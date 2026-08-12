from src.ingestion.chunker import DocumentChunker

def test_chunker_basic():
    chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
    pages = [
        {"page": 1, "text": "This is page one text. It talks about road construction and budget allocation in Ward 12."},
        {"page": 2, "text": "This is page two text. The contractor finished 70 percent of physical work."}
    ]
    meta = {
        "documentId": "DOC001",
        "projectId": "P001",
        "documentName": "Test Project Report"
    }

    chunks = chunker.chunk_document(pages, meta)
    assert len(chunks) >= 2
    for chunk in chunks:
        assert "chunkId" in chunk
        assert "documentId" in chunk
        assert "projectId" in chunk
        assert "text" in chunk
        assert "pageNumber" in chunk
        assert "documentName" in chunk
        assert chunk["projectId"] == "P001"
        assert chunk["pageNumber"] in (1, 2)
