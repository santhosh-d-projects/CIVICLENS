from src.retrieval.embeddings import EmbeddingService
from src.retrieval.index import VectorIndex
from src.retrieval.retriever import Retriever

def test_retriever_ranking_and_filtering():
    embedding_service = EmbeddingService()
    index = VectorIndex()

    chunks = [
        {
            "chunkId": "c1",
            "documentId": "DOC1",
            "projectId": "P001",
            "documentName": "Budget Report",
            "pageNumber": 2,
            "text": "Total sanctioned project budget is 45 Crore."
        },
        {
            "chunkId": "c2",
            "documentId": "DOC2",
            "projectId": "P002",
            "documentName": "Parks Report",
            "pageNumber": 5,
            "text": "Tree planting in Park Zone 4."
        }
    ]

    embedded = embedding_service.embed_documents(chunks)
    index.add(embedded)

    retriever = Retriever(embedding_service, index)

    # Search with project filter P001
    results = retriever.retrieve("What is the budget?", top_k=5, project_id="P001", relevance_threshold=0.0)
    assert len(results) == 1
    assert results[0]["projectId"] == "P001"
    assert results[0]["document"] == "Budget Report"
    assert results[0]["page"] == 2
