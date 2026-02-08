"""
LLM Interpreter for IT Career Test Engine (MVP VERSION - SIMPLE).

Generates natural language interpretation of test results using OpenAI API.
This is the ONLY component that uses LLM functionality.

Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
"""

import os
import time
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

from openai import OpenAI, APIError, RateLimitError, APIConnectionError, APITimeoutError


# Configure logging
logger = logging.getLogger(__name__)


class LLMInterpreterError(Exception):
    """Base exception for LLM Interpreter errors."""
    pass


class LLMAPIError(LLMInterpreterError):
    """Raised when LLM API call fails after all retries."""
    pass


class LLMConfigError(LLMInterpreterError):
    """Raised when LLM configuration is invalid."""
    pass


@dataclass
class RetryConfig:
    """Configuration for retry behavior."""
    max_retries: int = 3
    base_delay: float = 1.0  # seconds
    max_delay: float = 60.0  # seconds
    exponential_base: float = 2.0
    jitter: bool = True  # Add randomness to delays


@dataclass
class InterpretationResult:
    """
    Result of LLM interpretation.

    Contains personalized career recommendation and analysis.
    """
    primary_recommendation: str  # Role name
    explanation: str  # Why this role fits
    signal_analysis: str  # Which signals led to this result
    alternative_roles: List[str]  # If scores are close
    differentiation_criteria: str  # How to choose between close roles


class LLMInterpreter:
    """
    LLM-based interpreter for generating natural language explanations of test results.

    This is the ONLY component that uses LLM functionality.
    Uses OpenAI API for generating personalized interpretations.
    Includes retry logic with exponential backoff for resilience.
    """

    # Retryable OpenAI exceptions
    RETRYABLE_EXCEPTIONS = (
        RateLimitError,
        APIConnectionError,
        APITimeoutError,
    )

    def __init__(
        self,
        api_key: str = None,
        model: str = "gpt-4",
        score_threshold: float = 0.1,
        retry_config: Optional[RetryConfig] = None
    ):
        """
        Initialize the LLM Interpreter.

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: OpenAI model to use (default: gpt-4, can use gpt-3.5-turbo for cheaper option)
            score_threshold: Threshold for detecting close scores (default: 0.1)
            retry_config: Configuration for retry behavior (default: RetryConfig())
        """
        self._api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self._api_key:
            raise LLMConfigError(
                "OpenAI API key not provided. "
                "Set OPENAI_API_KEY environment variable or pass api_key parameter."
            )

        self._client = OpenAI(api_key=self._api_key)
        self._model = model
        self._score_threshold = score_threshold
        self._retry_config = retry_config or RetryConfig()

    def _calculate_delay(self, attempt: int) -> float:
        """
        Calculate delay for retry with exponential backoff.

        Args:
            attempt: Current attempt number (0-indexed)

        Returns:
            Delay in seconds
        """
        delay = self._retry_config.base_delay * (
            self._retry_config.exponential_base ** attempt
        )
        delay = min(delay, self._retry_config.max_delay)

        # Add jitter (0-25% randomness) to prevent thundering herd
        if self._retry_config.jitter:
            import random
            jitter = delay * random.uniform(0, 0.25)
            delay += jitter

        return delay

    def _call_with_retry(self, prompt: str) -> str:
        """
        Call OpenAI API with retry logic and exponential backoff.
        Uses JSON mode for robust parsing.
        """
        last_exception = None

        for attempt in range(self._retry_config.max_retries + 1):
            try:
                response = self._client.chat.completions.create(
                    model=self._model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "Ты — ведущий эксперт по профориентации в IT. "
                                "Твоя задача — анализировать результаты теста и давать глубокие, но лаконичные рекомендации. "
                                "ПРАВИЛА:\n"
                                "1. Используй ТОЛЬКО предоставленные описания ролей и сигналов. Не выдумывай новые качества.\n"
                                "2. Пиши на профессиональном русском языке, избегай воды.\n"
                                "3. Каждая секция объяснения должна быть разбита на абзацы. Используй \\n\\n между абзацами для читаемости.\n"
                                "4. Пиши короткими абзацами по 2-3 предложения максимум.\n"
                                "5. Всегда возвращай ответ ТОЛЬКО в формате JSON."
                            )
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                    max_tokens=1000,
                    timeout=45.0
                )
                return response.choices[0].message.content

            except self.RETRYABLE_EXCEPTIONS as e:
                last_exception = e
                if attempt < self._retry_config.max_retries:
                    delay = self._calculate_delay(attempt)
                    logger.warning(f"Retry {attempt+1}: {e}. Waiting {delay:.2f}s...")
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
        signals: Dict[str, Dict]
    ) -> InterpretationResult:
        """
        Generate natural language interpretation of test results using JSON flow.
        """
        if not ranked_roles:
            raise LLMInterpreterError("No ranked roles provided")

        # Determine if we have close scores
        multiple_recommendations = False
        if len(ranked_roles) >= 2:
            top_score = ranked_roles[0][1]
            second_score = ranked_roles[1][1]
            if top_score - second_score < self._score_threshold:
                multiple_recommendations = True

        # Format the prompt
        prompt = self._format_prompt(
            ranked_roles,
            signal_profile,
            role_profiles,
            signals,
            multiple_recommendations
        )

        # Call OpenAI API
        interpretation_json = self._call_with_retry(prompt)

        # Parse the JSON response
        return self._parse_interpretation(
            interpretation_json,
            ranked_roles,
            multiple_recommendations
        )

    def _format_prompt(
        self,
        ranked_roles: List[Tuple[str, float]],
        signal_profile: Dict[str, int],
        role_profiles: Dict[str, Dict],
        signals: Dict[str, Dict],
        multiple_recommendations: bool
    ) -> str:
        """Format the prompt for JSON response."""
        top_roles = ranked_roles[:3]
        sorted_signals = sorted(signal_profile.items(), key=lambda x: x[1], reverse=True)[:5]

        signal_text = "\n".join([
            f"- {signals[s_id]['name']}: {signals[s_id]['description']}"
            for s_id, _ in sorted_signals if s_id in signals
        ])

        roles_text = ""
        for role_id, score in top_roles:
            if role_id in role_profiles:
                r = role_profiles[role_id]
                roles_text += f"- {r['name']} (Балл: {score:.2f}): {r['description']}\n"

        json_structure = {
            "primary_recommendation": "Название роли и краткое 'почему'",
            "explanation": "Подробное (3-4 предл.) соответствие мышления роли",
            "signal_analysis": "Анализ топовых сигналов в контексте выбора",
        }
        if multiple_recommendations:
            json_structure["alternative_roles"] = ["Роль 2", "Роль 3"]
            json_structure["differentiation_criteria"] = "Как выбрать между ними"

        import json
        return f"""Проанализируй данные теста и верни JSON согласно структуре:
{json.dumps(json_structure, ensure_ascii=False, indent=2)}

ДАННЫЕ:
ПРОФИЛЬ (Сигналы): {signal_text}
РОЛИ: {roles_text}
{'ВНИМАНИЕ: Баллы ролей близки, обязательно заполни секции альтернатив и критериев.' if multiple_recommendations else ''}
"""

    def _parse_interpretation(
        self,
        interpretation_text: str,
        ranked_roles: List[Tuple[str, float]],
        multiple_recommendations: bool
    ) -> InterpretationResult:
        """Parse JSON response from LLM."""
        import json
        logger.info(f"LLM raw response: {interpretation_text}")
        try:
            data = json.loads(interpretation_text)
            logger.info(f"Parsed explanation: {data.get('explanation', '')[:200]}...")
            
            return InterpretationResult(
                primary_recommendation=data.get("primary_recommendation", ranked_roles[0][0]),
                explanation=data.get("explanation", ""),
                signal_analysis=data.get("signal_analysis", ""),
                alternative_roles=data.get("alternative_roles", []),
                differentiation_criteria=data.get("differentiation_criteria", "")
            )
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON: {e}")
            return InterpretationResult(
                primary_recommendation=ranked_roles[0][0] if ranked_roles else "Unknown",
                explanation=interpretation_text[:500],
                signal_analysis="Ошибка разбора ответа",
                alternative_roles=[],
                differentiation_criteria=""
            )

    @property
    def retry_config(self) -> RetryConfig:
        """Get current retry configuration."""
        return self._retry_config

    @retry_config.setter
    def retry_config(self, config: RetryConfig) -> None:
        """Set retry configuration."""
        self._retry_config = config
