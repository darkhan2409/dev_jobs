"""
Stage data models for IT Product Creation Pipeline v2.1.

Represents the 5 canonical stages: research, design, build, test, run.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices


class PrimaryVacancyFilters(BaseModel):
    """Filters for finding vacancies relevant to a stage."""
    roles: List[str] = Field(default=[], description="Role hints relevant to this stage")
    keywords: List[str] = Field(default=[], description="Keywords for vacancy search")


class Stage(BaseModel):
    """
    Represents a stage in the IT product creation process.

    5 canonical stages (v2.1):
    1. research - Исследование
    2. design - Проектирование
    3. build - Разработка
    4. test - Тестирование
    5. run - Запуск и эксплуатация
    """
    id: str = Field(..., min_length=1, description="Unique stage identifier")
    name: str = Field(
        ...,
        min_length=1,
        validation_alias=AliasChoices("name", "title"),
        description="Stage name in Russian",
    )
    summary: str = Field(
        default="",
        validation_alias=AliasChoices("summary", "description"),
        description="1-2 sentences describing the stage",
    )
    primary_roles: List[str] = Field(default=[], description="Roles primarily active at this stage")
    typical_outputs: List[str] = Field(default=[], description="Typical artifacts/results of this stage")
    common_mistakes: List[str] = Field(default=[], description="Common mistakes newcomers make")
    primary_vacancy_filters: PrimaryVacancyFilters = Field(
        default_factory=PrimaryVacancyFilters,
        description="Filters for finding relevant vacancies"
    )

    model_config = ConfigDict(
        populate_by_name=True
    )


class StageRoleMap(BaseModel):
    """Maps a role to a stage with explanation."""
    stage_id: str = Field(..., description="Stage identifier")
    role_id: str = Field(..., description="Role identifier")
    why_here: str = Field(..., description="Why this role is key at this stage")
    how_it_connects_to_vacancies: str = Field(
        default="",
        description="How this reflects in job postings"
    )
    importance: str = Field(
        default="primary",
        description="Importance level: 'primary' | 'secondary'"
    )


class StageTestMapping(BaseModel):
    """Maps a stage to display text for test results (v2.1 - no signals)."""
    stage_id: str = Field(..., description="Stage identifier")
    strong_signals: List[str] = Field(default=[], description="Deprecated in v2.1")
    weak_signals: List[str] = Field(default=[], description="Deprecated in v2.1")
    anti_signals: List[str] = Field(default=[], description="Deprecated in v2.1")
    what_user_will_see: str = Field(
        ...,
        description="Text shown to user when this stage is recommended"
    )


class StageScoreResult(BaseModel):
    """Result of stage scoring for a user."""
    stage_id: str
    stage_name: str
    score: float = Field(description="Normalized score 0-1")


class StageRecommendation(BaseModel):
    """Stage recommendation based on test results."""
    primary_stage_id: str
    primary_stage_name: str
    what_user_will_see: str
    related_roles: List[str] = Field(
        default=[],
        description="Role IDs that work on this stage"
    )
    ranked_stages: List[StageScoreResult] = Field(
        default=[],
        description="All stages ranked by score"
    )
