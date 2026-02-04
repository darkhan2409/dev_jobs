"""
RoleProfile data model (Extended for Career Pipeline v2.0).
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class SharedSkill(BaseModel):
    """Represents skill overlap with another role."""
    role: str
    skills: List[str]
    overlap_percent: int = Field(ge=0, le=100)


class RoleProfile(BaseModel):
    """
    Represents an IT career role profile (Extended v2.0).
    
    Validates: Requirements 1.1, 1.2, 1.3
    """
    id: str = Field(..., min_length=1, description="Unique identifier for the role")
    name: str = Field(..., min_length=1, description="Name of the IT role")
    description: str = Field(..., min_length=1, description="Description of role tasks and responsibilities")
    
    # NEW: Entry difficulty level
    entry_difficulty: str = Field(
        default="junior", 
        description="Entry level: 'junior' | 'mid' | 'senior_only'"
    )
    
    # NEW: Detailed fields from Career Pipeline v2.0
    responsibilities: List[str] = Field(default=[], description="3-6 daily tasks")
    typical_stack: List[str] = Field(default=[], description="Languages/tools")
    core_skills: List[str] = Field(default=[], description="Key skills for success")
    what_this_role_is_not: List[str] = Field(default=[], description="Common misconceptions")
    red_flags: List[str] = Field(default=[], description="Signs this role is NOT for someone")
    entry_from: List[str] = Field(default=[], description="Roles people commonly transition from")
    can_grow_to: List[str] = Field(default=[], description="Career growth paths")
    shared_skills_with: List[SharedSkill] = Field(default=[], description="Skill overlap with other roles")
    
    # Existing fields
    key_signals: List[str] = Field(..., min_length=1, description="Signal IDs that strongly indicate this role")
    distinguishing_features: str = Field(..., min_length=1, description="What makes this role unique from similar roles")
    
    # NEW: Signal mapping for test integration
    signal_mapping: Dict[str, List[str]] = Field(
        default={},
        description="Mapping of strong_signals, weak_signals, anti_signals"
    )
    
    @field_validator('entry_difficulty')
    @classmethod
    def validate_entry_difficulty(cls, v: str) -> str:
        """Ensure entry_difficulty is one of allowed values."""
        allowed = ["junior", "mid", "senior_only"]
        if v not in allowed:
            raise ValueError(f"entry_difficulty must be one of {allowed}, got '{v}'")
        return v
    
    @field_validator('key_signals')
    @classmethod
    def validate_key_signals(cls, v: List[str]) -> List[str]:
        """Ensure at least one key signal is provided."""
        if not v or len(v) == 0:
            raise ValueError("Role profile must have at least one key signal")
        if any(not signal_id.strip() for signal_id in v):
            raise ValueError("All signal IDs must be non-empty strings")
        return v
    
    model_config = ConfigDict(
        str_strip_whitespace=True
    )

