import re


def chunk_pages(pages):

    chunks = []

    MAX_CHUNK_SIZE = 1000

    for page in pages:

        text = page["text"]

        # Normalize whitespace but preserve paragraph boundaries
        text = re.sub(
            r"\r\n",
            "\n",
            text
        )

        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text
        )

        paragraphs = re.split(
            r"\n\s*\n",
            text
        )

        for paragraph in paragraphs:

            paragraph = re.sub(
                r"\s+",
                " ",
                paragraph
            ).strip()

            # Skip tiny fragments
            if len(paragraph) < 100:
                continue

            # Normal paragraph
            if len(paragraph) <= MAX_CHUNK_SIZE:

                chunks.append(
                    {
                        "page": page["page"],
                        "document": page["document"],
                        "category": page["category"],
                        "text": paragraph
                    }
                )

            # Split oversized paragraphs
            else:

                sentences = re.split(
                    r'(?<=[.!?])\s+',
                    paragraph
                )

                current_chunk = ""

                for sentence in sentences:

                    if (
                        len(current_chunk)
                        + len(sentence)
                        < MAX_CHUNK_SIZE
                    ):

                        current_chunk += (
                            sentence + " "
                        )

                    else:

                        if len(
                            current_chunk.strip()
                        ) > 100:

                            chunks.append(
                                {
                                    "page": page["page"],
                                    "document": page["document"],
                                    "category": page["category"],
                                    "text": current_chunk.strip()
                                }
                            )

                        current_chunk = (
                            sentence + " "
                        )

                if len(
                    current_chunk.strip()
                ) > 100:

                    chunks.append(
                        {
                            "page": page["page"],
                            "document": page["document"],
                            "category": page["category"],
                            "text": current_chunk.strip()
                        }
                    )

    print(
        f"\nTOTAL CHUNKS CREATED: {len(chunks)}"
    )

    return chunks