import re
from typing import List, Dict, Any
from src.config import CHUNK_SIZE, CHUNK_OVERLAP
from src.utils.helpers import generate_id, sanitize_metadata

class DocumentChunker:
    """Chunks page text into overlapping passages with rich page-level metadata."""

    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def _split_text_into_chunks(self, text: str) -> List[str]:
        """Split text into chunks aiming for sentence boundaries."""
        if not text:
            return []

        if len(text) <= self.chunk_size:
            return [text]

        # Sentence pattern for clean sentence boundary splitting
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_len = len(sentence)
            if current_length + sentence_len > self.chunk_size and current_chunk:
                chunk_str = " ".join(current_chunk)
                chunks.append(chunk_str)

                # Maintain overlap by keeping tail sentences
                overlap_len = 0
                overlap_chunk = []
                for prev_sent in reversed(current_chunk):
                    if overlap_len + len(prev_sent) <= self.chunk_overlap:
                        overlap_chunk.insert(0, prev_sent)
                        overlap_len += len(prev_sent)
                    else:
                        break

                current_chunk = overlap_chunk
                current_length = sum(len(s) for s in current_chunk)

            current_chunk.append(sentence)
            current_length += sentence_len

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def chunk_document(self, pages: List[Dict[str, Any]], doc_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk a document given its extracted pages and document-level metadata.
        Returns a list of structured chunk dicts with page numbers preserved.
        """
        meta = sanitize_metadata(doc_metadata)
        chunks = []

        for page_data in pages:
            page_num = page_data.get("page", 1)
            page_text = page_data.get("text", "")
            if not page_text:
                continue

            text_chunks = self._split_text_into_chunks(page_text)
            for idx, chunk_text in enumerate(text_chunks):
                chunk_id = generate_id(f"chunk_{meta['documentId']}_p{page_num}")
                chunk_record = {
                    "chunkId": chunk_id,
                    "documentId": meta["documentId"],
                    "projectId": meta["projectId"],
                    "text": chunk_text,
                    "pageNumber": page_num,
                    "documentName": meta["documentName"],
                    "metadata": {
                        **meta,
                        "pageNumber": page_num,
                        "chunkIndex": idx
                    }
                }
                chunks.append(chunk_record)

        return chunks
