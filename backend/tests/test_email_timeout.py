import asyncio
import sys
from types import SimpleNamespace

from app.config import settings
from app.services.email_service import EmailService


def test_send_email_passes_configured_timeout(monkeypatch):
    calls = {"kwargs": None}

    async def fake_send(_message, **kwargs):
        calls["kwargs"] = kwargs

    monkeypatch.setitem(sys.modules, "aiosmtplib", SimpleNamespace(send=fake_send))

    service = EmailService()
    service.enabled = True
    service.smtp_host = "smtp.example.test"
    service.smtp_port = 587
    service.smtp_user = "user@example.test"
    service.smtp_password = "secret"
    service.from_email = "noreply@example.test"

    result = asyncio.run(service.send_email("to@example.test", "subject", "body"))

    assert result is True
    assert calls["kwargs"] is not None
    assert calls["kwargs"]["timeout"] == settings.SMTP_TIMEOUT_SECONDS
