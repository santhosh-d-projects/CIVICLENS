import pytest
from pathlib import Path
from src.ingestion.extractor import PDFExtractor

def test_pdf_extractor_non_existent():
    with pytest.raises(FileNotFoundError):
        PDFExtractor.extract_pages("non_existent_file.pdf")

def test_pdf_extractor_invalid_extension(tmp_path):
    invalid_file = tmp_path / "test.txt"
    invalid_file.write_text("hello world")
    with pytest.raises(ValueError):
        PDFExtractor.extract_pages(invalid_file)

def test_pdf_extractor_page_structure():
    demo_pdf = Path(__file__).resolve().parent.parent / "documents" / "demo" / "ward12_project_report.pdf"
    if not demo_pdf.exists():
        pytest.skip("Demo PDF not generated yet.")

    pages = PDFExtractor.extract_pages(demo_pdf)
    assert len(pages) > 0
    assert "page" in pages[0]
    assert "text" in pages[0]
    assert pages[0]["page"] == 1
    assert len(pages[0]["text"]) > 0
