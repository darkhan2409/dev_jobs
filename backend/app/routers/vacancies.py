from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_cache.decorator import cache

from app.database import get_db
from app.models import Vacancy
from app.core.enums import GradeEnum, SortEnum
from app.schemas import VacancyResponse, PaginatedVacancies, FiltersResponse, RoleMarketStatsResponse
from app.services.vacancy_service import VacancyService, ROLE_SEARCH_MAPPING
from app.core.limiter import limiter

router = APIRouter(prefix="/api", tags=["Vacancies"])

@router.get("/filters", response_model=FiltersResponse, summary="Get filter options", description="Returns available filter options for UI: locations, grades, and popular technologies.")
@limiter.limit("100/minute")
@cache(expire=3600)
async def get_filters(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Returns metadata for UI filters.
    Delegate to Service.
    """
    filters_data = await VacancyService.get_filters(db)
    return FiltersResponse(**filters_data)


@router.get("/vacancies", response_model=PaginatedVacancies, summary="Get vacancies", description="Returns paginated list of IT vacancies with filtering and sorting options.")
@limiter.limit("100/minute")
# @cache(expire=300) # Disabled: CACHE_BREAKS_FILTERS
async def get_vacancies(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(21, ge=1, le=100, description="Number of records per page"),
    search: Optional[str] = Query(None, description="Search in title, description, and company name"),
    location: Optional[str] = Query(None, description="Filter by location"),
    grade: Optional[str] = Query(None, description="Filter by grade (Junior, Middle, Senior, Lead). Supports comma-separated values."),
    stack: Optional[str] = Query(None, description="Filter by technology stack"),
    min_salary: Optional[int] = Query(None, description="Minimum salary in KZT"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    sort: SortEnum = Query(SortEnum.newest, description="Sort order: newest, oldest, salary_desc, salary_asc"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of vacancies with optional filters.
    Delegate to Service.
    """
    vacancies, total = await VacancyService.get_vacancies(
        db=db,
        page=page,
        per_page=per_page,
        search=search,
        location=location,
        grade=grade,
        stack=stack,
        min_salary=min_salary,
        company=company,
        sort=sort
    )
    
    return PaginatedVacancies(
        items=vacancies,
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/vacancies/{vacancy_id}", response_model=VacancyResponse)
async def get_vacancy(vacancy_id: int, db: AsyncSession = Depends(get_db)):
    vacancy = await VacancyService.get_vacancy_by_id(db, vacancy_id)

    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")

    return vacancy


@router.get(
    "/vacancies/market-stats/{role_id}",
    response_model=RoleMarketStatsResponse,
    summary="Get market stats for a career role",
    description="Returns vacancy count, salary ranges, grade distribution, and top skills for a role based on existing vacancy data."
)
@limiter.limit("60/minute")
@cache(expire=3600)
async def get_role_market_stats(
    request: Request,
    role_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get market statistics for a specific IT career role.
    Uses predefined search terms to match vacancies in the database.
    """
    # Look up search terms for this role
    search_terms = ROLE_SEARCH_MAPPING.get(role_id)

    if not search_terms:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_id}' not found. Available roles: {', '.join(ROLE_SEARCH_MAPPING.keys())}"
        )

    # Get aggregated stats from service
    stats = await VacancyService.get_role_market_stats(db, search_terms)

    return RoleMarketStatsResponse(
        role_id=role_id,
        vacancy_count=stats["vacancy_count"],
        salary_range=stats["salary_range"],
        grade_distribution=stats["grade_distribution"],
        salary_ranges_by_grade=stats["salary_ranges_by_grade"],
        companies_hiring_count=stats["companies_hiring_count"],
        hiring_company_share_percent=stats["hiring_company_share_percent"],
        top_skills=stats["top_skills"],
        search_terms_used=search_terms
    )
