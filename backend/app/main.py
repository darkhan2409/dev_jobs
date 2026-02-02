from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
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
from app.models import Vacancy, User
from app.schemas import (
    VacancyResponse, MetricsResponse, PaginatedVacancies, 
    FiltersResponse, CompanyResponse, CompaniesListResponse, CompanyDetailResponse,
    UserCreate, UserOut, Token, UserProfileOut
)
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.routers import users, recommendations
from app.config import settings

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    yield

app = FastAPI(
    title="DevJobs API",
    description="API for DevJobs KZ - Kazakhstan IT Job Board. Provides endpoints for vacancies, companies, and metrics.",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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

app.include_router(users.router)
app.include_router(recommendations.router)

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

@app.get("/api/metrics", response_model=MetricsResponse, summary="Get platform metrics", description="Returns aggregated statistics about vacancies including counts, grade distribution, average salaries, and top locations.")
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

@app.get("/api/filters", response_model=FiltersResponse, summary="Get filter options", description="Returns available filter options for UI: locations, grades, and popular technologies.")
@limiter.limit("100/minute")
@cache(expire=3600)
async def get_filters(request: Request, db: AsyncSession = Depends(get_db)):
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

@app.get("/api/vacancies", response_model=PaginatedVacancies, summary="Get vacancies", description="Returns paginated list of IT vacancies with filtering and sorting options.")
@limiter.limit("100/minute")
@cache(expire=300)
async def get_vacancies(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(21, ge=1, le=100, description="Number of records per page"),
    search: Optional[str] = Query(None, description="Search in title, description, and company name"),
    location: Optional[str] = Query(None, description="Filter by location"),
    grade: Optional[str] = Query(None, description="Filter by grade (Junior, Middle, Senior, Lead)"),
    stack: Optional[str] = Query(None, description="Filter by technology stack"),
    min_salary: Optional[int] = Query(None, description="Minimum salary in KZT"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    sort: Optional[str] = Query("newest", description="Sort order: newest, oldest, salary_desc, salary_asc"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of vacancies with optional filters.
    
    **Sorting Options:**
    - `newest`: Most recent first (default)
    - `oldest`: Oldest first
    - `salary_desc`: Highest salary first
    - `salary_asc`: Lowest salary first
    """
    from sqlalchemy import asc
    
    # Calculate skip based on page and per_page
    skip = (page - 1) * per_page
    
    # Filter only active vacancies
    query = select(Vacancy).filter(Vacancy.is_active == True)

    if search:
        # Smart Search: Title OR Description OR Company Name (in raw_data)
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Vacancy.title.ilike(search_pattern),
                Vacancy.description.ilike(search_pattern),
                # Search in company name within raw_data JSONB
                Vacancy.raw_data['employer']['name'].astext.ilike(search_pattern)
            )
        )
    
    if location:
        query = query.filter(Vacancy.location == location)

    if min_salary:
        # Use normalized salary in KZT for correct cross-currency comparison
        query = query.filter(Vacancy.salary_in_kzt >= min_salary)
        
    if grade:
        # Support comma-separated grades for multi-select (e.g., "Junior,Middle")
        grades_list = [g.strip() for g in grade.split(',') if g.strip()]
        if len(grades_list) == 1:
            query = query.filter(Vacancy.grade == grades_list[0])
        elif len(grades_list) > 1:
            query = query.filter(Vacancy.grade.in_(grades_list))
        
    if stack:
        # Filter by Tech Stack (searching in key_skills array or description)
        # Note: key_skills is stored as an ARRAY or JSON in some DBs, but mapped as List[str].
        # For simple string matching in description if array query not available easily:
        stack_pattern = f"%{stack}%"
        query = query.filter(
            or_(
                Vacancy.description.ilike(stack_pattern),
                Vacancy.title.ilike(stack_pattern)
                # Ideally we check key_skills column if it's searchable
            )
        )

    if company:
        # Exact filter by company name in raw_data JSONB
        query = query.filter(
            Vacancy.raw_data['employer']['name'].astext == company
        )

    # Get total count before pagination
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    total = result.scalar()

    # Apply sorting based on sort parameter
    if sort == "oldest":
        query = query.order_by(asc(Vacancy.published_at))
    elif sort == "salary_desc":
        query = query.order_by(desc(Vacancy.salary_in_kzt).nulls_last(), desc(Vacancy.published_at))
    elif sort == "salary_asc":
        query = query.order_by(asc(Vacancy.salary_in_kzt).nulls_last(), desc(Vacancy.published_at))
    else:  # default: newest
        query = query.order_by(desc(Vacancy.published_at), desc(Vacancy.salary_in_kzt))

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

@app.get("/api/companies", response_model=CompaniesListResponse)
@cache(expire=3600)
async def get_companies(
    limit: int = Query(10, ge=1, le=100, description="Number of companies to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of companies aggregated from active vacancies.
    Returns company name, vacancy count, and logo.
    """
    # Get all active vacancies with company info
    result = await db.execute(
        select(Vacancy)
        .filter(Vacancy.is_active == True)
    )
    vacancies = result.scalars().all()
    
    # Aggregate companies
    companies_dict = {}
    for vacancy in vacancies:
        company_name = vacancy.company_name
        if not company_name:
            continue
            
        if company_name not in companies_dict:
            companies_dict[company_name] = {
                "name": company_name,
                "vacancy_count": 0,
                "logo_url": vacancy.company_logo
            }
        
        companies_dict[company_name]["vacancy_count"] += 1
        
        # Update logo if current vacancy has one and we don't have it yet
        if vacancy.company_logo and not companies_dict[company_name]["logo_url"]:
            companies_dict[company_name]["logo_url"] = vacancy.company_logo
    
    # Convert to list and sort by vacancy count
    companies_list = sorted(
        companies_dict.values(),
        key=lambda x: x["vacancy_count"],
        reverse=True
    )
    
    # Apply limit
    companies_list = companies_list[:limit]
    
    return CompaniesListResponse(
        items=companies_list,
        total=len(companies_dict)
    )

@app.get("/api/companies/{company_name}", response_model=CompanyDetailResponse)
async def get_company_detail(
    company_name: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get company details and all its active vacancies.
    
    Args:
        company_name: URL-encoded company name
        
    Returns:
        Company metadata and list of active vacancies
    """
    from urllib.parse import unquote
    decoded_name = unquote(company_name)
    
    # Find all active vacancies for this company
    result = await db.execute(
        select(Vacancy)
        .filter(
            Vacancy.is_active == True,
            Vacancy.raw_data['employer']['name'].astext == decoded_name
        )
        .order_by(desc(Vacancy.published_at))
    )
    vacancies = result.scalars().all()
    
    if not vacancies:
        raise HTTPException(status_code=404, detail="Company not found or has no active vacancies")
    
    # Build company info from first vacancy
    first_vacancy = vacancies[0]
    company_info = {
        "name": decoded_name,
        "vacancy_count": len(vacancies),
        "logo_url": first_vacancy.company_logo
    }
    
    # Try to get employer site URL from raw_data
    employer_data = first_vacancy.raw_data.get("employer", {})
    if employer_data.get("alternate_url"):
        company_info["site_url"] = employer_data.get("alternate_url")
    
    return CompanyDetailResponse(
        company=company_info,
        vacancies=vacancies
    )

# --- Authentication Endpoints ---
@app.post("/api/auth/register", response_model=UserOut, summary="Register new user")
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user with email and password.
    """
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@app.post("/api/auth/token", response_model=Token, summary="Login for access token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    OAuth2 compatible token login. Use email as username.
    """
    # Find user by email (username field contains email)
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(access_token=access_token, token_type="bearer")


@app.get("/api/auth/me", response_model=UserProfileOut, summary="Get current user")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current authenticated user's information.
    Protected endpoint - requires valid JWT token.
    """
    return current_user


# --- User Profile Endpoints ---
# --- User Profile Endpoints ---
# Moved to app.routers.users and app.routers.recommendations


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
