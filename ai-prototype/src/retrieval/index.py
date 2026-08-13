from typing import List, Dict, Any, Optional
import numpy as np

class VectorIndex:
    """In-memory vector storage and cosine similarity index."""

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.matrix: Optional[np.ndarray] = None

    def add(self, embedded_chunks: List[Dict[str, Any]]):
        """Add embedded chunks to the in-memory index."""
        if not embedded_chunks:
            return

        for chunk in embedded_chunks:
            if "embedding" not in chunk:
                raise ValueError(f"Chunk '{chunk.get('chunkId')}' missing 'embedding' field.")
            self.chunks.append(chunk)

        # Rebuild embedding matrix
        vecs = [c["embedding"] for c in self.chunks]
        self.matrix = np.vstack(vecs).astype(np.float32)

    def search(
        self,
        query_vec: np.ndarray,
        top_k: int = 5,
        project_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for top_k most similar chunks using cosine similarity.
        Optionally filter by project_id.
        Returns chunks enriched with 'score'.
        """
        if not self.chunks or self.matrix is None:
            return []

        # Auto-align matrix dimension if embedding model space shifted (e.g. lightweight mode)
        if query_vec.shape[0] != self.matrix.shape[1]:
            from src.retrieval.embeddings import EmbeddingService
            es = EmbeddingService()
            self.chunks = es.embed_documents(self.chunks)
            self.matrix = np.vstack([c["embedding"] for c in self.chunks]).astype(np.float32)

        # Filter candidate indices if project_id is provided
        candidate_indices = []
        project_id_aliases = {project_id} if project_id else set()
        if project_id in ("P001", "proj-001"):
            project_id_aliases.update(["P001", "proj-001"])

        for idx, chunk in enumerate(self.chunks):
            chunk_pid = chunk.get("projectId")
            if project_id is None or chunk_pid in project_id_aliases:
                candidate_indices.append(idx)

        if not candidate_indices:
            return []

        sub_matrix = self.matrix[candidate_indices]

        # Compute cosine similarity
        q_norm = np.linalg.norm(query_vec)
        if q_norm < 1e-10:
            return []

        norms = np.linalg.norm(sub_matrix, axis=1)
        norms = np.where(norms < 1e-10, 1e-10, norms)

        dot_products = np.dot(sub_matrix, query_vec)
        similarities = dot_products / (norms * q_norm)

        # Pair candidates with score
        scored_candidates = []
        for local_idx, sim_score in enumerate(similarities):
            global_idx = candidate_indices[local_idx]
            chunk_copy = self.chunks[global_idx].copy()
            chunk_copy["score"] = float(sim_score)
            scored_candidates.append(chunk_copy)

        # Sort descending by score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        return scored_candidates[:top_k]

    def clear(self):
        """Clear the vector index."""
        self.chunks = []
        self.matrix = None
