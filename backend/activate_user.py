
import asyncio
from sqlalchemy import update
from app.database import engine
from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession

async def activate():
    async with AsyncSession(engine) as db:
        await db.execute(
            update(User)
            .where(User.email == 'd.seilbekov@mail.ru')
            .values(is_active=True)
        )
        await db.commit()
        print("SUCCESS: User d.seilbekov@mail.ru activated!")

if __name__ == "__main__":
    asyncio.run(activate())
