"""
Email service for sending authentication-related emails.
"""
import logging
from typing import Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

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


    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    async def send_email(self, to: str, subject: str, body: str) -> bool:
        """
        Send an email.
        In dev mode (EMAIL_ENABLED=False), logs to console.
        In prod mode (EMAIL_ENABLED=True), sends via SMTP with retry.
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
                    timeout=settings.SMTP_TIMEOUT_SECONDS,
                )

                logger.info(f"Email sent to {to}: {subject}")
                return True

            except Exception as e:
                logger.error(f"Failed to send email to {to}: {e}")
                return False

        else:
            # Development mode - log to console
            logger.info("=" * 80)
            logger.info("[DEV MODE EMAIL]")
            logger.info("To: %s", to)
            logger.info("Subject: %s", subject)
            logger.info("Body:\\n%s", body)
            logger.info("=" * 80)
            return True

    async def send_verification_email(self, user: User, token: str) -> bool:
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

        return await self.send_email(user.email, subject, body)

    async def send_password_reset_email(self, user: User, token: str) -> bool:
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

        return await self.send_email(user.email, subject, body)


# Singleton instance
email_service = EmailService()
