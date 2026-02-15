import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, select
from fastapi_cache.decorator import cache

from app.database import get_db
from app.models import Vacancy, Company
from app.schemas import CompaniesListResponse, CompanyDetailResponse, CompanyResponse

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.get("", response_model=CompaniesListResponse)
@cache(expire=3600)
async def get_companies(
    limit: int = Query(10, ge=1, le=100, description="Number of companies to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of companies from companies table.
    Only includes companies with active vacancies.
    Returns company metadata and vacancy count.
    """
    # Count total companies with active vacancies
    count_result = await db.execute(
        select(func.count(func.distinct(Company.id)))
        .select_from(Company)
        .join(Vacancy, Vacancy.company_id == Company.id)
        .filter(Vacancy.is_active == True)
    )
    total = count_result.scalar() or 0

    # Get companies with vacancy counts
    result = await db.execute(
        select(
            Company,
            func.count(Vacancy.id).label("vacancy_count")
        )
        .join(Vacancy, Vacancy.company_id == Company.id)
        .filter(Vacancy.is_active == True)
        .group_by(Company.id)
        .order_by(func.count(Vacancy.id).desc())
        .limit(limit)
    )
    rows = result.all()

    companies_list = [
        CompanyResponse(
            id=row[0].id,
            name=row[0].name,
            vacancy_count=row[1],
            logo_url=row[0].logo_url,
            site_url=row[0].site_url,
            description=row[0].description,
            company_type=row[0].company_type,
            area_name=row[0].area_name,
            industries=row[0].industries,
            trusted=row[0].trusted
        )
        for row in rows
    ]

    return CompaniesListResponse(
        items=companies_list,
        total=total
    )


@router.get("/id/{company_id}", response_model=CompanyDetailResponse)
async def get_company_detail_by_id(
    company_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(21, ge=1, le=100, description="Number of records per page"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get company details by ID and all its active vacancies.

    Args:
        company_id: Company ID from companies table

    Returns:
        Company metadata and list of active vacancies
    """
    # Fetch company
    company_result = await db.execute(
        select(Company).filter(Company.id == company_id)
    )
    company = company_result.scalar_one_or_none()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Count active vacancies
    count_result = await db.execute(
        select(func.count(Vacancy.id))
        .filter(
            Vacancy.is_active == True,
            Vacancy.company_id == company_id
        )
    )
    total = count_result.scalar() or 0

    if total == 0:
        raise HTTPException(status_code=404, detail="Company has no active vacancies")

    total_pages = max(1, math.ceil(total / per_page))
    if page > total_pages:
        raise HTTPException(status_code=404, detail="Page out of range")

    offset = (page - 1) * per_page

    # Fetch paginated vacancies
    result = await db.execute(
        select(Vacancy)
        .filter(
            Vacancy.is_active == True,
            Vacancy.company_id == company_id
        )
        .order_by(desc(Vacancy.published_at))
        .offset(offset)
        .limit(per_page)
    )
    vacancies = result.scalars().all()

    # Build company info
    company_info = CompanyResponse(
        id=company.id,
        name=company.name,
        vacancy_count=total,
        logo_url=company.logo_url,
        site_url=company.site_url,
        description=company.description,
        company_type=company.company_type,
        area_name=company.area_name,
        industries=company.industries,
        trusted=company.trusted
    )

    return CompanyDetailResponse(
        company=company_info,
        vacancies=vacancies,
        total=total,
        page=page,
        per_page=per_page
    )
