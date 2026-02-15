import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.limiter import limiter
from app.database import get_db
from app.models import AnalyticsEvent
from app.schemas import AnalyticsIngestRequest, AnalyticsIngestResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post(
    "/events",
    response_model=AnalyticsIngestResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest first-party analytics events",
)
@limiter.limit("300/minute")
async def ingest_analytics_events(
    request: Request,
    body: AnalyticsIngestRequest,
    db: AsyncSession = Depends(get_db),
):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
        rows = []
        for event in body.events:
            payload = dict(event.payload or {})
            if event.timestamp:
                payload.setdefault("client_timestamp", event.timestamp.isoformat())

            rows.append(
                AnalyticsEvent(
                    event_name=event.event_name,
                    source=event.source or "unknown",
                    route=event.route or "unknown",
                    user_type_guess=event.user_type_guess or "unknown",
                    session_id=event.session_id,
                    payload=payload,
                    ip_address=client_ip,
                    user_agent=user_agent,
                )
            )

        db.add_all(rows)
        await db.commit()

        return AnalyticsIngestResponse(accepted=len(rows))
    except Exception as exc:
        await db.rollback()
        logger.error(f"Failed to ingest analytics events: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ingest analytics events",
        )

