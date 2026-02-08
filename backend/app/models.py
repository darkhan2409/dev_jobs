from datetime import datetime
from typing import Optional

from sqlalchemy import (
    String, 
    Text, 
    Boolean, 
    DateTime, 
    Integer, 
    func, 
    UniqueConstraint,
    Computed,
    Index
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.core.enums import GradeEnum


class Vacancy(Base):
    __tablename__ = "vacancies"

    id: Mapped[int] = mapped_column(primary_key=True)
    
    # ID из внешнего источника (HH.ru, Telegram и т.д.)
    external_id: Mapped[str] = mapped_column(String, index=True)
    
    # Источник (напр., 'hh', 'tg')
    source: Mapped[str] = mapped_column(String)
    
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    salary_from: Mapped[Optional[int]] = mapped_column(Integer)
    salary_to: Mapped[Optional[int]] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String, default="KZT", server_default="KZT")
    
    location: Mapped[Optional[str]] = mapped_column(String, index=True)
    
    # Новые поля для метаданных
    experience: Mapped[Optional[str]] = mapped_column(String)
    employment: Mapped[Optional[str]] = mapped_column(String)
    schedule: Mapped[Optional[str]] = mapped_column(String)
    
    # Автоматически определяемый уровень (Junior, Middle, Senior, Lead)
    grade: Mapped[Optional[str]] = mapped_column(String, index=True)

    url: Mapped[str] = mapped_column(String, unique=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    
    # AI Junk Filter: Track if vacancy has been checked by AI classifier
    is_ai_checked: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", index=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    # Дата публикации вакансии в источнике
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), 
        index=True
    )
    
    updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True), 
    server_default=func.now(), 
    onupdate=func.now() # SQLAlchemy сам обновит время при любом UPDATE
)
    
    # Название компании (денормализовано для индексации и быстрого поиска)
    company_name: Mapped[Optional[str]] = mapped_column(String, index=True)

    # URL логотипа компании
    company_logo: Mapped[Optional[str]] = mapped_column(String)
    
    # Зарплата, приведённая к KZT для единой сортировки/фильтрации
    salary_in_kzt: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    
    # Ключевые навыки (список технологий/требований)
    key_skills: Mapped[Optional[list]] = mapped_column(JSONB)
    
    # Хранение полных данных от API в формате JSONB
    raw_data: Mapped[dict] = mapped_column(JSONB)


    # Full Text Search Vector (Computed)
    search_vector: Mapped[Optional[str]] = mapped_column(
        TSVECTOR, 
        Computed("to_tsvector('simple', title || ' ' || coalesce(description, ''))", persisted=True)
    )

    # Ограничение уникальности: одна и та же вакансия из одного источника не может дублироваться
    __table_args__ = (
        UniqueConstraint("external_id", "source", name="unique_external_vacancy"),
        Index("ix_vacancies_search_vector", "search_vector", postgresql_using="gin"),
    )

    def __repr__(self) -> str:
        return f"<Vacancy(title={self.title}, source={self.source})>"


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Auth enhancements
    role: Mapped[str] = mapped_column(String, default="user", server_default="user")  # "user" | "admin"
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Profile fields
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # Junior, Middle, Senior, Lead
    skills: Mapped[list] = mapped_column(JSONB, default=list, server_default='[]')
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<User(email={self.email})>"


class RefreshToken(Base):
    """Refresh token model for session tracking."""
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    device_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<RefreshToken(user_id={self.user_id}, revoked={self.revoked})>"


class EmailVerificationToken(Base):
    """Email verification token model."""
    __tablename__ = "email_verification_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    used: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<EmailVerificationToken(user_id={self.user_id}, used={self.used})>"


class PasswordResetToken(Base):
    """Password reset token model."""
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    used: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<PasswordResetToken(user_id={self.user_id}, used={self.used})>"


class LoginAttempt(Base):
    """Login attempt logging model."""
    __tablename__ = "login_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    email: Mapped[str] = mapped_column(String, index=True)
    ip_address: Mapped[str] = mapped_column(String)
    user_agent: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    success: Mapped[bool] = mapped_column(Boolean)
    failure_reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # "invalid_password" | "user_not_found" | "rate_limit"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<LoginAttempt(email={self.email}, success={self.success})>"


class AdminAuditLog(Base):
    """Admin audit log model for security tracking."""
    __tablename__ = "admin_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    admin_user_id: Mapped[int] = mapped_column(Integer, index=True)
    admin_email: Mapped[str] = mapped_column(String, index=True)
    action: Mapped[str] = mapped_column(String, index=True)  # "update_role", "view_users", "view_login_attempts", etc.
    target_user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    target_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string with action details
    ip_address: Mapped[str] = mapped_column(String)
    user_agent: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<AdminAuditLog(admin={self.admin_email}, action={self.action})>"
