from datetime import datetime
from typing import Optional, Any, List
from pydantic import BaseModel, field_validator

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