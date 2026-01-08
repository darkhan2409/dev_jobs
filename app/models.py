from datetime import datetime
from typing import Optional

from sqlalchemy import (
    String, 
    Text, 
    Boolean, 
    DateTime, 
    Integer, 
    func, 
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


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
    
    # Хранение полных данных от API в формате JSONB
    raw_data: Mapped[dict] = mapped_column(JSONB)

    @property
    def company_name(self) -> Optional[str]:
        """Извлекает название компании из JSONB (raw_data)."""
        if not self.raw_data:
            return None
        employer = self.raw_data.get("employer")
        if not employer:
            return None
        return employer.get("name")

    # Ограничение уникальности: одна и та же вакансия из одного источника не может дублироваться
    __table_args__ = (
        UniqueConstraint("external_id", "source", name="unique_external_vacancy"),
    )

    def __repr__(self) -> str:
        return f"<Vacancy(title={self.title}, source={self.source})>"


