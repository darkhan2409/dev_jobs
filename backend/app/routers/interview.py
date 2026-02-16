"""
Interview API Router - FastAPI endpoints for IT Career Test Engine v2.1.
"""
import asyncio
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request, status

from app.interview import ITCareerTestOrchestrator
from app.interview.aggregation import IncompleteSessionError
from app.interview.storage import (
    InvalidReferenceError,
    SessionCompleteError,
    SessionNotFoundError,
)
from app.interview.storage.session_store import (
    SessionBackendUnavailableError,
    SessionLimitExceededError,
)
from app.config import settings
from app.core.limiter import limiter
from app.schemas import (
    QuestionResponse,
    AnswerOptionResponse,
    StartTestResponse,
    SubmitAnswerRequest,
    TestResultResponse,
    RoleScoreResponse,
    InterpretationResponse,
    TestStageScoreResponse,
    TestStageRecommendationResponse,
    StageResponse,
    StageWithRolesResponse,
    StageDetailResponse,
    PrimaryVacancyFiltersResponse,
    StageRoleMapResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/interview",
    tags=["interview"]
)

_orchestrator: Optional[ITCareerTestOrchestrator] = None
_orchestrator_lock: Optional[asyncio.Lock] = None


async def get_orchestrator() -> ITCareerTestOrchestrator:
    """Get or create the orchestrator singleton."""
    global _orchestrator, _orchestrator_lock
    if _orchestrator is None:
        current_loop = asyncio.get_running_loop()
        lock_loop = getattr(_orchestrator_lock, "_loop", None) if _orchestrator_lock else None
        if _orchestrator_lock is None or (lock_loop is not None and lock_loop is not current_loop):
            _orchestrator_lock = asyncio.Lock()
        async with _orchestrator_lock:
            if _orchestrator is None:
                enable_llm = bool(settings.OPENAI_API_KEY)
                _orchestrator = ITCareerTestOrchestrator(
                    openai_api_key=settings.OPENAI_API_KEY,
                    model=settings.AI_MODEL,
                    enable_llm=enable_llm
                )
    return _orchestrator


def _map_interview_exception(exc: Exception) -> HTTPException:
    if isinstance(exc, SessionNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    if isinstance(exc, SessionCompleteError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interview session is already completed"
        )
    if isinstance(exc, (InvalidReferenceError, IncompleteSessionError)):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Interview session data is invalid or incomplete"
        )
    if isinstance(exc, SessionLimitExceededError):
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many active interview sessions. Please try again later."
        )
    if isinstance(exc, SessionBackendUnavailableError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Interview session storage is temporarily unavailable"
        )
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unexpected interview error"
    )


# --- API Endpoints ---

@router.get("/questions", response_model=List[QuestionResponse], summary="Get all test questions")
async def get_questions():
    """Get all questions for the IT Career Test."""
    orchestrator = await get_orchestrator()
    questions = orchestrator.get_all_questions()

    return [
        QuestionResponse(
            id=q.id,
            text=q.text,
            thematic_block=q.thematic_block,
            type=q.type,
            answer_options=[
                AnswerOptionResponse(id=opt.id, text=opt.text)
                for opt in q.answer_options
            ]
        )
        for q in questions
    ]


@router.post("/start", response_model=StartTestResponse, summary="Start a new test session")
@limiter.limit("5/minute")
async def start_test(request: Request):
    """Start a new IT Career Test session."""
    try:
        orchestrator = await get_orchestrator()
        session_id = await asyncio.to_thread(orchestrator.start_test)
        logger.info("interview_session_created session_id=%s", session_id)
        return StartTestResponse(session_id=session_id)
    except Exception as exc:
        logger.error("Interview start failed", exc_info=True)
        raise _map_interview_exception(exc)


@router.post("/answer/{session_id}", summary="Submit an answer")
@limiter.limit("60/minute")
async def submit_answer(request: Request, session_id: str, payload: SubmitAnswerRequest):
    """Submit an answer for a question in the test."""
    try:
        orchestrator = await get_orchestrator()
        await asyncio.to_thread(
            orchestrator.submit_answer,
            session_id,
            payload.question_id,
            payload.answer_option_id,
        )
        return {"status": "ok"}
    except Exception as exc:
        logger.error("Interview answer submit failed", exc_info=True)
        raise _map_interview_exception(exc)


@router.post("/complete/{session_id}", response_model=TestResultResponse, summary="Complete test and get results")
@limiter.limit("5/minute")
async def complete_test(request: Request, session_id: str, skip_llm: bool = False):
    """Complete the test and get results with role-first stage recommendation."""
    try:
        orchestrator = await get_orchestrator()
        result = await asyncio.wait_for(
            asyncio.to_thread(orchestrator.complete_test, session_id, skip_llm),
            timeout=30.0
        )

        # Convert interpretation
        interpretation = None
        warnings = list(result.warnings or [])
        if result.interpretation:
            try:
                interpretation = InterpretationResponse(
                    primary_recommendation=result.interpretation.primary_recommendation,
                    explanation=result.interpretation.explanation,
                    signal_analysis=result.interpretation.signal_analysis,
                    alternative_roles=result.interpretation.alternative_roles,
                    differentiation_criteria=result.interpretation.differentiation_criteria,
                    why_this_role_reasons=result.interpretation.why_this_role_reasons
                )
            except Exception as ie:
                logger.warning(f"Interpretation payload invalid, returning result without interpretation: {ie}")
                warnings.append("interpretation_payload_invalid")
                interpretation = None

        # Convert stage result (now computed by orchestrator via role-first algorithm)
        ranked_stages = None
        stage_recommendation = None
        if result.stage_result:
            rec = result.stage_result.recommendation
            ranked_stages = [
                TestStageScoreResponse(
                    stage_id=s.stage_id,
                    stage_name=s.stage_name,
                    score=s.score
                )
                for s in rec.ranked_stages
            ]
            stage_recommendation = TestStageRecommendationResponse(
                primary_stage_id=rec.primary_stage_id,
                primary_stage_name=rec.primary_stage_name,
                what_user_will_see=rec.what_user_will_see,
                related_roles=rec.related_roles
            )

        logger.info("interview_session_completed session_id=%s", result.session_id)

        return TestResultResponse(
            session_id=result.session_id,
            ranked_roles=[
                RoleScoreResponse(role_id=role_id, score=score)
                for role_id, score in result.ranked_roles
            ],
            signal_profile=result.signal_profile,
            interpretation=interpretation,
            ranked_stages=ranked_stages,
            stage_recommendation=stage_recommendation,
            warnings=warnings or None,
        )
    except asyncio.TimeoutError:
        logger.error("Interview completion timed out after 30s for session_id=%s", session_id)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Interview completion timed out. Please try again."
        )
    except Exception as exc:
        logger.error("Interview completion failed", exc_info=True)
        raise _map_interview_exception(exc)


# --- Career Pipeline Endpoints ---

@router.get("/roles/{role_id}", summary="Get role details")
async def get_role_details(role_id: str):
    orchestrator = await get_orchestrator()
    role = orchestrator.role_manager.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


# --- Product Stages Endpoints ---

from app.interview.storage.stage_manager import StageManager
from app.interview.storage.role_catalog_manager import RoleCatalogManager
from app.interview.aggregation.stage_aggregation_engine import StageAggregationEngine

_stage_manager: Optional[StageManager] = None
_stage_engine: Optional[StageAggregationEngine] = None
_stage_manager_lock: Optional[asyncio.Lock] = None
_stage_engine_lock: Optional[asyncio.Lock] = None


async def get_stage_manager() -> StageManager:
    global _stage_manager, _stage_manager_lock
    if _stage_manager is None:
        current_loop = asyncio.get_running_loop()
        lock_loop = getattr(_stage_manager_lock, "_loop", None) if _stage_manager_lock else None
        if _stage_manager_lock is None or (lock_loop is not None and lock_loop is not current_loop):
            _stage_manager_lock = asyncio.Lock()
        async with _stage_manager_lock:
            if _stage_manager is None:
                _stage_manager = StageManager()
    return _stage_manager


async def get_stage_engine() -> StageAggregationEngine:
    global _stage_engine, _stage_engine_lock
    if _stage_engine is None:
        current_loop = asyncio.get_running_loop()
        lock_loop = getattr(_stage_engine_lock, "_loop", None) if _stage_engine_lock else None
        if _stage_engine_lock is None or (lock_loop is not None and lock_loop is not current_loop):
            _stage_engine_lock = asyncio.Lock()
        async with _stage_engine_lock:
            if _stage_engine is None:
                _stage_engine = StageAggregationEngine(
                    await get_stage_manager(),
                    RoleCatalogManager()
                )
    return _stage_engine


@router.get("/stages", response_model=List[StageResponse], summary="Get all product stages")
async def get_all_stages():
    """Get all stages of IT product creation process."""
    manager = await get_stage_manager()
    stages = manager.get_all_stages()
    return [
        StageResponse(id=stage.id, name=stage.name, summary=stage.summary)
        for stage in stages
    ]


@router.get("/stages/{stage_id}", response_model=StageWithRolesResponse, summary="Get stage details")
async def get_stage_details(stage_id: str):
    manager = await get_stage_manager()
    stage = manager.get_stage(stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail=f"Stage '{stage_id}' not found")

    role_maps = manager.get_roles_for_stage(stage_id)
    return StageWithRolesResponse(
        stage=StageDetailResponse(
            id=stage.id,
            name=stage.name,
            summary=stage.summary,
            typical_outputs=stage.typical_outputs,
            common_mistakes=stage.common_mistakes,
            primary_vacancy_filters=PrimaryVacancyFiltersResponse(
                roles=stage.primary_vacancy_filters.roles,
                keywords=stage.primary_vacancy_filters.keywords
            )
        ),
        roles=[
            StageRoleMapResponse(
                stage_id=rm.stage_id,
                role_id=rm.role_id,
                why_here=rm.why_here,
                how_it_connects_to_vacancies=rm.how_it_connects_to_vacancies,
                importance=rm.importance
            )
            for rm in role_maps
        ]
    )
