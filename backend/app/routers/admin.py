from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, select
from fastapi_cache import FastAPICache

from app.database import get_db
from app.models import User, Vacancy, LoginAttempt
from app.config import settings
from app.auth import require_admin

router = APIRouter(prefix="/api", tags=["Admin"])


async def verify_admin_secret(x_admin_secret: str = Header(..., description="Admin secret token")):
    """
    Verify admin secret token from Header.
    DEPRECATED: Use role-based auth (require_admin) instead for user-initiated requests.
    This is kept only for internal/automated tools.
    """
    if x_admin_secret != settings.INTERNAL_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret token")


@router.post("/internal/clear-cache")
async def clear_cache(authorized: None = Depends(verify_admin_secret)):
    """
    Force clear the entire In-Memory cache.
    Protected by X-Admin-Secret header.
    """
    await FastAPICache.clear()
    return {"status": "ok", "message": "Cache successfully cleared"}


@router.get("/admin/users", summary="Get all users (Admin)")
async def get_all_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all registered users with their profiles.
    Protected by role-based auth (requires admin role).
    """
    result = await db.execute(
        select(User).order_by(desc(User.created_at))
    )
    users = result.scalars().all()

    return {
        "total": len(users),
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "email_verified": u.email_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
                "full_name": u.full_name,
                "location": u.location,
                "grade": u.grade,
                "skills": u.skills,
                "bio": u.bio
            }
            for u in users
        ]
    }


@router.get("/admin/stats", summary="Get platform stats (Admin)")
async def get_admin_stats(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get platform statistics: users, vacancies, etc.
    Protected by role-based auth (requires admin role).
    """
    # Users count
    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar()

    # Active users (with profile filled - have skills)
    # Skills is a JSON array, need to check if it's not empty
    result = await db.execute(
        select(func.count(User.id)).filter(
            User.skills.isnot(None),
            func.jsonb_array_length(User.skills) > 0
        )
    )
    users_with_profile = result.scalar()

    # Vacancies count
    result = await db.execute(
        select(func.count(Vacancy.id)).filter(Vacancy.is_active == True)
    )
    active_vacancies = result.scalar()

    # Companies count
    result = await db.execute(
        select(func.count(func.distinct(Vacancy.company_name)))
        .filter(Vacancy.is_active == True, Vacancy.company_name != None)
    )
    total_companies = result.scalar()

    return {
        "users": {
            "total": total_users,
            "with_profile": users_with_profile
        },
        "vacancies": {
            "active": active_vacancies
        },
        "companies": {
            "total": total_companies
        }
    }


@router.put("/admin/users/{user_id}/role", summary="Update user role (Admin)")
async def update_user_role(
    user_id: int,
    new_role: str = Body(..., embed=True),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's role.
    Protected by role-based auth (requires admin role).
    """
    if new_role not in ["user", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be 'user' or 'admin'"
        )

    # Get user
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent self-demotion
    if user.id == admin.id and new_role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Cannot remove your own admin role"
        )

    user.role = new_role
    await db.commit()

    return {
        "message": f"User {user.email} role updated to {new_role}",
        "user_id": user.id,
        "new_role": new_role
    }


@router.get("/admin/login-attempts", summary="Get login attempts (Admin)")
async def get_login_attempts(
    limit: int = 100,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent login attempts for security monitoring.
    Protected by role-based auth (requires admin role).
    """
    result = await db.execute(
        select(LoginAttempt)
        .order_by(desc(LoginAttempt.created_at))
        .limit(limit)
    )
    attempts = result.scalars().all()

    return {
        "total": len(attempts),
        "attempts": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "email": a.email,
                "ip_address": a.ip_address,
                "user_agent": a.user_agent,
                "success": a.success,
                "failure_reason": a.failure_reason,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in attempts
        ]
    }
