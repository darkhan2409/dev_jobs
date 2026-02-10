"""
Email service for sending authentication-related emails.
"""
import logging
from typing import Optional

from app.config import settings
from app.models import User

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails."""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        self.enabled = settings.EMAIL_ENABLED

    async def send_email(self, to: str, subject: str, body: str):
        """
        Send an email.
        In dev mode (EMAIL_ENABLED=False), logs to console.
        In prod mode (EMAIL_ENABLED=True), sends via SMTP.
        """
        if self.enabled:
            # Production SMTP sending
            try:
                import aiosmtplib
                from email.message import EmailMessage

                message = EmailMessage()
                message["From"] = self.from_email
                message["To"] = to
                message["Subject"] = subject
                message.set_content(body)

                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_user,
                    password=self.smtp_password,
                    start_tls=True,
                )

                logger.info(f"Email sent to {to}: {subject}")

            except Exception as e:
                logger.error(f"Failed to send email to {to}: {e}")
                raise

        else:
            # Development mode - log to console
            print("\n" + "=" * 80)
            print("[DEV MODE EMAIL]")
            print(f"To: {to}")
            print(f"Subject: {subject}")
            print(f"Body:\n{body}")
            print("=" * 80 + "\n")

            # Also log via logger for proper logging
            logger.info(f"[DEV MODE EMAIL] To: {to}, Subject: {subject}")

    async def send_verification_email(self, user: User, token: str):
        """Send email verification code to user."""
        subject = "Подтвердите email - GitJob"
        body = f"""
Здравствуйте!

Ваш код подтверждения email: {token}

Код действителен в течение 24 часов.

Если вы не регистрировались на GitJob, проигнорируйте это письмо.

---
С уважением,
Команда GitJob
        """.strip()

        await self.send_email(user.email, subject, body)

    async def send_password_reset_email(self, user: User, token: str):
        """Send password reset link to user."""
        from app.config import settings
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        subject = "Сброс пароля - GitJob"
        body = f"""
Здравствуйте!

Вы запросили сброс пароля для вашего аккаунта GitJob.

Перейдите по ссылке для создания нового пароля:
{reset_link}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля, проигнорируйте это письмо.

---
С уважением,
Команда GitJob
        """.strip()

        await self.send_email(user.email, subject, body)


# Singleton instance
email_service = EmailService()
