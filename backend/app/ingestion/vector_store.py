import chromadb
import uuid
from sentence_transformers import SentenceTransformer
from chromadb.config import Settings
from app.utils.paths import CHROMA_DIR


class VectorStore:

    def __init__(self):

        print("\nLOADING CHROMADB...")

        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DIR),
            settings=Settings(
                anonymized_telemetry=False
            )
        )

        print("CHROMADB READY")

        self.collection = self.client.get_or_create_collection(
            name="echs_documents"
        )

        print("\nLOADING BGE-M3...")
        self.model = SentenceTransformer(
            "BAAI/bge-m3",
            device="cpu"
        )
        print("BGE-M3 READY")

    def add_chunks(self, chunks):

        texts = [
            chunk["text"]
            for chunk in chunks
        ]

        embeddings = self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=True,
            normalize_embeddings=True
        )

        for chunk, embedding in zip(
            chunks,
            embeddings
        ):

            self.collection.add(
                ids=[str(uuid.uuid4())],
                embeddings=[embedding.tolist()],
                documents=[chunk["text"]],
                metadatas=[
                    {
                        "page": chunk["page"],
                        "document": chunk["document"],
                        "category": chunk["category"]
                    }
                ]
            )

    def search(
        self,
        query,
        n_results=5
    ):

        query_embedding = self.model.encode(
            query,
            normalize_embeddings=True
        ).tolist()

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

        return results