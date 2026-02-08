"""
Stage data models for IT Product Creation Pipeline.

Represents the 10 canonical stages of IT product creation process.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class PrimaryVacancyFilters(BaseModel):
    """Filters for finding vacancies relevant to a stage."""
    roles: List[str] = Field(..., description="Role IDs relevant to this stage")
    keywords: List[str] = Field(..., description="Keywords for vacancy search")


class Stage(BaseModel):
    """
    Represents a stage in the IT product creation process.

    10 canonical stages:
    1. idea_and_need - Идея и потребность
    2. planning - Планирование и управление
    3. design - Дизайн
    4. architecture - Архитектура и проектирование
    5. development - Разработка
    6. testing - Тестирование
    7. deployment - Запуск и эксплуатация
    8. security - Безопасность
    9. analytics - Аналитика и улучшения
    10. documentation - Документация
    """
    id: str = Field(..., min_length=1, description="Unique stage identifier")
    name: str = Field(..., min_length=1, description="Stage name in Russian")
    summary: str = Field(..., description="1-2 sentences describing the stage")
    typical_outputs: List[str] = Field(
        default=[],
        description="3-6 typical artifacts/results of this stage"
    )
    common_mistakes: List[str] = Field(
        default=[],
        description="3-5 common mistakes newcomers make"
    )
    primary_vacancy_filters: PrimaryVacancyFilters = Field(
        ...,
        description="Filters for finding relevant vacancies"
    )


class StageRoleMap(BaseModel):
    """Maps a role to a stage with explanation."""
    stage_id: str = Field(..., description="Stage identifier")
    role_id: str = Field(..., description="Role identifier")
    why_here: str = Field(..., description="Why this role is key at this stage")
    how_it_connects_to_vacancies: str = Field(
        ...,
        description="How this reflects in job postings"
    )
    importance: str = Field(
        default="primary",
        description="Importance level: 'primary' | 'secondary'"
    )


class StageTestMapping(BaseModel):
    """Maps cognitive signals to a stage for test scoring."""
    stage_id: str = Field(..., description="Stage identifier")
    strong_signals: List[str] = Field(
        default=[],
        description="Signals that strongly indicate this stage (+2 points)"
    )
    weak_signals: List[str] = Field(
        default=[],
        description="Signals that weakly indicate this stage (+1 point)"
    )
    anti_signals: List[str] = Field(
        default=[],
        description="Signals that indicate against this stage (-1 point)"
    )
    what_user_will_see: str = Field(
        ...,
        description="Text shown to user when this stage is recommended"
    )


class StageScoreResult(BaseModel):
    """Result of stage scoring for a user."""
    stage_id: str
    stage_name: str
    score: float = Field(ge=0, le=1, description="Normalized score 0-1")


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
