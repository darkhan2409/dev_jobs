"""
Interview API Router - FastAPI endpoints for IT Career Test Engine v2.1.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.interview import ITCareerTestOrchestrator
from app.config import settings
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


def get_orchestrator() -> ITCareerTestOrchestrator:
    """Get or create the orchestrator singleton."""
    global _orchestrator
    if _orchestrator is None:
        enable_llm = bool(settings.OPENAI_API_KEY)
        _orchestrator = ITCareerTestOrchestrator(
            openai_api_key=settings.OPENAI_API_KEY,
            model=settings.AI_MODEL,
            enable_llm=enable_llm
        )
    return _orchestrator


# --- API Endpoints ---

@router.get("/questions", response_model=List[QuestionResponse], summary="Get all test questions")
async def get_questions():
    """Get all questions for the IT Career Test."""
    orchestrator = get_orchestrator()
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
async def start_test():
    """Start a new IT Career Test session."""
    orchestrator = get_orchestrator()
    session_id = orchestrator.start_test()
    return StartTestResponse(session_id=session_id)


@router.post("/answer/{session_id}", summary="Submit an answer")
async def submit_answer(session_id: str, request: SubmitAnswerRequest):
    """Submit an answer for a question in the test."""
    orchestrator = get_orchestrator()
    try:
        orchestrator.submit_answer(session_id, request.question_id, request.answer_option_id)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error submitting answer: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/complete/{session_id}", response_model=TestResultResponse, summary="Complete test and get results")
async def complete_test(session_id: str, skip_llm: bool = False):
    """Complete the test and get results with role-first stage recommendation."""
    orchestrator = get_orchestrator()

    try:
        result = orchestrator.complete_test(session_id, skip_llm=skip_llm)

        # Convert interpretation
        interpretation = None
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

        return TestResultResponse(
            session_id=result.session_id,
            ranked_roles=[
                RoleScoreResponse(role_id=role_id, score=score)
                for role_id, score in result.ranked_roles
            ],
            signal_profile=result.signal_profile,
            interpretation=interpretation,
            ranked_stages=ranked_stages,
            stage_recommendation=stage_recommendation
        )
    except Exception as e:
        logger.error(f"Error completing test: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# --- Career Pipeline Endpoints ---

@router.get("/roles/{role_id}", summary="Get role details")
async def get_role_details(role_id: str):
    orchestrator = get_orchestrator()
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


def get_stage_manager() -> StageManager:
    global _stage_manager
    if _stage_manager is None:
        _stage_manager = StageManager()
    return _stage_manager


def get_stage_engine() -> StageAggregationEngine:
    global _stage_engine
    if _stage_engine is None:
        _stage_engine = StageAggregationEngine(
            get_stage_manager(),
            RoleCatalogManager()
        )
    return _stage_engine


@router.get("/stages", response_model=List[StageResponse], summary="Get all product stages")
async def get_all_stages():
    """Get all stages of IT product creation process."""
    manager = get_stage_manager()
    stages = manager.get_all_stages()
    return [
        StageResponse(id=stage.id, name=stage.name, summary=stage.summary)
        for stage in stages
    ]


@router.get("/stages/{stage_id}", response_model=StageWithRolesResponse, summary="Get stage details")
async def get_stage_details(stage_id: str):
    manager = get_stage_manager()
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
