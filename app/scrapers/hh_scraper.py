import asyncio
import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from app.database import SessionLocal
from app.models import Vacancy
from app.utils import clean_html, determine_grade

from fake_useragent import UserAgent

logger = logging.getLogger("HHScraper")

class HHScraper:
    def __init__(self):
        self.base_url = "https://api.hh.ru/vacancies"
        
        # User-Agent Rotation
        try:
            logger.debug("FakeUserAgent initialization...")
            self.ua = UserAgent()
            self.user_agent = self.ua.random
            logger.debug(f"User-Agent selected: {self.user_agent}")
        except Exception as e:
            logger.warning(f"FakeUserAgent error: {e}. Using default.")
            # Fallback if fake_useragent fails to load
            self.user_agent = "DevJobsAggregator/1.0 (seilbekov2409@gmail.com)"
            
        self.headers = {
            "User-Agent": self.user_agent,
            "Accept": "*/*",
            "Connection": "keep-alive"
        }
        self.semaphore = asyncio.Semaphore(3)  # Не больше 3 запросов одновременно

    async def fetch_page(self, client: httpx.AsyncClient, params: dict) -> List[dict]:
        """Асинхронно скачивает одну страницу."""
        async with self.semaphore:
            try:
                # Jitter внутри потока (0.5 - 1.0 сек), чтобы эмулировать человека
                await asyncio.sleep(0.5) 
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()
                items = data.get("items", [])
                logger.info(f"Page {params['page'] + 1}: fetched {len(items)} vacancies")
                return items
            except httpx.HTTPError as e:
                logger.error(f"Error page {params['page'] + 1}: {e}")
                return []

    async def fetch_vacancies(self, role_id: int, text: Optional[str] = None, pages: int = 3, area: int = 40, do_cleanup: bool = True) -> None:
        """
        Оркестратор: качает параллельно, сохраняет.
        text: Дополнительный текстовый поиск (например, 'Backend').
        do_cleanup: Если False, то мы только добавляем/обновляем, но НЕ удаляем старое.
                   Это нужно для точечных поисков, чтобы не снести остальные вакансии этой роли.
        """
        start_time = datetime.now()
        
        # 1. Асинхронный сбор данных (Parallel Fetching)
        tasks = []
        async with httpx.AsyncClient(headers=self.headers, timeout=20.0) as client:
            for page in range(pages):
                params = {
                    "professional_role": role_id,
                    "area": area,
                    "per_page": 100,
                    "page": page
                }
                if text:
                    params["text"] = text
                    
                tasks.append(self.fetch_page(client, params))
            
            search_label = f"Role {role_id} + '{text}'" if text else f"Role {role_id}"
            logger.info(f"Scraping for {search_label} ({pages} pages)...")
            results = await asyncio.gather(*tasks)

        # Выпрямляем список списков [[v1, v2], [v3, v4]] -> [v1, v2, v3, v4]
        all_items = [item for page_items in results for item in page_items]

        if not all_items:
            logger.info("No vacancies found.")
            return {"added": 0, "updated": 0, "deleted": 0}

        # 2. Синхронное сохранение
        logger.info(f"Saving {len(all_items)} records to DB...")
        stats = await asyncio.to_thread(self.save_to_db_and_cleanup, all_items, role_id, start_time, do_cleanup)
        
        logger.info(f"Done. {search_label}: +{stats['added']} new, ~{stats['updated']} upd, -{stats['deleted']} del.")
        return stats

    def save_to_db_and_cleanup(self, items: List[dict], role_id: int, start_time: datetime, do_cleanup: bool = True) -> dict:
        """Синхронная работа с БД: Upsert + Scoped Cleanup. Возвращает статистику."""
        db = SessionLocal()
        stats = {"added": 0, "updated": 0, "deleted": 0}
        try:
            # --- ЧАСТЬ 1: UPSERT ---
            # Используем text для xmax трюка (Postgres specific)
            from sqlalchemy import text
            
            for item in items:
                salary = item.get("salary") or {}
                snippet = item.get("snippet") or {}
                raw_desc = f"{snippet.get('requirement') or ''} {snippet.get('responsibility') or ''}"
                
                # Извлечение метаданных
                exp_data = item.get("experience", {})
                experience_id = exp_data.get("id")
                grade = determine_grade(item.get("name"), experience_id)
                
                vacancy_data = {
                    "external_id": str(item.get("id")),
                    "source": "hh",
                    "title": item.get("name"),
                    "description": clean_html(raw_desc),
                    "salary_from": salary.get("from"),
                    "salary_to": salary.get("to"),
                    "currency": salary.get("currency") or "KZT",
                    "location": item.get("area", {}).get("name"),
                    
                    # Извлечение метаданных
                    "experience": exp_data.get("name"),
                    "employment": item.get("employment", {}).get("name"),
                    "schedule": item.get("schedule", {}).get("name"),
                    "grade": grade,
                    
                    "url": item.get("alternate_url"),
                    "published_at": self._parse_date(item.get("published_at")),
                    "raw_data": item,
                    "is_active": True
                }

                stmt = insert(Vacancy).values(**vacancy_data)
                stmt = stmt.on_conflict_do_update(
                    index_elements=["external_id", "source"],
                    set_={**vacancy_data, "updated_at": func.now()}
                )
                # RETURNING (xmax = 0) as is_new
                stmt = stmt.returning(text("(xmax = 0) as is_new"))
                
                result = db.execute(stmt)
                row = result.fetchone()
                # Access by index 0 because we selected only one column
                if row and row[0]:
                    stats["added"] += 1
                else:
                    stats["updated"] += 1
            
            db.commit()

            # --- ЧАСТЬ 2: SCOPED CLEANUP ---
            if do_cleanup:
                # Мы удаляем старые вакансии ТОЛЬКО этой роли (role_id).
                
                threshold = start_time - timedelta(minutes=10)
                
                # Формируем JSON-структуру для поиска: [{'id': '96'}]
                role_filter = [{"id": str(role_id)}]
                
                affected = db.query(Vacancy).filter(
                    Vacancy.source == "hh",
                    Vacancy.is_active == True,
                    Vacancy.updated_at < threshold,
                    Vacancy.raw_data['professional_roles'].contains(role_filter)
                ).update({"is_active": False}, synchronize_session=False)
                
                db.commit()
                if affected:
                    logger.info(f"[Role {role_id}] Cleared {affected} outdated vacancies.")
                    stats["deleted"] = affected
            else:
                logger.debug("Skipping cleanup for targeted search.")
                
            return stats

        except Exception as e:
            db.rollback()
            logger.error(f"DB Transaction Error: {e}", exc_info=True)
            return stats
        finally:
            db.close()

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace(" ", "T"))
        except ValueError:
            return None