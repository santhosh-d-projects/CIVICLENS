import pytest
from scripts.serve import app, ask_question, root, AskRequest

def test_root_endpoint():
    res = root()
    assert res["status"] == "online"
    assert "/ai/ask" in res["endpoints"]

def test_ask_endpoint_empty_question():
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        ask_question(AskRequest(question=""))
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Question parameter cannot be empty."

def test_ask_endpoint_valid_question():
    res = ask_question(AskRequest(
        question="What is the budget of the Ward 12 Road Development project?",
        projectId="P001"
    ))
    assert res.success is True
    assert res.question == "What is the budget of the Ward 12 Road Development project?"
    assert res.grounded is True
    assert isinstance(res.sources, list)
    assert len(res.sources) > 0
    # Validate contract schema
    source = res.sources[0]
    assert hasattr(source, "documentId")
    assert hasattr(source, "documentName")
    assert hasattr(source, "page")
    assert hasattr(source, "projectId")
    assert source.projectId == "P001"

def test_ask_endpoint_project_filtering():
    res = ask_question(AskRequest(
        question="What is the budget?",
        projectId="P999"
    ))
    assert res.grounded is False
    assert len(res.sources) == 0
    assert "couldn't find sufficient information" in res.answer

def test_ask_endpoint_anti_hallucination():
    res = ask_question(AskRequest(
        question="What is the population of Tokyo?",
        projectId="P001"
    ))
    assert res.grounded is False
    assert len(res.sources) == 0
    assert "couldn't find sufficient information" in res.answer
