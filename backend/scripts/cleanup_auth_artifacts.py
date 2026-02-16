import logging
import os
import sys
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import or_

from app.database import SessionLocal
from app.models import LoginAttempt, RefreshToken

logger = logging.getLogger("AuthArtifactsCleanup")


def cleanup_auth_artifacts(retention_days: int = 30) -> dict:
    """Delete old auth artifacts by retention policy."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=retention_days)

    db = SessionLocal()
    try:
        deleted_login_attempts = db.query(LoginAttempt).filter(
            LoginAttempt.created_at < cutoff
        ).delete(synchronize_session=False)

        deleted_refresh_tokens = db.query(RefreshToken).filter(
            RefreshToken.created_at < cutoff,
            or_(
                RefreshToken.revoked == True,
                RefreshToken.expires_at < now,
            ),
        ).delete(synchronize_session=False)

        db.commit()
        logger.info(
            "Auth artifact cleanup complete: login_attempts_deleted=%s refresh_tokens_deleted=%s retention_days=%s",
            deleted_login_attempts,
            deleted_refresh_tokens,
            retention_days,
        )
        return {
            "login_attempts_deleted": deleted_login_attempts,
            "refresh_tokens_deleted": deleted_refresh_tokens,
            "retention_days": retention_days,
        }
    except Exception:
        db.rollback()
        logger.exception("Auth artifact cleanup failed")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    retention = int(os.getenv("AUTH_ARTIFACT_RETENTION_DAYS", "30"))
    cleanup_auth_artifacts(retention_days=retention)
