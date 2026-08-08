# Resume AI

## Overview
Resume AI is a GenAI resume optimizer for job seekers: you drop in your resume (PDF/DOCX/TXT) plus the job description you're targeting, and it returns recruiter-style feedback — a decimal score out of 10, a TL;DR, missing keywords from the JD, rewrite suggestions, and STAR-method bullet upgrades — alongside a set of personalized interview questions generated from your actual resume and the JD. It's a Next.js 15 app with no accounts and no database: files live in an in-memory store with a 30-minute TTL, parsing is deterministic regex work, and only the feedback/question generation calls out to LLMs on HuggingFace Inference. When the free API quota runs out, the app doesn't break — it serves clearly-labeled mock data and shows an "upgrade" popup that is, in reality, a pay-what-you-want UPI QR code.

## Architecture
Everything is one Next.js app with four API routes forming a pipeline the client drives from `src/app/resume/page.tsx`. `POST /api/upload` (`src/app/api/upload/route.ts`) buffers the file into `src/lib/fileStore.ts` — a module-level `Map<uuid, {buffer, filename, mimeType}>` with a 30-minute TTL cleanup — and returns a `fileId`. `POST /api/parse` (`src/app/api/parse/route.ts`) fetches the buffer, extracts raw text (pdf2json for PDFs, mammoth for DOCX, utf8 for everything else), then runs a ~150-line hand-written regex/heuristic parser that pulls out name, email, phone, and splits Experience/Education/Skills/Summary sections by heading keywords, even chunking experience entries on month/year boundaries. The structured resume plus JD then feed two LLM routes: `POST /api/feedback` and `POST /api/interview`, both delegating to `src/lib/hugingface.ts`, which routes to per-service HuggingFace InferenceClients (separate optional tokens for feedback vs questions, falling back to a shared `HF_TOKEN`), calls `Qwen3-Next-80B-A3B-Instruct` via the Novita provider, retries on 503 with backoff, falls back to `Llama-3.3-70B-Instruct` on overload, and classifies quota errors into a custom `APILimitExceededError`. On any failure the routes return mock data from `src/data/mockData/mockData.ts` flagged `isMock: true`, which the UI surfaces via `MockBadge` and an `UpgradePopup`. Results render in tabs (Feedback / Interview) and can be exported to PDF client-side with jsPDF + html2canvas (`src/components/PdfExport.tsx`).

### Diagram spec
```json
{
  "nodes": [
    {"id": "ui", "label": "Next.js UI (/resume tabs: Feedback, Interview)", "kind": "client"},
    {"id": "upload", "label": "POST /api/upload", "kind": "service"},
    {"id": "store", "label": "In-memory fileStore (Map, 30-min TTL)", "kind": "cache"},
    {"id": "parse", "label": "POST /api/parse (pdf2json / mammoth + regex parser)", "kind": "service"},
    {"id": "feedback", "label": "POST /api/feedback", "kind": "service"},
    {"id": "interview", "label": "POST /api/interview", "kind": "service"},
    {"id": "hf", "label": "HuggingFace Inference (Qwen3-80B via Novita, Llama-3.3 fallback)", "kind": "external"},
    {"id": "mock", "label": "Mock data fallback (isMock: true)", "kind": "service"},
    {"id": "pdf", "label": "jsPDF + html2canvas export (client-side)", "kind": "client"}
  ],
  "edges": [
    {"from": "ui", "to": "upload", "label": "resume file"},
    {"from": "upload", "to": "store", "label": "save buffer → fileId"},
    {"from": "ui", "to": "parse", "label": "fileId"},
    {"from": "parse", "to": "store", "label": "read buffer"},
    {"from": "ui", "to": "feedback", "label": "parsedResume + JD"},
    {"from": "ui", "to": "interview", "label": "parsedResume + JD"},
    {"from": "feedback", "to": "hf", "label": "chat completion (retry + fallback model)"},
    {"from": "interview", "to": "hf", "label": "generate 8 questions"},
    {"from": "feedback", "to": "mock", "label": "on quota/API failure"},
    {"from": "ui", "to": "pdf", "label": "export results"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| Next.js 15 (App Router) + React 19 | Full-stack framework | API routes colocate the pipeline with the UI; no separate backend to host |
| HuggingFace Inference (`@huggingface/inference`) | LLM feedback + interview questions | Free-tier access to big open models (Qwen3-80B, Llama-3.3-70B) via the Novita provider instead of paid OpenAI/Gemini |
| pdf2json / mammoth | PDF and DOCX text extraction | Pure-JS extraction inside the Node runtime (`export const runtime = "nodejs"`), no native binaries |
| In-memory Map (`src/lib/fileStore.ts`) | Ephemeral file storage | Resumes are sensitive; nothing is persisted — a 30-minute TTL and process memory are the whole storage story |
| Framer Motion + Aceternity-style UI (spotlight, container-text-flip, floating-dock, multi-step-loader) | Landing page polish | Portfolio-grade visual flair from copy-in components rather than a component library dependency |
| jsPDF + html2canvas | Client-side PDF export of results | Avoids any server rendering; the report is screenshotted from the DOM |
| react-dropzone | File upload UX | Drag-and-drop with type filtering |
| Vercel Analytics | Usage tracking | One-line drop-in for a Vercel-hosted app |

## Data model
There is no database of any kind — the entire persistent-ish state is one in-memory `Map` in `src/lib/fileStore.ts` holding uploaded file buffers keyed by UUID, swept lazily on every save/get with a 30-minute TTL. The interesting "model" is the shape of data flowing through the pipeline: the parse step produces a `ParsedResume` (rawText plus a structured object with name, contact {email, phone}, summary, skills[], experience[] — each entry heuristically split into title/company/bullets — and education), which is truncated to 5,000 characters of rawText before being sent to the LLM. The feedback route returns a typed `Feedback` object (`score`, `tldr`, `suggestions[]`, `keywords[]`, `exampleBullets[]`, `isMock`) that the LLM is forced to emit as strict JSON via the system prompt; interview questions come back as a typed array. Mock twins of both shapes live in `src/data/mockData/mockData.ts` for quota-exhausted fallback.

### DB diagram spec
```json
{
  "entities": [
    {"name": "FileEntry (in-memory Map)", "fields": ["id: randomUUID", "buffer: Buffer", "filename / mimeType", "uploadedAt (30-min TTL)"]},
    {"name": "ParsedResume (transient)", "fields": ["rawText (capped 5000 chars for LLM)", "structured.name / contact", "structured.skills[]", "structured.experience[] (title, company, bullets)"]},
    {"name": "Feedback (LLM JSON response)", "fields": ["score (decimal /10)", "tldr", "suggestions[] / keywords[]", "exampleBullets[]", "isMock flag"]},
    {"name": "InterviewQuestions (LLM JSON response)", "fields": ["question", "category", "isMock flag (route-level)"]}
  ],
  "relations": [
    {"from": "FileEntry (in-memory Map)", "to": "ParsedResume (transient)", "label": "parsed by /api/parse"},
    {"from": "ParsedResume (transient)", "to": "Feedback (LLM JSON response)", "label": "+ job description → /api/feedback"},
    {"from": "ParsedResume (transient)", "to": "InterviewQuestions (LLM JSON response)", "label": "+ job description → /api/interview"}
  ]
}
```

## Why this, not that

### Why an in-memory file store, not S3 or a database
`fileStore.ts` keeps resume buffers in a process-local Map with a 30-minute TTL — uploads never touch disk or a third party, which is both a privacy stance and zero infrastructure. The tradeoff is real: a serverless deployment can route `/api/upload` and `/api/parse` to different lambda instances, making the fileId 404 — which is why routes pin `runtime = "nodejs"` and the code logs store size on every operation to debug exactly this.

### Why regex resume parsing, not LLM extraction
`parseResumeText` in `src/app/api/parse/route.ts` finds sections by heading keywords ("work experience", "technical skills"...) and splits experience entries on month/year regexes. It's free, instant, deterministic, and keeps the only LLM spend for the two calls users actually see value from — at the cost of brittleness on creatively formatted resumes (the first non-empty line is simply assumed to be your name).

### Why mock-data fallback, not a hard error
Both LLM routes catch failures and return pre-baked results from `mockData.ts` tagged `isMock: true`, rendered with a visible `MockBadge`. For a free app riding free-tier HuggingFace quotas, the demo must never show a 500 to a recruiter or portfolio visitor; honesty is preserved by labeling the data rather than pretending.

### Why HuggingFace via Novita with a model-fallback chain, not OpenAI
`callHuggingFaceChat` targets `Qwen/Qwen3-Next-80B-A3B-Instruct`, retries 503s with linear backoff, and re-calls with `meta-llama/Llama-3.3-70B-Instruct` when the primary is overloaded — plus separate `HF_TOKEN_FEEDBACK` / `HF_TOKEN_QUESTIONS` tokens so one feature exhausting its quota doesn't kill the other. That's a lot of resilience machinery whose entire purpose is running an 80B-class model for $0; the `openai`, `@google/genai`, and `razorpay` packages sit installed but unused, evidence of roads not taken.

### Why client-side PDF export, not server rendering
`PdfExport.tsx` uses html2canvas + jsPDF to snapshot the rendered feedback into a PDF in the browser. No Puppeteer, no server CPU, works on static hosting — the tradeoff is raster (screenshot) quality output rather than selectable-text PDFs.

## Fun facts
- The monetization strategy is a meme: hitting the API limit opens `UpgradePopup` (`src/components/PopUp.tsx`) and the hero has a modal showing `Gareeb.png` (Hindi for "broke") with a UPI QR code captioned "Scan the QR code and pay me whatever you want 💸" — pay-what-you-want as a pricing page.
- The README's setup section accidentally reveals a previous name: "Follow these steps to set up **Daddy AI** locally."
- The code has bilingual comments — `src/lib/hugingface.ts` (yes, the filename is misspelled) opens with "// Alag clients for different services" (alag = separate in Hindi).
- The feedback prompt (`src/data/prompt/PROMPT.md`) explicitly engineers against LLM tics: it demands "varied decimals (e.g., 7.3, 8.7, 6.5) — do not use fixed increments" and bans "roasting" language.
- Quota detection is string-sniffing: `isLimitExceededError` matches ten substrings including "billing" and "subscription" against error messages, plus status codes 403/429/503.
- Three different PDF libraries are installed (`pdf-parse`, `pdf-parser`, `pdf2json`); the live route uses pdf2json while `parseHelper.ts` still carries a pdf-parse implementation.

## Screenshot targets
- `/` — animated landing page (Spotlight, flipping hero text, floating dock, and the pay-me QR modal).
- `/resume` — the core flow: dropzone upload, multi-step loader, then the Feedback tab (score, keywords, bullet rewrites) and Interview tab; also worth capturing the `MockBadge` state and `UpgradePopup`.
- Runs locally with no secrets: without `HF_TOKEN` every analysis returns labeled mock data, which is fine for screenshots. Commands: `npm install && npm run dev` (add `HF_TOKEN=hf_...` in `.env.local` for real LLM output; optional `HF_TOKEN_FEEDBACK` / `HF_TOKEN_QUESTIONS`).
- No live URL in the repo (Vercel Analytics is wired, suggesting a Vercel deployment exists — author to confirm).

## Gaps
- Live deployment URL not present in the repo — confirm where it's hosted.
- `openai`, `@google/genai`, `@google/generative-ai`, and `razorpay` are dependencies but appear unused in `src/` — confirm whether payments/Gemini were planned or abandoned.
- The in-memory file store's behavior on Vercel serverless (cross-invocation Map loss) — has this been observed in production, and is that why so much logging exists in `fileStore.ts`?
- No `.env.example` file; env vars documented only in the README (`HF_TOKEN`, `HF_TOKEN_FEEDBACK`, `HF_TOKEN_QUESTIONS`).
- No tests or CI found.
