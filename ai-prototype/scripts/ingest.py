import sys
import pickle
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import DOCUMENTS_DIR, INDEX_CACHE_PATH
from src.ingestion.extractor import PDFExtractor
from src.ingestion.chunker import DocumentChunker
from src.retrieval.embeddings import EmbeddingService
from src.retrieval.index import VectorIndex

# Metadata registry for the demo documents
DOCUMENT_METADATA_REGISTRY = {
    "ward12_project_report.pdf": {
        "documentId": "DOC_W12_PROJ_REP",
        "projectId": "P001",
        "documentName": "Ward 12 Project Report",
        "documentType": "Official Project Report",
        "sourceOrganization": "Municipal Works & Transport Department",
        "publicationDate": "2025-02-01",
        "fileName": "ward12_project_report.pdf"
    },
    "ward12_budget_report.pdf": {
        "documentId": "DOC_W12_BUDGET_REP",
        "projectId": "P001",
        "documentName": "Ward 12 Budget Report",
        "documentType": "Financial Audit Report",
        "sourceOrganization": "Municipal Treasury & Financial Registry",
        "publicationDate": "2025-12-15",
        "fileName": "ward12_budget_report.pdf"
    },
    "ward12_tender_report.pdf": {
        "documentId": "DOC_W12_TENDER_REP",
        "projectId": "P001",
        "documentName": "Ward 12 Tender Evaluation Report",
        "documentType": "Procurement & Bidding Report",
        "sourceOrganization": "Tender Evaluation Committee",
        "publicationDate": "2024-12-01",
        "fileName": "ward12_tender_report.pdf"
    },
    "ward12_progress_report.pdf": {
        "documentId": "DOC_W12_PROGRESS_REP",
        "projectId": "P001",
        "documentName": "Ward 12 Progress Report",
        "documentType": "Field Inspection & Progress Update",
        "sourceOrganization": "Divisional Inspection Officer",
        "publicationDate": "2026-01-20",
        "fileName": "ward12_progress_report.pdf"
    }
}

def run_ingestion():
    print("=" * 60)
    print("CivicLens Source-Backed AI - Document Ingestion Pipeline")
    print("=" * 60)

    if not DOCUMENTS_DIR.exists():
        print(f"[!] Documents directory '{DOCUMENTS_DIR}' does not exist. Run scripts/generate_demo_docs.py first.")
        return

    pdf_files = list(DOCUMENTS_DIR.glob("*.pdf"))
    if not pdf_files:
        print("[!] No PDF documents found in documents/demo/. Run scripts/generate_demo_docs.py first.")
        return

    chunker = DocumentChunker()
    embedding_service = EmbeddingService()
    vector_index = VectorIndex()

    all_chunks = []

    for pdf_path in pdf_files:
        meta = DOCUMENT_METADATA_REGISTRY.get(pdf_path.name, {
            "documentId": f"DOC_{pdf_path.stem.upper()}",
            "projectId": "P001",
            "documentName": pdf_path.stem.replace("_", " ").title(),
            "documentType": "Government Document",
            "sourceOrganization": "CivicLens Municipal Authority",
            "publicationDate": "2026-01-01",
            "fileName": pdf_path.name
        })

        print(f"Processing: {pdf_path.name}...")
        try:
            pages = PDFExtractor.extract_pages(pdf_path)
            chunks = chunker.chunk_document(pages, meta)
            print(f"  -> Extracted {len(pages)} pages -> Generated {len(chunks)} text chunks.")
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"  -> [!] Failed to extract {pdf_path.name}: {e}")

    if not all_chunks:
        print("[!] No chunks extracted. Aborting ingestion.")
        return

    print(f"\nEmbedding {len(all_chunks)} chunks using model '{embedding_service.model_name}'...")
    embedded_chunks = embedding_service.embed_documents(all_chunks)

    vector_index.add(embedded_chunks)
    print(f"[OK] Vector index populated with {len(vector_index.chunks)} chunks.")

    # Save index to cache file
    INDEX_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(INDEX_CACHE_PATH, "wb") as f:
        pickle.dump(vector_index, f)

    print(f"[OK] Successfully cached vector index to: {INDEX_CACHE_PATH}")
    print("Pipeline Complete! System is ready for retrieval & QA.")
    print("=" * 60)

if __name__ == "__main__":
    run_ingestion()
