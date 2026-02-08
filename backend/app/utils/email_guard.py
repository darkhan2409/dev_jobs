"""
Email verification guard for protecting sensitive endpoints.
"""
from fastapi import Depends, HTTPException, status
from app.models import User
from app.auth import get_current_user


async def require_email_verified(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to require email verification.
    Use this for sensitive operations that should only be available to verified users.
    """
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required. Please verify your email to access this feature."
        )
    return current_user
