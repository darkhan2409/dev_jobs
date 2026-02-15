import asyncio
import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Set

from sqlalchemy import func, text
from sqlalchemy.dialects.postgresql import insert
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.database import SessionLocal
from app.models import Vacancy, Company
from app.utils.helpers import determine_grade
from app.config_roles import EXCHANGE_RATES, ROLES
from app.config import settings

# User-Agent handling
try:
    from fake_useragent import UserAgent
except ImportError:
    UserAgent = None

logger = logging.getLogger("HHScraper")

class HHScraper:
    def __init__(self):
        self.base_url = "https://api.hh.ru/vacancies"
        self.headers = {
            "Accept": "*/*",
            "Connection": "keep-alive"
        }
        
        # User-Agent Setup
        try:
            if UserAgent:
                ua = UserAgent()
                self.user_agent = ua.random
            else:
                self.user_agent = "GitJobAggregator/1.0 (admin@devjobs.com)"
        except Exception as e:
            logger.warning(f"User-Agent generation failed: {e}")
            self.user_agent = "GitJobAggregator/1.0 (admin@devjobs.com)"
            
        self.headers["User-Agent"] = self.user_agent
        # Reduced concurrency to avoid rate limiting (was 5, now 2)
        self.semaphore = asyncio.Semaphore(2) 

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.ConnectError, httpx.HTTPStatusError, httpx.ReadTimeout))
    )
    async def _make_request(self, client: httpx.AsyncClient, url: str, params: dict = None) -> httpx.Response:
        """Makes an HTTP GET request with retry logic."""
        response = await client.get(url, params=params)
        if response.status_code >= 500:
            response.raise_for_status() # Trigger retry for server errors
        return response

    async def fetch_page(self, client: httpx.AsyncClient, params: dict) -> List[dict]:
        """Fetches a single page of results."""
        async with self.semaphore:
            try:
                await asyncio.sleep(1.0) # Increased delay to avoid rate limiting
                response = await self._make_request(client, self.base_url, params)
                response.raise_for_status()
                data = response.json()
                items = data.get("items", [])
                logger.debug(f"Page {params.get('page', 0) + 1} fetched: {len(items)} items")
                return items
            except Exception as e:
                logger.error(f"Error fetching page {params.get('page')}: {e}")
                return []

    async def _fetch_single_detail(self, client: httpx.AsyncClient, item: dict):
        """Worker function to fetch details for a single item."""
        async with self.semaphore: # CRITICAL: Respect concurrency limit
            try:
                # Increased delay to avoid rate limiting
                await asyncio.sleep(1.5) 
                
                detail_url = f"https://api.hh.ru/vacancies/{item['id']}"
                resp = await self._make_request(client, detail_url)
                
                if resp.status_code == 200:
                    full_data = resp.json()
                    item['description'] = full_data.get('description')
                    item['key_skills'] = full_data.get('key_skills', [])
                    
                    if 'name' in full_data: item['name'] = full_data['name']
                    if 'area' in full_data: item['area'] = full_data['area']
                    if 'salary' in full_data and full_data['salary']: item['salary'] = full_data['salary']
                    
                elif resp.status_code == 404:
                    logger.warning(f"Vacancy {item['id']} not found (404). Using snippet.")
                    self._fallback_to_snippet(item)
                elif resp.status_code in [403, 429]:
                    logger.error(f"Rate limit (403/429) on {item['id']}. Skipping.")
                    self._fallback_to_snippet(item)
                else:
                    logger.warning(f"Failed detail fetch {item['id']}: {resp.status_code}")
                    self._fallback_to_snippet(item)

            except Exception as e:
                logger.error(f"Error fetching detail {item['id']}: {e}")
                self._fallback_to_snippet(item)

    async def fetch_vacancies(
        self,
        role_id: int,
        text: Optional[str] = None,
        pages: int = 3,
        area: Optional[int] = None,
        do_cleanup: bool = True,
    ) -> dict:
        start_time = datetime.now()
        target_area = settings.HH_AREA if area is None else area
        
        # --- Step 1: Fetch Search Results ---
        tasks = []
        async with httpx.AsyncClient(headers=self.headers, timeout=30.0) as client:
            for page in range(pages):
                params = {
                    "professional_role": role_id,
                    "area": target_area,
                    "per_page": 100,
                    "page": page
                }
                if text: params["text"] = text
                tasks.append(self.fetch_page(client, params))
            
            search_label = f"Role {role_id}" + (f" + '{text}'" if text else "")
            logger.info(f"[{search_label}] Scraping list ({pages} pages)...")
            results = await asyncio.gather(*tasks)

        all_items = [item for page_items in results for item in page_items]

        if not all_items:
            logger.info(f"[{search_label}] No vacancies found.")
            return {"added": 0, "updated": 0, "deleted": 0}

        # --- Step 1.5: Upsert Companies ---
        employer_ids = set()
        for item in all_items:
            employer = item.get('employer')
            if employer and employer.get('id'):
                try:
                    employer_ids.add(int(employer['id']))
                except (ValueError, TypeError):
                    pass

        if employer_ids:
            logger.info(f"[{search_label}] Found {len(employer_ids)} unique employers. Upserting...")
            async with httpx.AsyncClient(headers=self.headers, timeout=30.0) as client:
                await self._upsert_companies(employer_ids, client)

        # --- Step 2: Check DB for existing valid descriptions ---
        external_ids = [str(item['id']) for item in all_items]
        existing_good_ids = await asyncio.to_thread(self._get_ids_with_html_description, external_ids)
        
        logger.info(f"[{search_label}] Found {len(all_items)} items. {len(existing_good_ids)} already have valid HTML.")

        # --- Step 3: Enrich Loop (Parallelized) ---
        items_to_enrich = []
        for item in all_items:
            vac_id = str(item['id'])
            if vac_id in existing_good_ids:
                item['skip_detail'] = True 
            else:
                item['skip_detail'] = False
                items_to_enrich.append(item)

        if items_to_enrich:
            logger.info(f"[{search_label}] Fetching details for {len(items_to_enrich)} items (Parallel)...")
            
            # Using a new client for detail fetching to reset connection pool state
            async with httpx.AsyncClient(headers=self.headers, timeout=30.0) as client:
                detail_tasks = [self._fetch_single_detail(client, item) for item in items_to_enrich]
                # Run concurrently
                await asyncio.gather(*detail_tasks)

        # --- Step 4: Save to DB ---
        logger.info(f"[{search_label}] Saving {len(all_items)} records to DB...")
        stats = await asyncio.to_thread(self.save_to_db, all_items, role_id, start_time, do_cleanup)
        
        logger.info(f"[{search_label}] Done. +{stats['added']} new, ~{stats['updated']} upd, -{stats['deleted']} del.")
        return stats

    def _get_ids_with_html_description(self, external_ids: List[str]) -> Set[str]:
        db = SessionLocal()
        try:
            # Check for '<' to ensure it's HTML
            existing = db.query(Vacancy.external_id).filter(
                Vacancy.external_id.in_(external_ids),
                Vacancy.description != None,
                Vacancy.description.contains('<') 
            ).all()
            return {e[0] for e in existing}
        finally:
            db.close()

    def _fallback_to_snippet(self, item: dict):
        snippet = item.get("snippet") or {}
        req = snippet.get("requirement") or ""
        resp = snippet.get("responsibility") or ""
        item['description'] = f"<div class='fallback-snippet'><p><strong>Requirements:</strong> {req}</p><p><strong>Responsibilities:</strong> {resp}</p></div>"

    async def _fetch_employer_data(self, client: httpx.AsyncClient, employer_id: int) -> Optional[dict]:
        """Fetch full employer data from HH API."""
        try:
            await asyncio.sleep(0.6)  # Rate limit: ~1.5 req/sec
            url = f"https://api.hh.ru/employers/{employer_id}"
            resp = await self._make_request(client, url)

            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code == 404:
                logger.warning(f"Employer {employer_id} not found (404)")
                return None
            else:
                logger.warning(f"Failed to fetch employer {employer_id}: {resp.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error fetching employer {employer_id}: {e}")
            return None

    def _should_refresh_company(self, company: Company) -> bool:
        """Check if company data should be refreshed (older than 7 days)."""
        if not company or not company.updated_at:
            return True
        age_days = (datetime.now() - company.updated_at).days
        return age_days > 7

    async def _upsert_companies(self, employer_ids: Set[int], client: httpx.AsyncClient):
        """Fetch and upsert company records for unique employer IDs."""
        if not employer_ids:
            return

        db = SessionLocal()
        try:
            # Check which companies exist and need refresh
            existing = db.query(Company).filter(Company.hh_employer_id.in_(employer_ids)).all()
            existing_map = {c.hh_employer_id: c for c in existing}

            ids_to_fetch = []
            for emp_id in employer_ids:
                company = existing_map.get(emp_id)
                if self._should_refresh_company(company):
                    ids_to_fetch.append(emp_id)

            if not ids_to_fetch:
                logger.info("All companies up to date, skipping fetch")
                return

            logger.info(f"Fetching {len(ids_to_fetch)} employer details...")

            # Fetch employer data
            for emp_id in ids_to_fetch:
                data = await self._fetch_employer_data(client, emp_id)
                if not data:
                    continue

                # Upsert company
                stmt = insert(Company).values(
                    hh_employer_id=int(data['id']),
                    name=data.get('name'),
                    description=data.get('description'),
                    company_type=data.get('type'),
                    logo_url=data.get('logo_urls', {}).get('240') if data.get('logo_urls') else None,
                    site_url=data.get('site_url'),
                    area_id=str(data.get('area', {}).get('id')) if data.get('area') else None,
                    area_name=data.get('area', {}).get('name') if data.get('area') else None,
                    industries=data.get('industries'),
                    trusted=data.get('trusted', False),
                    raw_data=data,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )

                stmt = stmt.on_conflict_do_update(
                    index_elements=['hh_employer_id'],
                    set_={
                        'name': stmt.excluded.name,
                        'description': stmt.excluded.description,
                        'company_type': stmt.excluded.company_type,
                        'logo_url': stmt.excluded.logo_url,
                        'site_url': stmt.excluded.site_url,
                        'area_id': stmt.excluded.area_id,
                        'area_name': stmt.excluded.area_name,
                        'industries': stmt.excluded.industries,
                        'trusted': stmt.excluded.trusted,
                        'raw_data': stmt.excluded.raw_data,
                        'updated_at': datetime.now()
                    }
                )

                db.execute(stmt)

            db.commit()
            logger.info(f"Upserted {len(ids_to_fetch)} companies")

        finally:
            db.close()

    def _get_company_id_by_hh_id(self, hh_employer_id: int) -> Optional[int]:
        """Get company.id from hh_employer_id."""
        db = SessionLocal()
        try:
            company = db.query(Company).filter(Company.hh_employer_id == hh_employer_id).first()
            return company.id if company else None
        finally:
            db.close()

    def _calculate_salary_in_kzt(self, salary: dict) -> Optional[int]:
        if not salary or not salary.get("from"):
            return None
        currency = salary.get("currency", "KZT")
        rate = EXCHANGE_RATES.get(currency, 1)
        return int(salary.get("from") * rate)

    def _extract_company_name(self, item: dict) -> Optional[str]:
        """Extract company name from employer data."""
        employer = item.get("employer")
        if not employer:
            return None
        return employer.get("name")

    def _extract_company_logo(self, item: dict) -> Optional[str]:
        employer = item.get("employer")
        if not employer:
            return None
        logo_urls = employer.get("logo_urls")
        if not logo_urls:
            return None
        return logo_urls.get("240")

    def save_to_db(self, items: List[dict], role_id: int, start_time: datetime, do_cleanup: bool) -> dict:
        db = SessionLocal()
        stats = {"added": 0, "updated": 0, "deleted": 0}
        
        try:
            for item in items:
                # Skip None items
                if not item or not isinstance(item, dict):
                    logger.warning(f"Skipping invalid item: {item}")
                    continue
                    
                salary = item.get("salary") or {}
                exp_data = item.get("experience", {})
                experience_id = exp_data.get("id")
                grade = determine_grade(item.get("name"), experience_id)
                
                # Extract tech stack from title and description
                from app.utils.tech_extractor import extract_tech_from_vacancy
                title = item.get("name", "")
                description = item.get("description", "")
                tech_stack = extract_tech_from_vacancy(title, description)
                
                vacancy_data = {
                    "external_id": str(item.get("id")),
                    "source": "hh",
                    "title": title,
                    "salary_from": salary.get("from"),
                    "salary_to": salary.get("to"),
                    "currency": salary.get("currency") or "KZT",
                    "location": item.get("area", {}).get("name"),
                    "experience": exp_data.get("name"),
                    "employment": item.get("employment", {}).get("name"),
                    "schedule": item.get("schedule", {}).get("name"),
                    "grade": grade,
                    "company_name": self._extract_company_name(item),
                    "company_logo": self._extract_company_logo(item),
                    "salary_in_kzt": self._calculate_salary_in_kzt(salary),
                    "key_skills": tech_stack,  # Use extracted tech stack instead of HH.ru's key_skills
                    "url": item.get("alternate_url"),
                    "published_at": self._parse_date(item.get("published_at")),
                    "raw_data": item,
                    "is_active": True,
                    "updated_at": datetime.now()
                }

                # Conditional Description Logic
                if not item.get('skip_detail'):
                     vacancy_data["description"] = item.get("description")

                # Link to company
                employer = item.get('employer')
                if employer and employer.get('id'):
                    try:
                        hh_emp_id = int(employer['id'])
                        company_id = self._get_company_id_by_hh_id(hh_emp_id)
                        if company_id:
                            vacancy_data['company_id'] = company_id
                    except (ValueError, TypeError):
                        pass

                # Smart AI Recheck: Check if title changed BEFORE update
                # If title changed, mark for AI re-verification
                existing_vacancy = db.query(Vacancy).filter(
                    Vacancy.external_id == str(item.get("id")),
                    Vacancy.source == "hh"
                ).first()
                
                title_changed = existing_vacancy and existing_vacancy.title != title
                if title_changed:
                    logger.debug(f"Title changed for {item.get('id')}: '{existing_vacancy.title}' → '{title}'. Will mark for AI recheck.")
                
                stmt = insert(Vacancy).values(**vacancy_data)
                
                # Update Dict logic
                update_dict = {**vacancy_data}
                if item.get('skip_detail') and "description" in update_dict:
                    del update_dict["description"] # Don't overwrite existing HTML with nothing
                
                # If title changed, reset AI check flag
                if title_changed:
                    update_dict["is_ai_checked"] = False
                
                stmt = stmt.on_conflict_do_update(
                    index_elements=["external_id", "source"],
                    set_=update_dict
                )
                
                stmt = stmt.returning(text("(xmax = 0) as is_new"))
                result = db.execute(stmt)
                row = result.fetchone()
                
                if row and row[0]:
                    stats["added"] += 1
                else:
                    stats["updated"] += 1
            
            db.commit()

            if do_cleanup:
                threshold = start_time - timedelta(minutes=10)
                role_filter = [{"id": str(role_id)}]
                affected = db.query(Vacancy).filter(
                    Vacancy.source == "hh",
                    Vacancy.is_active == True,
                    Vacancy.updated_at < threshold,
                    Vacancy.raw_data['professional_roles'].contains(role_filter)
                ).update({"is_active": False}, synchronize_session=False)
                db.commit()
                if affected:
                    stats["deleted"] = affected
            
            return stats

        except Exception as e:
            db.rollback()
            logger.error(f"save_to_db failed: {e}", exc_info=True)
            return stats
        finally:
            db.close()

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        if not date_str: return None
        try:
            return datetime.fromisoformat(date_str.replace(" ", "T"))
        except ValueError:
            return None

# --- MANUAL RUN BLOCK ---
if __name__ == "__main__":
    import asyncio
    import sys
    import os

    # Setup paths
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    async def manual_mass_scrape():
        scraper = HHScraper()
        logger.info("🚀 STARTING MASS SCRAPE (ALL IT ROLES - KAZAKHSTAN)")

        for role in ROLES:
            try:
                logger.info(f"--- 📥 Processing: {role['name']} (ID: {role['id']}) ---")
                stats = await scraper.fetch_vacancies(
                    role_id=role['id'],
                    text=None,      
                    pages=10,       # Reduced from 20 to 10 to avoid rate limiting
                    area=settings.HH_AREA,
                    do_cleanup=False 
                )
                print(f"📊 Stats for {role['name']}: {stats}")
                
                # Add delay between roles to avoid rate limiting
                import random
                delay = random.uniform(10, 20)
                logger.info(f"⏳ Waiting {delay:.1f}s before next role...")
                await asyncio.sleep(delay)
                
            except Exception as e:
                logger.error(f"❌ Failed to scrape role {role['name']}: {e}")
                continue # Skip to next role if one fails

        logger.info("✅ MASS SCRAPE COMPLETE.")

    asyncio.run(manual_mass_scrape())
