"""
Stage Aggregation Engine for IT Product Creation Pipeline.

Computes stage scores based on signal profile from the career test.
Maps cognitive signals to product creation stages.

This is deterministic - NO LLM usage here.
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass

from ..storage.stage_manager import StageManager
from ..models.stage import StageScoreResult, StageRecommendation


class StageAggregationEngineError(Exception):
    """Base exception for Stage Aggregation Engine errors."""
    pass


@dataclass
class StageScoreComputeResult:
    """
    Result of stage score computation.

    Contains ranked stages and the primary recommendation.
    """
    ranked_stages: List[Tuple[str, float]]  # List of (stage_id, normalized_score) descending
    raw_scores: Dict[str, float]  # Map of stage_id -> raw_score
    recommendation: StageRecommendation  # Primary stage recommendation


class StageAggregationEngine:
    """
    Aggregation engine for computing stage scores from signal profiles.

    Algorithm:
    1. For each stage, compute score based on signal weights:
       - strong_signals: +2 points per occurrence
       - weak_signals: +1 point per occurrence
       - anti_signals: -1 point per occurrence
    2. Normalize scores to 0-1 range
    3. Rank stages by score
    4. Generate recommendation for top stage
    """

    # Weight constants for signal types
    STRONG_SIGNAL_WEIGHT = 2
    WEAK_SIGNAL_WEIGHT = 1
    ANTI_SIGNAL_WEIGHT = -1

    def __init__(self, stage_manager: StageManager = None):
        """
        Initialize the Stage Aggregation Engine.

        Args:
            stage_manager: StageManager instance (creates new if not provided)
        """
        self._stage_manager = stage_manager or StageManager()

    def compute_stage_scores(self, signal_profile: Dict[str, int]) -> StageScoreComputeResult:
        """
        Compute stage scores based on signal profile.

        Args:
            signal_profile: Dict of signal_id -> count from test results

        Returns:
            StageScoreComputeResult with ranked stages and recommendation
        """
        if not signal_profile:
            raise StageAggregationEngineError("Signal profile is empty")

        # Get all test mappings
        test_mappings = self._stage_manager.get_all_test_mappings()

        # Step 1: Compute raw scores for each stage
        raw_scores: Dict[str, float] = {}

        for stage_id, mapping in test_mappings.items():
            score = 0.0

            # Add points for strong signals
            for signal in mapping.strong_signals:
                score += self.STRONG_SIGNAL_WEIGHT * signal_profile.get(signal, 0)

            # Add points for weak signals
            for signal in mapping.weak_signals:
                score += self.WEAK_SIGNAL_WEIGHT * signal_profile.get(signal, 0)

            # Subtract points for anti signals
            for signal in mapping.anti_signals:
                score += self.ANTI_SIGNAL_WEIGHT * signal_profile.get(signal, 0)

            # Ensure non-negative score
            raw_scores[stage_id] = max(0.0, score)

        # Step 2: Normalize scores to 0-1 range
        normalized_scores: Dict[str, float] = {}

        if raw_scores:
            max_score = max(raw_scores.values()) if raw_scores.values() else 1.0

            # Avoid division by zero
            if max_score == 0:
                max_score = 1.0

            for stage_id, raw_score in raw_scores.items():
                normalized_scores[stage_id] = raw_score / max_score

        # Step 3: Rank stages by normalized score (descending)
        ranked_stages = sorted(
            normalized_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        # Step 4: Generate recommendation
        recommendation = self._generate_recommendation(ranked_stages)

        return StageScoreComputeResult(
            ranked_stages=ranked_stages,
            raw_scores=raw_scores,
            recommendation=recommendation
        )

    def _generate_recommendation(self, ranked_stages: List[Tuple[str, float]]) -> StageRecommendation:
        """
        Generate stage recommendation from ranked stages.

        Args:
            ranked_stages: List of (stage_id, score) tuples in descending order

        Returns:
            StageRecommendation with primary stage and related info
        """
        if not ranked_stages:
            raise StageAggregationEngineError("No ranked stages to generate recommendation")

        primary_stage_id = ranked_stages[0][0]
        primary_stage = self._stage_manager.get_stage(primary_stage_id)
        test_mapping = self._stage_manager.get_test_mapping(primary_stage_id)

        if not primary_stage or not test_mapping:
            raise StageAggregationEngineError(f"Stage {primary_stage_id} not found")

        # Get roles for this stage
        role_maps = self._stage_manager.get_roles_for_stage(primary_stage_id)
        related_roles = [rm.role_id for rm in role_maps]

        # Build ranked stages list
        ranked_stage_results = []
        for stage_id, score in ranked_stages:
            stage = self._stage_manager.get_stage(stage_id)
            if stage:
                ranked_stage_results.append(
                    StageScoreResult(
                        stage_id=stage_id,
                        stage_name=stage.name,
                        score=score
                    )
                )

        return StageRecommendation(
            primary_stage_id=primary_stage_id,
            primary_stage_name=primary_stage.name,
            what_user_will_see=test_mapping.what_user_will_see,
            related_roles=related_roles,
            ranked_stages=ranked_stage_results
        )

    def get_stage_details_for_recommendation(self, stage_id: str) -> dict:
        """
        Get detailed stage info for displaying recommendation.

        Args:
            stage_id: Stage identifier

        Returns:
            Dict with stage details, roles, and vacancy filters
        """
        stage = self._stage_manager.get_stage(stage_id)
        if not stage:
            return {}

        role_maps = self._stage_manager.get_roles_for_stage(stage_id)

        return {
            "stage": stage.model_dump(),
            "roles": [rm.model_dump() for rm in role_maps],
            "vacancy_keywords": stage.primary_vacancy_filters.keywords
        }
