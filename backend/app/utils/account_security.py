"""
Account security utilities for rate limiting and lockout.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models import LoginAttempt


async def check_account_lockout(
    db: AsyncSession,
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    ip: Optional[str] = None,
    lockout_threshold: int = 5,
    lockout_window_minutes: int = 15
) -> tuple[bool, int]:
    """
    Check if account should be locked out due to too many failed login attempts.
    
    Args:
        db: Database session
        user_id: User ID to check
        email: Email/username to check (fallback if user_id not available)
        ip: Client IP address (optional)
        lockout_threshold: Number of failed attempts before lockout (default: 5)
        lockout_window_minutes: Time window to check for failed attempts (default: 15)
    
    Returns:
        tuple[bool, int]: (is_locked_out, failed_attempts_count)
    """
    if user_id is None and not email:
        return False, 0

    window_start = datetime.now(timezone.utc) - timedelta(minutes=lockout_window_minutes)
    
    # Count failed login attempts in the time window
    filters = [
        LoginAttempt.success == False,
        LoginAttempt.created_at >= window_start
    ]
    if user_id is not None:
        filters.append(LoginAttempt.user_id == user_id)
    elif email:
        filters.append(LoginAttempt.email == email)
    if ip:
        filters.append(LoginAttempt.ip_address == ip)

    result = await db.execute(
        select(func.count(LoginAttempt.id)).filter(*filters)
    )
    
    failed_count = result.scalar() or 0
    is_locked = failed_count >= lockout_threshold
    
    return is_locked, failed_count


async def get_lockout_remaining_time(
    db: AsyncSession,
    user_id: Optional[int] = None,
    email: Optional[str] = None,
    ip: Optional[str] = None,
    lockout_window_minutes: int = 15
) -> int:
    """
    Get remaining lockout time in seconds.
    
    Args:
        db: Database session
        user_id: User ID to check
        email: Email/username to check (fallback if user_id not available)
        ip: Client IP address (optional)
        lockout_window_minutes: Lockout window duration
    
    Returns:
        int: Remaining seconds until lockout expires (0 if not locked)
    """
    if user_id is None and not email:
        return 0

    window_start = datetime.now(timezone.utc) - timedelta(minutes=lockout_window_minutes)
    
    # Get the oldest failed attempt in the window
    filters = [
        LoginAttempt.success == False,
        LoginAttempt.created_at >= window_start
    ]
    if user_id is not None:
        filters.append(LoginAttempt.user_id == user_id)
    elif email:
        filters.append(LoginAttempt.email == email)
    if ip:
        filters.append(LoginAttempt.ip_address == ip)

    result = await db.execute(
        select(LoginAttempt.created_at)
        .filter(*filters)
        .order_by(LoginAttempt.created_at.asc())
        .limit(1)
    )
    
    oldest_attempt = result.scalar_one_or_none()
    
    if not oldest_attempt:
        return 0
    
    # Calculate when the lockout will expire
    lockout_expires_at = oldest_attempt + timedelta(minutes=lockout_window_minutes)
    remaining = (lockout_expires_at - datetime.now(timezone.utc)).total_seconds()
    
    return max(0, int(remaining))
