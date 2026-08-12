from src.citations.builder import CitationBuilder

def test_citation_builder_deduplication():
    chunks = [
        {"document": "Ward 12 Project Report", "page": 14, "documentId": "DOC1", "projectId": "P001"},
        {"document": "Ward 12 Project Report", "page": 14, "documentId": "DOC1", "projectId": "P001"},
        {"document": "Ward 12 Progress Report", "page": 3, "documentId": "DOC4", "projectId": "P001"}
    ]

    sources, formatted = CitationBuilder.build_citations(chunks)

    # Should deduplicate page 14 of Ward 12 Project Report
    assert len(sources) == 2
    assert sources[0]["document"] == "Ward 12 Project Report"
    assert sources[0]["page"] == 14
    assert sources[1]["document"] == "Ward 12 Progress Report"
    assert sources[1]["page"] == 3

    assert "1. Ward 12 Project Report, Page 14" in formatted
    assert "2. Ward 12 Progress Report, Page 3" in formatted
