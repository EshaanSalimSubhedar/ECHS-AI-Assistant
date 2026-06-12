from transformers import AutoTokenizer
from transformers import AutoModelForSeq2SeqLM
from app.utils.paths import MODEL_DIR
import os

os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

print("\nLOADING NLLB...")

MODEL_NAME = str(
    MODEL_DIR / "nllb"
)

print("\nMODEL PATH:")
print(MODEL_NAME)

print("\nEXISTS:")
print(os.path.exists(MODEL_NAME))

print("\nCONFIG EXISTS:")
print(
    os.path.exists(
        os.path.join(
            MODEL_NAME,
            "config.json"
        )
    )
)

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME
)

print("NLLB READY")


LANG_CODES = {
    "English": "eng_Latn",
    "Hindi": "hin_Deva",
    "Bengali": "ben_Beng",
    "Assamese": "asm_Beng",
}


def translate_text(
    text,
    source_language,
    target_language
):

    GLOSSARY = {
        "ECHS": "__ECHS__",
        "ESM": "__ESM__",
        "NOK": "__NOK__",
        "CGHS": "__CGHS__",
        "OPD": "__OPD__",
        "IPD": "__IPD__",
        "Polyclinic": "__POLYCLINIC__",
        "Referral": "__REFERRAL__",
        "Reimbursement": "__REIMBURSEMENT__"
    }

    # Protect terms
    for original, placeholder in GLOSSARY.items():
        text = text.replace(
            original,
            placeholder
        )

    source_code = LANG_CODES[source_language]
    target_code = LANG_CODES[target_language]

    tokenizer.src_lang = source_code

    encoded = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    generated_tokens = model.generate(
        **encoded,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids(
            target_code
        ),
        max_length=1024
    )

    translated_text = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True
    )[0]

    # Restore terms
    for original, placeholder in GLOSSARY.items():
        translated_text = translated_text.replace(
            placeholder,
            original
        )

    return translated_text