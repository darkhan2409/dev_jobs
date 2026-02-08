"""
Stage Manager for IT Product Creation Pipeline.

Manages the 10 canonical stages of IT product creation with role mappings.
"""

import json
import os
import logging
from typing import Dict, List, Optional

from ..models.stage import (
    Stage,
    PrimaryVacancyFilters,
    StageRoleMap,
    StageTestMapping,
)

logger = logging.getLogger(__name__)


class StageManager:
    """
    Manages product creation stages with methods for retrieval and filtering.

    Stores exactly 10 canonical stages with descriptions, outputs, mistakes,
    and vacancy filters.
    """

    def __init__(self):
        """Initialize the Stage Manager with data from JSON files."""
        self._stages: Dict[str, Stage] = {}
        self._role_maps: List[StageRoleMap] = []
        self._test_mappings: Dict[str, StageTestMapping] = {}
        self._load_data()

    def _get_data_path(self, filename: str) -> str:
        """Get the full path to a data file."""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(current_dir, "..", "data", filename)

    def _load_data(self) -> None:
        """Load all stage data from JSON files."""
        self._load_stages()
        self._load_role_maps()
        self._load_test_mappings()

    def _load_stages(self) -> None:
        """Load stages from stages_data.json."""
        try:
            with open(self._get_data_path("stages_data.json"), "r", encoding="utf-8") as f:
                data = json.load(f)

            for stage_data in data.get("stages", []):
                stage = Stage(
                    id=stage_data["id"],
                    name=stage_data["name"],
                    summary=stage_data["summary"],
                    typical_outputs=stage_data.get("typical_outputs", []),
                    common_mistakes=stage_data.get("common_mistakes", []),
                    primary_vacancy_filters=PrimaryVacancyFilters(
                        roles=stage_data["primary_vacancy_filters"]["roles"],
                        keywords=stage_data["primary_vacancy_filters"]["keywords"]
                    )
                )
                self._stages[stage.id] = stage

            logger.info(f"Loaded {len(self._stages)} stages")
        except Exception as e:
            logger.error(f"Failed to load stages: {e}")
            raise

    def _load_role_maps(self) -> None:
        """Load stage-role mappings from stage_role_map.json."""
        try:
            with open(self._get_data_path("stage_role_map.json"), "r", encoding="utf-8") as f:
                data = json.load(f)

            for mapping_data in data.get("mappings", []):
                mapping = StageRoleMap(
                    stage_id=mapping_data["stage_id"],
                    role_id=mapping_data["role_id"],
                    why_here=mapping_data["why_here"],
                    how_it_connects_to_vacancies=mapping_data["how_it_connects_to_vacancies"],
                    importance=mapping_data.get("importance", "primary")
                )
                self._role_maps.append(mapping)

            logger.info(f"Loaded {len(self._role_maps)} stage-role mappings")
        except Exception as e:
            logger.error(f"Failed to load role maps: {e}")
            raise

    def _load_test_mappings(self) -> None:
        """Load test signal mappings from stage_test_mapping.json."""
        try:
            with open(self._get_data_path("stage_test_mapping.json"), "r", encoding="utf-8") as f:
                data = json.load(f)

            for stage_id, mapping_data in data.get("mappings", {}).items():
                mapping = StageTestMapping(
                    stage_id=stage_id,
                    strong_signals=mapping_data.get("strong_signals", []),
                    weak_signals=mapping_data.get("weak_signals", []),
                    anti_signals=mapping_data.get("anti_signals", []),
                    what_user_will_see=mapping_data["what_user_will_see"]
                )
                self._test_mappings[stage_id] = mapping

            logger.info(f"Loaded {len(self._test_mappings)} test mappings")
        except Exception as e:
            logger.error(f"Failed to load test mappings: {e}")
            raise

    def get_stage(self, stage_id: str) -> Optional[Stage]:
        """
        Retrieve a stage by its ID.

        Args:
            stage_id: The unique identifier of the stage

        Returns:
            Stage if found, None otherwise
        """
        return self._stages.get(stage_id)

    def get_all_stages(self) -> List[Stage]:
        """
        Retrieve all stages in order.

        Returns:
            List of Stage instances
        """
        # Return in canonical order
        order = [
            "idea_and_need", "planning", "design", "architecture",
            "development", "testing", "deployment", "security",
            "analytics", "documentation"
        ]
        return [self._stages[sid] for sid in order if sid in self._stages]

    def get_roles_for_stage(self, stage_id: str, importance: Optional[str] = None) -> List[StageRoleMap]:
        """
        Get all role mappings for a stage.

        Args:
            stage_id: Stage identifier
            importance: Filter by importance ('primary' or 'secondary')

        Returns:
            List of StageRoleMap for the stage
        """
        mappings = [m for m in self._role_maps if m.stage_id == stage_id]
        if importance:
            mappings = [m for m in mappings if m.importance == importance]
        return mappings

    def get_stages_for_role(self, role_id: str) -> List[StageRoleMap]:
        """
        Get all stage mappings for a role.

        Args:
            role_id: Role identifier

        Returns:
            List of StageRoleMap for the role
        """
        return [m for m in self._role_maps if m.role_id == role_id]

    def get_test_mapping(self, stage_id: str) -> Optional[StageTestMapping]:
        """
        Get test signal mapping for a stage.

        Args:
            stage_id: Stage identifier

        Returns:
            StageTestMapping if found, None otherwise
        """
        return self._test_mappings.get(stage_id)

    def get_all_test_mappings(self) -> Dict[str, StageTestMapping]:
        """
        Get all test signal mappings.

        Returns:
            Dict of stage_id -> StageTestMapping
        """
        return self._test_mappings.copy()

    def get_vacancy_keywords(self, stage_id: str) -> List[str]:
        """
        Get vacancy filter keywords for a stage.

        Args:
            stage_id: Stage identifier

        Returns:
            List of keywords for vacancy search
        """
        stage = self.get_stage(stage_id)
        if stage:
            return stage.primary_vacancy_filters.keywords
        return []

    def get_stage_count(self) -> int:
        """
        Get the total number of stages.

        Returns:
            Number of stages stored
        """
        return len(self._stages)
