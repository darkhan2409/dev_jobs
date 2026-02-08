from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, or_

from app.database import get_db
from app.models import User, LoginAttempt, RefreshToken, EmailVerificationToken, PasswordResetToken
from app.schemas import (
    UserCreate, UserOut, Token, UserProfileOut,
    RefreshTokenRequest, ChangePasswordRequest,
    VerifyEmailRequest, ForgotPasswordRequest,
    ResetPasswordRequest, SessionOut, DeleteAccountRequest
)
from app.auth import (
    verify_password, get_password_hash, create_access_token, get_current_user,
    create_refresh_token, save_refresh_token, verify_refresh_token,
    revoke_refresh_token, revoke_all_user_tokens,
    create_verification_token, verify_email_token,
    create_password_reset_token, verify_password_reset_token,
    hash_token, oauth2_scheme
)
from app.core.limiter import limiter
from app.services.email_service import email_service
from app.utils.account_security import check_account_lockout, get_lockout_remaining_time

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut, summary="Register new user")
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user with email and password.
    """
    # Check if user already exists by email
    result = await db.execute(select(User).filter(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    result = await db.execute(select(User).filter(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@router.post("/token", response_model=Token, summary="Login for access token")
@limiter.limit("5/minute")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    OAuth2 compatible token login. Use email as username.
    Returns both access_token (15 min) and refresh_token (7 days).
    """
    # Check for account lockout
    is_locked, failed_count = await check_account_lockout(db, form_data.username)
    
    if is_locked:
        remaining_time = await get_lockout_remaining_time(db, form_data.username)
        minutes = remaining_time // 60
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to too many failed login attempts. Try again in {minutes} minutes."
        )
    
    # Get client info
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    # Find user by email or username
    from sqlalchemy import or_
    result = await db.execute(
        select(User).filter(
            or_(User.email == form_data.username, User.username == form_data.username)
        )
    )
    user = result.scalar_one_or_none()

    # Log failed attempt if user not found
    if not user:
        login_attempt = LoginAttempt(
            user_id=None,
            email=form_data.username,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            failure_reason="user_not_found"
        )
        db.add(login_attempt)
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data.password, user.hashed_password):
        login_attempt = LoginAttempt(
            user_id=user.id,
            email=form_data.username,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            failure_reason="invalid_password"
        )
        db.add(login_attempt)
        await db.commit()

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

    # Create tokens
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token()

    # Save refresh token to database
    await save_refresh_token(
        db=db,
        user_id=user.id,
        token=refresh_token,
        device_info=user_agent,
        ip=client_ip
    )

    # Update user last login info
    user.last_login_at = datetime.now(timezone.utc)
    user.last_login_ip = client_ip

    # Log successful login
    login_attempt = LoginAttempt(
        user_id=user.id,
        email=form_data.username,
        ip_address=client_ip,
        user_agent=user_agent,
        success=True,
        failure_reason=None
    )
    db.add(login_attempt)

    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserProfileOut, summary="Get current user")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current authenticated user's information.
    Protected endpoint - requires valid JWT token.
    """
    return current_user


@router.post("/refresh", summary="Refresh access token")
@limiter.limit("10/minute")
async def refresh_access_token(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using a valid refresh token.
    Returns a new access token (15 min) and a new refresh token (Token Rotation).
    The old refresh token is automatically revoked.
    """
    # Verify refresh token
    refresh_token_obj = await verify_refresh_token(db, refresh_data.refresh_token)

    if not refresh_token_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # Get user
    result = await db.execute(select(User).filter(User.id == refresh_token_obj.user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new access token
    access_token = create_access_token(data={"sub": user.email})
    
    # Token Rotation: Create new refresh token
    new_refresh_token = create_refresh_token()
    
    # Get client info
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Save new refresh token
    await save_refresh_token(
        db=db,
        user_id=user.id,
        token=new_refresh_token,
        device_info=user_agent,
        ip=client_ip
    )
    
    # Revoke old refresh token
    refresh_token_obj.revoked = True
    refresh_token_obj.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout", summary="Logout (revoke refresh token)")
async def logout(
    refresh_data: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout by revoking the provided refresh token.
    """
    await revoke_refresh_token(db, refresh_data.refresh_token)
    return {"message": "Successfully logged out"}


@router.post("/logout-all", summary="Logout from all devices")
async def logout_all_devices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout from all devices by revoking all refresh tokens.
    """
    await revoke_all_user_tokens(db, current_user.id)
    return {"message": "Successfully logged out from all devices"}


@router.post("/change-password", summary="Change password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change user password. Requires old password for verification.
    Logs out from all devices after successful password change.
    """
    # Verify old password
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)

    # Revoke all refresh tokens (logout everywhere for security)
    await revoke_all_user_tokens(db, current_user.id)

    await db.commit()

    return {"message": "Password changed successfully. Please log in again."}


@router.post("/send-verification-email", summary="Send email verification code")
@limiter.limit("3/hour")
async def send_verification_email(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send email verification code to the user's email.
    """
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Create verification token
    token = await create_verification_token(db, current_user.id)

    # Send email
    await email_service.send_verification_email(current_user, token)

    return {"message": "Verification code sent to your email"}


@router.post("/verify-email", summary="Verify email with code")
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    verify_data: VerifyEmailRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify email using the verification code.
    """
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Verify token
    user = await verify_email_token(db, verify_data.token, current_user.id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )

    return {"message": "Email verified successfully"}


@router.post("/forgot-password", summary="Request password reset")
@limiter.limit("3/hour")
async def forgot_password(
    request: Request,
    forgot_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset link. Always returns success for security.
    """
    # Find user by email
    result = await db.execute(select(User).filter(User.email == forgot_data.email))
    user = result.scalar_one_or_none()

    # Always return success (don't reveal if email exists)
    if user:
        # Create reset token
        token = await create_password_reset_token(db, user.id)

        # Send email
        await email_service.send_password_reset_email(user, token)

    return {"message": "If your email is registered, you will receive a password reset link"}


@router.post("/reset-password", summary="Reset password with token")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using the reset token from email.
    """
    # Verify token and get user
    user = await verify_password_reset_token(db, reset_data.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)

    # Revoke all refresh tokens (logout everywhere for security)
    await revoke_all_user_tokens(db, user.id)

    await db.commit()

    return {"message": "Password reset successfully. Please log in with your new password."}


@router.get("/sessions", response_model=List[SessionOut], summary="Get active sessions")
async def get_active_sessions(
    current_user: User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all active sessions (non-revoked refresh tokens) for the current user.
    """
    result = await db.execute(
        select(RefreshToken).filter(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc)
        ).order_by(RefreshToken.created_at.desc())
    )
    tokens = result.scalars().all()

    # Convert to SessionOut format
    sessions = []
    for refresh_token in tokens:
        # Check if this is the current session by comparing last_used_at
        # (most recently used token is likely the current one)
        is_current = (
            refresh_token.last_used_at is not None and
            refresh_token == tokens[0]  # Most recent
        )
        
        sessions.append(SessionOut(
            id=refresh_token.id,
            device_info=refresh_token.device_info,
            ip_address=refresh_token.ip_address,
            created_at=refresh_token.created_at,
            last_used_at=refresh_token.last_used_at,
            is_current=is_current
        ))

    return sessions


@router.delete("/sessions/{token_id}", summary="Revoke a specific session")
async def revoke_session(
    token_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoke a specific session by token ID.
    """
    # Get the token
    result = await db.execute(
        select(RefreshToken).filter(RefreshToken.id == token_id)
    )
    token = result.scalar_one_or_none()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    # Verify ownership
    if token.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Revoke token
    token.revoked = True
    token.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Session revoked successfully"}


@router.delete("/account", summary="Delete account")
@limiter.limit("3/hour")
async def delete_account(
    request: Request,
    delete_data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user account. Requires password confirmation.
    """
    # Verify password
    if not verify_password(delete_data.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    # Hard delete user and all related data
    user_id = current_user.id
    
    # Clean up related tables since we don't have cascade delete in DB
    await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    await db.execute(delete(EmailVerificationToken).where(EmailVerificationToken.user_id == user_id))
    await db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user_id))
    await db.execute(delete(LoginAttempt).where(LoginAttempt.user_id == user_id))
    
    # Finally delete the user
    await db.execute(delete(User).where(User.id == user_id))

    await db.commit()

    return {"message": "Account and all associated data deleted successfully"}
