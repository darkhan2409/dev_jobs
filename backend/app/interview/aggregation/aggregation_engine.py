"""
Aggregation Engine for IT Career Test Engine v2.1.

Computes role scores and stage affinity deterministically through
weight summation and min-max normalization.
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass, field
from ..storage.user_response_store import UserResponseStore


class AggregationEngineError(Exception):
    """Base exception for Aggregation Engine errors."""
    pass


class IncompleteSessionError(AggregationEngineError):
    """Raised when attempting to compute scores for an incomplete session."""
    pass


@dataclass
class RoleScoreResult:
    """
    Result of role score computation.

    Contains ranked roles, raw scores, signal profile, and stage affinity.
    """
    ranked_roles: List[Tuple[str, float]]  # List of (role_id, normalized_score) descending
    raw_scores: Dict[str, float]  # Map of role_id -> raw_score
    signal_profile: Dict[str, int]  # Map of signal_id -> count
    stage_affinity: Dict[str, float] = field(default_factory=dict)  # Map of stage_id -> raw affinity score

    def __eq__(self, other):
        if not isinstance(other, RoleScoreResult):
            return False
        return (
            self.ranked_roles == other.ranked_roles and
            self.raw_scores == other.raw_scores and
            self.signal_profile == other.signal_profile and
            self.stage_affinity == other.stage_affinity
        )


class AggregationEngine:
    """
    Deterministic aggregation engine for computing role scores and stage affinity.

    v2.1: Also computes stage_affinity from stage_weights for role-first algorithm.
    Uses min-max normalization to handle negative scores.
    """

    def __init__(self, user_response_store: UserResponseStore):
        self._user_response_store = user_response_store

    def _get_all_role_ids(self) -> List[str]:
        """
        Collect all role IDs present in the question bank weights.

        Ensures ranked_roles always includes the full role catalog even when
        a specific test run does not select options for some roles.
        """
        role_ids = set()
        question_bank_manager = getattr(self._user_response_store, "_question_bank_manager", None)
        if question_bank_manager is None:
            return []

        try:
            for question in question_bank_manager.get_all_questions():
                for option in question.answer_options:
                    role_ids.update(option.role_weights.keys())
        except Exception:
            return []

        return sorted(role_ids)

    def compute_scores(self, session_id: str) -> RoleScoreResult:
        """
        Compute role scores and stage affinity for a completed test session.

        Algorithm:
        1. Sum role_weights from all responses -> raw_scores
        2. Sum stage_weights from all responses -> stage_affinity
        3. Normalize role scores using min-max (handles negative values)
        4. Rank roles by normalized score (descending)
        5. Aggregate signal profile (count occurrences)
        """
        if not self._user_response_store.validate_response_completeness(session_id):
            responses = self._user_response_store.get_session_responses(session_id)
            expected = self._user_response_store._question_bank_manager.get_question_count()
            raise IncompleteSessionError(
                f"Cannot compute scores for incomplete session. "
                f"Expected {expected} responses, got {len(responses)}"
            )

        responses = self._user_response_store.get_session_responses(session_id)

        # Step 1: Sum role_weights for each role
        raw_scores: Dict[str, float] = {}
        for response in responses:
            for role_id, weight in response.resolved_weights.items():
                raw_scores[role_id] = raw_scores.get(role_id, 0.0) + weight

        # Ensure all roles from the question bank are present in output (with 0.0 default)
        for role_id in self._get_all_role_ids():
            raw_scores.setdefault(role_id, 0.0)

        # Step 2: Sum stage_weights for stage affinity
        stage_affinity: Dict[str, float] = {}
        for response in responses:
            for stage_id, weight in response.resolved_stage_weights.items():
                stage_affinity[stage_id] = stage_affinity.get(stage_id, 0.0) + weight

        # Step 3: Min-max normalize role scores to 0-1 range
        normalized_scores: Dict[str, float] = {}
        if raw_scores:
            min_score = min(raw_scores.values())
            max_score = max(raw_scores.values())
            score_range = max_score - min_score

            if score_range == 0:
                # All scores equal — assign 1.0 to all
                for role_id in raw_scores:
                    normalized_scores[role_id] = 1.0
            else:
                for role_id, raw_score in raw_scores.items():
                    normalized_scores[role_id] = (raw_score - min_score) / score_range

        # Step 4: Rank roles by normalized score (descending)
        ranked_roles = sorted(
            normalized_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        # Step 5: Aggregate signal profile
        signal_profile: Dict[str, int] = {}
        for response in responses:
            for signal_id in response.resolved_signals:
                signal_profile[signal_id] = signal_profile.get(signal_id, 0) + 1

        return RoleScoreResult(
            ranked_roles=ranked_roles,
            raw_scores=raw_scores,
            signal_profile=signal_profile,
            stage_affinity=stage_affinity
        )

    def validate_determinism(self, session_id: str) -> bool:
        """Validate that score computation is deterministic."""
        result1 = self.compute_scores(session_id)
        result2 = self.compute_scores(session_id)
        return result1 == result2
