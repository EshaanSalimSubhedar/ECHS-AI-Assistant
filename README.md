# ECHS AI Assistant

## Overview

ECHS AI Assistant is an offline-first, multilingual AI-powered assistant designed to help Ex-Servicemen Contributory Health Scheme (ECHS) beneficiaries quickly access information from official ECHS documents, policies, SOPs, brochures, and healthcare resources.

The system combines Retrieval-Augmented Generation (RAG), semantic search, OCR, multilingual translation, and local LLM inference to provide accurate, document-grounded answers with source citations.

---

## Key Features

### Document Intelligence

* Searches across official ECHS policies, SOPs, brochures, and manuals.
* Retrieves relevant sections from thousands of document chunks.
* Generates answers grounded in official documentation.
* Accepts voice input for all supported languages.

<img width="842" height="968" alt="image" src="https://github.com/user-attachments/assets/eee170e7-be3b-4e1f-9bbd-5ecaa40c63ff" />

### Multilingual Support

* English
* Hindi
* Bengali
* Assamese

Powered by Meta's NLLB translation model for bidirectional translation.

<img width="881" height="615" alt="WhatsApp Image 2026-06-12 at 15 27 07" src="https://github.com/user-attachments/assets/32086e34-45fc-492e-812c-c38c5039ecfa" />

<img width="847" height="972" alt="image" src="https://github.com/user-attachments/assets/1e4b1a1a-dc07-41eb-bddd-9f0a37e60d12" />

<img width="845" height="296" alt="image" src="https://github.com/user-attachments/assets/0f514fd0-10c3-4baf-a28c-84c3184c769f" />

### Hybrid Retrieval

* Semantic search using BGE-M3 embeddings.
* Vector similarity search with ChromaDB.
* Query rewriting for improved retrieval quality.

### OCR for Scanned Documents

* Extracts text from scanned PDF documents.
* Supports ingestion of image-based policy documents and SOPs.

### Local AI Inference

* Runs entirely on local infrastructure.
* No dependency on external AI APIs.
* Suitable for secure and low-connectivity environments.

### Admin Dashboard

* Upload and manage ECHS documents.
* Categorize knowledge sources.
* Manage empanelled hospital information.
* Automatic database rebuilding after document updates.

<img width="845" height="967" alt="image" src="https://github.com/user-attachments/assets/e59ff4ae-a482-4af6-a9ef-03a3aa6ca93c" />

### Source Verification

Every response includes:

* Source document
* Category
* Page reference

This ensures transparency and traceability.

---

## System Architecture

User Query

↓

React Frontend

↓

FastAPI Backend

↓

Hybrid Search Layer

↓

ChromaDB + BGE-M3 Embeddings

↓

Document Retrieval

↓

Qwen 2.5 LLM

↓

Response with Citations

---

## Technology Stack

### Frontend

* React
* Vite
* CSS

### Backend

* FastAPI
* Python

### AI & NLP

* Qwen 2.5 Instruct (GGUF)
* BGE-M3 Embeddings
* NLLB-200 Translation Model
* RapidOCR

### Retrieval

* ChromaDB
* Retrieval-Augmented Generation (RAG)

### Document Processing

* PyMuPDF
* OCR Pipeline
* Custom Chunking System

---

## Project Structure

ECHS-AI-Assistant/

├── backend/

│ ├── app/

│ ├── build_db.py

│ ├── run_server.py

│ └── requirements.txt

│

├── frontend/

│ ├── src/

│ ├── public/

│ └── package.json

│

└── deployment/

---

## Use Cases

* ECHS beneficiaries seeking policy information
* Ex-servicemen healthcare guidance
* SOP lookup and interpretation
* Hospital information retrieval
* Administrative assistance
* Multilingual document access

---

## Highlights

* Offline-capable architecture
* Local LLM deployment
* Multilingual support
* OCR-enabled document ingestion
* Source-grounded responses
* Admin management portal
* Automatic knowledge base updates

---

## Future Enhancements

* Authentication and role-based access
* Public deployment with secure API gateway
* Voice interaction support
* Advanced analytics dashboard
* Mobile application
* Expanded language coverage

---

## Disclaimer

This project is an educational and research implementation intended to demonstrate the application of Retrieval-Augmented Generation, multilingual NLP, and local AI inference for healthcare information retrieval. Responses should always be verified against official ECHS documentation.
