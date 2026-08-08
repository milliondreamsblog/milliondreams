# Talk2PDF (AskyourPDF)

## Overview
Talk2PDF is a self-hostable PDF question-answering app: users upload a PDF (even a scanned, image-only one), the backend extracts its text, indexes it into a local vector database, and then answers natural-language questions about the document with cited source filenames. It targets students, researchers, and anyone who needs to interrogate long documents without sending them to a paid cloud API — the entire retrieval stack (embeddings + vector store) runs locally for free. The system is a classic RAG (Retrieval-Augmented Generation) pipeline built with FastAPI and ChromaDB, with a React/Vite chat UI on top, and it degrades gracefully through three tiers of LLM availability (local Ollama, HuggingFace Inference API, or a pure-template extractive fallback).

## Architecture
The app is a two-process system. The frontend (`chatApp/frontend/src/App.jsx`) is a single-page React chat interface that talks to `http://localhost:8000` via axios: one call to `POST /upload` with multipart form data, then repeated `POST /query` calls as the user chats. The FastAPI backend (`chatApp/backend/main.py`) wires together two components. `PDFProcessor` (`chatApp/backend/pdf_processor.py`) first tries direct text extraction with PyPDF2; if that yields fewer than 100 characters it assumes a scanned PDF, rasterizes pages at 200 DPI with pdf2image/Poppler, and runs Tesseract OCR on each page image — keeping whichever result is longer. `RAGEngine` (`chatApp/backend/rag_engine.py`) chunks the text into 500-word windows with 50-word overlap, embeds each chunk locally with SentenceTransformer `all-MiniLM-L6-v2`, and stores embeddings + chunk text + filename metadata in a persistent ChromaDB collection (cosine HNSW space, on-disk at `./chroma_db`). At query time the question is embedded, the top-3 chunks are retrieved, concatenated into a context block, and passed to whichever LLM the engine auto-detected at startup: Ollama's `phi3` at `localhost:11434`, the HuggingFace Inference API (`Mistral-7B-Instruct` by default) if `HF_API_TOKEN` is set, or a keyword-overlap sentence extractor as a last resort. `DELETE /documents` drops and recreates the Chroma collection.

### Diagram spec
```json
{
  "nodes": [
    {"id": "ui", "label": "React chat UI (Vite)", "kind": "client"},
    {"id": "api", "label": "FastAPI (main.py)", "kind": "service"},
    {"id": "pdf", "label": "PDFProcessor (PyPDF2 + Tesseract OCR)", "kind": "service"},
    {"id": "rag", "label": "RAGEngine (chunk + embed + retrieve)", "kind": "service"},
    {"id": "chroma", "label": "ChromaDB (persistent, cosine HNSW)", "kind": "db"},
    {"id": "embed", "label": "SentenceTransformer all-MiniLM-L6-v2", "kind": "service"},
    {"id": "ollama", "label": "Ollama phi3 (local LLM)", "kind": "external"},
    {"id": "hf", "label": "HuggingFace Inference API", "kind": "external"}
  ],
  "edges": [
    {"from": "ui", "to": "api", "label": "POST /upload, /query"},
    {"from": "api", "to": "pdf", "label": "extract text / OCR"},
    {"from": "api", "to": "rag", "label": "add_document / query"},
    {"from": "rag", "to": "embed", "label": "embed chunks & queries"},
    {"from": "rag", "to": "chroma", "label": "store / top-3 similarity search"},
    {"from": "rag", "to": "ollama", "label": "generate answer (1st choice)"},
    {"from": "rag", "to": "hf", "label": "generate answer (fallback)"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| FastAPI + Uvicorn | REST API server | Async-friendly Python framework with built-in validation (Pydantic request/response models) and auto docs |
| React 18 + Vite | Chat frontend | Fast dev loop; the whole UI is one component (`App.jsx`) so no heavier framework needed |
| PyPDF2 | Primary text extraction | Pure-Python, fast for born-digital PDFs |
| pdf2image + pytesseract (Tesseract) | OCR fallback | Handles scanned/image PDFs for free, entirely offline |
| ChromaDB (PersistentClient) | Vector store | Embedded, zero-ops, persists to local disk (`./chroma_db`) — no external DB server |
| sentence-transformers (all-MiniLM-L6-v2) | Embeddings | Small (~80MB) model that runs on CPU locally, so embedding costs nothing |
| Ollama (phi3) / HuggingFace API | Answer generation | Tiered free options: local-first, API second, template extraction last |
| Axios | HTTP client | Simple multipart upload + JSON calls from the browser |

## Data model
There is no relational database — all state lives in a single ChromaDB collection named `pdf_documents` plus raw uploads on disk (`./uploads`). Documents are chunked into 500-word windows with a 50-word overlap (`RAGEngine.chunk_text`), each chunk stored with a deterministic ID (`doc_{n}_chunk_{i}`), its 384-dimension MiniLM embedding, the chunk text itself, and metadata `{filename, chunk_id}`. Retrieval is top-3 cosine similarity; source attribution comes from deduplicating the `filename` metadata of retrieved chunks. A `doc_counter` held in process memory numbers documents, and `session_id` is accepted on queries but not yet used, so all uploaded documents share one global namespace.

### DB diagram spec
```json
{
  "entities": [
    {"name": "pdf_documents (Chroma collection)", "fields": ["id: doc_{n}_chunk_{i}", "embedding: 384-d MiniLM vector", "document: 500-word chunk text", "metadata.filename", "metadata.chunk_id"]},
    {"name": "uploads/ (filesystem)", "fields": ["filename.pdf", "raw bytes"]},
    {"name": "RAGEngine (in-process state)", "fields": ["doc_counter", "llm_type: ollama|huggingface|template"]}
  ],
  "relations": [
    {"from": "uploads/ (filesystem)", "to": "pdf_documents (Chroma collection)", "label": "extracted, chunked, embedded"},
    {"from": "RAGEngine (in-process state)", "to": "pdf_documents (Chroma collection)", "label": "numbers docs / queries top-3"}
  ]
}
```

## Why this, not that

### Why local embeddings, not an embeddings API
Embeddings are generated with `all-MiniLM-L6-v2` running in-process via sentence-transformers rather than OpenAI/Cohere APIs. Every upload embeds dozens of chunks and every query embeds again — doing this locally makes the retrieval half of RAG completely free and offline-capable, at the cost of a heavyweight `torch` dependency and slower cold start while the model loads.

### Why a three-tier LLM fallback, not a single provider
`RAGEngine._detect_llm()` probes at startup: Ollama at `localhost:11434` first, then a HuggingFace token, then a template-based keyword-overlap extractor. This means the app never hard-fails from a missing API key — a deliberate zero-cost, demo-anywhere design — but the answer quality silently varies by environment, and detection happens only once at boot.

### Why PyPDF2-first with OCR fallback, not always-OCR
`PDFProcessor.process_pdf` only invokes the OCR path when direct extraction returns under 100 characters. OCR at 200 DPI through Tesseract is orders of magnitude slower than PyPDF2's text-layer read, so the heuristic keeps born-digital PDFs fast while still handling scans — the tradeoff being that a PDF with a thin text layer plus important image content would skip OCR.

### Why embedded ChromaDB, not pgvector or a hosted vector DB
`chromadb.PersistentClient(path="./chroma_db")` gives durable vector search with zero infrastructure — no Postgres, no Pinecone account, nothing to provision, matching the project's "runs on a laptop for free" ethos. The cost is single-node scale and a global collection shared by all users of the instance (clearing documents clears everyone's).

### Why fixed word-count chunking, not semantic/recursive splitting
Chunking is a simple 500-word sliding window with 50-word overlap rather than LangChain-style recursive or semantic splitters. It is trivially predictable and dependency-free (notably, the project uses no LangChain at all despite being a RAG app), though it can split sentences and tables mid-thought.

## Fun facts
- Despite being a RAG app, there is zero LangChain in the codebase — the whole pipeline (chunking, embedding, retrieval, prompting) is hand-rolled in ~230 lines in `chatApp/backend/rag_engine.py`.
- The ultimate fallback "LLM" is not an LLM: `generate_answer_template` does set-intersection of query words against document sentences and returns the top 3 overlapping sentences — RAG that works with no model at all.
- The `session_id` field exists in the `QueryRequest` model (`main.py`) but is never read, so every user of an instance queries one shared global document store; `DELETE /documents` wipes it for everyone.
- The `doc_counter` used to build chunk IDs lives in memory, so restarting the server resets it to 0 while ChromaDB persists old chunks — new uploads can collide with old IDs.
- The repo ships `setup.sh`, `setup.bat`, and `start.sh` scripts plus a 420-line `ARCHITECTURE.md`, and the README embeds a YouTube demo video.

## Screenshot targets
- The single-page chat UI at `http://localhost:5173` — upload panel state, then the chat with an answer and its source citations.
- FastAPI auto-docs at `http://localhost:8000/docs` (shows `/upload`, `/query`, `/documents` endpoints).
- Runs fully locally with no secrets required (template-answer mode); Tesseract + Poppler must be installed system-wide for OCR. Commands:
  - Backend: `cd chatApp/backend && pip install -r requirements.txt && uvicorn main:app --port 8000`
  - Frontend: `cd chatApp/frontend && npm install && npm run dev`
  - Optional: run `ollama pull phi3 && ollama serve` first for real LLM answers, or `export HF_API_TOKEN=...`
- Demo video: https://www.youtube.com/watch?v=eWiyWnbZwyU (linked from the repo README). No live deployment.

## Gaps
- No `.env.example`; the only configurable env vars found in code are `UPLOAD_DIR`, `HF_API_TOKEN`, and `HF_MODEL` — confirm nothing else is expected.
- The task brief described this as "agentic RAG with LangChain," but the code contains no LangChain and no agent loop — author should confirm whether an agentic version exists on another branch or the description should be corrected.
- Unclear whether the YouTube demo reflects the current code or an earlier iteration.
- No tests beyond a small `chatApp/backend/test_api.py` smoke script; no CI configuration.
