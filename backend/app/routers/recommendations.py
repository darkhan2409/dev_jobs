from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import User, Vacancy
from app.schemas import VacancyResponse
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/recommendations",
    tags=["recommendations"]
)

RECOMMENDATIONS_PREFILTER_CAP = 500
RECOMMENDATIONS_LIMIT = 20


@router.get("", response_model=List[VacancyResponse], summary="Get personalized recommendations")
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get personalized vacancy recommendations based on user's grade and skills.
    
    Logic:
    - If user has no grade or skills, returns latest 20 vacancies
    - Filters by grade (±1 level)
    - Scores by skill match
    - Sorts by score DESC, then published_at DESC
    """
    # Fallback: if no profile data, return latest vacancies
    if not current_user.grade and not current_user.skills:
        result = await db.execute(
            select(Vacancy)
            .filter(Vacancy.is_active == True)
            .order_by(desc(Vacancy.published_at))
            .limit(RECOMMENDATIONS_LIMIT)
        )
        return result.scalars().all()
    
    # Grade filtering logic
    grade_map = {
        'Junior': ['Junior', 'Middle'],
        'Middle': ['Junior', 'Middle', 'Senior'],
        'Senior': ['Middle', 'Senior', 'Lead'],
        'Lead': ['Senior', 'Lead']
    }
    
    query = select(Vacancy).filter(Vacancy.is_active == True)
    
    # Apply grade filter if user has grade
    if current_user.grade and current_user.grade in grade_map:
        allowed_grades = grade_map[current_user.grade]
        query = query.filter(Vacancy.grade.in_(allowed_grades))
    
    # SQL prefilter before in-memory scoring to cap memory usage.
    if current_user.skills:
        query = query.filter(Vacancy.key_skills.isnot(None))

    query = query.order_by(desc(Vacancy.published_at)).limit(RECOMMENDATIONS_PREFILTER_CAP)

    result = await db.execute(query)
    vacancies = result.scalars().all()
    
    # If user has skills, calculate match scores
    if current_user.skills:
        user_skills = set(s.lower() for s in current_user.skills)
        
        # Calculate scores
        scored_vacancies = []
        for vacancy in vacancies:
            vacancy_skills = set(
                s.lower() for s in (vacancy.key_skills or [])
            )
            score = len(user_skills & vacancy_skills)
            scored_vacancies.append((vacancy, score))
        
        # Sort by score DESC, then published_at DESC
        scored_vacancies.sort(
            key=lambda x: (x[1], x[0].published_at or datetime.min),
            reverse=True
        )
        
        # Return top recommendations limit.
        return [v[0] for v in scored_vacancies[:RECOMMENDATIONS_LIMIT]]
    
    # No skills, just sort by date
    vacancies_list = sorted(
        vacancies,
        key=lambda v: v.published_at or datetime.min,
        reverse=True
    )
    return vacancies_list[:RECOMMENDATIONS_LIMIT]
