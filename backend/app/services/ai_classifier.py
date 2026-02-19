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

KEEP a vacancy ONLY if the job directly involves software, programming, IT infrastructure, or digital technology.

KEEP these roles (explicit IT roles):
- Software Developers: Backend, Frontend, Fullstack, Mobile, GameDev, разработчик, программист
- QA/Testing: QA Engineer, Tester, тестировщик (Manual or Automation)
- Infrastructure: DevOps, SRE, System Administrator, DBA, Network Engineer, сисадмин
- Data/AI: Data Scientist, Data Engineer, ML Engineer, AI Engineer
- IT Management: CTO, CIO, IT Director, IT Manager, Head of Engineering
- IT Support: HelpDesk, Technical Support, IT Support, эникейщик
- Enterprise IT: SAP Developer, 1C Developer, ERP Developer/Consultant
- IT Security: Cybersecurity Engineer, Information Security Engineer, Pentest, SOC Analyst
- Digital Design: UI Designer, UX Designer, UX/UI Designer, Web Designer, Product Designer
- Product/Project (IT only): Product Manager, Product Owner, Scrum Master — ONLY if title explicitly contains "IT", "software", "digital", "tech", "product" in IT context
- Technical roles: Technical Writer, Solution Architect, Cloud Engineer, Data Analyst (IT company)

DISCARD everything that is NOT clearly IT:
- Any "Инженер" (Engineer) without IT qualifier: radiation, safety, construction, mechanical, electrical, chemical, industrial, civil
- Any "Дизайнер" without UI/UX/Web qualifier: interior designer, graphic designer (print), fashion designer
- Any "Аналитик" in banking/finance/sales context: кредитный аналитик, аналитик продаж, финансовый аналитик
- Project/Program Managers for non-IT projects: construction, oil&gas, events, resort, medical, finance
- Sales & Business: Менеджер по продажам, Менеджер по развитию, Hunter/Хантер, BD Manager (non-IT)
- Finance/Legal/HR: Бухгалтер, Юрист, Финансист, HR (unless "HR Automation" or "HRIS")
- Physical labor: Driver, Courier, Loader, Builder, Welder, Electrician, Plumber
- Food & Retail: Cashier, Waiter, Cook, Florist, Barista, Продавец
- Healthcare: Doctor, Nurse, Pharmacist, Врач, Медсестра (unless health-tech software)
- Safety roles: Инженер по охране труда, Инженер по пожарной безопасности, Инженер по радиационной безопасности
- Education (non-IT): Teacher, Tutor, Преподаватель (unless "Python Teacher" or "IT Teacher")
- Manufacturing/Industry: Factory Worker, Токарь, Сварщик, Геолог, Горняк
- Agriculture: Агроном, Ветеринар, Фермер
- Administrative: Secretary, Receptionist, Office Manager, Координатор (non-IT)

DECISION RULE:
"Does this job DIRECTLY require writing code, administering IT systems, or building digital products?"
- CLEARLY YES → KEEP
- NO or UNCLEAR → DISCARD

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
