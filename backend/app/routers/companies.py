import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, select
from fastapi_cache.decorator import cache
from urllib.parse import unquote

from app.database import get_db
from app.models import Vacancy
from app.schemas import CompaniesListResponse, CompanyDetailResponse

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.get("", response_model=CompaniesListResponse)
@cache(expire=3600)
async def get_companies(
    limit: int = Query(10, ge=1, le=100, description="Number of companies to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of companies aggregated from active vacancies.
    Returns company name, vacancy count, and logo.
    Optimized with GROUP BY and SQL-level LIMIT/OFFSET for performance.
    """
    # 1. Get total count of companies (efficient count)
    count_result = await db.execute(
        select(func.count(func.distinct(Vacancy.company_name)))
        .filter(Vacancy.is_active == True, Vacancy.company_name != None)
    )
    total = count_result.scalar() or 0

    # 2. Get paginated companies
    result = await db.execute(
        select(
            Vacancy.company_name,
            func.count(Vacancy.id).label("vacancy_count"),
            func.max(Vacancy.company_logo).label("logo_url")
        )
        .filter(
            Vacancy.is_active == True,
            Vacancy.company_name != None
        )
        .group_by(Vacancy.company_name)
        .order_by(func.count(Vacancy.id).desc())
        .limit(limit)
    )
    all_companies = result.all()

    companies_list = [
        {
            "name": row.company_name,
            "vacancy_count": row.vacancy_count,
            "logo_url": row.logo_url
        }
        for row in all_companies
    ]

    return CompaniesListResponse(
        items=companies_list,
        total=total
    )


@router.get("/{company_name}", response_model=CompanyDetailResponse)
async def get_company_detail(
    company_name: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Number of records per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get company details and all its active vacancies.
    
    Args:
        company_name: URL-encoded company name
        
    Returns:
        Company metadata and list of active vacancies
    """
    decoded_name = unquote(company_name)
    
    # Count active vacancies for this company
    count_result = await db.execute(
        select(func.count(Vacancy.id))
        .filter(
            Vacancy.is_active == True,
            Vacancy.company_name == decoded_name
        )
    )
    total = count_result.scalar() or 0

    if total == 0:
        raise HTTPException(status_code=404, detail="Company not found or has no active vacancies")

    total_pages = max(1, math.ceil(total / per_page))
    if page > total_pages:
        raise HTTPException(status_code=404, detail="Page out of range")

    # Fetch one vacancy for company metadata
    first_result = await db.execute(
        select(Vacancy)
        .filter(
            Vacancy.is_active == True,
            Vacancy.company_name == decoded_name
        )
        .order_by(desc(Vacancy.published_at))
        .limit(1)
    )
    first_vacancy = first_result.scalar_one()

    offset = (page - 1) * per_page

    # Find paginated active vacancies for this company
    result = await db.execute(
        select(Vacancy)
        .filter(
            Vacancy.is_active == True,
            Vacancy.company_name == decoded_name
        )
        .order_by(desc(Vacancy.published_at))
        .offset(offset)
        .limit(per_page)
    )
    vacancies = result.scalars().all()
    
    # Build company info from first vacancy
    company_info = {
        "name": decoded_name,
        "vacancy_count": total,
        "logo_url": first_vacancy.company_logo
    }
    
    # Try to get employer site URL from raw_data
    employer_data = first_vacancy.raw_data.get("employer", {})
    if employer_data.get("alternate_url"):
        company_info["site_url"] = employer_data.get("alternate_url")
    
    return CompanyDetailResponse(
        company=company_info,
        vacancies=vacancies,
        total=total,
        page=page,
        per_page=per_page
    )
