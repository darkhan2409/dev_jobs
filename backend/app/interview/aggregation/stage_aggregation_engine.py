"""
Stage Aggregation Engine for IT Product Creation Pipeline v2.1.

Implements the "Role-First" algorithm:
1. Determine winning role from ranked_roles
2. Look up winning role's primary_stages from role_catalog
3. Select winning stage by highest stage_affinity within primary_stages
4. Return stage recommendation with display text
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass

from ..storage.stage_manager import StageManager
from ..storage.role_catalog_manager import RoleCatalogManager
from ..models.stage import StageScoreResult, StageRecommendation


class StageAggregationEngineError(Exception):
    """Base exception for Stage Aggregation Engine errors."""
    pass


@dataclass
class StageScoreComputeResult:
    """Result of stage score computation."""
    ranked_stages: List[Tuple[str, float]]  # (stage_id, normalized_score) descending
    raw_scores: Dict[str, float]  # stage_id -> raw affinity score
    recommendation: StageRecommendation


class StageAggregationEngine:
    """
    Role-first stage aggregation engine (v2.1).

    Algorithm:
    1. Winning role = top-ranked role
    2. Primary stages = role_catalog[winning_role].primary_stages
    3. Winning stage = primary stage with highest stage_affinity
    4. Display text from stage_test_mapping
    """

    def __init__(
        self,
        stage_manager: StageManager = None,
        role_catalog_manager: RoleCatalogManager = None,
    ):
        self._stage_manager = stage_manager or StageManager()
        self._role_catalog_manager = role_catalog_manager or RoleCatalogManager()

    def compute_stage_scores(
        self,
        ranked_roles: List[Tuple[str, float]],
        stage_affinity: Dict[str, float],
    ) -> StageScoreComputeResult:
        """
        Compute stage recommendation using the role-first algorithm.

        Args:
            ranked_roles: List of (role_id, score) sorted descending
            stage_affinity: Dict of stage_id -> raw affinity score from answers
        """
        if not ranked_roles:
            raise StageAggregationEngineError("No ranked roles provided")

        # Step 1: Winning role
        winning_role_id = ranked_roles[0][0]

        # Step 2: Get primary stages from role catalog
        primary_stages = self._role_catalog_manager.get_primary_stages(winning_role_id)
        if not primary_stages:
            raise StageAggregationEngineError(
                f"No primary stages found for role '{winning_role_id}'"
            )

        # Step 3: Select winning stage by highest affinity within primary_stages
        best_stage_id = primary_stages[0]  # default to first primary stage
        best_score = stage_affinity.get(primary_stages[0], 0.0)

        for stage_id in primary_stages:
            score = stage_affinity.get(stage_id, 0.0)
            if score > best_score:
                best_score = score
                best_stage_id = stage_id

        # Step 4: Normalize all stage scores using min-max for UI display
        raw_scores = dict(stage_affinity)

        normalized_scores: Dict[str, float] = {}
        if raw_scores:
            min_s = min(raw_scores.values())
            max_s = max(raw_scores.values())
            score_range = max_s - min_s
            if score_range == 0:
                for sid in raw_scores:
                    normalized_scores[sid] = 1.0
            else:
                for sid, raw in raw_scores.items():
                    normalized_scores[sid] = max(0.0, (raw - min_s) / score_range)

        # Rank all stages by normalized score (descending)
        ranked_stages = sorted(
            normalized_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        # Step 5: Generate recommendation
        recommendation = self._generate_recommendation(
            winning_stage_id=best_stage_id,
            ranked_stages=ranked_stages
        )

        return StageScoreComputeResult(
            ranked_stages=ranked_stages,
            raw_scores=raw_scores,
            recommendation=recommendation
        )

    def _generate_recommendation(
        self,
        winning_stage_id: str,
        ranked_stages: List[Tuple[str, float]],
    ) -> StageRecommendation:
        """Generate stage recommendation from winning stage."""
        primary_stage = self._stage_manager.get_stage(winning_stage_id)
        test_mapping = self._stage_manager.get_test_mapping(winning_stage_id)

        stage_name = primary_stage.name if primary_stage else winning_stage_id
        what_user_will_see = test_mapping.what_user_will_see if test_mapping else ""

        # Get roles for this stage
        role_maps = self._stage_manager.get_roles_for_stage(winning_stage_id)
        related_roles = [rm.role_id for rm in role_maps]

        # Build ranked stage results for UI
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
            primary_stage_id=winning_stage_id,
            primary_stage_name=stage_name,
            what_user_will_see=what_user_will_see,
            related_roles=related_roles,
            ranked_stages=ranked_stage_results
        )
