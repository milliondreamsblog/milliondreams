import type { CaseStudy } from "./types";

export const talk2pdf: CaseStudy = {
  slug: "talk2pdf",
  tldr: "Talk2PDF is a self-hostable PDF question-answering app: upload a PDF — even a scanned, image-only one — and ask it questions in plain English, with answers citing their source files. The whole retrieval stack runs locally for free: text extraction with an OCR fallback, local MiniLM embeddings, and an embedded ChromaDB vector store, so students and researchers never have to ship documents to a paid cloud API. It's a classic RAG pipeline hand-rolled on FastAPI, and it degrades gracefully through three tiers of LLM availability — local Ollama, HuggingFace's API, or a pure-template extractive fallback that needs no model at all.",
  architecture: {
    intro:
      "A two-process system: a single-component React/Vite chat UI talking to a FastAPI backend over two endpoints (upload, query). PDFProcessor tries PyPDF2 first and only falls back to 200-DPI Tesseract OCR when direct extraction yields under 100 characters — a cheap heuristic that keeps born-digital PDFs fast. RAGEngine chunks text into 500-word windows with 50-word overlap, embeds everything locally with all-MiniLM-L6-v2, stores it in a persistent on-disk ChromaDB collection, and at query time hands the top-3 chunks to whichever LLM it auto-detected at boot.",
    diagram: {
      nodes: [
        { id: "ui", label: "React chat UI (Vite)", kind: "client" },
        { id: "api", label: "FastAPI (main.py)", kind: "service" },
        { id: "pdf", label: "PDFProcessor (PyPDF2 + Tesseract OCR)", kind: "service" },
        { id: "rag", label: "RAGEngine (chunk + embed + retrieve)", kind: "service" },
        { id: "embed", label: "SentenceTransformer all-MiniLM-L6-v2", kind: "service" },
        { id: "chroma", label: "ChromaDB (persistent, cosine HNSW)", kind: "db" },
        { id: "ollama", label: "Ollama phi3 (local LLM)", kind: "external" },
        { id: "hf", label: "HuggingFace Inference API", kind: "external" },
      ],
      edges: [
        { from: "ui", to: "api", label: "POST /upload, /query" },
        { from: "api", to: "pdf", label: "extract text / OCR" },
        { from: "api", to: "rag", label: "add_document / query" },
        { from: "rag", to: "embed", label: "embed chunks & queries" },
        { from: "rag", to: "chroma", label: "store / top-3 similarity" },
        { from: "rag", to: "ollama", label: "answer (1st choice)" },
        { from: "rag", to: "hf", label: "answer (fallback)" },
      ],
    },
  },
  stack: [
    {
      tech: "FastAPI + Uvicorn",
      role: "REST API server",
      why: "Async-friendly Python with Pydantic validation on every request and auto-generated docs for free.",
    },
    {
      tech: "React 18 + Vite",
      role: "Chat frontend",
      why: "The entire UI is one component, so a fast dev loop mattered more than a heavy framework.",
    },
    {
      tech: "PyPDF2",
      role: "Primary text extraction",
      why: "Pure-Python and fast for born-digital PDFs — the happy path stays cheap.",
    },
    {
      tech: "pdf2image + Tesseract",
      role: "OCR fallback",
      why: "Handles scanned, image-only PDFs entirely offline and for free.",
    },
    {
      tech: "ChromaDB",
      role: "Vector store",
      why: "Embedded and zero-ops — persists to a local directory with no external DB server to provision.",
    },
    {
      tech: "all-MiniLM-L6-v2",
      role: "Embeddings",
      why: "An ~80MB sentence-transformer that runs on CPU in-process, so embedding costs literally nothing.",
    },
    {
      tech: "Ollama phi3 / HuggingFace",
      role: "Answer generation",
      why: "Tiered free options: local model first, hosted API second, template extraction as the floor.",
    },
    {
      tech: "Axios",
      role: "HTTP client",
      why: "Simple multipart uploads and JSON calls — nothing fancier needed.",
    },
  ],
  dataModel: {
    intro:
      "There is no relational database — all state is one ChromaDB collection plus raw uploads on disk. Each 500-word chunk is stored with a deterministic ID, its 384-dimension MiniLM embedding, the chunk text, and filename metadata; source attribution at answer time is just deduplicating the filenames of the top-3 retrieved chunks. A doc counter lives in process memory, and the session_id field on queries is accepted but not yet used — so every uploaded document shares one global namespace by design.",
    diagram: {
      entities: [
        {
          name: "pdf_documents (Chroma collection)",
          fields: ["id: doc_{n}_chunk_{i}", "embedding: 384-d MiniLM vector", "document: 500-word chunk", "metadata.filename / chunk_id"],
        },
        {
          name: "uploads/ (filesystem)",
          fields: ["filename.pdf", "raw bytes"],
        },
        {
          name: "RAGEngine (in-process state)",
          fields: ["doc_counter", "llm_type: ollama | huggingface | template"],
        },
      ],
      relations: [
        { from: "uploads/ (filesystem)", to: "pdf_documents (Chroma collection)", label: "extracted, chunked, embedded" },
        { from: "RAGEngine (in-process state)", to: "pdf_documents (Chroma collection)", label: "numbers docs / queries top-3" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
