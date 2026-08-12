import numpy as np
from src.retrieval.embeddings import EmbeddingService

def test_embedding_single_text():
    service = EmbeddingService()
    vec = service.embed("Ward 12 Road Development Project budget is 45 Crore.")
    assert isinstance(vec, np.ndarray)
    assert vec.ndim == 1
    assert len(vec) > 0

def test_embedding_batch_chunks():
    service = EmbeddingService()
    chunks = [
        {"chunkId": "c1", "text": "Budget is 45 Crore."},
        {"chunkId": "c2", "text": "Contractor is Skyline Infrastructure."}
    ]
    embedded = service.embed_documents(chunks)
    assert len(embedded) == 2
    assert "embedding" in embedded[0]
    assert isinstance(embedded[0]["embedding"], np.ndarray)
