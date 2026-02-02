import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models import Vacancy
from app.config import settings
import json

# Setup async DB connection
# Force asyncpg driver if not present
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(database_url)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def inspect_vacancy():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Vacancy).limit(1))
        vacancy = result.scalar_one_or_none()
        
        if not vacancy:
            print("No vacancies found in database.")
            return

        print(f"--- Vacancy ID: {vacancy.id} ---")
        print(f"Title: {vacancy.title}")
        print(f"Source: {vacancy.source}")
        print(f"Description (First 500 chars):")
        print(vacancy.description[:500] if vacancy.description else "None")
        print("\n--- Raw Data Keys ---")
        print(list(vacancy.raw_data.keys()) if vacancy.raw_data else "None")
        
        print("\n--- Full Raw Data Sample ---")
        print(json.dumps(vacancy.raw_data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(inspect_vacancy())
