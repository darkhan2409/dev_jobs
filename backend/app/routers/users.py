import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.schemas import UserProfileUpdate, UserProfileOut
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

@router.put("/me/profile", response_model=UserProfileOut, summary="Update user profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the current user's profile information.
    Skills are automatically normalized to lowercase.
    """
    # Update fields if provided
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.location is not None:
        current_user.location = profile_data.location
    if profile_data.grade is not None:
        current_user.grade = profile_data.grade
    if profile_data.skills is not None:
        # Skills are already normalized by the schema validator
        current_user.skills = profile_data.skills
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/me/profile", response_model=UserProfileOut, summary="Get user profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current user's full profile information.
    """
    return current_user
