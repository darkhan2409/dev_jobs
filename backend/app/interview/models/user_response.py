"""
UserResponse and SessionModel data models.
"""

from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator, ConfigDict


class SessionStatus(str, Enum):
    """Status of a test session."""
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class UserResponse(BaseModel):
    """
    Represents a user's response to a question with resolved semantic context.
    
    Validates: Requirements 5.1, 5.2, 5.3, 5.4
    """
    session_id: str = Field(..., min_length=1, description="Test session identifier")
    question_id: str = Field(..., min_length=1, description="Question answered")
    answer_option_id: str = Field(..., min_length=1, description="Selected answer option")
    resolved_signals: List[str] = Field(..., description="Signal IDs from the selected answer")
    resolved_weights: Dict[str, float] = Field(..., description="Role weights from the selected answer")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the response was recorded")
    
    @field_validator('resolved_signals')
    @classmethod
    def validate_resolved_signals(cls, v: List[str]) -> List[str]:
        """Ensure resolved signals are present."""
        if not isinstance(v, list):
            raise ValueError("resolved_signals must be a list")
        return v
    
    @field_validator('resolved_weights')
    @classmethod
    def validate_resolved_weights(cls, v: Dict[str, float]) -> Dict[str, float]:
        """Ensure resolved weights are present and valid."""
        if not isinstance(v, dict):
            raise ValueError("resolved_weights must be a dictionary")
        for role_id, weight in v.items():
            if weight < 0:
                raise ValueError(f"Weight for role '{role_id}' must be non-negative, got {weight}")
        return v
    
    model_config = ConfigDict(
        str_strip_whitespace=True
    )


class SessionModel(BaseModel):
    """
    Represents a test session with user responses.
    
    Validates: Requirements 5.5, 3.7
    """
    session_id: str = Field(..., min_length=1, description="Unique session identifier")
    responses: List[UserResponse] = Field(default_factory=list, description="User responses (up to 25)")
    status: SessionStatus = Field(default=SessionStatus.IN_PROGRESS, description="Session status")
    locked_question_bank_version: Optional[str] = Field(None, description="Ensures question bank immutability")
    
    @field_validator('responses')
    @classmethod
    def validate_responses(cls, v: List[UserResponse]) -> List[UserResponse]:
        """Ensure responses don't exceed 25."""
        if len(v) > 25:
            raise ValueError(f"Session cannot have more than 25 responses, got {len(v)}")
        return v
    
    model_config = ConfigDict(
        str_strip_whitespace=True
    )
