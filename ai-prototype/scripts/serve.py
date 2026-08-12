import sys
import pickle
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import INDEX_CACHE_PATH
from src.retrieval.embeddings import EmbeddingService
from src.retrieval.retriever import Retriever
from src.generation.generator import GenerationService

app = FastAPI(
    title="CivicLens Source-Backed AI Prototype API",
    description="Isolated RAG Engine API providing grounded answers with page-level citations.",
    version="0.1.0"
)

# Global services initialized on startup
retriever_instance: Optional[Retriever] = None
generator_instance: Optional[GenerationService] = None

class AskRequest(BaseModel):
    question: str
    projectId: Optional[str] = None
    topK: Optional[int] = 5

class AskResponse(BaseModel):
    success: bool
    question: str
    answer: str
    sources: list
    formattedSources: str
    grounded: bool

@app.on_event("startup")
def startup_event():
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

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "CivicLens AI/RAG Prototype Engine",
        "endpoints": ["/ai/ask"]
    }

@app.post("/ai/ask", response_model=AskResponse)
def ask_question(req: AskRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Question parameter cannot be empty.")

    if not retriever_instance or not generator_instance:
        raise HTTPException(status_code=500, detail="AI Service is initializing.")

    chunks = retriever_instance.retrieve(
        query=req.question,
        top_k=req.topK or 5,
        project_id=req.projectId
    )

    result = generator_instance.generate(req.question, chunks)

    return AskResponse(
        success=True,
        question=req.question,
        answer=result.get("answer", ""),
        sources=result.get("sources", []),
        formattedSources=result.get("formattedSources", ""),
        grounded=result.get("grounded", False)
    )

if __name__ == "__main__":
    uvicorn.run("scripts.serve:app", host="127.0.0.1", port=8000, reload=True)
