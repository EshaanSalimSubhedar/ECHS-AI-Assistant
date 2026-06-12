from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.api.admin import router as admin_router
from app.rag.rag_service import ask_question
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.utils.paths import BASE_PATH
from pathlib import Path



app = FastAPI(
    title="ECHS AI Assistant"
)


app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    question: str
    language: str = "en"



@app.post("/ask")
def ask(
    request: QueryRequest
):

    return ask_question(
        request.question,
        request.language
    )

FRONTEND_DIR = (
    BASE_PATH
    / "frontend"
    / "dist"
)

print("\nFRONTEND_DIR")
print(FRONTEND_DIR)

print("\nEXISTS")
print(FRONTEND_DIR.exists())

print("\nINDEX")
print(
    (FRONTEND_DIR / "index.html").exists()
)


app.mount(
    "/",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)
