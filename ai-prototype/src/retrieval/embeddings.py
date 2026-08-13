import os
import re
import zlib
from typing import List, Dict, Any
import numpy as np
from src.config import EMBEDDING_MODEL

class EmbeddingService:
    """Abstracted embedding service supporting sentence-transformers with lightweight RAM-efficient fallback."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model_name = model_name
        self.model = None

    def _load_model(self):
        if self.model is None:
            # Force lightweight mode if LIGHTWEIGHT_AI is set or running in constrained environment
            if os.environ.get("LIGHTWEIGHT_AI", "").lower() in ("1", "true", "yes") or os.environ.get("RENDER"):
                self.model = "LIGHTWEIGHT"
                return

            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
            except Exception:
                self.model = "LIGHTWEIGHT"

    def _lightweight_embed(self, text: str, dim: int = 512) -> np.ndarray:
        """Lightweight zero-memory term & n-gram feature hashing vectorizer using deterministic CRC32."""
        stop_words = {
            "what", "is", "the", "a", "an", "of", "in", "on", "for", "this", "that", "to", "are",
            "and", "or", "by", "with", "it", "at", "from", "as", "be", "has", "have", "had", "was",
            "were", "will", "would", "which", "who", "whom", "where", "when", "why", "how"
        }
        raw_words = [w.lower() for w in re.findall(r'\w+', text or "")]
        content_words = [w for w in raw_words if w not in stop_words and len(w) > 1]
        words_to_use = content_words if content_words else raw_words
        vec = np.zeros(dim, dtype=np.float32)
        if not words_to_use:
            return vec

        for w in words_to_use:
            h = zlib.crc32(w.encode("utf-8")) % dim
            weight = 3.0 if len(w) > 3 else 1.5
            vec[h] += weight

        for i in range(len(content_words) - 1):
            bigram = f"{content_words[i]}_{content_words[i+1]}"
            h = zlib.crc32(bigram.encode("utf-8")) % dim
            vec[h] += 2.5

        norm = np.linalg.norm(vec)
        if norm > 1e-10:
            vec /= norm
        return vec

    def embed(self, text: str) -> np.ndarray:
        """Embed a single text string into a float32 vector."""
        self._load_model()
        if self.model not in ("MOCK", "LIGHTWEIGHT"):
            vec = self.model.encode(text, convert_to_numpy=True)
            return vec.astype(np.float32)
        else:
            return self._lightweight_embed(text)

    def embed_documents(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Embed a list of chunk dicts, attaching 'embedding' key to each chunk."""
        if not chunks:
            return []

        texts = [c["text"] for c in chunks]
        self._load_model()

        if self.model not in ("MOCK", "LIGHTWEIGHT"):
            vecs = self.model.encode(texts, convert_to_numpy=True)
            for idx, chunk in enumerate(chunks):
                chunk["embedding"] = vecs[idx].astype(np.float32)
        else:
            for chunk in chunks:
                chunk["embedding"] = self._lightweight_embed(chunk["text"])

        return chunks
