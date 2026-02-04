"""
Aggregation Engine for IT Career Test Engine.

Computes role scores deterministically through weight summation and normalization.
This is the core deterministic scoring component - NO LLM usage here.

Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
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
    
    Contains ranked roles, raw scores, and aggregated signal profile.
    """
    ranked_roles: List[Tuple[str, float]]  # List of (role_id, normalized_score) in descending order
    raw_scores: Dict[str, float]  # Map of role_id -> raw_score
    signal_profile: Dict[str, int]  # Map of signal_id -> count across all responses
    
    def __eq__(self, other):
        """Check equality for determinism validation."""
        if not isinstance(other, RoleScoreResult):
            return False
        return (
            self.ranked_roles == other.ranked_roles and
            self.raw_scores == other.raw_scores and
            self.signal_profile == other.signal_profile
        )


class AggregationEngine:
    """
    Deterministic aggregation engine for computing role scores.
    
    Implements weight summation, score normalization, and role ranking
    without any non-deterministic algorithms or LLM usage.
    """
    
    def __init__(self, user_response_store: UserResponseStore):
        """
        Initialize the Aggregation Engine.
        
        Args:
            user_response_store: UserResponseStore instance for retrieving responses
        """
        self._user_response_store = user_response_store
    
    def compute_scores(self, session_id: str) -> RoleScoreResult:
        """
        Compute role scores for a completed test session.
        
        Algorithm:
        1. Sum weights from all user responses for each role (raw scores)
        2. Normalize scores to 0-1 range (max score = 1)
        3. Rank roles by normalized score (descending order)
        4. Aggregate signal profile (count occurrences across responses)
        
        Args:
            session_id: Test session identifier
            
        Returns:
            RoleScoreResult with ranked roles, raw scores, and signal profile
            
        Raises:
            IncompleteSessionError: If session has fewer than 25 responses
            
        Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
        """
        # Validate session completeness
        if not self._user_response_store.validate_response_completeness(session_id):
            responses = self._user_response_store.get_session_responses(session_id)
            raise IncompleteSessionError(
                f"Cannot compute scores for incomplete session. "
                f"Expected 25 responses, got {len(responses)}"
            )
        
        # Get all responses for the session
        responses = self._user_response_store.get_session_responses(session_id)
        
        # Step 1: Sum weights for each role (raw scores)
        raw_scores: Dict[str, float] = {}
        
        for response in responses:
            for role_id, weight in response.resolved_weights.items():
                if role_id not in raw_scores:
                    raw_scores[role_id] = 0.0
                raw_scores[role_id] += weight
        
        # Step 2: Normalize scores to 0-1 range
        normalized_scores: Dict[str, float] = {}
        
        if raw_scores:
            max_score = max(raw_scores.values()) if raw_scores.values() else 1.0
            
            # Avoid division by zero
            if max_score == 0:
                max_score = 1.0
            
            for role_id, raw_score in raw_scores.items():
                normalized_scores[role_id] = raw_score / max_score
        
        # Step 3: Rank roles by normalized score (descending order)
        ranked_roles = sorted(
            normalized_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Step 4: Aggregate signal profile
        signal_profile: Dict[str, int] = {}
        
        for response in responses:
            for signal_id in response.resolved_signals:
                if signal_id not in signal_profile:
                    signal_profile[signal_id] = 0
                signal_profile[signal_id] += 1
        
        return RoleScoreResult(
            ranked_roles=ranked_roles,
            raw_scores=raw_scores,
            signal_profile=signal_profile
        )
    
    def validate_determinism(self, session_id: str) -> bool:
        """
        Validate that score computation is deterministic.
        
        Computes scores twice and verifies identical results.
        
        Args:
            session_id: Test session identifier
            
        Returns:
            True if both computations produce identical results
            
        Raises:
            IncompleteSessionError: If session has fewer than 25 responses
            
        Validates: Requirements 6.3
        """
        # Compute scores twice
        result1 = self.compute_scores(session_id)
        result2 = self.compute_scores(session_id)
        
        # Verify identical results
        return result1 == result2
