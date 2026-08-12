from src.generation.generator import GenerationService

def test_generator_with_chunks():
    generator = GenerationService()
    chunks = [
        {
            "chunkId": "c1",
            "documentId": "DOC1",
            "projectId": "P001",
            "document": "Ward 12 Budget Report",
            "page": 2,
            "text": "Total sanctioned project budget is 45 Crore."
        }
    ]

    res = generator.generate("What is the budget?", chunks)
    assert res["grounded"] is True
    assert len(res["sources"]) == 1
    assert res["sources"][0]["document"] == "Ward 12 Budget Report"
    assert res["sources"][0]["page"] == 2
    assert "Ward 12 Budget Report, Page 2" in res["formattedSources"]

def test_generator_empty_chunks_anti_hallucination():
    generator = GenerationService()
    res = generator.generate("What is the population of Tokyo?", [])
    assert res["grounded"] is False
    assert res["answer"] == "I couldn't find sufficient information in the available CivicLens sources."
    assert len(res["sources"]) == 0
