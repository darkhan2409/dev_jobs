from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, or_, select
from contextlib import asynccontextmanager

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from datetime import datetime
import logging
from fastapi.responses import JSONResponse
from app.database import get_db
from app.models import Vacancy
from app.schemas import VacancyResponse, MetricsResponse, PaginatedVacancies, FiltersResponse
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    yield

app = FastAPI(title="DevJobs API", lifespan=lifespan)

# CORS Setup - parametrized from settings
# For production, set ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
allowed_origins = settings.ALLOWED_ORIGINS.split(",") if settings.ALLOWED_ORIGINS != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "DevJobs API"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""    
    logger = logging.getLogger("uvicorn.error")
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/api/metrics", response_model=MetricsResponse)
@cache(expire=300)
async def get_metrics(db: AsyncSession = Depends(get_db)):
    # 1. Total Count
    result = await db.execute(select(func.count(Vacancy.id)).filter(Vacancy.is_active == True))
    total = result.scalar()
    
    # 2. Grade Distribution
    result = await db.execute(
        select(Vacancy.grade, func.count(Vacancy.id))
        .filter(Vacancy.is_active == True, Vacancy.grade != None)
        .group_by(Vacancy.grade)
    )
    grades_query = result.all()
    
    grade_dist = {g: c for g, c in grades_query}
    
    # 3. Avg Salary by Grade (using normalized KZT salary for all currencies)
    result = await db.execute(
        select(Vacancy.grade, func.avg(Vacancy.salary_in_kzt))
        .filter(
            Vacancy.is_active == True,
            Vacancy.grade != None,
            Vacancy.salary_in_kzt != None
        )
        .group_by(Vacancy.grade)
    )
    salaries_query = result.all()
    
    avg_salary = {g: int(s) for g, s in salaries_query if s is not None}
    
    # 4. Top 10 Locations
    result = await db.execute(
        select(Vacancy.location, func.count(Vacancy.id))
        .filter(Vacancy.is_active == True, Vacancy.location != None)
        .group_by(Vacancy.location)
        .order_by(func.count(Vacancy.id).desc())
        .limit(10)
    )
    loc_query = result.all()
    
    top_locs = {l: c for l, c in loc_query}
    
    return MetricsResponse(
        total_count=total or 0,
        grade_distribution=grade_dist,
        avg_salary_by_grade=avg_salary,
        top_locations=top_locs
    )

@app.get("/api/filters", response_model=FiltersResponse)
@cache(expire=3600)
async def get_filters(db: AsyncSession = Depends(get_db)):
    """
    Returns metadata for UI filters:
    - Unique Locations
    - Unique Grades
    - Popular Technologies (hardcoded for now)
    """
    # Fetch unique locations
    result = await db.execute(
        select(Vacancy.location)
        .filter(Vacancy.is_active == True, Vacancy.location != None)
        .distinct()
    )
    locations_query = result.all()
    locations = sorted([loc[0] for loc in locations_query if loc[0]])

    # Fetch unique grades
    result = await db.execute(
        select(Vacancy.grade)
        .filter(Vacancy.is_active == True, Vacancy.grade != None)
        .distinct()
    )
    grades_query = result.all()
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
async def get_vacancies(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(21, ge=1, le=100, description="Number of records per page"),
    search: Optional[str] = None,
    location: Optional[str] = None,
    grade: Optional[str] = None,
    min_salary: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of vacancies with optional filters.
    """
    # Calculate skip based on page and per_page
    skip = (page - 1) * per_page
    
    # Filter only active vacancies
    query = select(Vacancy).filter(Vacancy.is_active == True)

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
        # Use normalized salary in KZT for correct cross-currency comparison
        query = query.filter(Vacancy.salary_in_kzt >= min_salary)
        
    if grade:
        query = query.filter(Vacancy.grade == grade)

    # Get total count before pagination
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar()

    # Sort: Published DESC, then Salary DESC (using normalized KZT salary)
    query = query.order_by(
        desc(Vacancy.published_at),
        desc(Vacancy.salary_in_kzt)
    )

    # Apply pagination
    result = await db.execute(query.offset(skip).limit(per_page))
    vacancies = result.scalars().all()
    
    return PaginatedVacancies(
        items=vacancies,
        total=total,
        page=page,
        per_page=per_page
    )

@app.get("/api/vacancies/{vacancy_id}", response_model=VacancyResponse)
async def get_vacancy(vacancy_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Vacancy).filter(
            Vacancy.id == vacancy_id,
            Vacancy.is_active == True
        )
    )
    vacancy = result.scalar_one_or_none()
    
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
