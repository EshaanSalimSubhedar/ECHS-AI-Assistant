from llama_cpp import Llama
from app.llm.translator import translate_text
from app.utils.paths import MODEL_DIR
import re
import os

MODEL_PATH = (
    MODEL_DIR /
    "qwen2.5-7b-instruct-q3_k_m.gguf"
)

print("\nLOADING MODEL...")
llm = Llama(
    model_path=str(MODEL_PATH),
    n_ctx=16384,
    n_threads=os.cpu_count(),
    n_batch=512,
    verbose=False
)
print("MODEL LOADED")

def generate_answer(
    question,
    context,
    language="en"
):
    
    print("\nQUESTION")
    print(question)

    requested_language = language

    language_names = {
        "hi": "Hindi",
        "bn": "Bengali",
        "as": "Assamese"
    }

     
    prompt = f"""
    
You are an official ECHS (Ex-Servicemen Contributory Health Scheme) policy assistant.

Answer ONLY using the supplied ECHS documents.

Always answer in English.

Never answer in Hindi, Bengali, Assamese, or Bodo.

Ignore reference numbers, circular numbers, section numbers, Mod IDs and authority citations in the documents. Focus only on the policy content.

Rules:

1. Use only information present in the context.
2. Never invent, assume, or guess policy information.
3. If the answer is not present in the context, respond exactly:
I could not find a reliable answer in the uploaded ECHS documents.
4. Combine information from multiple documents when relevant.
5. Prefer newer documents if multiple sources discuss the same topic.
6. Explain in simple language suitable for veterans and dependents.
7. Do not repeat the user's question.
8. Do not use markdown.
9. Do not use headings.
10. Do not use #, ##, ###, **, tables, or special formatting.
11. Use simple bullet points beginning with "-".
12. Mention important eligibility conditions, restrictions, and exceptions.

Context:

{context}

User Question:

{question}

Answer:
"""

    try:

        messages = [
            {
                "role": "system",
                "content": """
            You are an ECHS policy assistant.

            Always answer in English, even if the question is in another language.

            The user's question may be in Hindi, Bengali, Assamese, Bodo or English.
            
            Use the supplied context to understand the question.

            Answer only using the provided documents.

            Never repeat sentences.

            Never repeat bullet points.

            Never generate the same item twice.

            If information is missing, say:
            I could not find a reliable answer in the uploaded ECHS documents.

            Keep answers concise and factual.
            """
            },

            {
                "role": "user",
                "content": prompt
            }
        ]

        response = llm.create_chat_completion(
            messages=messages,
            temperature=0,
            max_tokens=1500,
            repeat_penalty=1.2
        )

        answer = response["choices"][0]["message"]["content"]

        finish_reason = response["choices"][0]["finish_reason"]

        print("\nFINISH REASON")
        print(finish_reason)

        continuation_count = 0

        while (
            finish_reason == "length"
            and continuation_count < 3
        ):

            print(
                f"\nCONTINUING ANSWER ({continuation_count + 1})"
            )

            continuation = llm.create_chat_completion(
                messages=[
                    *messages,
                    {
                        "role": "assistant",
                        "content": answer
                    },
                    {
                        "role": "user",
                        "content": (
                            "Continue exactly where you stopped. "
                            "Do not repeat any previous text."
                        )
                    }
                ],
                temperature=0,
                max_tokens=1000,
                repeat_penalty=1.2
            )

            extra = continuation["choices"][0]["message"]["content"]

            answer += "\n" + extra

            finish_reason = (
                continuation["choices"][0]["finish_reason"]
            )

            continuation_count += 1

        answer = answer.strip()

        if not answer.endswith(
            (
                ".",
                "!",
                "?",
                "।",
                ":"
            )
        ):

            print(
                "\nANSWER MAY BE INCOMPLETE. "
                "REQUESTING FINAL COMPLETION."
            )

            final_completion = llm.create_chat_completion(
                messages=[
                    {
                        "role": "assistant",
                        "content": answer
                    },
                    {
                        "role": "user",
                        "content": (
                            "Complete the unfinished sentence only. "
                            "Do not repeat anything."
                        )
                    }
                ],
                temperature=0,
                max_tokens=100
            )

            answer += (
                " "
                + final_completion["choices"][0]["message"]["content"]
            )

        if "</think>" in answer:
            answer = answer.split("</think>")[-1]

        answer = answer.strip()

    except Exception as e:

        print("\nGGUF ERROR")
        print(str(e))

        return "I could not generate an answer at this time."

    print("\n" + "=" * 80)
    print("QWEN ANSWER")
    print("=" * 80)
    print(answer)

    answer = re.sub(
        r"^#+\s*",
        "",
        answer,
        flags=re.MULTILINE
    )

    answer = answer.replace("**", "")

    answer = re.sub(
        rf"^\s*{re.escape(question)}\s*",
        "",
        answer,
        flags=re.IGNORECASE
    ).strip()

    answer = re.sub(
        r"^Based on the ECHS documents,?\s*",
        "",
        answer,
        flags=re.IGNORECASE
    )

    answer = re.sub(
        r"\n{3,}",
        "\n\n",
        answer
    )

    language_names = {
        "hi": "Hindi",
        "bn": "Bengali",
        "as": "Assamese",
        "bodo": "Bodo"
    }

    if requested_language != "en":

        target_language = language_names.get(
            requested_language
        )

        print(
            f"\nTRANSLATING TO {target_language}"
        )

        answer = translate_text(
            answer,
            "English",
            target_language
        )

        print("\nTRANSLATED ANSWER")
        print(answer)

    return answer