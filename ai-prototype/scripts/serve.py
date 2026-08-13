import sys
import pickle
from pathlib import Path
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import uvicorn

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import INDEX_CACHE_PATH
from src.retrieval.embeddings import EmbeddingService
from src.retrieval.retriever import Retriever
from src.generation.generator import GenerationService

# Global services
retriever_instance: Optional[Retriever] = None
generator_instance: Optional[GenerationService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global retriever_instance, generator_instance
    print("[FastAPI] Loading CivicLens AI Index & Models...")

    if not INDEX_CACHE_PATH.exists():
        from scripts.ingest import run_ingestion
        run_ingestion()

    with open(INDEX_CACHE_PATH, "rb") as f:
        index = pickle.load(f)

    embedding_service = EmbeddingService()
    retriever_instance = Retriever(embedding_service, index)
    generator_instance = GenerationService()
    print("[FastAPI] CivicLens AI Prototype API Service Ready!")
    yield


app = FastAPI(
    title="CivicLens Source-Backed AI Prototype API",
    description=(
        "Isolated RAG Engine API for CivicLens providing grounded answers "
        "with page-level citations from verified government documents."
    ),
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)


class SourceCitation(BaseModel):
    documentId: str = Field(..., examples=["DOC_W12_PROGRESS_REP"], description="Unique ID of the source document")
    documentName: str = Field(..., examples=["Ward 12 Progress Report"], description="Human-readable title of the document")
    page: int = Field(..., examples=[3], description="1-indexed page number where source chunk resides")
    projectId: Optional[str] = Field(None, examples=["P001"], description="Associated CivicLens project ID")


class AskRequest(BaseModel):
    question: str = Field(
        ...,
        examples=["Why is this project potentially delayed?"],
        description="The user's query about a civic project."
    )
    projectId: Optional[str] = Field(
        None,
        examples=["P001"],
        description="Optional project ID filter to restrict context search to a single project."
    )
    topK: Optional[int] = Field(
        5,
        examples=[5],
        description="Number of relevant document chunks to retrieve."
    )


class AskResponse(BaseModel):
    success: bool = Field(True, description="Indicates if the query was processed successfully")
    question: str = Field(..., description="The original question asked by the user")
    answer: str = Field(..., description="Grounded answer synthesized from verified document sources")
    sources: List[SourceCitation] = Field(..., description="List of page-level source citations")
    formattedSources: str = Field(..., description="Pre-formatted human-readable citation list")
    grounded: bool = Field(..., description="True if answer is supported by retrieved sources; false if unsupported/rejected")


class ErrorDetail(BaseModel):
    detail: str = Field(..., examples=["Question parameter cannot be empty."])


@app.get("/", tags=["Health & Info"])
def root():
    return {
        "status": "online",
        "service": "CivicLens AI/RAG Prototype Engine",
        "endpoints": ["/ai/ask"],
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


def get_services():
    global retriever_instance, generator_instance
    if retriever_instance is None or generator_instance is None:
        if not INDEX_CACHE_PATH.exists():
            from scripts.ingest import run_ingestion
            run_ingestion()

        with open(INDEX_CACHE_PATH, "rb") as f:
            index = pickle.load(f)

        embedding_service = EmbeddingService()
        retriever_instance = Retriever(embedding_service, index)
        generator_instance = GenerationService()
    return retriever_instance, generator_instance


@app.post(
    "/ai/ask",
    response_model=AskResponse,
    responses={
        400: {"model": ErrorDetail, "description": "Invalid input / empty question"},
        500: {"model": ErrorDetail, "description": "Internal server / service initialization error"}
    },
    tags=["AI Core"]
)
def ask_question(req: AskRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question parameter cannot be empty."
        )

    retriever, generator = get_services()

    chunks = retriever.retrieve(
        query=req.question,
        top_k=req.topK or 5,
        project_id=req.projectId
    )

    result = generator.generate(req.question, chunks)

    sources_clean = []
    for s in result.get("sources", []):
        sources_clean.append(SourceCitation(
            documentId=s.get("documentId", "DOC_UNKNOWN"),
            documentName=s.get("documentName", s.get("document", "Unknown Document")),
            page=s.get("page", 1),
            projectId=s.get("projectId")
        ))

    return AskResponse(
        success=True,
        question=req.question,
        answer=result.get("answer", ""),
        sources=sources_clean,
        formattedSources=result.get("formattedSources", ""),
        grounded=result.get("grounded", False)
    )


if __name__ == "__main__":
    uvicorn.run("scripts.serve:app", host="127.0.0.1", port=8000, reload=True)
