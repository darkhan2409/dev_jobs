from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase

from app.config import settings


# Настройка SQLAlchemy движка с параметрами для продакшена
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
)

# Фабрика сессий
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Базовый класс для моделей (стиль SQLAlchemy 2.0)
class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """Зависимость для получения сессии базы данных."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()