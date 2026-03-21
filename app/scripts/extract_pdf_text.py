"""Extract text from a PDF file using pdfplumber."""
import sys
import io
import site

# Set UTF-8 encoding for stdout to handle special characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

site.ENABLE_USER_SITE = True
if site.getusersitepackages() not in sys.path:
    sys.path.insert(0, site.getusersitepackages())
import pdfplumber


def extract_text(pdf_path: str) -> str:
    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        
        # Extract first 3 pages and last 2 pages only
        # This captures opening balances and closing balances typically
        first_n = 3
        last_n = 2
        
        if total_pages <= (first_n + last_n):
            # If PDF has 5 or fewer pages, extract all
            pages_to_extract = range(total_pages)
        else:
            # Extract first 3 and last 2 pages
            pages_to_extract = list(range(first_n)) + list(range(total_pages - last_n, total_pages))
        
        for page_num in pages_to_extract:
            page = pdf.pages[page_num]
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"--- Page {page_num + 1} ---\n{page_text}")
    
    return "\n\n".join(text_parts)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf_text.py <pdf_path>", file=sys.stderr)
        sys.exit(1)

    pdf_path = sys.argv[1]
    try:
        text = extract_text(pdf_path)
        print(text)
    except Exception as e:
        print(f"Error extracting text: {e}", file=sys.stderr)
        sys.exit(1)
