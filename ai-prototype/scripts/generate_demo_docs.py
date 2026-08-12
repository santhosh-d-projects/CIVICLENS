import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import DOCUMENTS_DIR

def create_demo_pdf(filename: str, title: str, pages_content: list[tuple[str, str]]):
    """
    Create a PDF with PyMuPDF (fitz) or fpdf2.
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
            page.insert_text((50, 30), "CIVICLENS DEMONSTRATION DATA — NOT A REAL GOVERNMENT DOCUMENT", fontsize=8, color=(0.6, 0.6, 0.6))
            page.insert_text((50, 45), f"Document: {title} | Page {page_num} of {len(pages_content)}", fontsize=8, color=(0.4, 0.4, 0.4))

            # Page Title & Section
            page.insert_text((50, 80), title, fontsize=16, color=(0, 0.2, 0.6))
            page.insert_text((50, 110), section_title, fontsize=13, color=(0.2, 0.2, 0.2))

            # Body Text (split long lines for page)
            y_pos = 140
            lines = text.split("\n")
            for line in lines:
                # Wrap text if long
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
            page.insert_text((50, 810), f"CivicLens Verification Engine • Project ID: P001 • Ward 12 • Page {page_num}", fontsize=8, color=(0.5, 0.5, 0.5))

        doc.save(str(pdf_path))
        doc.close()
        print(f"[OK] Created demo document: {pdf_path.name} ({len(pages_content)} pages)")

    except ImportError:
        print("[!] PyMuPDF not found. Please install pymupdf to generate demo PDFs.")

def generate_all_demo_documents():
    print("Generating CivicLens Demo Document Corpus...")

    # Document 1: Project Report (5 pages)
    create_demo_pdf(
        "ward12_project_report.pdf",
        "Ward 12 Road Development Project Report",
        [
            ("1. Executive Summary & Administrative Overview",
             "Project Name: Ward 12 Road Development Project (ID: P001).\n"
             "Department: Municipal Works & Transport Department.\n"
             "Ward: Ward 12, Central Civic Zone.\n"
             "Project Executive Officer: Ramesh Kumar, Chief Municipal Engineer.\n"
             "The project encompasses the widening, asphalt resurfacing, and stormwater drainage installation along Main Arterial Corridor in Ward 12."),

            ("2. Project Scope & Specifications",
             "Scope of Work includes:\n"
             "- Resurfacing of 4.2 kilometers of double-lane asphalt road.\n"
             "- Construction of reinforced concrete side drains (1.2m depth).\n"
             "- Installation of 48 LED streetlights and pedestrian crossings.\n"
             "Total Sanctioned Project Budget: Rs 45.0 Crore (Forty Five Crore Rupees).\n"
             "Sanction Authority: Municipal Executive Council Resolution #4092."),

            ("3. Contractor Assignment & Procurement Details",
             "Contractor Assigned: Skyline Infrastructure Pvt Ltd.\n"
             "Representative: Vikram Shah, Managing Director.\n"
             "Contract Registration ID: REG-2024-8891.\n"
             "Tender Award Date: January 15, 2025.\n"
             "Work Order Executed Date: February 1, 2025."),

            ("4. Target Timeline & Completion Schedule",
             "Official Construction Start Date: March 1, 2025.\n"
             "Original Expected Completion Date: June 30, 2026.\n"
             "Phase 1 (Earthworks & Sub-base): Target May 2025.\n"
             "Phase 2 (Drainage & Utility Ducting): Target October 2025.\n"
             "Phase 3 (Asphalt Paving & Final Polish): Target June 2026."),

            ("5. Current Official Project Status",
             "As of the latest official government audit, overall physical progress stands at 70% complete.\n"
             "Key Completed Work: Earthworks, side drains, and 2.8 km of sub-base paving.\n"
             "Pending Work: Final asphalt top layer (1.4 km) and LED streetlight cabling.\n"
             "Government Official Status: ONGOING (Under active monitoring).")
        ]
    )

    # Document 2: Budget Report (4 pages)
    create_demo_pdf(
        "ward12_budget_report.pdf",
        "Ward 12 Financial Audit & Budget Report",
        [
            ("1. Financial Allocation Summary",
             "Ward 12 Road Development Financial Breakdown (Project P001).\n"
             "Total Sanctioned Budget: Rs 45.0 Crore.\n"
             "Funds Released by Municipal Treasury: Rs 32.0 Crore.\n"
             "Reported Official Expenditure to Date: Rs 28.5 Crore.\n"
             "Remaining Unspent Allocation: Rs 16.5 Crore."),

            ("2. Headwise Expenditure Allocation",
             "Head 1: Civil Material & Asphalt: Allocated Rs 22.0 Crore, Spent Rs 15.2 Crore.\n"
             "Head 2: Drainage & Concrete Infrastructure: Allocated Rs 12.0 Crore, Spent Rs 8.1 Crore.\n"
             "Head 3: Electrical & LED Streetlights: Allocated Rs 6.0 Crore, Spent Rs 3.2 Crore.\n"
             "Head 4: Contingency & Supervision: Allocated Rs 5.0 Crore, Spent Rs 2.0 Crore."),

            ("3. Payment Release Tranches",
             "Tranche 1 (Advance Mobilization): Rs 4.5 Crore released Feb 2025.\n"
             "Tranche 2 (Sub-base Completion): Rs 12.5 Crore released Jun 2025.\n"
             "Tranche 3 (Drainage Completion): Rs 11.5 Crore released Nov 2025.\n"
             "Tranche 4 (Final Asphalt & Handover): Rs 3.5 Crore pending verification."),

            ("4. Financial Audit Notes",
             "Municipal Financial Registry verified all 3 released tranches.\n"
             "No unauthorized diversion of funds detected during Q4 2025 audit.\n"
             "Financial Controller Signature: A. K. Verma, Chief Accounts Officer.")
        ]
    )

    # Document 3: Tender Report (3 pages)
    create_demo_pdf(
        "ward12_tender_report.pdf",
        "Ward 12 Tender & Bidding Evaluation Report",
        [
            ("1. Procurement Notice & Bidding Overview",
             "Tender Notice # MWC-2024-W12-088 for Ward 12 Road Widening.\n"
             "Published Date: November 10, 2024.\n"
             "Total Qualified Bidders Participated: 4 Construction Companies.\n"
             "Estimated Tender Value: Rs 45.0 Crore."),

            ("2. Comparative Bid Evaluation",
             "Bidder 1: Skyline Infrastructure Pvt Ltd — Bid Amount: Rs 44.2 Crore (L1 - Lowest Bidder).\n"
             "Bidder 2: Apex Urban Engineering Ltd — Bid Amount: Rs 46.8 Crore (L2).\n"
             "Bidder 3: Bharat Roadways & Infra Corp — Bid Amount: Rs 48.5 Crore (L3).\n"
             "Bidder 4: Crestline Builders LLP — Disqualified (Technical Non-compliance)."),

            ("3. Final Award Recommendation",
             "The Tender Evaluation Committee unanimously recommended awarding the contract to Skyline Infrastructure Pvt Ltd at their quoted price of Rs 44.2 Crore.\n"
             "Contract includes mandatory 24-month Defect Liability Period and 0.5% per week penalty clause for unexcused delays.")
        ]
    )

    # Document 4: Progress Report (4 pages)
    create_demo_pdf(
        "ward12_progress_report.pdf",
        "Ward 12 Monthly Progress Update & Field Inspection Report",
        [
            ("1. Executive Progress Summary",
             "Reporting Period: January 2026.\n"
             "Government Project Record Official Progress: 70% physical completion.\n"
             "Contractor Submitted Progress Report: 75% physical completion.\n"
             "Note on Discrepancy: The contractor's report includes unverified off-site pre-cast drain fabrication which municipal engineers have not yet inspected."),

            ("2. Detailed Work Milestone Status",
             "Milestone 1 (Earthwork & Grading): 100% Complete.\n"
             "Milestone 2 (Stormwater Side Drains): 90% Complete.\n"
             "Milestone 3 (Asphalt Base Layer): 80% Complete.\n"
             "Milestone 4 (Top Surface & Streetlights): 30% Complete."),

            ("3. Delay Analysis & Obstacles Encountered",
             "The project experienced schedule delays of approximately 60 days due to two primary factors:\n"
             "Factor 1: Heavy unseasonal monsoon rainfall in August-September 2025 which prevented asphalt laying.\n"
             "Factor 2: Utility line relocation delays involving state electricity board cables along a 600-meter stretch."),

            ("4. Corrective Action Plan & Field Photos",
             "Contractor Skyline Infrastructure has deployed additional machinery to recover lost time.\n"
             "Revised Expected Handover Date: August 15, 2026.\n"
             "Field Inspector Signature: S. N. Mehta, Senior Divisional Inspector.")
        ]
    )

    print("[OK] All demo document PDFs generated successfully in documents/demo/")

if __name__ == "__main__":
    generate_all_demo_documents()
