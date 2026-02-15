"""
Question and AnswerOption data models for Career Test v2.1.

Supports Likert-5 and forced-choice question types with
role_weights, stage_weights, and signal_associations.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field, ConfigDict, AliasChoices


class AnswerOption(BaseModel):
    """
    Represents an answer option for a question.
    Supports both Likert-5 (5 options) and forced-choice (2 options).
    """
    id: str = Field(..., min_length=1, description="Unique identifier for the answer option")
    text: str = Field(
        ...,
        min_length=1,
        validation_alias=AliasChoices("text", "label"),
        description="Answer option text",
    )
    signal_associations: List[str] = Field(default=[], description="Signal IDs this answer indicates")
    role_weights: Dict[str, float] = Field(default={}, description="Mapping of role_id to weight value (-4 to +5)")
    stage_weights: Dict[str, float] = Field(default={}, description="Mapping of stage_id to weight value (-4 to +5)")

    model_config = ConfigDict(
        str_strip_whitespace=True
    )


class Question(BaseModel):
    """
    Represents a question in the question bank.
    Supports variable number of answer options (2 for forced-choice, 5 for Likert).
    """
    id: str = Field(..., min_length=1, description="Unique identifier for the question")
    text: str = Field(..., min_length=1, description="Question text")
    thematic_block: str = Field(..., min_length=1, description="Thematic category")
    answer_options: List[AnswerOption] = Field(..., min_length=2, description="Answer options (2-5)")
    type: Optional[str] = Field(default=None, description="Question type: likert_5 or forced_choice")
    is_reverse_keyed: bool = Field(default=False, description="Whether scoring direction is reversed")
    forced_choice_priority: bool = Field(default=False, description="Whether this is a high-priority discriminator")

    model_config = ConfigDict(
        str_strip_whitespace=True
    )
