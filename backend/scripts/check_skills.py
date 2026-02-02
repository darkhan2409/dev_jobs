import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from app.database import AsyncSessionLocal
from app.models import Vacancy
from sqlalchemy import select

async def check_skills():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Vacancy).limit(5))
        vacancies = result.scalars().all()
        for v in vacancies:
            print(f"ID: {v.id}, Title: {v.title}, Skills: {v.key_skills}")

if __name__ == "__main__":
    import platform
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_skills())
