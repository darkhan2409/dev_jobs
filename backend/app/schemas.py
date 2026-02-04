from datetime import datetime
from enum import Enum
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, field_validator


class GradeEnum(str, Enum):
    """Allowed grade values for filtering vacancies."""
    junior = "Junior"
    middle = "Middle"
    senior = "Senior"
    lead = "Lead"


class SortEnum(str, Enum):
    """Allowed sort options for vacancies."""
    newest = "newest"
    oldest = "oldest"
    salary_desc = "salary_desc"
    salary_asc = "salary_asc"

class VacancyResponse(BaseModel):
    id: int
    title: str
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

class CompanyResponse(BaseModel):
    name: str
    vacancy_count: int
    logo_url: Optional[str] = None
    site_url: Optional[str] = None

class CompaniesListResponse(BaseModel):
    items: List[CompanyResponse]
    total: int

class CompanyDetailResponse(BaseModel):
    company: CompanyResponse
    vacancies: List[VacancyResponse]


# Auth Schemas
class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


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
    full_name: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None
    skills: List[str] = []
    bio: Optional[str] = None