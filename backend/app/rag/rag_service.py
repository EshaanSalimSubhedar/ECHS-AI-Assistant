from app.ingestion.vector_store import VectorStore
from app.llm.ollama_client import generate_answer

db = VectorStore()


def ask_question(
    question,
    language="en"
):

    print("\nORIGINAL QUESTION")
    print(question)

    search_query = question

    results = db.search(
        search_query,
        n_results=3
    )

    print("\nDISTANCES")
    print(results["distances"][0])

    distances = results["distances"][0]

    best_distance = min(distances)

    if best_distance < 12:
        confidence = "High"

    elif best_distance < 16:
        confidence = "Medium"

    else:
        confidence = "Low"

    docs = results["documents"][0]

    for i, doc in enumerate(docs):
        print("\n" + "="*80)
        print(f"RESULT {i+1}")
        print("="*80)
        print(doc[:500])

    meta = results["metadatas"][0]

    context = ""

    for i, doc in enumerate(docs):

        context += f"""
DOCUMENT: {meta[i]["document"]}

CATEGORY: {meta[i]["category"]}

PAGE: {meta[i]["page"]}

TEXT:
{doc}

====================================================

"""

    print("\n" + "=" * 80)
    print("CONTEXT")
    print("=" * 80)
    print(context)

    print("\nCONTEXT LENGTH")
    print(len(context))

    # Prevent huge prompts
    MAX_CONTEXT = 8000

    if len(context) > MAX_CONTEXT:

        print("\nTRUNCATING CONTEXT")

        context = context[:MAX_CONTEXT]

    answer = generate_answer(
        question,
        context,
        language
    )

    print("\n" + "=" * 80)
    print("FINAL ANSWER")
    print("=" * 80)
    print(answer)

    sources = []
    seen = set()

    for item in meta:

        document = item.get(
            "document",
            ""
        ).strip()

        if document in seen:
            continue

        seen.add(document)

        sources.append(
            {
                "document": document,
                "category": item.get("category"),
                "page": item.get("page")
            }
        )

    print("\nUNIQUE SOURCES")

    for source in sources:
        print(source)

    return {
        "answer": answer,
        "confidence": confidence,
        "sources": sources
    }