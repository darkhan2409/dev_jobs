
import asyncio
from sqlalchemy import delete
from app.database import engine
from app.models import User, RefreshToken, EmailVerificationToken, PasswordResetToken, LoginAttempt
from sqlalchemy.ext.asyncio import AsyncSession

async def hard_delete():
    email_to_delete = 'd.seilbekov@mail.ru'
    async with AsyncSession(engine) as db:
        # Get user ID first
        from sqlalchemy import select
        result = await db.execute(select(User).filter(User.email == email_to_delete))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User {email_to_delete} not found.")
            return

        user_id = user.id
        
        # Delete related records
        await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
        await db.execute(delete(EmailVerificationToken).where(EmailVerificationToken.user_id == user_id))
        await db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user_id))
        await db.execute(delete(LoginAttempt).where(LoginAttempt.user_id == user_id))
        
        # Delete user
        await db.execute(delete(User).where(User.id == user_id))
        
        await db.commit()
        print(f"SUCCESS: User {email_to_delete} (ID: {user_id}) and all related data have been hard deleted.")

if __name__ == "__main__":
    asyncio.run(hard_delete())
