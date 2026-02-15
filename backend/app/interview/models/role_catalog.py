"""
Role Catalog data model for Career Test v2.1.

Defines the source of truth for roles, their primary stages, and core signals.
"""

from typing import List
from pydantic import BaseModel, Field


class RoleCatalogEntry(BaseModel):
    """
    A role definition from the role catalog.

    Each role has exactly 2 primary_stages that constrain
    which stage can be selected as the winning stage.
    """
    id: str = Field(..., min_length=1, description="Unique role identifier")
    title: str = Field(..., min_length=1, description="English title")
    tagline: str = Field(default="", description="Brief description")
    primary_stages: List[str] = Field(..., min_length=1, description="Ordered primary stages for this role")
    core_signals: List[str] = Field(default=[], description="Defining cognitive signals")
    primary_stage_titles: List[str] = Field(default=[], description="Localized stage titles")
    short_description: str = Field(default="", description="Short role description")
