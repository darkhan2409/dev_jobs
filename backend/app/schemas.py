from datetime import datetime
from enum import Enum
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, field_validator, Field, EmailStr

from app.core.enums import GradeEnum, SortEnum
from app.utils.password_validator import validate_password_strength

class VacancyResponse(BaseModel):
    id: int
    title: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    salary_from: Optional[int] = None
    salary_to: Optional[int] = None
    salary_in_kzt: Optional[int] = None
    currency: Optional[str] = "KZT"
    location: Optional[str] = None
    grade: Optional[str] = None
    published_at: Optional[datetime] = None
    description: Optional[str] = None
    key_skills: Optional[List[str]] = None
    url: str
    raw_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class MetricsResponse(BaseModel):
    total_count: int
    grade_distribution: dict[str, int]
    avg_salary_by_grade: dict[str, int]
    top_locations: dict[str, int]

class PaginatedVacancies(BaseModel):
    items: List[VacancyResponse]
    total: int
    page: int
    per_page: int

class FiltersResponse(BaseModel):
    locations: List[str]
    grades: List[str]
    technologies: List[str]

class RoleMarketStatsResponse(BaseModel):
    role_id: str
    vacancy_count: int
    salary_range: Dict[str, Optional[int]]
    grade_distribution: Dict[str, int]
    salary_ranges_by_grade: Dict[str, Dict[str, Optional[int]]]
    companies_hiring_count: int
    hiring_company_share_percent: float
    top_skills: List[str]
    search_terms_used: List[str]

class CompanyResponse(BaseModel):
    id: int
    name: str
    vacancy_count: int
    logo_url: Optional[str] = None
    site_url: Optional[str] = None
    description: Optional[str] = None
    company_type: Optional[str] = None
    area_name: Optional[str] = None
    industries: Optional[List[dict]] = None
    trusted: bool = False

    class Config:
        from_attributes = True

class CompaniesListResponse(BaseModel):
    items: List[CompanyResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class CompanyDetailResponse(BaseModel):
    company: CompanyResponse
    vacancies: List[VacancyResponse]
    total: int
    page: int
    per_page: int


# Auth Schemas
class UserCreate(BaseModel):
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=30, 
        description="Username can contain letters, numbers, dots, underscores, and hyphens"
    )
    email: EmailStr
    password: str = Field(..., min_length=7, max_length=100)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength using shared utility."""
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        import re
        if not re.match(r'^[a-zA-Zа-яА-ЯёЁ0-9._-]+$', v):
            raise ValueError('Логин может содержать только буквы (латиница/кириллица), цифры, точки, тире и подчеркивания')
        return v


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=7, max_length=100)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        """Validate new password strength using shared utility."""
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v


class VerifyEmailRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=7, max_length=100)

    @field_validator('new_password')
    @classmethod
    def validate_reset_password(cls, v: str) -> str:
        """Validate new password strength using shared utility."""
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v


class SessionOut(BaseModel):
    id: int
    device_info: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    last_used_at: Optional[datetime]
    is_current: bool

    class Config:
        from_attributes = True


class DeleteAccountRequest(BaseModel):
    password: str


# User Profile Schemas
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None  # Junior, Middle, Senior, Lead
    skills: Optional[List[str]] = None
    bio: Optional[str] = None
    
    @field_validator('grade')
    @classmethod
    def validate_grade(cls, v):
        if v is not None and v not in ['Junior', 'Middle', 'Senior', 'Lead']:
            raise ValueError('Grade must be one of: Junior, Middle, Senior, Lead')
        return v
    
    @field_validator('skills')
    @classmethod
    def normalize_skills(cls, v):
        if v is not None:
            return [skill.lower().strip() for skill in v if skill.strip()]
        return v


class UserProfileOut(UserOut):
    role: str
    email_verified: bool
    email_verified_at: Optional[datetime] = None
    full_name: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None
    skills: List[str] = []
    bio: Optional[str] = None


# --- Interview Schemas ---

class AnswerOptionResponse(BaseModel):
    """Answer option for a question."""
    id: str
    text: str


class QuestionResponse(BaseModel):
    """Question with answer options."""
    id: str
    text: str
    thematic_block: str
    type: Optional[str] = None
    answer_options: List[AnswerOptionResponse]


class StartTestResponse(BaseModel):
    """Response when starting a new test."""
    session_id: str


class SubmitAnswerRequest(BaseModel):
    """Request body for submitting an answer."""
    question_id: str = Field(..., description="Question ID")
    answer_option_id: str = Field(..., description="Selected answer option ID")


class InterpretationResponse(BaseModel):
    """LLM interpretation of test results."""
    primary_recommendation: str
    explanation: str
    signal_analysis: str
    alternative_roles: List[str]
    differentiation_criteria: str
    why_this_role_reasons: List[str] = []


class RoleScoreResponse(BaseModel):
    """Role with its score."""
    role_id: str
    score: float


class TestStageScoreResponse(BaseModel):
    """Stage score in test results."""
    stage_id: str
    stage_name: str
    score: float


class TestStageRecommendationResponse(BaseModel):
    """Stage recommendation in test results."""
    primary_stage_id: str
    primary_stage_name: str
    what_user_will_see: str
    related_roles: List[str]


class TestResultResponse(BaseModel):
    """Complete test results."""
    session_id: str
    ranked_roles: List[RoleScoreResponse]
    signal_profile: dict
    interpretation: Optional[InterpretationResponse] = None
    # Stage recommendation (NEW)
    ranked_stages: Optional[List[TestStageScoreResponse]] = None
    stage_recommendation: Optional[TestStageRecommendationResponse] = None
    warnings: Optional[List[str]] = None


# --- Stage Schemas ---

class StageResponse(BaseModel):
    """Stage summary for list view."""
    id: str
    name: str
    summary: str


class PrimaryVacancyFiltersResponse(BaseModel):
    """Vacancy filters for a stage."""
    roles: List[str]
    keywords: List[str]
    # Allow missing fields if necessary, but keep strict for now


class StageDetailResponse(BaseModel):
    """Detailed stage information."""
    id: str
    name: str
    summary: str
    typical_outputs: List[str]
    common_mistakes: List[str]
    primary_vacancy_filters: PrimaryVacancyFiltersResponse


class StageRoleMapResponse(BaseModel):
    """Stage-role mapping."""
    stage_id: str
    role_id: str
    why_here: str
    how_it_connects_to_vacancies: str
    importance: str


class StageWithRolesResponse(BaseModel):
    """Stage with its associated roles."""
    stage: StageDetailResponse
    roles: List[StageRoleMapResponse]


# --- Analytics Schemas ---

class AnalyticsEventRequest(BaseModel):
    """One analytics event payload from frontend."""
    event_name: str = Field(..., min_length=1, max_length=120)
    source: str = Field(default="unknown", max_length=120)
    route: str = Field(default="unknown", max_length=255)
    user_type_guess: str = Field(default="unknown", max_length=32)
    session_id: Optional[str] = Field(default=None, max_length=128)
    timestamp: Optional[datetime] = None
    payload: Dict[str, Any] = Field(default_factory=dict)


class AnalyticsIngestRequest(BaseModel):
    """Batch of analytics events."""
    events: List[AnalyticsEventRequest] = Field(..., min_length=1, max_length=100)


class AnalyticsIngestResponse(BaseModel):
    """Accepted event count."""
    accepted: int
