"""
UserResponse and SessionModel data models for Career Test v2.1.
"""

from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class SessionStatus(str, Enum):
    """Status of a test session."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class UserResponse(BaseModel):
    """
    Represents a user's response to a question with resolved semantic context.
    """
    session_id: str = Field(..., min_length=1, description="Test session identifier")
    question_id: str = Field(..., min_length=1, description="Question answered")
    answer_option_id: str = Field(..., min_length=1, description="Selected answer option")
    resolved_signals: List[str] = Field(default=[], description="Signal IDs from the selected answer")
    resolved_weights: Dict[str, float] = Field(default={}, description="Role weights from the selected answer")
    resolved_stage_weights: Dict[str, float] = Field(default={}, description="Stage weights from the selected answer")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the response was recorded")

    model_config = ConfigDict(
        str_strip_whitespace=True
    )


class SessionModel(BaseModel):
    """
    Represents a test session with user responses.
    """
    session_id: str = Field(..., min_length=1, description="Unique session identifier")
    responses: List[UserResponse] = Field(default_factory=list, description="User responses")
    status: SessionStatus = Field(default=SessionStatus.IN_PROGRESS, description="Session status")
    locked_question_bank_version: Optional[str] = Field(None, description="Ensures question bank immutability")
    created_at: datetime = Field(default_factory=datetime.now, description="Session creation time")
    expires_at: Optional[datetime] = Field(default=None, description="Session expiration time")

    model_config = ConfigDict(
        str_strip_whitespace=True
    )
