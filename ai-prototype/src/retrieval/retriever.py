from typing import List, Dict, Any, Optional
from src.retrieval.embeddings import EmbeddingService
from src.retrieval.index import VectorIndex
from src.config import TOP_K, RELEVANCE_THRESHOLD

class Retriever:
    """High-level retriever combining embedding and similarity search with source tracking."""

    def __init__(self, embedding_service: EmbeddingService, index: VectorIndex):
        self.embedding_service = embedding_service
        self.index = index

    def retrieve(
        self,
        query: str,
        top_k: int = TOP_K,
        project_id: Optional[str] = None,
        relevance_threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant chunks for a user query.
        Returns structured items with page, score, document, and text.
        Filters out matches below relevance_threshold.
        """
        if not query or not query.strip():
            return []

        self.embedding_service._load_model()
        if relevance_threshold is None:
            if getattr(self.embedding_service, "model", None) in ("MOCK", "LIGHTWEIGHT"):
                relevance_threshold = 0.12
            else:
                relevance_threshold = RELEVANCE_THRESHOLD

        query_vec = self.embedding_service.embed(query)
        raw_results = self.index.search(query_vec, top_k=top_k, project_id=project_id)

        structured_results = []
        for r in raw_results:
            score = r.get("score", 0.0)
            if score < relevance_threshold:
                continue

            structured_results.append({
                "chunkId": r.get("chunkId"),
                "documentId": r.get("documentId"),
                "projectId": r.get("projectId"),
                "document": r.get("documentName", "Unknown Document"),
                "page": r.get("pageNumber", 1),
                "score": round(score, 4),
                "text": r.get("text", "")
            })

        return structured_results
