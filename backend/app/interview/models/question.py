"""
Question and AnswerOption data models.
"""

from typing import List, Dict
from pydantic import BaseModel, Field, field_validator, ConfigDict


class AnswerOption(BaseModel):
    """
    Represents an answer option for a question.
    
    Validates: Requirements 4.1, 4.2, 4.3, 4.4
    """
    id: str = Field(..., min_length=1, description="Unique identifier for the answer option")
    text: str = Field(..., min_length=1, description="Answer option text")
    signal_associations: List[str] = Field(..., min_length=1, description="Signal IDs this answer indicates")
    role_weights: Dict[str, float] = Field(..., description="Mapping of role_id to weight value")
    
    @field_validator('signal_associations')
    @classmethod
    def validate_signal_associations(cls, v: List[str]) -> List[str]:
        """Ensure at least one signal association is provided."""
        if not v or len(v) == 0:
            raise ValueError("Answer option must have at least one signal association")
        if any(not signal_id.strip() for signal_id in v):
            raise ValueError("All signal IDs must be non-empty strings")
        return v
    
    @field_validator('role_weights')
    @classmethod
    def validate_role_weights(cls, v: Dict[str, float]) -> Dict[str, float]:
        """Ensure all weights are non-negative."""
        for role_id, weight in v.items():
            if weight < 0:
                raise ValueError(f"Weight for role '{role_id}' must be non-negative, got {weight}")
        return v
    
    model_config = ConfigDict(
        str_strip_whitespace=True
    )


class Question(BaseModel):
    """
    Represents a question in the question bank.
    
    Validates: Requirements 3.1, 3.2, 3.3, 4.3
    """
    id: str = Field(..., min_length=1, description="Unique identifier for the question")
    text: str = Field(..., min_length=1, description="Question text")
    thematic_block: str = Field(..., min_length=1, description="One of 6 thematic blocks")
    answer_options: List[AnswerOption] = Field(..., min_length=4, max_length=4, description="Exactly 4 answer options")
    
    @field_validator('answer_options')
    @classmethod
    def validate_answer_options(cls, v: List[AnswerOption]) -> List[AnswerOption]:
        """Ensure exactly 4 answer options are provided."""
        if len(v) != 4:
            raise ValueError(f"Question must have exactly 4 answer options, got {len(v)}")
        return v
    
    model_config = ConfigDict(
        str_strip_whitespace=True
    )
