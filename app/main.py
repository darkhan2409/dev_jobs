from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from contextlib import asynccontextmanager

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache

from app.database import SessionLocal, get_db
from app.models import Vacancy
from app.schemas import VacancyResponse, MetricsResponse, PaginatedVacancies, FiltersResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    yield

app = FastAPI(title="DevJobs API", lifespan=lifespan)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/metrics", response_model=MetricsResponse)
@cache(expire=300)
def get_metrics(db: Session = Depends(get_db)):
    # 1. Total Count
    total = db.query(func.count(Vacancy.id)).filter(Vacancy.is_active == True).scalar()
    
    # 2. Grade Distribution
    grades_query = db.query(
        Vacancy.grade, func.count(Vacancy.id)
    ).filter(
        Vacancy.is_active == True,
        Vacancy.grade != None
    ).group_by(Vacancy.grade).all()
    
    grade_dist = {g: c for g, c in grades_query}
    
    # 3. Avg Salary by Grade (KZT only)
    salary_avg_expr = func.avg(
        (func.coalesce(Vacancy.salary_from, Vacancy.salary_to) + 
         func.coalesce(Vacancy.salary_to, Vacancy.salary_from)) / 2
    )
    
    salaries_query = db.query(
        Vacancy.grade, salary_avg_expr
    ).filter(
        Vacancy.is_active == True,
        Vacancy.currency == 'KZT', 
        Vacancy.grade != None,
        (Vacancy.salary_from != None) | (Vacancy.salary_to != None)
    ).group_by(Vacancy.grade).all()
    
    avg_salary = {g: int(s) for g, s in salaries_query if s is not None}
    
    # 4. Top 10 Locations
    loc_query = db.query(
        Vacancy.location, func.count(Vacancy.id)
    ).filter(
        Vacancy.is_active == True,
        Vacancy.location != None
    ).group_by(Vacancy.location).order_by(func.count(Vacancy.id).desc()).limit(10).all()
    
    top_locs = {l: c for l, c in loc_query}
    
    return MetricsResponse(
        total_count=total or 0,
        grade_distribution=grade_dist,
        avg_salary_by_grade=avg_salary,
        top_locations=top_locs
    )

@app.get("/api/filters", response_model=FiltersResponse)
@cache(expire=3600)
def get_filters(db: Session = Depends(get_db)):
    """
    Returns metadata for UI filters:
    - Unique Locations
    - Unique Grades
    - Popular Technologies (hardcoded for now)
    """
    # Fetch unique locations
    locations_query = db.query(Vacancy.location).filter(
        Vacancy.is_active == True, 
        Vacancy.location != None
    ).distinct().all()
    locations = sorted([loc[0] for loc in locations_query if loc[0]])

    # Fetch unique grades
    grades_query = db.query(Vacancy.grade).filter(
        Vacancy.is_active == True, 
        Vacancy.grade != None
    ).distinct().all()
    grades = sorted([g[0] for g in grades_query if g[0]])

    # Hardcoded popular techs
    technologies = ["Python", "Java", "Go", "JS", "React", "C++", "C#", "PHP", "Rust", "Swift"]

    return FiltersResponse(
        locations=locations,
        grades=grades,
        technologies=technologies
    )

@app.get("/api/vacancies", response_model=PaginatedVacancies)
@cache(expire=300)
def get_vacancies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    search: Optional[str] = None,
    location: Optional[str] = None,
    grade: Optional[str] = None,
    min_salary: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # Filter only active vacancies
    query = db.query(Vacancy).filter(Vacancy.is_active == True)

    if search:
        # Smart Search: Title OR Description
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Vacancy.title.ilike(search_pattern),
                Vacancy.description.ilike(search_pattern)
            )
        )
    
    if location:
        query = query.filter(Vacancy.location == location)

    if min_salary:
        # Check if either salary_from OR salary_to meets expectation
        query = query.filter(
            or_(
                Vacancy.salary_from >= min_salary,
                Vacancy.salary_to >= min_salary
            )
        )
        
    if grade:
        query = query.filter(Vacancy.grade == grade)

    # Get total count before pagination
    total = query.count()

    # Sort: Published DESC, then Salary DESC
    # Nulls last for salary sort is often good, strictly following req:
    query = query.order_by(
        desc(Vacancy.published_at),
        desc(Vacancy.salary_from)
    )

    # Apply pagination
    vacancies = query.offset(skip).limit(limit).all()
    
    # Calculate page number for response
    current_page = (skip // limit) + 1
    
    return PaginatedVacancies(
        items=vacancies,
        total=total,
        page=current_page,
        per_page=limit
    )

@app.get("/api/vacancies/{vacancy_id}", response_model=VacancyResponse)
def get_vacancy(vacancy_id: int, db: Session = Depends(get_db)):
    vacancy = db.query(Vacancy).filter(
        Vacancy.id == vacancy_id, 
        Vacancy.is_active == True
    ).first()
    
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
        
    return vacancy

# --- Internal Admin Endpoints ---
@app.post("/api/internal/clear-cache")
async def clear_cache(secret: str):
    """
    Force clear the entire In-Memory cache.
    Protected by a simple secret token.
    """
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    INTERNAL_SECRET = os.getenv("INTERNAL_SECRET")
    
    if secret != INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret token")
        
    await FastAPICache.clear()
    return {"status": "ok", "message": "Cache successfully cleared"}
