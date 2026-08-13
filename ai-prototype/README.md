# CivicLens Source-Backed AI / RAG Prototype

An isolated, source-backed Retrieval-Augmented Generation (RAG) prototype built for CivicLens. 
This engine processes official government documents, performs page-level text extraction and sentence-aware chunking, computes dense vector embeddings, performs cosine similarity retrieval with project filtering, and generates grounded responses with page-level citations using Anthropic Claude.

> [!NOTE]
> **Canonical Data Alignment**: The demonstration corpus in `documents/demo/` is fully aligned with the canonical CivicLens project dataset (`backend/seed_data.py`).
> - **Hero Project ID**: `proj-001` (alias `P001`)
> - **Project Name**: Ward 12 Road Development
> - **Canonical Budget**: **₹50.0 Lakhs** (Rs 5,000,000 / Head 440-Roads)
> - **Contractor**: ABC Constructions (Rep: Arun Bhat)
> - **Department**: BBMP Road Infrastructure
> - **Dates**: January 10, 2026 – June 30, 2026

---

## 1. System Architecture

```text
       Government Documents (PDF)
                   │
                   ▼
        PyMuPDF Text Extraction (Page-Preserving)
                   │
                   ▼
    Document Chunker (Sentence-Aware + Overlap)
                   │
                   ▼
      Embedding Service (sentence-transformers / MiniLM)
                   │
                   ▼
           In-Memory Vector Index
                   │
  User Query ──────┴──────► Cosine Similarity Retriever (Top-K + Project Filtering)
                                     │
                                     ▼
                            Relevant Source Chunks
                                     │
                                     ▼
                        LLM Generation (Anthropic Claude)
                                     │
                                     ▼
                      Grounded Answer + Page-Level Citations
```

---

## 2. Directory Structure

```text
ai-prototype/
├── documents/
│   └── demo/                     # Demo government document PDFs (Aligned with seed_data.py)
├── src/
│   ├── __init__.py
│   ├── config.py                 # Configuration & environment variables
│   ├── ingestion/
│   │   ├── extractor.py          # PyMuPDF text extraction preserving page numbers
│   │   └── chunker.py            # Sentence-aware chunking with overlap & metadata
│   ├── retrieval/
│   │   ├── embeddings.py         # Abstracted EmbeddingService (sentence-transformers)
│   │   ├── index.py              # In-memory numpy vector storage & similarity calculation
│   │   └── retriever.py          # Retriever with project filtering & relevance threshold
│   ├── generation/
│   │   ├── generator.py          # LLM Generation service (Claude API)
│   │   └── prompts.py            # CivicLens AI persona & grounding system prompts
│   ├── citations/
│   │   └── builder.py            # Page-level citation builder & deduplicator
│   └── utils/
│       └── helpers.py            # Utility functions
├── scripts/
│   ├── generate_demo_docs.py     # Generates 4 multi-page demo government PDFs
│   ├── ingest.py                 # Document processing & embedding pipeline
│   ├── ask.py                    # Interactive CLI demo & benchmark test suite
│   └── serve.py                  # Standalone FastAPI service (POST /ai/ask)
├── tests/                        # Full automated test suite (Pytest)
├── requirements.txt
├── .env.example
└── README.md
```

---

## 3. Environment Setup & Installation

```bash
# Navigate to the prototype directory
cd ai-prototype

# Install Python dependencies
pip install -r requirements.txt

# Copy environment variables template
cp .env.example .env

# Configure your Anthropic API Key in .env (optional for offline testing)
# ANTHROPIC_API_KEY=your_key_here
```

---

## 4. Quickstart Usage

### Step 1: Generate Demo Documents
```bash
python scripts/generate_demo_docs.py
```
This generates 4 multi-page demonstration PDFs in `documents/demo/`:
- `ward12_project_report.pdf` (5 pages)
- `ward12_budget_report.pdf` (4 pages)
- `ward12_tender_report.pdf` (3 pages)
- `ward12_progress_report.pdf` (4 pages)

### Step 2: Run Document Ingestion
```bash
python scripts/ingest.py
```
Extracts text, preserves page numbers, chunks passages, computes embeddings, and saves `documents/index_cache.pkl`.

### Step 3: Launch Interactive CLI
```bash
python scripts/ask.py
```
- Type any question about Ward 12 Road Development.
- Type `test` to execute the 6 benchmark questions automatically.

### Step 4: Launch Standalone API (Optional)
```bash
python scripts/serve.py
```
Starts FastAPI server on `http://127.0.0.1:8000`. Test via HTTP request:
```bash
curl -X POST http://127.0.0.1:8000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the budget of Ward 12 Road Development?", "projectId": "proj-001"}'
```

---

## 5. Running Automated Tests

```bash
python -m pytest tests/ -v
```

Tests cover:
1. `test_extractor.py`: PDF extraction & page boundary preservation
2. `test_chunker.py`: Sentence-aware chunking & metadata integrity
3. `test_embeddings.py`: Embedding vector generation
4. `test_retriever.py`: Cosine similarity ranking & `projectId` filtering
5. `test_citations.py`: Citation formatting & deduplication
6. `test_generator.py`: Grounded prompt construction
7. `test_anti_hallucination.py`: Safe rejection of unsupported questions
8. `test_integration.py`: Full end-to-end RAG pipeline
9. `test_api.py`: FastAPI `/ai/ask` endpoint contract & error handling

---

## 6. Demonstration Questions & Benchmark Matrix

| # | Question | Expected AI Answer & Behavior | Citation Output |
|---|----------|--------------------------------|-----------------|
| 1 | What is the budget of the Ward 12 Road Development project? | Total sanctioned budget is **Rs 50.0 Lakhs** (Fifty Lakh Rupees / Rs 5,000,000). | Ward 12 Project Report, Page 2 / Budget Report, Page 1 |
| 2 | When was the project expected to be completed? | Original completion date is June 30, 2026. | Ward 12 Project Report, Page 4 |
| 3 | What was the latest reported progress? | Notes conflict neutrally: Govt official record states 70%, while contractor report claims 75%. | Ward 12 Progress Report, Page 1 & Project Report, Page 5 |
| 4 | Why was the project delayed? | Material transport delays for curb casting & utility line verification. | Ward 12 Progress Report, Page 3 |
| 5 | Who is the contractor? | ABC Constructions (Managing Rep: Arun Bhat). | Ward 12 Project Report, Page 3 / Tender Report, Page 3 |
| 6 | What is the population of Tokyo? | Rejection: "I couldn't find sufficient information in the available CivicLens sources." | No sources cited |

---

## 7. CivicLens Primary Backend Integration Instructions

When integrating this RAG engine into the main CivicLens Flask backend (`backend/`):

1. **Dependencies**: Add `pymupdf`, `sentence-transformers`, `numpy`, `anthropic` to `backend/requirements.txt`.
2. **Upgrade RAG Engine**: Replace keyword matching in `backend/rag_engine.py` with `ai-prototype/src/retrieval/retriever.py` and `ai-prototype/src/generation/generator.py`.
3. **Mount Route**: Update `backend/routes/ai.py` to route queries through `Retriever` and `GenerationService`.
4. **Project Scoping**: Pass `projectId` or `ward` filter dynamically to `retriever.retrieve(query, project_id=project_id)`.
