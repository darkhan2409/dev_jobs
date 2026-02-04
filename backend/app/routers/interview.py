"""
Interview API Router - FastAPI endpoints for IT Career Test Engine.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.interview import ITCareerTestOrchestrator
from app.config import settings

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


# --- Pydantic Response Models ---

class AnswerOptionResponse(BaseModel):
    """Answer option for a question."""
    id: str
    text: str


class QuestionResponse(BaseModel):
    """Question with answer options."""
    id: str
    text: str
    thematic_block: str
    answer_options: List[AnswerOptionResponse]


class StartTestResponse(BaseModel):
    """Response when starting a new test."""
    session_id: str


class SubmitAnswerRequest(BaseModel):
    """Request body for submitting an answer."""
    question_id: str = Field(..., description="Question ID")
    answer_option_id: str = Field(..., description="Selected answer option ID")


class InterpretationResponse(BaseModel):
    """LLM interpretation of test results."""
    primary_recommendation: str
    explanation: str
    signal_analysis: str
    alternative_roles: List[str]
    differentiation_criteria: str


class RoleScoreResponse(BaseModel):
    """Role with its score."""
    role_id: str
    score: float


class TestResultResponse(BaseModel):
    """Complete test results."""
    session_id: str
    ranked_roles: List[RoleScoreResponse]
    signal_profile: dict
    interpretation: Optional[InterpretationResponse] = None


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
        Complete test results with ranked roles, signal profile, and interpretation.
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

        return TestResultResponse(
            session_id=result.session_id,
            ranked_roles=[
                RoleScoreResponse(role_id=role_id, score=score)
                for role_id, score in result.ranked_roles
            ],
            signal_profile=result.signal_profile,
            interpretation=interpretation
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
