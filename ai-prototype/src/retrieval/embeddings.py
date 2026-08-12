from typing import List, Dict, Any
import numpy as np
from src.config import EMBEDDING_MODEL

class EmbeddingService:
    """Abstracted embedding service supporting sentence-transformers with fallback."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model_name = model_name
        self.model = None

    def _load_model(self):
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
            except Exception as e:
                # Fallback to deterministic pseudo-embeddings for testing without heavy model download if needed
                self.model = "MOCK"

    def embed(self, text: str) -> np.ndarray:
        """Embed a single text string into a float32 vector."""
        self._load_model()
        if self.model != "MOCK":
            vec = self.model.encode(text, convert_to_numpy=True)
            return vec.astype(np.float32)
        else:
            # Deterministic pseudo embedding based on text hash for offline/mock testing
            rng = np.random.RandomState(abs(hash(text)) % (2**32))
            vec = rng.randn(384).astype(np.float32)
            norm = np.linalg.norm(vec)
            return vec / (norm + 1e-10)

    def embed_documents(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Embed a list of chunk dicts, attaching 'embedding' key to each chunk."""
        if not chunks:
            return []

        texts = [c["text"] for c in chunks]
        self._load_model()

        if self.model != "MOCK":
            vecs = self.model.encode(texts, convert_to_numpy=True)
            for idx, chunk in enumerate(chunks):
                chunk["embedding"] = vecs[idx].astype(np.float32)
        else:
            for chunk in chunks:
                chunk["embedding"] = self.embed(chunk["text"])

        return chunks
