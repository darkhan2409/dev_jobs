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

        system_prompt = """You are a strict filter for an IT Job Board (GitJob).
Your task: identify vacancies that DO NOT belong on an IT job board.

KEEP a vacancy ONLY if the job requires working with software, technology, computers, or IT systems.

KEEP these roles (IT-related):
- Software Developers (Backend, Frontend, Fullstack, Mobile, GameDev, разработчики любого стека)
- QA Engineers, Testers (Manual/Automation, тестировщики)
- DevOps, SRE, System Administrators, DBAs, Network Engineers
- Data Scientists, Data Analysts, Data Engineers, Business Analysts (if in tech context)
- Product Managers, Project Managers (if in IT company/product context)
- Scrum Masters, Agile Coaches, Team Leads (technical teams)
- IT Support, Technical Support, HelpDesk, эникейщик
- SAP/1C/ERP Consultants and Developers
- Security Engineers, Architects, CTO, CIO
- UI/UX Designers, Technical Writers
- Any role with "IT", "Tech", "Software", "Developer", "Engineer" in the title

DISCARD a vacancy if the job has NOTHING to do with IT or technology:
- Physical labor: Driver/Водитель, Courier/Курьер, Loader/Грузчик, Builder/Строитель
- Food & Retail: Cashier/Кассир, Waiter/Официант, Barista, Cook/Повар, Florist/Флорист
- Beauty & Fitness: Hairdresser/Парикмахер, Fitness Trainer/Тренер, Massage Therapist
- Traditional office (non-IT): Accountant/Бухгалтер, Lawyer/Юрист, Secretary/Секретарь
- Generic Sales: Менеджер по продажам, Sales Representative (unless selling software/IT)
- Medical: Doctor/Врач, Nurse/Медсестра, Pharmacist/Фармацевт
- Education (non-IT): Teacher/Учитель, Tutor (unless "IT Teacher" or "Programming Teacher")
- Manufacturing: Factory Worker, Machinist/Токарь, Welder/Сварщик, Geologist, Miner
- Agriculture/Nature: Agronomist/Агроном, Veterinarian/Ветеринар, Farmer

DECISION RULE:
Ask yourself: "Does this job require using or building software/technology?"
- YES → KEEP
- NO or NOT CLEAR from the title → DISCARD

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
            raise
