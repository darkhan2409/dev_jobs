"""
Signal data model.
"""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class Signal(BaseModel):
    """
    Represents a cognitive signal (thinking style).
    
    Validates: Requirements 2.1, 2.2, 2.4
    """
    id: str = Field(..., min_length=1, description="Unique identifier for the signal")
    name: str = Field(..., min_length=1, description="Name of the signal (e.g., 'analytical_thinking')")
    description: str = Field(..., min_length=1, description="Description of what this signal represents")
    category: Optional[str] = Field(None, description="Optional grouping category")
    
    model_config = ConfigDict(
        str_strip_whitespace=True
    )
