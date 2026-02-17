"""
LLM Interpreter for IT Career Test Engine.

Generates concise, evidence-based interpretation of test results using OpenAI API.
"""

import json
import ast
import os
import time
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from openai import OpenAI, RateLimitError, APIConnectionError, APITimeoutError


logger = logging.getLogger(__name__)


class LLMInterpreterError(Exception):
    """Base exception for LLM Interpreter errors."""


class LLMAPIError(LLMInterpreterError):
    """Raised when LLM API call fails after all retries."""


class LLMConfigError(LLMInterpreterError):
    """Raised when LLM configuration is invalid."""


@dataclass
class RetryConfig:
    """Configuration for retry behavior."""

    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0
    exponential_base: float = 2.0
    jitter: bool = True


@dataclass
class InterpretationResult:
    """Result of LLM interpretation."""

    primary_recommendation: str
    explanation: str
    signal_analysis: str
    alternative_roles: List[str]
    differentiation_criteria: str
    why_this_role_reasons: List[str]


class LLMInterpreter:
    """LLM-based interpreter for natural language explanation of test results."""

    RETRYABLE_EXCEPTIONS = (
        RateLimitError,
        APIConnectionError,
        APITimeoutError,
    )
    EXPLANATION_BLOCK_TITLES = [
        "Почему тебе подходит роль",
        "Твои сильные качества",
        "Как это проявится в работе",
        "С чего начать в 2026",
    ]

    def __init__(
        self,
        api_key: str = None,
        model: str = "gpt-4o",
        score_threshold: float = 0.1,
        retry_config: Optional[RetryConfig] = None,
    ):
        self._api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self._api_key:
            raise LLMConfigError(
                "OpenAI API key not provided. "
                "Set OPENAI_API_KEY environment variable or pass api_key parameter."
            )

        self._client = OpenAI(
            api_key=self._api_key,
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        )
        self._model = model
        self._score_threshold = score_threshold
        self._retry_config = retry_config or RetryConfig()

    def _calculate_delay(self, attempt: int) -> float:
        delay = self._retry_config.base_delay * (self._retry_config.exponential_base**attempt)
        delay = min(delay, self._retry_config.max_delay)

        if self._retry_config.jitter:
            import random

            delay += delay * random.uniform(0, 0.25)

        return delay

    def _build_system_prompt(self) -> str:
        """System prompt with strict style and output requirements."""
        return """Ты — карьерный наставник GitJob. Ты искренне хочешь помочь новичку понять результаты теста и сделать первые шаги в обучении.

Пиши по-русски, дружелюбно, просто и по делу. Без пафоса, без воды, без канцелярита.
Учитывай контекст: сейчас 2026 год, эпоха ИИ, поэтому рекомендации должны включать практичный AI-старт.

Сформируй explanation ровно в 8-10 предложениях по структуре:
1) Короткий вывод: какая роль подходит и почему.
2) Разбери 3 главных качества пользователя, каждое качество подкрепи наблюдением из его ответов/паттернов.
3) Объясни, как эти качества проявятся в реальных рабочих задачах выбранной роли.
4) Дай старт обучения: 2-3 инструмента (для каждого: что это и зачем новичку), строго уровня beginner.
Формат explanation: 4 именованных блока. Каждый блок с новой строки в формате "Название: текст".
Используй такие названия блоков:
- "Почему тебе подходит роль"
- "Твои сильные качества"
- "Как это проявится в работе"
- "С чего начать в 2026"

Требования к стилю:
- Обращение на «ты».
- Простые формулировки, понятные старшекласснику.
- Не использовать штампы вроде «ты гений», «магия», «идеальный кандидат».
- Если используешь термин, сразу объясни его простыми словами.
- Рекомендации по обучению должны быть реалистичны для старта с нуля (первые 1-3 месяца).
- Не давай Docker/Kubernetes как первый шаг для новичка.
- Docker/Kubernetes можно упоминать только как следующий этап после базы и в основном для DevOps-трека.
- Предпочитай базовые инструменты: Git/GitHub, VS Code, Postman, Figma, SQL playground, Python/JavaScript basics, AI-помощник (Copilot/ChatGPT) с простым объяснением пользы.

Верни только JSON-объект со строго этими полями:
primary_recommendation, explanation, signal_analysis, why_this_role_reasons, alternative_roles, differentiation_criteria.

Дополнительно:
- signal_analysis: 1-2 коротких факта по поведенческим паттернам.
- why_this_role_reasons: ровно 3 короткие причины в формате «Ты выбирал X -> это значит Y».
- Никакого markdown и никакого текста вне JSON.
"""

    def _call_with_retry(self, prompt: str) -> str:
        """Call OpenAI API with retry logic and exponential backoff."""
        for attempt in range(self._retry_config.max_retries + 1):
            try:
                response = self._client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": self._build_system_prompt()},
                        {"role": "user", "content": prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.5,
                    max_tokens=600,
                    timeout=45.0,
                )
                return response.choices[0].message.content

            except self.RETRYABLE_EXCEPTIONS as e:
                if attempt < self._retry_config.max_retries:
                    delay = self._calculate_delay(attempt)
                    logger.warning(f"Retry {attempt + 1}: {e}. Waiting {delay:.2f}s...")
                    time.sleep(delay)
                else:
                    raise LLMAPIError(f"OpenAI exhausted retries: {e}") from e
            except Exception as e:
                raise LLMAPIError(f"Unexpected LLM error: {e}") from e

        raise LLMAPIError("OpenAI call failed")

    def interpret_results(
        self,
        ranked_roles: List[Tuple[str, float]],
        signal_profile: Dict[str, int],
        role_profiles: Dict[str, Dict],
        signals: Dict[str, Dict],
    ) -> InterpretationResult:
        """Generate natural language interpretation from ranking + signals."""
        if not ranked_roles:
            raise LLMInterpreterError("No ranked roles provided")

        multiple_recommendations = False
        if len(ranked_roles) >= 2:
            if (ranked_roles[0][1] - ranked_roles[1][1]) < self._score_threshold:
                multiple_recommendations = True

        prompt = self._format_prompt(
            ranked_roles=ranked_roles,
            signal_profile=signal_profile,
            role_profiles=role_profiles,
            signals=signals,
            multiple_recommendations=multiple_recommendations,
        )

        interpretation_json = self._call_with_retry(prompt)
        return self._parse_interpretation(
            interpretation_text=interpretation_json,
            ranked_roles=ranked_roles,
            multiple_recommendations=multiple_recommendations,
        )

    def _format_prompt(
        self,
        ranked_roles: List[Tuple[str, float]],
        signal_profile: Dict[str, int],
        role_profiles: Dict[str, Dict],
        signals: Dict[str, Dict],
        multiple_recommendations: bool,
    ) -> str:
        """Build user prompt in Role/Summary format."""
        primary_role_id = ranked_roles[0][0]
        primary_role_name = role_profiles.get(primary_role_id, {}).get("name", primary_role_id)

        top_roles = ranked_roles[:4]
        top_role_lines = []
        for role_id, score in top_roles:
            role_name = role_profiles.get(role_id, {}).get("name", role_id)
            top_role_lines.append(f"- {role_name} ({role_id}): {score:.3f}")

        top_signals = sorted(signal_profile.items(), key=lambda x: x[1], reverse=True)[:5]
        signal_lines = []
        for signal_id, count in top_signals:
            signal_name = signals.get(signal_id, {}).get("name", signal_id)
            signal_lines.append(f"- {signal_name} ({signal_id}): {count}")

        top_quality_lines = []
        for signal_id, count in top_signals[:3]:
            signal_name = signals.get(signal_id, {}).get("name", signal_id)
            top_quality_lines.append(f"- {signal_name}: {count}")

        primary_role_profile = role_profiles.get(primary_role_id, {})
        role_hint = primary_role_profile.get("description", "")

        close_roles_text = None
        if multiple_recommendations and len(ranked_roles) > 1:
            close_roles = []
            for role_id, score in ranked_roles[1:3]:
                role_name = role_profiles.get(role_id, {}).get("name", role_id)
                close_roles.append(f"{role_name} ({score:.3f})")
            if close_roles:
                close_roles_text = (
                    "Close alternatives (scores are close): "
                    + ", ".join(close_roles)
                    + ". Добавь их в alternative_roles и коротко объясни отличие в differentiation_criteria."
                )

        prompt_lines = [
            "# Input Data",
            "Current year: 2026",
            f"Primary role: {primary_role_name} ({primary_role_id})",
            "",
            "Top role scores:",
            *(top_role_lines or ["- нет данных"]),
            "",
            "Top behavior signals from answers:",
            *(signal_lines or ["- нет выраженных паттернов"]),
            "",
            "Three strongest qualities to explain in explanation:",
            *(top_quality_lines or ["- нет данных"]),
        ]

        if role_hint:
            prompt_lines.extend(["", f"Role profile hint: {role_hint}"])

        prompt_lines.extend(
            [
                "",
                "Output focus:",
                "- explanation: exactly 8-10 sentences",
                "- include role fit summary, then 3 qualities from data above, then practical role tasks",
                "- include 2-3 tools for 2026 AI-era learning with plain explanation of each tool purpose",
                "- tools must be beginner-friendly for first 1-3 months",
                "- avoid Docker/Kubernetes as immediate first tools; mention them only as later step, mostly for DevOps path",
                "- format explanation as 4 named blocks, each line in format: \"Название: текст\"",
                "- use block titles: \"Почему тебе подходит роль\", \"Твои сильные качества\", \"Как это проявится в работе\", \"С чего начать в 2026\"",
                "- simple beginner-friendly language",
                "- why_this_role_reasons: exactly 3 short strings",
            ]
        )

        if close_roles_text:
            prompt_lines.extend(["", close_roles_text])

        return "\n".join(prompt_lines) + "\n"

    def _parse_interpretation(
        self,
        interpretation_text: str,
        ranked_roles: List[Tuple[str, float]],
        multiple_recommendations: bool,
    ) -> InterpretationResult:
        """Parse JSON response from LLM with safe fallbacks."""
        logger.info(f"LLM raw response: {interpretation_text}")

        def parse_payload(raw_text: str) -> Dict[str, Any]:
            if raw_text is None:
                raise ValueError("LLM response is empty")

            text = str(raw_text).strip()
            if not text:
                raise ValueError("LLM response is blank")

            candidates: List[str] = [text]

            # Sometimes model wraps payload in markdown fences.
            if "```" in text:
                cleaned = text.replace("```json", "").replace("```", "").strip()
                if cleaned:
                    candidates.append(cleaned)

            # Sometimes model adds extra text around the JSON-like object.
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end > start:
                candidates.append(text[start : end + 1])

            tried: set[str] = set()
            for candidate in candidates:
                candidate = candidate.strip()
                if not candidate or candidate in tried:
                    continue
                tried.add(candidate)

                for parser in (json.loads, ast.literal_eval):
                    try:
                        parsed = parser(candidate)
                        if isinstance(parsed, dict):
                            return parsed
                    except Exception:
                        continue

            raise ValueError("LLM response is not a parseable object")

        def to_text(value: Any, default: str = "") -> str:
            if value is None:
                return default
            if isinstance(value, str):
                return value.strip()
            if isinstance(value, (list, tuple)):
                parts = [str(item).strip() for item in value if str(item).strip()]
                return " ".join(parts) if parts else default
            return str(value).strip()

        def to_str_list(value: Any, max_items: Optional[int] = None) -> List[str]:
            items: List[str] = []
            if value is None:
                items = []
            elif isinstance(value, (list, tuple)):
                items = [str(item).strip() for item in value if str(item).strip()]
            elif isinstance(value, str):
                raw = value.strip()
                if raw:
                    if "\n" in raw:
                        items = [part.strip("-• ").strip() for part in raw.split("\n") if part.strip()]
                    else:
                        items = [raw]
            else:
                raw = str(value).strip()
                items = [raw] if raw else []

            if max_items is not None:
                return items[:max_items]
            return items

        def normalize_explanation(value: Any) -> str:
            def clean_text(raw: Any) -> str:
                return str(raw).replace("\r\n", "\n").strip().strip("'\"")

            def flatten(value_to_flatten: Any) -> str:
                if value_to_flatten is None:
                    return ""
                if isinstance(value_to_flatten, str):
                    return clean_text(value_to_flatten)
                if isinstance(value_to_flatten, (list, tuple)):
                    parts = [flatten(item) for item in value_to_flatten]
                    return " ".join([p for p in parts if p]).strip()
                if isinstance(value_to_flatten, dict):
                    if "text" in value_to_flatten:
                        return flatten(value_to_flatten.get("text"))
                    parts = []
                    for key, val in value_to_flatten.items():
                        key_text = clean_text(key)
                        val_text = flatten(val)
                        if val_text:
                            parts.append(f"{key_text}: {val_text}")
                    return " ".join(parts).strip()
                return clean_text(value_to_flatten)

            if value is None:
                return ""

            if isinstance(value, str):
                raw = clean_text(value)
                if (raw.startswith("{") and raw.endswith("}")) or (raw.startswith("[") and raw.endswith("]")):
                    for parser in (json.loads, ast.literal_eval):
                        try:
                            reparsed = parser(raw)
                            return normalize_explanation(reparsed)
                        except Exception:
                            continue
                return raw

            if isinstance(value, dict):
                normalized: Dict[str, str] = {}
                for key, val in value.items():
                    key_text = clean_text(key).strip(":")
                    val_text = flatten(val)
                    if key_text and val_text:
                        normalized[key_text] = val_text

                if not normalized:
                    return ""

                lines: List[str] = []
                used: set[str] = set()
                for title in self.EXPLANATION_BLOCK_TITLES:
                    match_key = next(
                        (
                            key
                            for key in normalized.keys()
                            if key.lower() == title.lower()
                            or key.lower() in title.lower()
                            or title.lower() in key.lower()
                        ),
                        None,
                    )
                    if match_key:
                        lines.append(f"{title}: {normalized[match_key]}")
                        used.add(match_key)

                for key, val in normalized.items():
                    if key not in used:
                        lines.append(f"{key}: {val}")

                return "\n".join(lines).strip()

            if isinstance(value, (list, tuple)):
                lines: List[str] = []
                for item in value:
                    if isinstance(item, dict):
                        title = item.get("title") or item.get("name") or item.get("block")
                        text = item.get("text") or item.get("content") or item.get("value")
                        if title and text:
                            lines.append(f"{clean_text(title)}: {flatten(text)}")
                        else:
                            item_text = flatten(item)
                            if item_text:
                                lines.append(item_text)
                    else:
                        item_text = flatten(item)
                        if item_text:
                            lines.append(item_text)
                return "\n".join(lines).strip()

            return clean_text(value)

        try:
            data = parse_payload(interpretation_text)
            default_primary = ranked_roles[0][0] if ranked_roles else "Unknown"
            explanation_text = normalize_explanation(data.get("explanation"))
            logger.info(f"Parsed explanation: {explanation_text[:200]}...")
            return InterpretationResult(
                primary_recommendation=to_text(data.get("primary_recommendation"), default_primary),
                explanation=explanation_text,
                signal_analysis=to_text(data.get("signal_analysis"), ""),
                alternative_roles=to_str_list(data.get("alternative_roles")),
                differentiation_criteria=to_text(data.get("differentiation_criteria"), ""),
                why_this_role_reasons=to_str_list(data.get("why_this_role_reasons"), max_items=3),
            )
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON: {e}")
            fallback_explanation = normalize_explanation(interpretation_text)
            if not fallback_explanation:
                fallback_explanation = "Не удалось структурировать ответ. Попробуй пройти тест еще раз."
            return InterpretationResult(
                primary_recommendation=ranked_roles[0][0] if ranked_roles else "Unknown",
                explanation=fallback_explanation[:1200],
                signal_analysis="Не удалось разобрать ответ LLM.",
                alternative_roles=[] if not multiple_recommendations else [r[0] for r in ranked_roles[1:3]],
                differentiation_criteria="",
                why_this_role_reasons=[],
            )

    @property
    def retry_config(self) -> RetryConfig:
        """Get current retry configuration."""
        return self._retry_config

    @retry_config.setter
    def retry_config(self, config: RetryConfig) -> None:
        """Set retry configuration."""
        self._retry_config = config
