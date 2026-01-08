from datetime import datetime
from typing import Optional, Any, List
from pydantic import BaseModel, field_validator

class VacancyResponse(BaseModel):
    id: int
    title: str
    company_name: Optional[str] = None
    salary_from: Optional[int] = None
    salary_to: Optional[int] = None
    currency: str
    location: Optional[str] = None
    
    experience: Optional[str] = None
    employment: Optional[str] = None
    schedule: Optional[str] = None
    grade: Optional[str] = None

    published_at: Optional[str] = None  # Теперь строка
    description: Optional[str] = None
    url: str

    @field_validator('published_at', mode='before')
    @classmethod
    def format_date(cls, v: Optional[datetime]) -> Optional[str]:
        if v:
            return v.strftime("%d.%m.%Y")
        return None

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