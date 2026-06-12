
## Overview

ECHS AI Assistant is an offline-first, multilingual AI-powered healthcare information assistant developed for the Ex-Servicemen Contributory Health Scheme (ECHS).

The system enables beneficiaries, administrators, and healthcare personnel to quickly retrieve information from official ECHS documents, SOPs, policies, brochures, and manuals using Retrieval-Augmented Generation (RAG), semantic search, OCR, and local Large Language Models.

Unlike cloud-based solutions, the application is designed to operate entirely on local infrastructure, making it suitable for secure environments with limited or no internet connectivity.

---

## Key Features

### AI-Powered Question Answering

* Natural language querying of ECHS documentation.
* Context-aware answers generated using Retrieval-Augmented Generation (RAG).
* Source-grounded responses based on official ECHS documents.

### Multilingual Support

Supported Languages:

* English
* Hindi
* Bengali
* Assamese

---

<img width="881" height="615" alt="image" src="https://github.com/user-attachments/assets/6790fa5a-0f13-4bbb-a788-23a9ef01d2a8" />

---

Powered by Meta's NLLB translation model for bidirectional translation.

### Hybrid Search Architecture

* Dense semantic retrieval using BGE-M3 embeddings.
* Vector similarity search using ChromaDB.
* Query rewriting and retrieval optimization.
* Citation-based response generation.

### OCR for Scanned Documents

* Supports scanned PDF documents.
* Automatic OCR extraction during ingestion.
* Enables indexing of image-based SOPs and policy documents.

### Local AI Inference

* Fully offline deployment.
* No dependency on OpenAI or cloud APIs.
* Local inference using quantized LLM models.

### Administrative Dashboard

* Upload and manage ECHS documents.
* Categorize policy and SOP documents.
* Manage empanelled hospital records.
* Automatic database rebuilding after document updates.

---

<img width="845" height="967" alt="image" src="https://github.com/user-attachments/assets/eceecf30-c6ba-451a-baab-558df6f95c71" />

---

### Source Verification

Every response includes:

* Source document
* Document category
* Page reference

---

<img width="845" height="968" alt="image" src="https://github.com/user-attachments/assets/0bf18b07-3175-4982-a593-7cd2c67ab2a7" />

---

<img width="827" height="950" alt="image" src="https://github.com/user-attachments/assets/df1391ee-e0d6-467a-bfcc-9e7ffb328627" />

---

This ensures transparency and traceability of generated answers.

---

## Highlights

* Fully Offline Deployment
* Multilingual AI Assistant
* Accepts Voice Input For Supported Languages 
* OCR-enabled Knowledge Ingestion
* Local LLM Inference
* Hybrid Semantic Search
* Source-Cited Responses
* Automatic Database Rebuilding
* Administrative Management Portal

---

## System Architecture

User Query

↓

React Frontend

↓

FastAPI Backend

↓

Query Processing

↓

Hybrid Retrieval Layer

↓

ChromaDB + BGE-M3 Embeddings

↓

Document Retrieval

↓

Qwen 2.5 LLM

↓

Response Generation

↓

Source-Cited Answer

---

## Technology Stack

### Frontend

* React
* Vite
* CSS

### Backend

* FastAPI
* Python

### AI Models

* Qwen 2.5 Instruct GGUF
* BGE-M3 Embedding Model
* NLLB-200 Translation Model

### Retrieval

* ChromaDB
* Retrieval-Augmented Generation (RAG)

### Document Processing

* PyMuPDF
* RapidOCR
* Custom Chunking Pipeline

### Packaging

* PyInstaller

---

## Project Structure

```text
ECHS-AI-Assistant
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── ingestion
│   │   ├── llm
│   │   ├── rag
│   │   ├── services
│   │   └── utils
│   │
│   ├── build_db.py
│   ├── run_server.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── deployment
│
├── README.md
│
└── requirements.txt
```

---

## Knowledge Base

The system is designed to ingest and search:

* ECHS SOPs
* ECHS Policies
* ECHS Brochures
* Administrative Guidelines
* Treatment Management Documents
* Medicine Management Documents
* Hospital Information Records

Documents are automatically:

1. Extracted
2. OCR processed (if scanned)
3. Chunked
4. Embedded
5. Indexed into ChromaDB

---

## Future Enhancements

* Authentication and Role-Based Access Control
* Voice-Based Interaction
* Additional Indian Language Support
* Analytics Dashboard
* Mobile Application
* Advanced Hospital Search Filters

---

## Deployment

The repository contains the complete source code.

Due to the size of the AI models and document database, the deployment package is distributed separately.

### Download Deployment Package

Google Drive Link:

[https://drive.google.com/drive/folders/1nR25qo7wvYRnWGhY9JspO3mbHUIWtKS1?usp=sharing]

### Installation

1. Download all deployment archive parts.
2. Place all files in the same folder.
3. Extract using 7-Zip.
4. Open the extracted folder.
5. Run `ECHS_AI.exe`.
6. Open:

```text
http://localhost:8000
```

in a web browser. **OR** Scan the given QR code on any mobile device. 
(make sure device running the application and mobile device are on the same network) 

---



---

## Disclaimer

This project was developed for educational and research purposes to demonstrate the application of Retrieval-Augmented Generation, multilingual natural language processing, OCR, and local AI inference for healthcare information retrieval.

Users should verify all responses against official ECHS documentation before making administrative or healthcare decisions.
