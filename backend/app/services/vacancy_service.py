from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, or_, select, asc, String
from fastapi import HTTPException, status

from app.models import Vacancy
from app.core.enums import GradeEnum
from app.schemas import SortEnum

# Role to vacancy search terms mapping
ROLE_SEARCH_MAPPING = {
    "backend_developer": ["backend", "бэкенд", "python developer", "java developer", "go developer", "django", "fastapi", "spring"],
    "frontend_developer": ["frontend", "фронтенд", "react", "vue", "angular", "верстальщик", "javascript developer"],
    "product_manager": ["product manager", "продакт", "product owner", "менеджер продукта"],
    "uiux_designer": ["ui/ux", "ux designer", "ui designer", "дизайнер интерфейсов", "figma", "product designer"],
    "ai_data_engineer": ["data engineer", "data scientist", "ml engineer", "machine learning", "аналитик данных", "data analyst"],
    "qa_engineer": ["qa", "тестировщик", "quality assurance", "test engineer", "автотестирование"],
    "devops_engineer": ["devops", "sre", "site reliability", "infrastructure", "системный администратор", "cloud engineer"],
}

def _escape_ilike_value(raw_value: str) -> str:
    """Escape wildcard symbols used by SQL ILIKE."""
    return raw_value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


class VacancyService:
    @staticmethod
    async def get_filters(db: AsyncSession):
        """
        Fetch unique locations, grades, and technologies for UI filters.
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

        # Dynamic popular techs from key_skills
        tech = func.lower(func.trim(func.jsonb_array_elements_text(Vacancy.key_skills))).label("tech")
        result = await db.execute(
            select(tech, func.count().label("cnt"))
            .filter(
                Vacancy.is_active == True,
                Vacancy.key_skills.isnot(None),
                func.jsonb_array_length(Vacancy.key_skills) > 0
            )
            .group_by(tech)
            .order_by(desc("cnt"))
            .limit(30)
        )
        tech_rows = result.all()
        technologies = [row.tech for row in tech_rows if row.tech]

        return {
            "locations": locations,
            "grades": grades,
            "technologies": technologies
        }

    @staticmethod
    async def get_vacancies(
        db: AsyncSession,
        page: int,
        per_page: int,
        search: Optional[str] = None,
        location: Optional[str] = None,
        grade: Optional[str] = None,
        stack: Optional[str] = None,
        min_salary: Optional[int] = None,
        company: Optional[str] = None,
        sort: SortEnum = SortEnum.newest
    ) -> Tuple[List[Vacancy], int]:
        """
        Get paginated vacancies with filters and sorting.
        """
        skip = (page - 1) * per_page
        
        # Base query: only active vacancies
        query = select(Vacancy).filter(Vacancy.is_active == True)

        if search:
            # Full Text Search via Postgres
            ts_query = func.websearch_to_tsquery('simple', search)
            escaped_search = _escape_ilike_value(search)
            query = query.filter(
                or_(
                    Vacancy.search_vector.op('@@')(ts_query),
                    Vacancy.company_name.ilike(f"%{escaped_search}%", escape="\\")
                )
            )
        
        if location:
            query = query.filter(Vacancy.location == location)

        if min_salary:
            query = query.filter(Vacancy.salary_in_kzt >= min_salary)
            
        if grade:
            # Support comma-separated grades or single value
            valid_grades = {e.value for e in GradeEnum}
            grades_list = [g.strip() for g in grade.split(',') if g.strip()]
            
            # Validation is usually done at Pydantic/Validator level or here
            invalid_grades = [g for g in grades_list if g not in valid_grades]
            if invalid_grades:
                 raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid grade value(s): {', '.join(invalid_grades)}. Allowed: {', '.join(valid_grades)}"
                )

            if len(grades_list) == 1:
                query = query.filter(Vacancy.grade == grades_list[0])
            elif len(grades_list) > 1:
                query = query.filter(Vacancy.grade.in_(grades_list))
            
        if stack:
            escaped_stack = _escape_ilike_value(stack)
            stack_pattern = f"%{escaped_stack}%"
            query = query.filter(
                or_(
                    Vacancy.description.ilike(stack_pattern, escape="\\"),
                    Vacancy.title.ilike(stack_pattern, escape="\\")
                )
            )

        if company:
            escaped_company = _escape_ilike_value(company)
            query = query.filter(Vacancy.company_name.ilike(f"%{escaped_company}%", escape="\\"))

        # Get total count (optimized count query)
        count_query = select(func.count()).select_from(query.subquery())
        result = await db.execute(count_query)
        total = result.scalar() or 0

        # Sorting
        if sort == SortEnum.oldest:
            query = query.order_by(asc(Vacancy.published_at))
        elif sort == SortEnum.salary_desc:
            query = query.order_by(desc(Vacancy.salary_in_kzt).nulls_last(), desc(Vacancy.published_at))
        elif sort == SortEnum.salary_asc:
            query = query.order_by(asc(Vacancy.salary_in_kzt).nulls_last(), desc(Vacancy.published_at))
        else:  # newest
            query = query.order_by(desc(Vacancy.published_at), desc(Vacancy.salary_in_kzt))

        # Pagination
        result = await db.execute(query.offset(skip).limit(per_page))
        vacancies = result.scalars().all()
        
        return vacancies, total

    @staticmethod
    async def get_vacancy_by_id(db: AsyncSession, vacancy_id: int) -> Optional[Vacancy]:
        """
        Get single vacancy by ID.
        """
        result = await db.execute(
            select(Vacancy).filter(
                Vacancy.id == vacancy_id,
                Vacancy.is_active == True
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_role_market_stats(
        db: AsyncSession,
        search_terms: List[str]
    ) -> Dict[str, Any]:
        """
        Aggregate vacancy market stats for a role using search terms.
        Returns: vacancy_count, salary_range, grade_distribution,
        salary_ranges_by_grade, companies_hiring_count, hiring_company_share_percent, top_skills
        """
        # Build filter: match any search term in title
        title_filters = [
            Vacancy.title.ilike(f"%{_escape_ilike_value(term)}%", escape="\\")
            for term in search_terms
        ]
        base_filter = or_(*title_filters)

        # Count total matching vacancies
        count_result = await db.execute(
            select(func.count(Vacancy.id))
            .filter(Vacancy.is_active == True, base_filter)
        )
        vacancy_count = count_result.scalar() or 0

        # Salary stats (min, max, avg)
        salary_result = await db.execute(
            select(
                func.min(Vacancy.salary_from).label("min_salary"),
                func.max(Vacancy.salary_to).label("max_salary"),
                func.avg(Vacancy.salary_in_kzt).label("avg_salary")
            )
            .filter(
                Vacancy.is_active == True,
                base_filter,
                Vacancy.salary_in_kzt.isnot(None)
            )
        )
        salary_row = salary_result.first()
        salary_range = {
            "min": int(salary_row.min_salary) if salary_row.min_salary else None,
            "max": int(salary_row.max_salary) if salary_row.max_salary else None,
            "avg": int(salary_row.avg_salary) if salary_row.avg_salary else None,
        }

        # Grade distribution
        grade_result = await db.execute(
            select(Vacancy.grade, func.count().label("count"))
            .filter(
                Vacancy.is_active == True,
                base_filter,
                Vacancy.grade.isnot(None)
            )
            .group_by(Vacancy.grade)
        )
        grade_rows = grade_result.all()
        grade_distribution = {row.grade: row.count for row in grade_rows}

        # Salary ranges by grade (min/max/avg in KZT)
        grade_salary_result = await db.execute(
            select(
                Vacancy.grade,
                func.min(Vacancy.salary_in_kzt).label("min_salary"),
                func.max(Vacancy.salary_in_kzt).label("max_salary"),
                func.avg(Vacancy.salary_in_kzt).label("avg_salary"),
            )
            .filter(
                Vacancy.is_active == True,
                base_filter,
                Vacancy.grade.isnot(None),
                Vacancy.salary_in_kzt.isnot(None),
            )
            .group_by(Vacancy.grade)
        )
        grade_salary_rows = grade_salary_result.all()
        salary_ranges_by_grade = {
            row.grade: {
                "min": int(row.min_salary) if row.min_salary else None,
                "max": int(row.max_salary) if row.max_salary else None,
                "avg": int(row.avg_salary) if row.avg_salary else None,
            }
            for row in grade_salary_rows
            if row.grade
        }

        # Companies hiring stats for this role vs all active hiring companies
        company_identity = func.coalesce(func.cast(Vacancy.company_id, String), Vacancy.company_name)
        total_companies_result = await db.execute(
            select(func.count(func.distinct(company_identity)))
            .filter(
                Vacancy.is_active == True,
                company_identity.isnot(None),
            )
        )
        total_hiring_companies = total_companies_result.scalar() or 0

        matching_companies_result = await db.execute(
            select(func.count(func.distinct(company_identity)))
            .filter(
                Vacancy.is_active == True,
                base_filter,
                company_identity.isnot(None),
            )
        )
        companies_hiring_count = matching_companies_result.scalar() or 0
        hiring_company_share_percent = (
            round((companies_hiring_count / total_hiring_companies) * 100, 1)
            if total_hiring_companies > 0
            else 0.0
        )

        # Top 10 skills from key_skills
        tech = func.lower(func.trim(func.jsonb_array_elements_text(Vacancy.key_skills))).label("tech")
        tech_result = await db.execute(
            select(tech, func.count().label("cnt"))
            .filter(
                Vacancy.is_active == True,
                base_filter,
                Vacancy.key_skills.isnot(None),
                func.jsonb_array_length(Vacancy.key_skills) > 0
            )
            .group_by(tech)
            .order_by(desc("cnt"))
            .limit(10)
        )
        tech_rows = tech_result.all()
        top_skills = [row.tech for row in tech_rows if row.tech]

        return {
            "vacancy_count": vacancy_count,
            "salary_range": salary_range,
            "grade_distribution": grade_distribution,
            "salary_ranges_by_grade": salary_ranges_by_grade,
            "companies_hiring_count": companies_hiring_count,
            "hiring_company_share_percent": hiring_company_share_percent,
            "top_skills": top_skills
        }
