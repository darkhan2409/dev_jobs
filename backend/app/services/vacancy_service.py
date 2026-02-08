from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, or_, select, asc
from fastapi import HTTPException, status

from app.models import Vacancy, GradeEnum
from app.schemas import SortEnum

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

        # Hardcoded popular techs (could be dynamic in future)
        technologies = ["Python", "Java", "Go", "JS", "React", "C++", "C#", "PHP", "Rust", "Swift"]

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
            query = query.filter(
                or_(
                    Vacancy.search_vector.op('@@')(ts_query),
                    Vacancy.company_name.ilike(f"%{search}%")
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
            stack_pattern = f"%{stack}%"
            query = query.filter(
                or_(
                    Vacancy.description.ilike(stack_pattern),
                    Vacancy.title.ilike(stack_pattern)
                )
            )

        if company:
            query = query.filter(Vacancy.company_name == company)

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
