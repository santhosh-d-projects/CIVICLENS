from typing import List, Dict, Any, Optional
from src.generation.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from src.citations.builder import CitationBuilder
from src.config import ANTHROPIC_API_KEY, LLM_MODEL

class GenerationService:
    """LLM Generation service enforcing grounding, persona, and anti-hallucination rules."""

    def __init__(self, api_key: str = ANTHROPIC_API_KEY, model: str = LLM_MODEL):
        self.api_key = api_key
        self.model = model
        self.client = None

    def _get_client(self):
        if self.client is None and self.api_key:
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except Exception:
                self.client = None

    def generate(self, question: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate grounded answer from user question and retrieved chunks.
        Applies anti-hallucination check if context is empty.
        """
        # Anti-hallucination guard: If no chunks retrieved, reject safely
        if not retrieved_chunks:
            return {
                "answer": "I couldn't find sufficient information in the available CivicLens sources.",
                "sources": [],
                "formattedSources": "No sources available.",
                "grounded": False
            }

        # Build citations from retrieved chunks
        sources, formatted_sources = CitationBuilder.build_citations(retrieved_chunks)

        # Build context string
        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks):
            doc = chunk.get("document", "Unknown Document")
            page = chunk.get("page", 1)
            text = chunk.get("text", "")
            context_blocks.append(f"[{idx+1}] Document: {doc} | Page: {page}\nText: {text}")

        context_str = "\n\n".join(context_blocks)
        user_prompt = USER_PROMPT_TEMPLATE.format(context=context_str, question=question)

        self._get_client()

        if self.client:
            try:
                message = self.client.messages.create(
                    model=self.model,
                    max_tokens=1000,
                    system=SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_prompt}]
                )
                answer_text = message.content[0].text.strip()
                return {
                    "answer": answer_text,
                    "sources": sources,
                    "formattedSources": formatted_sources,
                    "grounded": True
                }
            except Exception as e:
                # Fallback on LLM API failure
                return self._rule_based_synthesis(question, retrieved_chunks, sources, formatted_sources, error_msg=str(e))
        else:
            return self._rule_based_synthesis(question, retrieved_chunks, sources, formatted_sources)

    def _rule_based_synthesis(
        self,
        question: str,
        chunks: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
        formatted_sources: str,
        error_msg: Optional[str] = None
    ) -> Dict[str, Any]:
        """Rule-based synthesis when LLM API key is not present or API call fails."""
        # Simple extraction fallback from context for testing/offline use
        texts = [c['text'] for c in chunks]
        combined = " ".join(texts)

        # Check for conflict in chunks (e.g., progress numbers)
        answer_parts = ["Based on the available CivicLens records:"]
        for c in chunks[:3]:
            answer_parts.append(f"• According to {c['document']} (Page {c['page']}): {c['text']}")

        answer = "\n".join(answer_parts) + "\n\nSources:\n" + formatted_sources
        return {
            "answer": answer,
            "sources": sources,
            "formattedSources": formatted_sources,
            "grounded": True,
            "note": "Generated via rule-based offline synthesizer" if not error_msg else f"Fallback due to: {error_msg}"
        }
