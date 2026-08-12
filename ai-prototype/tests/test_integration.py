from pathlib import Path
from src.ingestion.extractor import PDFExtractor
from src.ingestion.chunker import DocumentChunker
from src.retrieval.embeddings import EmbeddingService
from src.retrieval.index import VectorIndex
from src.retrieval.retriever import Retriever
from src.generation.generator import GenerationService

def test_e2e_pipeline():
    demo_pdf = Path(__file__).resolve().parent.parent / "documents" / "demo" / "ward12_project_report.pdf"
    if not demo_pdf.exists():
        # Generate demo pdf dynamically for test if not present
        from scripts.generate_demo_docs import generate_all_demo_documents
        generate_all_demo_documents()

    # 1. Extraction
    pages = PDFExtractor.extract_pages(demo_pdf)
    assert len(pages) == 5

    # 2. Chunking
    chunker = DocumentChunker()
    meta = {
        "documentId": "DOC_TEST",
        "projectId": "P001",
        "documentName": "Ward 12 Project Report"
    }
    chunks = chunker.chunk_document(pages, meta)
    assert len(chunks) > 0

    # 3. Embedding & Indexing
    embedding_service = EmbeddingService()
    embedded_chunks = embedding_service.embed_documents(chunks)

    index = VectorIndex()
    index.add(embedded_chunks)

    # 4. Retrieval
    retriever = Retriever(embedding_service, index)
    retrieved = retriever.retrieve("What is the budget of Ward 12 road project?", top_k=3, relevance_threshold=0.0)
    assert len(retrieved) > 0
    assert retrieved[0]["document"] == "Ward 12 Project Report"

    # 5. Generation
    generator = GenerationService()
    answer_res = generator.generate("What is the budget of Ward 12 road project?", retrieved)
    assert answer_res["grounded"] is True
    assert len(answer_res["sources"]) > 0
    assert answer_res["sources"][0]["page"] >= 1
