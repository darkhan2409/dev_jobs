"""
Interview API Router - FastAPI endpoints for IT Career Test Engine.
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
    StageRoleMapResponse,
    StageRecommendationResponse,
    StageScoreResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/interview",
    tags=["interview"]
)

# Initialize orchestrator (singleton, LLM disabled by default for safety)
_orchestrator: Optional[ITCareerTestOrchestrator] = None


def get_orchestrator() -> ITCareerTestOrchestrator:
    """Get or create the orchestrator singleton."""
    global _orchestrator
    if _orchestrator is None:
        # Enable LLM if API key is provided in settings
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
    """
    Get all 25 questions for the IT Career Test.

    Returns questions organized in 6 thematic blocks with 4 answer options each.
    """
    orchestrator = get_orchestrator()
    questions = orchestrator.get_all_questions()

    return [
        QuestionResponse(
            id=q.id,
            text=q.text,
            thematic_block=q.thematic_block,
            answer_options=[
                AnswerOptionResponse(id=opt.id, text=opt.text)
                for opt in q.answer_options
            ]
        )
        for q in questions
    ]


@router.post("/start", response_model=StartTestResponse, summary="Start a new test session")
async def start_test():
    """
    Start a new IT Career Test session.

    Returns a session_id that must be used for submitting answers and completing the test.
    """
    orchestrator = get_orchestrator()
    session_id = orchestrator.start_test()

    return StartTestResponse(session_id=session_id)


@router.post("/answer/{session_id}", summary="Submit an answer")
async def submit_answer(session_id: str, request: SubmitAnswerRequest):
    """
    Submit an answer for a question in the test.

    Args:
        session_id: Test session identifier from /start endpoint
        request: Question ID and selected answer option ID
    """
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
    """
    Complete the test and get results with optional LLM interpretation.

    Args:
        session_id: Test session identifier
        skip_llm: Skip LLM interpretation (faster, no API call)

    Returns:
        Complete test results with ranked roles, signal profile, interpretation,
        and stage recommendation.
    """
    orchestrator = get_orchestrator()

    try:
        result = orchestrator.complete_test(session_id, skip_llm=skip_llm)

        # Convert interpretation to response model
        interpretation = None
        if result.interpretation:
            interpretation = InterpretationResponse(
                primary_recommendation=result.interpretation.primary_recommendation,
                explanation=result.interpretation.explanation,
                signal_analysis=result.interpretation.signal_analysis,
                alternative_roles=result.interpretation.alternative_roles,
                differentiation_criteria=result.interpretation.differentiation_criteria
            )

        # Compute stage recommendation based on signal profile
        ranked_stages = None
        stage_recommendation = None
        try:
            stage_engine = get_stage_engine()
            stage_result = stage_engine.compute_stage_scores(result.signal_profile)
            rec = stage_result.recommendation

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
        except Exception as stage_error:
            logger.warning(f"Failed to compute stage recommendation: {stage_error}")
            # Continue without stage recommendation - it's optional

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

from app.interview.storage.career_pipeline_manager import CareerPipelineManager

_career_manager: Optional[CareerPipelineManager] = None

def get_career_manager() -> CareerPipelineManager:
    """Get or create the career pipeline manager singleton."""
    global _career_manager
    if _career_manager is None:
        _career_manager = CareerPipelineManager()
    return _career_manager

@router.get("/career/graph", summary="Get career pipeline graph")
async def get_career_graph():
    """Get the full career transition graph."""
    manager = get_career_manager()
    return manager.get_full_graph()

@router.get("/career/clusters", summary="Get role clusters")
async def get_role_clusters():
    """Get all role clusters."""
    manager = get_career_manager()
    return manager.get_role_clusters()

@router.get("/career/roles/{role_id}/next", summary="Get next career steps")
async def get_next_career_steps(role_id: str):
    """Get possible next career steps for a specific role."""
    manager = get_career_manager()
    return manager.get_next_roles(role_id)

@router.get("/roles/{role_id}", summary="Get role details")
async def get_role_details(role_id: str):
    """Get detailed role profile including responsibilities and red flags."""
    orchestrator = get_orchestrator()
    role = orchestrator.role_manager.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


# --- Product Stages Endpoints ---

from app.interview.storage.stage_manager import StageManager
from app.interview.aggregation.stage_aggregation_engine import StageAggregationEngine

_stage_manager: Optional[StageManager] = None
_stage_engine: Optional[StageAggregationEngine] = None


def get_stage_manager() -> StageManager:
    """Get or create the stage manager singleton."""
    global _stage_manager
    if _stage_manager is None:
        _stage_manager = StageManager()
    return _stage_manager


def get_stage_engine() -> StageAggregationEngine:
    """Get or create the stage aggregation engine singleton."""
    global _stage_engine
    if _stage_engine is None:
        _stage_engine = StageAggregationEngine(get_stage_manager())
    return _stage_engine





@router.get("/stages", response_model=List[StageResponse], summary="Get all product stages")
async def get_all_stages():
    """
    Get all 10 stages of IT product creation process.

    Returns stages in canonical order from idea to documentation.
    """
    manager = get_stage_manager()
    stages = manager.get_all_stages()

    return [
        StageResponse(
            id=stage.id,
            name=stage.name,
            summary=stage.summary
        )
        for stage in stages
    ]


@router.get("/stages/{stage_id}", response_model=StageWithRolesResponse, summary="Get stage details")
async def get_stage_details(stage_id: str):
    """
    Get detailed information about a specific stage including associated roles.

    Args:
        stage_id: Stage identifier (e.g., 'development', 'testing')
    """
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


@router.get("/stages/{stage_id}/keywords", summary="Get vacancy keywords for stage")
async def get_stage_vacancy_keywords(stage_id: str):
    """
    Get vacancy search keywords for a specific stage.

    Useful for filtering vacancies by product creation stage.
    """
    manager = get_stage_manager()
    stage = manager.get_stage(stage_id)

    if not stage:
        raise HTTPException(status_code=404, detail=f"Stage '{stage_id}' not found")

    return {
        "stage_id": stage_id,
        "stage_name": stage.name,
        "keywords": stage.primary_vacancy_filters.keywords,
        "roles": stage.primary_vacancy_filters.roles
    }


@router.post("/stages/recommend", response_model=StageRecommendationResponse, summary="Get stage recommendation")
async def get_stage_recommendation(signal_profile: dict):
    """
    Get stage recommendation based on signal profile from test.

    This endpoint computes which product creation stage best matches
    the user's cognitive profile from the career test.

    Args:
        signal_profile: Dict of signal_id -> count from test results
    """
    engine = get_stage_engine()

    try:
        result = engine.compute_stage_scores(signal_profile)
        rec = result.recommendation

        return StageRecommendationResponse(
            primary_stage_id=rec.primary_stage_id,
            primary_stage_name=rec.primary_stage_name,
            what_user_will_see=rec.what_user_will_see,
            related_roles=rec.related_roles,
            ranked_stages=[
                StageScoreResponse(
                    stage_id=s.stage_id,
                    stage_name=s.stage_name,
                    score=s.score
                )
                for s in rec.ranked_stages
            ]
        )
    except Exception as e:
        logger.error(f"Error computing stage recommendation: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
