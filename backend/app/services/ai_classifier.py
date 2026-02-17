import os
import asyncio
import json
import logging
from typing import List, Dict
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class AIClassifier:
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        self.api_key = api_key
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.model = model

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def classify_batch(self, vacancies: List[Dict]) -> List[int]:
        """
        Принимает список вакансий.
        Возвращает список ID, которые являются МУСОРОМ (JUNK).
        """
        items_str = "\n".join([
            f"ID: {v['id']} | Title: {v['title']} | Company: {v.get('company', 'N/A')}"
            for v in vacancies
        ])

        system_prompt = """You are an HR Tech Recruiter for an IT Job Board (GitJob).
Filter out ONLY clearly NON-IT roles.

CONTEXT: We want ALL IT-related roles including developers, QA, DevOps, data, managers, analysts, and support.
Vacancies are mostly in Russian and English.

RULES:
1. KEEP (Relevant IT roles):
   - Software Developers (Backend, Frontend, Fullstack, Mobile, GameDev, любые разработчики)
   - QA Engineers, Testers (Manual/Automation, Тестировщики)
   - DevOps, SRE, System Administrators, DBAs, Network Engineers
   - Data Scientists, Data Analysts, Data Engineers, Business Analysts
   - Product Owners, Product Managers, Project Managers (assume IT-related)
   - Scrum Masters, Agile Coaches, Team Leads
   - IT Specialists, IT Support, Technical Support, HelpDesk (ALL levels, including эникейщик)
   - SAP/1C/ERP Consultants/Developers
   - Security Engineers, Architects, CTO, CIO
   - UI/UX Designers, Technical Writers

2. DISCARD (Clearly NON-IT):
   - Physical labor (Driver/Водитель, Courier/Курьер, Warehouse/Склад, Construction/Строитель)
   - Retail/Service (Cashier/Кассир, Waiter/Официант, Barista, Fitness Trainer)
   - Traditional office (Secretary/Секретарь, Accountant/Бухгалтер, Lawyer/Юрист, HR Generalist)
   - Sales/Marketing (Sales Manager/Менеджер по продажам, UNLESS explicitly tech like "Salesforce Developer")
   - Medical/Education (Doctor/Врач, Teacher/Учитель, unless "IT Teacher")
   - Manufacturing/Production (Factory Worker, Geologist, Mining)

IMPORTANT:
- If title contains "IT", "Tech", "Software", "Developer", "Engineer", "Analyst", "Manager", "Scrum", "Product", "Project" → KEEP
- If you're unsure → KEEP (better to keep than discard)
- Only discard if it's CLEARLY not IT-related

Return ONLY a JSON object: {"junk_ids": [list of vacancy IDs to discard]}"""

        payload = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Classify these vacancies:\n{items_str}"}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        })

        try:
            proc = await asyncio.create_subprocess_exec(
                "curl", "-s", "--max-time", "30",
                "-X", "POST", f"{self.base_url}/chat/completions",
                "-H", "Content-Type: application/json",
                "-H", f"Authorization: Bearer {self.api_key}",
                "-H", "Connection: close",
                "-d", payload,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await proc.communicate()

            if proc.returncode != 0:
                raise RuntimeError(f"curl failed (rc={proc.returncode}): {stderr.decode()}")

            data = json.loads(stdout.decode())

            if "error" in data:
                raise RuntimeError(f"OpenAI error: {data['error']}")

            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            response_junk_ids = parsed.get("junk_ids", [])

            # HALLUCINATION PROTECTION
            valid_batch_ids = {v['id'] for v in vacancies}
            clean_junk_ids = [jid for jid in response_junk_ids if jid in valid_batch_ids]

            hallucinated = set(response_junk_ids) - valid_batch_ids
            if hallucinated:
                logger.warning(f"AI returned invalid IDs (hallucination): {hallucinated}")

            logger.info(f"Classified {len(vacancies)} vacancies: {len(clean_junk_ids)} junk found")
            return clean_junk_ids

        except Exception as e:
            logger.error(f"AI Classification failed: {e}")
            return []
