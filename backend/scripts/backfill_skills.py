
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from app.database import AsyncSessionLocal
from app.models import Vacancy
from app.utils.tech_extractor import extract_tech_from_vacancy
from sqlalchemy import select

async def backfill_skills():
    print("Starting skills backfill...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Vacancy))
        vacancies = result.scalars().all()
        
        updated_count = 0
        for v in vacancies:
            old_skills = v.key_skills
            new_skills = extract_tech_from_vacancy(v.title, v.description or "")
            
            if old_skills != new_skills:
                v.key_skills = new_skills
                updated_count += 1
                if updated_count % 10 == 0:
                    print(f"Updated {updated_count} vacancies...")
        
        await db.commit()
        print(f"Finished! Updated {updated_count} vacancies.")

if __name__ == "__main__":
    import platform
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(backfill_skills())
