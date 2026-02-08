
import asyncio
from sqlalchemy import select
from app.database import engine, get_db
from app.models import User
from sqlalchemy.ext.asyncio import AsyncSession

async def check():
    async with AsyncSession(engine) as db:
        result = await db.execute(select(User).filter(User.email == 'd.seilbekov@mail.ru'))
        user = result.scalar_one_or_none()
        if user:
            print(f"FOUND: {user.email}, active={user.is_active}")
        else:
            print("NOT FOUND")
            # List all users to see what's there
            result = await db.execute(select(User))
            users = result.scalars().all()
            print(f"Total users: {len(users)}")
            for u in users:
                print(f"- {u.email}")

if __name__ == "__main__":
    asyncio.run(check())
