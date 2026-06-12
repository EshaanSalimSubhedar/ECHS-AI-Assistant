import os
import shutil

from app.ingestion.pdf_loader import extract_pages
from app.ingestion.chunker import chunk_pages
from app.ingestion.vector_store import VectorStore


def rebuild_database():

    print("\nREBUILDING DATABASE")

    shutil.rmtree(
        "app/data/chroma",
        ignore_errors=True
    )

    vector_store = VectorStore()

    total_chunks = 0

    for root, dirs, files in os.walk("app/data"):

        if "chroma" in root:
            continue

        for file in files:

            if not file.lower().endswith(".pdf"):
                continue

            pdf_path = os.path.join(
                root,
                file
            )

            print(
                f"\nProcessing: {file}"
            )

            pages = extract_pages(
                pdf_path
            )

            chunks = chunk_pages(
                pages
            )

            if chunks:

                vector_store.add_chunks(
                    chunks
                )

                total_chunks += len(
                    chunks
                )

    print(
        f"\nTOTAL CHUNKS: {total_chunks}"
    )

    return total_chunks