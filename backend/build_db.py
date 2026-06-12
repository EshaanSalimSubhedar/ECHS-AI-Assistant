import os

from app.ingestion.pdf_loader import extract_pages
from app.ingestion.chunker import chunk_pages
from app.ingestion.vector_store import VectorStore


DATA_FOLDER = "app/data"

all_chunks = []

for root, dirs, files in os.walk(DATA_FOLDER):

    for file in files:

        if not file.lower().endswith(".pdf"):
            continue

        pdf_path = os.path.join(root, file)

        print(f"\nProcessing: {file}")

        pages = extract_pages(pdf_path)

        print("Pages:", len(pages))

        chunks = chunk_pages(pages)

        print("Chunks:", len(chunks))

        all_chunks.extend(chunks)


print("\nTOTAL CHUNKS:", len(all_chunks))

db = VectorStore()

try:
    db.client.delete_collection(
        name="echs_documents"
    )
    print("Old collection deleted")
except Exception:
    print("No existing collection found")

db.collection = db.client.get_or_create_collection(
    name="echs_documents"
)

db.add_chunks(all_chunks)

print("\nDatabase Built Successfully")