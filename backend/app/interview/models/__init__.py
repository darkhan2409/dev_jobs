"""
Core data models for IT Career Test Engine.
"""

from .role_profile import RoleProfile
from .signal import Signal
from .question import Question, AnswerOption
from .user_response import UserResponse, SessionModel
from .stage import (
    Stage,
    PrimaryVacancyFilters,
    StageRoleMap,
    StageTestMapping,
    StageScoreResult,
    StageRecommendation,
)

__all__ = [
    'RoleProfile',
    'Signal',
    'Question',
    'AnswerOption',
    'UserResponse',
    'SessionModel',
    'Stage',
    'PrimaryVacancyFilters',
    'StageRoleMap',
    'StageTestMapping',
    'StageScoreResult',
    'StageRecommendation',
]
