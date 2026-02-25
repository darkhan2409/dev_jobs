from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Vacancy

router = APIRouter(tags=["SEO"])

STATIC_PAGES = [
    {"loc": "/", "changefreq": "daily", "priority": "1.0"},
    {"loc": "/jobs", "changefreq": "hourly", "priority": "0.9"},
    {"loc": "/companies", "changefreq": "daily", "priority": "0.8"},
    {"loc": "/guide", "changefreq": "weekly", "priority": "0.7"},
    {"loc": "/career", "changefreq": "weekly", "priority": "0.7"},
    {"loc": "/start", "changefreq": "weekly", "priority": "0.6"},
]


@router.get("/sitemap.xml", include_in_schema=False)
async def sitemap(db: AsyncSession = Depends(get_db)):
    base_url = settings.FRONTEND_URL.rstrip("/")

    result = await db.execute(
        select(Vacancy.id, Vacancy.updated_at)
        .where(Vacancy.is_active == True)
        .order_by(Vacancy.id)
    )
    vacancies = result.all()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    urls: list[str] = []

    for page in STATIC_PAGES:
        urls.append(
            f"  <url>\n"
            f"    <loc>{base_url}{page['loc']}</loc>\n"
            f"    <changefreq>{page['changefreq']}</changefreq>\n"
            f"    <priority>{page['priority']}</priority>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"  </url>"
        )

    for vacancy_id, updated_at in vacancies:
        lastmod = (
            updated_at.strftime("%Y-%m-%d")
            if updated_at
            else today
        )
        urls.append(
            f"  <url>\n"
            f"    <loc>{base_url}/jobs/{vacancy_id}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            f"    <changefreq>weekly</changefreq>\n"
            f"    <priority>0.8</priority>\n"
            f"  </url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>"
    )

    return Response(content=xml, media_type="application/xml")
