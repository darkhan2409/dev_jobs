"""
Role Catalog Manager for Career Test v2.1.

Loads role_catalog.json and provides lookup for primary_stages per role.
"""

import json
import os
import logging
from typing import Dict, List, Optional

from ..models.role_catalog import RoleCatalogEntry

logger = logging.getLogger(__name__)


class RoleCatalogManager:
    """
    Manages the role catalog — the source of truth for role definitions.

    Each role has primary_stages that constrain which stage
    can be selected as the winning stage in the role-first algorithm.
    """

    def __init__(self):
        self._roles: Dict[str, RoleCatalogEntry] = {}
        self._load_data()

    def _get_data_path(self) -> str:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(current_dir, "..", "data", "role_catalog.json")

    def _load_data(self) -> None:
        try:
            with open(self._get_data_path(), "r", encoding="utf-8") as f:
                data = json.load(f)

            for role_data in data.get("roles", []):
                entry = RoleCatalogEntry(
                    id=role_data["id"],
                    title=role_data.get("title", ""),
                    tagline=role_data.get("tagline", ""),
                    primary_stages=role_data.get("primary_stages", []),
                    core_signals=role_data.get("core_signals", []),
                    primary_stage_titles=role_data.get("primary_stage_titles", []),
                    short_description=role_data.get("short_description", ""),
                )
                self._roles[entry.id] = entry

            logger.info(f"Loaded {len(self._roles)} roles from role catalog")
        except Exception as e:
            logger.error(f"Failed to load role catalog: {e}")
            raise

    def get_role_catalog(self, role_id: str) -> Optional[RoleCatalogEntry]:
        """Get a role catalog entry by ID."""
        return self._roles.get(role_id)

    def get_role(self, role_id: str) -> Optional[RoleCatalogEntry]:
        """Backward-compatible alias for get_role_catalog."""
        return self.get_role_catalog(role_id)

    def get_primary_stages(self, role_id: str) -> List[str]:
        """Get the primary stages for a role."""
        role = self._roles.get(role_id)
        if role:
            return role.primary_stages
        return []

    def get_all_roles(self) -> List[RoleCatalogEntry]:
        """Get all role catalog entries."""
        return list(self._roles.values())

    def get_role_count(self) -> int:
        """Get the total number of roles."""
        return len(self._roles)
