from typing import List, Dict, Any, Tuple

class CitationBuilder:
    """Constructs structured and formatted citations from retrieved chunk metadata."""

    @staticmethod
    def build_citations(retrieved_chunks: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], str]:
        """
        Deduplicate sources from chunks and build structured list + formatted display text.
        Returns:
            (structured_sources, formatted_text)
        """
        seen = set()
        structured_sources = []
        formatted_lines = []

        for chunk in retrieved_chunks:
            doc_name = chunk.get("document", "Unknown Document")
            page_num = chunk.get("page", 1)
            doc_id = chunk.get("documentId", "DOC_UNKNOWN")

            key = (doc_name, page_num)
            if key not in seen:
                seen.add(key)
                source_obj = {
                    "documentId": doc_id,
                    "documentName": doc_name,
                    "document": doc_name,
                    "page": page_num,
                    "projectId": chunk.get("projectId")
                }
                structured_sources.append(source_obj)
                formatted_lines.append(f"{len(formatted_lines) + 1}. {doc_name}, Page {page_num}")

        formatted_text = "\n".join(formatted_lines) if formatted_lines else "No verified sources retrieved."
        return structured_sources, formatted_text
