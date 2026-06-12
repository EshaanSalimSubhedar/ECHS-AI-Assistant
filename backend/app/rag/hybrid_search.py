from app.ingestion.vector_store import VectorStore

db = VectorStore()


def search(question):

    results = db.search(
        question,
        n_results=15
    )

    docs = results["documents"][0]
    meta = results["metadatas"][0]

    scored_results = []

    query_words = question.lower().split()

    for i, doc in enumerate(docs):

        score = 0

        doc_lower = doc.lower()

        for word in query_words:

            if word in doc_lower:
                score += 1

        scored_results.append(
            {
                "score": score,
                "page": meta[i]["page"],
                "text": doc
            }
        )

    scored_results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return scored_results[:5]