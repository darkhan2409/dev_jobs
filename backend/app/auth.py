"""
Authentication utilities for JWT-based auth.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
import hashlib

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, RefreshToken, EmailVerificationToken, PasswordResetToken
from app.config import settings

# Configuration from settings (reads from .env)
# No fallback - fail fast if JWT_SECRET_KEY is not set
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
EMAIL_VERIFICATION_EXPIRE_HOURS = settings.EMAIL_VERIFICATION_EXPIRE_HOURS
PASSWORD_RESET_EXPIRE_HOURS = settings.PASSWORD_RESET_EXPIRE_HOURS

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    Validates the JWT token and returns the user from database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Fetch user from database
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return user


# --- Refresh Token Functions ---

def create_refresh_token() -> str:
    """Generate a secure random refresh token."""
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    """Hash a token for secure storage."""
    return hashlib.sha256(token.encode()).hexdigest()


async def save_refresh_token(
    db: AsyncSession,
    user_id: int,
    token: str,
    device_info: Optional[str] = None,
    ip: Optional[str] = None,
    max_sessions: int = 10
) -> RefreshToken:
    """
    Save a refresh token to the database.
    Enforces maximum number of active sessions per user (default: 10).
    """
    # Check current active sessions count
    result = await db.execute(
        select(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc)
        ).order_by(RefreshToken.created_at.asc())
    )
    active_sessions = result.scalars().all()
    
    # If at max sessions, revoke the oldest one
    if len(active_sessions) >= max_sessions:
        oldest_session = active_sessions[0]
        oldest_session.revoked = True
        oldest_session.revoked_at = datetime.now(timezone.utc)
    
    token_hash = hash_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_token = RefreshToken(
        user_id=user_id,
        token=token_hash,
        expires_at=expires_at,
        device_info=device_info,
        ip_address=ip,
        last_used_at=datetime.now(timezone.utc)
    )

    db.add(refresh_token)
    await db.commit()
    await db.refresh(refresh_token)

    return refresh_token


async def verify_refresh_token(db: AsyncSession, token: str) -> Optional[RefreshToken]:
    """Verify a refresh token and return it if valid."""
    token_hash = hash_token(token)

    result = await db.execute(
        select(RefreshToken).filter(
            RefreshToken.token == token_hash,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc)
        )
    )

    return result.scalar_one_or_none()


async def revoke_refresh_token(db: AsyncSession, token: str) -> bool:
    """Revoke a refresh token."""
    token_hash = hash_token(token)

    result = await db.execute(
        select(RefreshToken).filter(RefreshToken.token == token_hash)
    )
    refresh_token = result.scalar_one_or_none()

    if refresh_token:
        refresh_token.revoked = True
        refresh_token.revoked_at = datetime.now(timezone.utc)
        await db.commit()
        return True

    return False


async def revoke_all_user_tokens(db: AsyncSession, user_id: int):
    """Revoke all refresh tokens for a user."""
    result = await db.execute(
        select(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        )
    )
    tokens = result.scalars().all()

    for token in tokens:
        token.revoked = True
        token.revoked_at = datetime.now(timezone.utc)

    await db.commit()


# --- Role Checking ---

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# --- Email Verification ---

def generate_verification_code() -> str:
    """Generate a 6-digit verification code."""
    return str(secrets.randbelow(1000000)).zfill(6)


async def create_verification_token(db: AsyncSession, user_id: int) -> str:
    """Create an email verification token."""
    token = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=EMAIL_VERIFICATION_EXPIRE_HOURS)

    verification_token = EmailVerificationToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )

    db.add(verification_token)
    await db.commit()

    return token


async def verify_email_token(db: AsyncSession, token: str, user_id: int) -> Optional[User]:
    """Verify an email verification token and mark user as verified."""
    result = await db.execute(
        select(EmailVerificationToken).filter(
            EmailVerificationToken.token == token,
            EmailVerificationToken.user_id == user_id,
            EmailVerificationToken.used == False,
            EmailVerificationToken.expires_at > datetime.now(timezone.utc)
        )
    )

    verification_token = result.scalar_one_or_none()

    if not verification_token:
        return None

    # Mark token as used
    verification_token.used = True
    verification_token.used_at = datetime.now(timezone.utc)

    # Mark user as verified
    user_result = await db.execute(select(User).filter(User.id == user_id))
    user = user_result.scalar_one_or_none()

    if user:
        user.email_verified = True
        user.email_verified_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)

    return user


# --- Password Reset ---

async def create_password_reset_token(db: AsyncSession, user_id: int) -> str:
    """Create a password reset token."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=PASSWORD_RESET_EXPIRE_HOURS)

    reset_token = PasswordResetToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )

    db.add(reset_token)
    await db.commit()

    return token


async def verify_password_reset_token(db: AsyncSession, token: str) -> Optional[User]:
    """Verify a password reset token and return the user."""
    result = await db.execute(
        select(PasswordResetToken).filter(
            PasswordResetToken.token == token,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > datetime.now(timezone.utc)
        )
    )

    reset_token = result.scalar_one_or_none()

    if not reset_token:
        return None

    # Get user
    user_result = await db.execute(select(User).filter(User.id == reset_token.user_id))
    user = user_result.scalar_one_or_none()

    if user:
        # Mark token as used
        reset_token.used = True
        reset_token.used_at = datetime.now(timezone.utc)
        await db.commit()

    return user
