import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import DOCUMENTS_DIR

def create_demo_pdf(filename: str, title: str, pages_content: list[tuple[str, str]]):
    """
    Create a PDF with PyMuPDF (fitz).
    pages_content is a list of (section_title, text) tuples per page.
    """
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = DOCUMENTS_DIR / filename

    try:
        import fitz  # PyMuPDF
        doc = fitz.open()

        for page_num, (section_title, text) in enumerate(pages_content, 1):
            page = doc.new_page(width=595, height=842)  # A4 size

            # Watermark / Header
            page.insert_text((50, 30), "CIVICLENS DEMONSTRATION DATA -- NOT A REAL GOVERNMENT DOCUMENT", fontsize=8, color=(0.6, 0.6, 0.6))
            page.insert_text((50, 45), f"Document: {title} | Page {page_num} of {len(pages_content)}", fontsize=8, color=(0.4, 0.4, 0.4))

            # Page Title & Section
            page.insert_text((50, 80), title, fontsize=16, color=(0, 0.2, 0.6))
            page.insert_text((50, 110), section_title, fontsize=13, color=(0.2, 0.2, 0.2))

            # Body Text (split long lines for page)
            y_pos = 140
            lines = text.split("\n")
            for line in lines:
                words = line.split(" ")
                current_line = ""
                for word in words:
                    if len(current_line + " " + word) > 75:
                        page.insert_text((50, y_pos), current_line, fontsize=10, color=(0.1, 0.1, 0.1))
                        y_pos += 16
                        current_line = word
                    else:
                        current_line = (current_line + " " + word).strip()
                if current_line:
                    page.insert_text((50, y_pos), current_line, fontsize=10, color=(0.1, 0.1, 0.1))
                    y_pos += 18

            # Footer
            page.insert_text((50, 810), f"CivicLens Verification Engine - Project ID: proj-001 (P001) - Ward 12 - Page {page_num}", fontsize=8, color=(0.5, 0.5, 0.5))

        doc.save(str(pdf_path))
        doc.close()
        print(f"[OK] Created demo document: {pdf_path.name} ({len(pages_content)} pages)")

    except ImportError:
        print("[!] PyMuPDF not found. Please install pymupdf to generate demo PDFs.")

def generate_all_demo_documents():
    print("Generating CivicLens Demo Document Corpus (Aligned with Canonical Seed Data)...")

    # Document 1: Project Report (5 pages) - Aligned with seed_data.py
    create_demo_pdf(
        "ward12_project_report.pdf",
        "Ward 12 Road Development Project Report",
        [
            ("1. Executive Summary & Administrative Overview",
             "Project Name: Ward 12 Road Development Project (ID: proj-001 / P001).\n"
             "Department: BBMP Road Infrastructure.\n"
             "Ward: Ward 12, Bengaluru.\n"
             "Project Executive Officer: Dr. Ramesh, BBMP Chief Engineer.\n"
             "The project encompasses the widening, asphalt resurfacing, and stormwater drainage installation along 3.2 km stretch in Ward 12."),

            ("2. Project Scope & Specifications",
             "Scope of Work includes:\n"
             "- Resurfacing of 3.2 kilometers of double-lane asphalt road.\n"
             "- Construction of reinforced concrete side drains.\n"
             "- Installation of LED streetlights and pedestrian footpaths.\n"
             "Total Sanctioned Project Budget: Rs 50.0 Lakhs (Fifty Lakh Rupees / Rs 50,000,000).\n"
             "Sanction Authority: BBMP Municipal Budget 2025-26 -- Head 440-Roads."),

            ("3. Contractor Assignment & Procurement Details",
             "Contractor Assigned: ABC Constructions.\n"
             "Representative: Arun Bhat, Managing Representative.\n"
             "Contract Registration ID: KA-MC-CON-2022-1155.\n"
             "Tender Award Date: December 20, 2025.\n"
             "Work Order Executed Date: January 5, 2026."),

            ("4. Target Timeline & Completion Schedule",
             "Official Construction Start Date: January 10, 2026.\n"
             "Original Expected Completion Date: June 30, 2026.\n"
             "Phase 1 (Excavation & Sub-grade): Target February 2026.\n"
             "Phase 2 (Drainage & Curb Ducting): Target April 2026.\n"
             "Phase 3 (Asphalt Resurfacing & Markings): Target June 30, 2026."),

            ("5. Current Official Project Status",
             "As of the latest official government audit, overall physical progress stands at 70% complete.\n"
             "Key Completed Work: Site grading, excavation, side drains, and sub-base leveling.\n"
             "Pending Work: Final asphalt top layer and streetlight electrical ducting.\n"
             "Government Official Status: ONGOING (Under active BBMP monitoring).")
        ]
    )

    # Document 2: Budget Report (4 pages) - Aligned with seed_data.py
    create_demo_pdf(
        "ward12_budget_report.pdf",
        "Ward 12 Financial Audit & Budget Report",
        [
            ("1. Financial Allocation Summary",
             "Ward 12 Road Development Financial Breakdown (Project proj-001 / P001).\n"
             "Total Sanctioned Budget: Rs 50.0 Lakhs (Rs 5,000,000).\n"
             "Funds Released by Municipal Treasury: Rs 50.0 Lakhs.\n"
             "Reported Official Expenditure to Date: Rs 35.0 Lakhs.\n"
             "Remaining Allocation: Rs 15.0 Lakhs."),

            ("2. Headwise Expenditure Allocation",
             "Head 1: Civil Material & Asphalt: Allocated Rs 25.0 Lakhs, Spent Rs 18.0 Lakhs.\n"
             "Head 2: Drainage & Concrete Infrastructure: Allocated Rs 15.0 Lakhs, Spent Rs 10.0 Lakhs.\n"
             "Head 3: Electrical & LED Streetlights: Allocated Rs 6.0 Lakhs, Spent Rs 4.0 Lakhs.\n"
             "Head 4: Contingency & Supervision: Allocated Rs 4.0 Lakhs, Spent Rs 3.0 Lakhs."),

            ("3. Payment Release Tranches",
             "Tranche 1 (Advance Mobilization): Rs 15.0 Lakhs released Jan 2026.\n"
             "Tranche 2 (Sub-base Completion): Rs 20.0 Lakhs released Mar 2026.\n"
             "Tranche 3 (Drainage & Ducting): Rs 15.0 Lakhs released May 2026."),

            ("4. Financial Audit Notes",
             "Municipal Financial Registry verified all released tranches under BBMP Head 440-Roads.\n"
             "Financial Controller Signature: BBMP Accounts Audit Section.")
        ]
    )

    # Document 3: Tender Report (3 pages) - Aligned with seed_data.py
    create_demo_pdf(
        "ward12_tender_report.pdf",
        "Ward 12 Tender & Bidding Evaluation Report",
        [
            ("1. Procurement Notice & Bidding Overview",
             "Tender Notice # BBMP-ROAD-2025-W12-001 for Ward 12 Road Widening.\n"
             "Published Date: November 15, 2025.\n"
             "Total Qualified Bidders Participated: 3 Construction Companies.\n"
             "Estimated Tender Value: Rs 50.0 Lakhs."),

            ("2. Comparative Bid Evaluation",
             "Bidder 1: ABC Constructions -- Bid Amount: Rs 49.5 Lakhs (L1 - Lowest Bidder).\n"
             "Bidder 2: Apex Urban Projects India -- Bid Amount: Rs 52.0 Lakhs (L2).\n"
             "Bidder 3: Rajesh Infra & Construction Pvt Ltd -- Bid Amount: Rs 54.0 Lakhs (L3)."),

            ("3. Final Award Recommendation",
             "The Tender Evaluation Committee unanimously recommended awarding contract to ABC Constructions (Registration ID: KA-MC-CON-2022-1155) at quoted price of Rs 49.5 Lakhs.\n"
             "Contract includes mandatory defect liability period and penalty clause for unexcused delays.")
        ]
    )

    # Document 4: Progress Report (4 pages) - Aligned with seed_data.py
    create_demo_pdf(
        "ward12_progress_report.pdf",
        "Ward 12 Monthly Progress Update & Field Inspection Report",
        [
            ("1. Executive Progress Summary",
             "Reporting Period: August 2026.\n"
             "Government Project Record Official Progress: 70% physical completion.\n"
             "Contractor Submitted Progress Report: 75% physical completion.\n"
             "Note on Discrepancy: Contractor ABC Constructions submitted pending update claiming 75% for secondary grading and curb stone installation currently under review by Dr. Ramesh."),

            ("2. Detailed Work Milestone Status",
             "Milestone 1 (Excavation & Grading): 100% Complete (Approved).\n"
             "Milestone 2 (Stormwater Side Drains): 85% Complete.\n"
             "Milestone 3 (Curb Stone & Utility Ducting): 75% Complete (Submitted, Pending Review).\n"
             "Milestone 4 (Final Asphalt Layer & Streetlights): 20% Pending."),

            ("3. Delay Analysis & Obstacles Encountered",
             "The project encountered minor schedule setbacks due to material transport delays:\n"
             "Factor 1: Shortage of raw material transport vehicles causing minor curb casting setbacks.\n"
             "Factor 2: Utility line alignment verification along 400-meter stretch."),

            ("4. Corrective Action Plan & Inspection Notes",
             "Contractor ABC Constructions deployed additional equipment to complete asphalt top layer.\n"
             "Target Completion Date: June 30, 2026.\n"
             "Field Inspector: Dr. Ramesh, BBMP Chief Engineer.")
        ]
    )

    print("[OK] All demo document PDFs regenerated successfully in documents/demo/")

if __name__ == "__main__":
    generate_all_demo_documents()
