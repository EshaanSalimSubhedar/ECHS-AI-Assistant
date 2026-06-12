from pypdf import PdfReader
from rapidocr_onnxruntime import RapidOCR
import fitz
import os

ocr = RapidOCR()


def extract_pages(pdf_path):

    reader = PdfReader(pdf_path)

    pages = []

    filename = os.path.basename(pdf_path)

    category = os.path.basename(
        os.path.dirname(pdf_path)
    )

    print(f"\nProcessing: {filename}")

    #
    # FIRST TRY NORMAL PDF EXTRACTION
    #

    for page_num, page in enumerate(
        reader.pages,
        start=1
    ):

        try:

            text = page.extract_text()

            if text and text.strip():

                pages.append(
                    {
                        "page": page_num,
                        "text": text,
                        "document": filename,
                        "category": category
                    }
                )

        except Exception:
            pass

    #
    # IF NOTHING FOUND → OCR
    #

    if len(pages) == 0:

        print(
            "No embedded text found. "
            "Running OCR..."
        )

        doc = fitz.open(pdf_path)

        for page_num in range(len(doc)):

            page = doc[page_num]

            pix = page.get_pixmap(
                matrix=fitz.Matrix(2, 2),
                alpha=False
            )

            image = pix.samples

            result, _ = ocr(
                pix.tobytes("png")
            )

            text = ""

            if result:

                text = "\n".join(
                    [line[1] for line in result]
                )

            if text.strip():

                pages.append(
                    {
                        "page": page_num + 1,
                        "text": text,
                        "document": filename,
                        "category": category
                    }
                )

    print(f"Pages: {len(pages)}")

    return pages