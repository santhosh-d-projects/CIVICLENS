from src.retrieval.embeddings import EmbeddingService
from src.retrieval.index import VectorIndex
from src.retrieval.retriever import Retriever
from src.generation.generator import GenerationService

def test_unsupported_question_rejection():
    embedding_service = EmbeddingService()
    index = VectorIndex()

    # Index civic document
    chunks = [{
        "chunkId": "c1",
        "documentId": "DOC1",
        "projectId": "P001",
        "documentName": "Ward 12 Report",
        "pageNumber": 1,
        "text": "Ward 12 road project budget is 45 Crore."
    }]
    index.add(embedding_service.embed_documents(chunks))

    retriever = Retriever(embedding_service, index)
    generator = GenerationService()

    # Unrelated question should return low similarity score or no match under high threshold
    retrieved = retriever.retrieve("What is the population of Tokyo?", relevance_threshold=0.99)
    res = generator.generate("What is the population of Tokyo?", retrieved)

    assert res["grounded"] is False
    assert "couldn't find sufficient information" in res["answer"]
