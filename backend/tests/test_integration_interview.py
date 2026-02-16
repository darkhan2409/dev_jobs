"""
Integration test for interview core flow.

Flow:
- Start interview session
- Fetch questions
- Submit one answer for each question
- Complete session with deterministic mode (skip_llm=true)
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_interview_flow_start_answer_complete(client: AsyncClient):
    """Interview flow should complete successfully without Redis session backend."""
    start_response = await client.post("/api/interview/start")
    assert start_response.status_code == 200
    assert start_response.headers.get("X-Request-ID")

    session_id = start_response.json()["session_id"]
    assert session_id

    questions_response = await client.get("/api/interview/questions")
    assert questions_response.status_code == 200
    assert questions_response.headers.get("X-Request-ID")

    questions = questions_response.json()
    assert isinstance(questions, list)
    assert questions

    for question in questions:
        answer_payload = {
            "question_id": question["id"],
            "answer_option_id": question["answer_options"][0]["id"],
        }
        answer_response = await client.post(
            f"/api/interview/answer/{session_id}",
            json=answer_payload,
        )
        assert answer_response.status_code == 200
        assert answer_response.headers.get("X-Request-ID")

    complete_response = await client.post(f"/api/interview/complete/{session_id}?skip_llm=true")
    assert complete_response.status_code == 200
    assert complete_response.headers.get("X-Request-ID")

    result = complete_response.json()
    assert result["session_id"] == session_id
    assert "ranked_roles" in result
    assert "signal_profile" in result
