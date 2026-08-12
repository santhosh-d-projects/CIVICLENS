import fitz  # PyMuPDF
from typing import List, Dict, Any
from pathlib import Path

class PDFExtractor:
    """PDF Text Extractor preserving page boundaries for accurate citations."""

    @staticmethod
    def extract_pages(file_path: str | Path) -> List[Dict[str, Any]]:
        """
        Extract text from a PDF file preserving page numbers.
        Returns a list of dicts: [{"page": int, "text": str}]
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        if path.suffix.lower() != ".pdf":
            raise ValueError(f"Unsupported file format: {path.suffix}. Only .pdf allowed.")

        pages_data = []
        try:
            doc = fitz.open(str(path))
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text").strip()
                pages_data.append({
                    "page": page_num + 1,  # 1-indexed page number
                    "text": text
                })
            doc.close()
        except Exception as e:
            raise RuntimeError(f"Error extracting text from PDF '{path.name}': {str(e)}")

        return pages_data
