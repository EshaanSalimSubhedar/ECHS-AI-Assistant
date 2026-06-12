import os
import shutil
import json
import datetime
import chromadb

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.ingestion.pdf_loader import extract_pages
from app.ingestion.chunker import chunk_pages
from app.ingestion.vector_store import VectorStore
from app.services.rebuild_service import (rebuild_database)
from app.utils.paths import DATA_DIR

router = APIRouter()

DATA_FOLDER = str(DATA_DIR)
HOSPITALS_FILE = os.path.join(DATA_FOLDER, "hospitals.json")
DOCUMENT_CATEGORIES = {"beneficiary", "clinical", "finance", "governance", "infrastructure", "pharmacy", "policy"}


def ensure_data_folder():
    os.makedirs(DATA_FOLDER, exist_ok=True)


def load_hospitals():
    ensure_data_folder()
    if not os.path.exists(HOSPITALS_FILE):
        return []
    with open(HOSPITALS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_hospitals(hospitals):
    ensure_data_folder()
    with open(HOSPITALS_FILE, "w", encoding="utf-8") as f:
        json.dump(hospitals, f, indent=2, ensure_ascii=False)


@router.get("/admin/stats")
def get_stats():

    pdf_count = 0

    for root, dirs, files in os.walk(DATA_FOLDER):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_count += 1

    client = chromadb.PersistentClient(
        path="app/data/chroma"
    )

    collection = client.get_collection(
        "echs_documents"
    )

    hospitals = load_hospitals()

    return {
        "documents": pdf_count,
        "chunks": collection.count(),
        "hospitals": len(hospitals),
        "queries_today": 0
    }


class HospitalIn(BaseModel):
    name: str
    city: str
    state: str
    specialties: list[str]


@router.get("/admin/documents")
def get_documents():
    documents = []
    for root, dirs, files in os.walk(DATA_FOLDER):
        if os.path.basename(root) == "chroma":
            continue
        for file in files:
            if not file.lower().endswith(".pdf"):
                continue
            path = os.path.join(root, file)
            rel_root = os.path.relpath(root, DATA_FOLDER)
            category = rel_root.split(os.sep)[0] if rel_root and rel_root != "." else "uncategorized"
            documents.append({
                "name": file,
                "size": round(os.path.getsize(path) / (1024 * 1024), 2),
                "date": datetime.datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d"),
                "category": category,
                "status": "indexed"
            })
    return documents


@router.post("/admin/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...)
):
    ensure_data_folder()
    category_clean = category.strip().lower()
    if category_clean not in DOCUMENT_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid document category")
    category_dir = os.path.join(DATA_FOLDER, category_clean)
    os.makedirs(category_dir, exist_ok=True)
    destination = os.path.join(category_dir, os.path.basename(file.filename))
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        pages = extract_pages(destination)
        if pages:
            chunks = chunk_pages(pages)
            if chunks:
                vector_store = VectorStore()
                vector_store.add_chunks(chunks)
    except Exception as e:
        print(f"Error indexing document {file.filename}: {e}")
    
    return {
        "message": "uploaded",
        "category": category_clean
    }


@router.get("/admin/hospitals")
def get_hospitals():
    ensure_data_folder()
    if not os.path.exists(HOSPITALS_FILE):
        return []
    with open(HOSPITALS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/admin/add_hospital")
def add_hospital(hospital: HospitalIn):
    if not hospital.name.strip() or not hospital.city.strip() or not hospital.state.strip():
        raise HTTPException(status_code=400, detail="Hospital name, city, and state are required")
    hospitals = load_hospitals()
    next_id = max([h.get("id", 0) for h in hospitals], default=0) + 1
    specialties = [s for s in hospital.specialties if s and s != "All"]
    record = {
        "id": next_id,
        "name": hospital.name,
        "city": hospital.city,
        "state": hospital.state,
        "specialties": specialties
    }
    hospitals.append(record)
    save_hospitals(hospitals)
    return {"message": "saved", "hospital": record}


@router.delete("/admin/documents")
def delete_document(category: str, filename: str):
    category_clean = category.strip().lower()
    if category_clean not in DOCUMENT_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid document category")
    path = os.path.join(DATA_FOLDER, category_clean, os.path.basename(filename))
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Document not found")
    os.remove(path)
    return {"message": "deleted"}


@router.delete("/admin/hospitals/{hospital_id}")
def delete_hospital(hospital_id: int):
    hospitals = load_hospitals()
    remaining = [h for h in hospitals if h.get("id") != hospital_id]
    if len(remaining) == len(hospitals):
        raise HTTPException(status_code=404, detail="Hospital not found")
    save_hospitals(remaining)
    return {"message": "Document deleted." 
            "Run database rebuild " 
            "from admin panel."}

@router.post("/admin/rebuild")
def rebuild_index():

    try:

        total_chunks = rebuild_database()

        return {
            "message": "success",
            "chunks": total_chunks
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
