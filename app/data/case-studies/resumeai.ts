import type { CaseStudy } from "./types";

export const resumeai: CaseStudy = {
  slug: "resumeai",
  heroImage: "/case-studies/resumeai/hero.png",
  tldr: "Resume AI is a GenAI resume optimizer: drop in your resume plus the job description you're targeting, and get recruiter-style feedback — a decimal score out of 10, missing keywords, STAR-method bullet rewrites — alongside interview questions generated from your actual resume and JD. There are no accounts and no database: files live in an in-memory store with a 30-minute TTL, parsing is deterministic regex work, and only the two LLM calls hit HuggingFace's free tier. When the free quota runs out, the app doesn't break — it serves clearly-labeled mock data and shows an 'upgrade' popup that is, in reality, a pay-what-you-want UPI QR code.",
  architecture: {
    intro:
      "One Next.js 15 app with four API routes forming a client-driven pipeline: upload buffers the file into a module-level Map with a 30-minute TTL and returns a fileId; parse extracts text (pdf2json or mammoth) and runs a ~150-line hand-written regex parser that splits out name, contact, and sections, even chunking experience entries on month/year boundaries. The structured resume plus JD feed two LLM routes that call Qwen3-80B via HuggingFace's Novita provider, retry 503s with backoff, fall back to Llama-3.3-70B on overload, and — on quota exhaustion — return mock data flagged isMock: true that the UI surfaces with a visible badge.",
    diagram: {
      nodes: [
        { id: "ui", label: "Next.js UI (/resume: Feedback + Interview tabs)", kind: "client" },
        { id: "upload", label: "POST /api/upload", kind: "service" },
        { id: "store", label: "In-memory fileStore (Map, 30-min TTL)", kind: "cache" },
        { id: "parse", label: "POST /api/parse (pdf2json / mammoth + regex)", kind: "service" },
        { id: "feedback", label: "POST /api/feedback", kind: "service" },
        { id: "interview", label: "POST /api/interview", kind: "service" },
        { id: "hf", label: "HuggingFace (Qwen3-80B, Llama-3.3 fallback)", kind: "external" },
        { id: "mock", label: "Mock data fallback (isMock: true)", kind: "service" },
        { id: "pdf", label: "jsPDF + html2canvas export (client-side)", kind: "client" },
      ],
      edges: [
        { from: "ui", to: "upload", label: "resume file" },
        { from: "upload", to: "store", label: "save buffer → fileId" },
        { from: "ui", to: "parse", label: "fileId" },
        { from: "parse", to: "store", label: "read buffer" },
        { from: "ui", to: "feedback", label: "parsedResume + JD" },
        { from: "feedback", to: "hf", label: "chat completion (retry + fallback)" },
        { from: "interview", to: "hf", label: "generate questions" },
        { from: "feedback", to: "mock", label: "on quota / API failure" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 15 + React 19",
      role: "Full-stack framework",
      why: "API routes colocate the whole pipeline with the UI — no separate backend to host.",
    },
    {
      tech: "HuggingFace Inference",
      role: "Feedback + interview questions",
      why: "Free-tier access to 80B-class open models via the Novita provider instead of paid OpenAI or Gemini.",
    },
    {
      tech: "pdf2json / mammoth",
      role: "PDF and DOCX extraction",
      why: "Pure-JS extraction inside the Node runtime, no native binaries to install.",
    },
    {
      tech: "In-memory Map",
      role: "Ephemeral file storage",
      why: "Resumes are sensitive; a 30-minute TTL and process memory are the entire storage story — nothing is persisted.",
    },
    {
      tech: "Framer Motion + Aceternity-style UI",
      role: "Landing page polish",
      why: "Spotlight, text-flip, and floating-dock flair from copy-in components rather than a library dependency.",
    },
    {
      tech: "jsPDF + html2canvas",
      role: "Client-side PDF export",
      why: "The report is screenshotted from the DOM in the browser — no Puppeteer, no server CPU.",
    },
    {
      tech: "react-dropzone",
      role: "File upload UX",
      why: "Drag-and-drop with type filtering out of the box.",
    },
    {
      tech: "Vercel Analytics",
      role: "Usage tracking",
      why: "A one-line drop-in for a Vercel-hosted app.",
    },
  ],
  dataModel: {
    intro:
      "There is no database of any kind — the only persistent-ish state is one in-memory Map of uploaded file buffers keyed by UUID, swept lazily with a 30-minute TTL. The interesting 'model' is the pipeline's data shapes: parse produces a ParsedResume (raw text capped at 5,000 characters for the LLM, plus structured name, contact, skills, and heuristically-split experience entries), and the feedback route forces the LLM to emit a strictly-typed JSON Feedback object via the system prompt. Mock twins of both shapes exist for the quota-exhausted fallback.",
    diagram: {
      entities: [
        {
          name: "FileEntry (in-memory Map)",
          fields: ["id: randomUUID", "buffer: Buffer", "filename / mimeType", "uploadedAt (30-min TTL)"],
        },
        {
          name: "ParsedResume (transient)",
          fields: ["rawText (capped 5000 chars)", "structured.name / contact", "structured.skills[]", "experience[] (title, company, bullets)"],
        },
        {
          name: "Feedback (LLM JSON)",
          fields: ["score (decimal /10)", "tldr", "suggestions[] / keywords[]", "exampleBullets[]", "isMock flag"],
        },
        {
          name: "InterviewQuestions (LLM JSON)",
          fields: ["question", "category", "isMock flag (route-level)"],
        },
      ],
      relations: [
        { from: "FileEntry (in-memory Map)", to: "ParsedResume (transient)", label: "parsed by /api/parse" },
        { from: "ParsedResume (transient)", to: "Feedback (LLM JSON)", label: "+ JD → /api/feedback" },
        { from: "ParsedResume (transient)", to: "InterviewQuestions (LLM JSON)", label: "+ JD → /api/interview" },
      ],
    },
  },
  decisions: [
    {
      chose: "an in-memory file store",
      over: "S3 or a database",
      body: "Resume buffers live in a process-local Map with a 30-minute TTL — uploads never touch disk or a third party, which is both a privacy stance and zero infrastructure. The tradeoff is real: serverless can route upload and parse to different lambda instances, 404ing the fileId — which is exactly why the routes pin runtime = 'nodejs' and the store logs its size on every operation.",
    },
    {
      chose: "regex resume parsing",
      over: "LLM extraction",
      body: "Sections are found by heading keywords and experience entries split on month/year regexes. It's free, instant, and deterministic, saving the only LLM spend for the two calls users actually see value from. The cost is brittleness on creatively formatted resumes — the first non-empty line is simply assumed to be your name.",
    },
    {
      chose: "mock-data fallback",
      over: "a hard error",
      body: "Both LLM routes catch failures and return pre-baked results tagged isMock: true, rendered with a visible badge. For a free app riding free-tier quotas, the demo must never show a recruiter a 500 — and honesty is preserved by labeling the data rather than pretending it's real.",
    },
    {
      chose: "HuggingFace via Novita with a fallback chain",
      over: "OpenAI",
      body: "The client targets Qwen3-80B, retries 503s with linear backoff, swaps to Llama-3.3-70B on overload, and even splits feedback and interview traffic across separate tokens so one feature exhausting its quota doesn't kill the other. That's a lot of resilience machinery whose entire purpose is running an 80B-class model for $0 — while the installed-but-unused openai and razorpay packages sit as evidence of roads not taken.",
    },
    {
      chose: "client-side PDF export",
      over: "server rendering",
      body: "html2canvas plus jsPDF snapshot the rendered feedback into a PDF in the browser. No Puppeteer, no server CPU, works on static hosting — the tradeoff is a raster screenshot rather than a selectable-text PDF.",
    },
  ],
  funFacts: [
    "The monetization strategy is a meme: hitting the API limit opens an 'upgrade' popup showing Gareeb.png (Hindi for 'broke') with a UPI QR code captioned 'Scan the QR code and pay me whatever you want' — pay-what-you-want as the entire pricing page.",
    "The README's setup section accidentally reveals a previous name: 'Follow these steps to set up Daddy AI locally.'",
    "The code has bilingual comments — src/lib/hugingface.ts (yes, the filename is misspelled) opens with '// Alag clients for different services' (alag = separate in Hindi).",
    "The feedback prompt explicitly engineers against LLM tics: it demands varied decimals like 7.3 and 8.7 — 'do not use fixed increments' — and bans 'roasting' language.",
    "Quota detection is string-sniffing: ten substrings including 'billing' and 'subscription' matched against error messages, plus status codes 403/429/503.",
    "Three different PDF libraries are installed; the live route uses pdf2json while a helper file still carries a whole pdf-parse implementation.",
  ],
};
