from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from fastapi_cache.decorator import cache

from app.database import get_db
from app.models import Vacancy
from app.schemas import MetricsResponse
from app.core.limiter import limiter

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])


@router.get("", response_model=MetricsResponse, summary="Get platform metrics", description="Returns aggregated statistics about vacancies including counts, grade distribution, average salaries, and top locations.")
@limiter.limit("100/minute")
@cache(expire=300)
async def get_metrics(request: Request, db: AsyncSession = Depends(get_db)):
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
