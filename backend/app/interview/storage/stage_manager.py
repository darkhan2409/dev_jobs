"""
Stage Manager for IT Product Creation Pipeline v2.1.

Manages the 5 canonical stages with role mappings and test display text.
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

    v4.0: 5 stages (research, design, development, testing, launch_ops).
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
        """Load stages from stages_data.json (v2.1 format)."""
        try:
            with open(self._get_data_path("stages_data.json"), "r", encoding="utf-8") as f:
                data = json.load(f)

            for stage_data in data.get("stages", []):
                # v2.1 uses "title" for name and "description" for summary
                name = stage_data.get("title") or stage_data.get("name", "")
                summary = stage_data.get("description") or stage_data.get("summary", "")
                primary_roles = stage_data.get("primary_roles", [])

                # v2.1 uses "vacancy_filters" with "role_hints" and "keywords"
                vf = stage_data.get("vacancy_filters") or stage_data.get("primary_vacancy_filters", {})
                roles_list = vf.get("role_hints") or vf.get("roles", [])
                keywords_list = vf.get("keywords", [])

                stage = Stage(
                    id=stage_data["id"],
                    name=name,
                    summary=summary,
                    primary_roles=primary_roles,
                    typical_outputs=stage_data.get("typical_outputs", []),
                    common_mistakes=stage_data.get("common_mistakes", []),
                    primary_vacancy_filters=PrimaryVacancyFilters(
                        roles=roles_list,
                        keywords=keywords_list
                    )
                )
                self._stages[stage.id] = stage

            logger.info(f"Loaded {len(self._stages)} stages")
        except Exception as e:
            logger.error(f"Failed to load stages: {e}")
            raise

    def _load_role_maps(self) -> None:
        """Load stage-role mappings from stage_role_map.json (v2.1 format)."""
        try:
            with open(self._get_data_path("stage_role_map.json"), "r", encoding="utf-8") as f:
                data = json.load(f)

            # v2.1 uses "mapping" key (not "mappings")
            raw_mappings = data.get("mapping") or data.get("mappings", [])

            for mapping_data in raw_mappings:
                connection_text = mapping_data.get("how_it_connects_to_vacancies", "")
                if not connection_text:
                    connection_text = self._build_vacancy_connection_text(
                        stage_id=mapping_data["stage_id"],
                        role_id=mapping_data["role_id"],
                        why_here=mapping_data["why_here"],
                    )

                mapping = StageRoleMap(
                    stage_id=mapping_data["stage_id"],
                    role_id=mapping_data["role_id"],
                    why_here=mapping_data["why_here"],
                    how_it_connects_to_vacancies=connection_text,
                    importance=mapping_data.get("importance", "primary")
                )
                self._role_maps.append(mapping)

            logger.info(f"Loaded {len(self._role_maps)} stage-role mappings")
        except Exception as e:
            logger.error(f"Failed to load role maps: {e}")
            raise

    def _build_vacancy_connection_text(self, stage_id: str, role_id: str, why_here: str) -> str:
        """Build deterministic fallback text when mapping lacks explicit vacancy linkage."""
        stage = self._stages.get(stage_id)
        stage_name = stage.name if stage else stage_id
        return (
            f"В вакансиях по роли '{role_id}' для этапа '{stage_name}' "
            f"обычно ожидаются задачи, связанные с тем, что специалист {why_here.lower()}"
        )

    def _load_test_mappings(self) -> None:
        """Load test display mappings from stage_test_mapping.json (v2.1 format)."""
        try:
            with open(self._get_data_path("stage_test_mapping.json"), "r", encoding="utf-8") as f:
                data = json.load(f)

            # v2.1 can use "stages" array with {stage_id, what_user_will_see}
            stages_list = data.get("stages")
            if stages_list and isinstance(stages_list, list):
                for entry in stages_list:
                    stage_id = entry["stage_id"]
                    mapping = StageTestMapping(
                        stage_id=stage_id,
                        what_user_will_see=entry["what_user_will_see"]
                    )
                    self._test_mappings[stage_id] = mapping
            elif isinstance(data.get("mappings"), list):
                # Also support list-based "mappings" format
                for entry in data.get("mappings", []):
                    stage_id = entry["stage_id"]
                    mapping = StageTestMapping(
                        stage_id=stage_id,
                        strong_signals=entry.get("strong_signals", []),
                        weak_signals=entry.get("weak_signals", []),
                        anti_signals=entry.get("anti_signals", []),
                        what_user_will_see=entry.get("what_user_will_see", "")
                    )
                    self._test_mappings[stage_id] = mapping
            else:
                # Fallback: v1 format with "mappings" dict
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
        """Retrieve a stage by its ID."""
        return self._stages.get(stage_id)

    def get_all_stages(self) -> List[Stage]:
        """Retrieve all stages in canonical order."""
        order = ["research", "design", "development", "testing", "launch_ops"]
        result = [self._stages[sid] for sid in order if sid in self._stages]
        # Include any stages not in the canonical order
        for sid, stage in self._stages.items():
            if sid not in order:
                result.append(stage)
        return result

    def get_roles_for_stage(self, stage_id: str, importance: Optional[str] = None) -> List[StageRoleMap]:
        """Get all role mappings for a stage."""
        mappings = [m for m in self._role_maps if m.stage_id == stage_id]
        if importance:
            mappings = [m for m in mappings if m.importance == importance]
        return mappings

    def get_stages_for_role(self, role_id: str) -> List[StageRoleMap]:
        """Get all stage mappings for a role."""
        return [m for m in self._role_maps if m.role_id == role_id]

    def get_test_mapping(self, stage_id: str) -> Optional[StageTestMapping]:
        """Get test display mapping for a stage."""
        return self._test_mappings.get(stage_id)

    def get_all_test_mappings(self) -> Dict[str, StageTestMapping]:
        """Get all test display mappings."""
        return self._test_mappings.copy()

    def get_vacancy_keywords(self, stage_id: str) -> List[str]:
        """Get vacancy filter keywords for a stage."""
        stage = self.get_stage(stage_id)
        if stage:
            return stage.primary_vacancy_filters.keywords
        return []

    def get_stage_count(self) -> int:
        """Get the total number of stages."""
        return len(self._stages)
