import type { CaseStudy } from "./types";

export const contractrisk: CaseStudy = {
  slug: "contractrisk",
  tldr: "Contract-Risk.ai is an AI legal sentinel for Indian freelancers: feed it a contract — PDF, DOCX, or even a photo of one — and it flags predatory clauses with a deterministic 0-100 risk score and plain-language explanations from both sides of the table, in English or Hindi. Every finding is grounded in the Indian Contract Act, 1872: all 225 sections are seeded into a local knowledge base, so a non-compete clause gets flagged as void under Section 27, not just 'looks risky'. Detection is hybrid — keyword/regex rules plus semantic similarity over embedded clause patterns — and the LLM is confined to explaining findings, never inventing them. There's a drafting side too: template-generated contracts, a clause library, and Puppeteer-rendered PDF reports emailed via Gmail.",
  architecture: {
    intro:
      "A Next.js 15 App Router monolith where all the intelligence lives in server-side services. The analysis route runs a pipeline: multi-format extraction (with magic-byte validation) → clause splitting → two parallel validators — keyword/regex against SQLite-seeded patterns from the Act, and mpnet embeddings cosine-matched in ChromaDB — merged with keyword priority, then a deterministic weighted scorer, a fair-contract deviation check, and finally an LLM pass for dual-perspective ELI5 explanations. Persistence is deliberately three-tiered: SQLite for the immutable legal corpus, Supabase Postgres via Prisma for users and saved analyses, ChromaDB for vectors.",
    diagram: {
      nodes: [
        { id: "browser", label: "Next.js UI (upload / result / dashboard)", kind: "client" },
        { id: "api", label: "API routes (analyze, contracts, generate-pdf)", kind: "service" },
        { id: "pipeline", label: "Pipeline (extract → parse → validate → score → explain)", kind: "service" },
        { id: "sqlite", label: "SQLite: Indian Contract Act + clause patterns", kind: "db" },
        { id: "chroma", label: "ChromaDB (clause-pattern embeddings)", kind: "db" },
        { id: "pg", label: "Supabase Postgres (User, SavedAnalysis)", kind: "db" },
        { id: "hf", label: "HuggingFace Inference (embed + chat)", kind: "external" },
        { id: "clerk", label: "Clerk auth", kind: "external" },
        { id: "smtp", label: "Gmail SMTP (Nodemailer)", kind: "external" },
      ],
      edges: [
        { from: "browser", to: "api", label: "upload contract / fetch results" },
        { from: "api", to: "pipeline", label: "run analysis" },
        { from: "pipeline", to: "sqlite", label: "keyword patterns + Act sections" },
        { from: "pipeline", to: "chroma", label: "semantic similarity search" },
        { from: "pipeline", to: "hf", label: "embed clauses / ELI5 explanations" },
        { from: "api", to: "pg", label: "save analyses per user" },
        { from: "browser", to: "clerk", label: "sign-in / session" },
        { from: "api", to: "smtp", label: "email PDF report" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 15 + TypeScript",
      role: "Full-stack framework",
      why: "One deployable for the UI and the heavy server-side pipeline — contracts never leave the server.",
    },
    {
      tech: "better-sqlite3",
      role: "Legal knowledge base",
      why: "The Act is static reference data, and an embedded synchronous zero-latency DB fits it perfectly.",
    },
    {
      tech: "Prisma + Supabase Postgres",
      role: "Users and saved analyses",
      why: "Multi-user durable data deserves a real hosted database that survives deployments.",
    },
    {
      tech: "ChromaDB",
      role: "Clause-pattern vector store",
      why: "Purpose-built similarity search, with a dual-mode client so local dev runs on free Docker.",
    },
    {
      tech: "HuggingFace Inference",
      role: "Embeddings + explanations",
      why: "Free-tier friendly, with the service rotating between two tokens when one gets rate-limited.",
    },
    {
      tech: "Clerk",
      role: "Authentication",
      why: "Drop-in Next.js middleware auth; user IDs flow straight into Prisma and rate-limit keys.",
    },
    {
      tech: "Tesseract.js + pdf-parse + mammoth",
      role: "Multi-format extraction",
      why: "PDF, DOCX, and photographed contracts handled entirely in Node — no external OCR API.",
    },
    {
      tech: "Puppeteer",
      role: "PDF report rendering",
      why: "Headless-Chrome print of the styled report page gives pixel-faithful exports.",
    },
    {
      tech: "Tailwind v4 + Radix + Recharts",
      role: "UI and risk visualizations",
      why: "shadcn-style components with Recharts driving the risk-score meter and charts.",
    },
  ],
  dataModel: {
    intro:
      "Data is split by lifecycle across three stores. SQLite holds the immutable corpus: all 225 sections of the Indian Contract Act (summarized from the 53-page government PDF), the clause-pattern detection rules with per-context risk modifiers and parallel English/Hindi explanations, a fair-contract baseline, and anonymous analytics tables. Postgres holds only what must be durable and per-user — accounts keyed by Clerk ID and saved analyses. ChromaDB holds one collection of 768-dim mpnet embeddings generated from each pattern's semantic examples.",
    diagram: {
      entities: [
        {
          name: "act_sections (SQLite)",
          fields: ["section_number (unique)", "section_title", "full_text / summary", "gov_url"],
        },
        {
          name: "clause_patterns (SQLite)",
          fields: ["keywords (JSON)", "regex_pattern", "risk_level / risk_score", "linked_section → act_sections", "explanation_en / explanation_hi"],
        },
        {
          name: "contract_analysis_context (SQLite)",
          fields: ["contract_type / industry", "contract_value_inr", "risk_score", "keyword vs semantic matches"],
        },
        {
          name: "User (Postgres)",
          fields: ["id (Clerk ID)", "email", "role: freelancer | business"],
        },
        {
          name: "SavedAnalysis (Postgres)",
          fields: ["userId → User", "contentText", "analysisJson", "riskScore", "tags[]"],
        },
        {
          name: "clause_patterns (ChromaDB)",
          fields: ["768-d mpnet embedding", "pattern_id metadata", "risk metadata"],
        },
      ],
      relations: [
        { from: "clause_patterns (SQLite)", to: "act_sections (SQLite)", label: "linked_section FK" },
        { from: "SavedAnalysis (Postgres)", to: "User (Postgres)", label: "belongs to" },
        { from: "clause_patterns (ChromaDB)", to: "clause_patterns (SQLite)", label: "embeddings of semantic_examples" },
        { from: "contract_analysis_context (SQLite)", to: "clause_patterns (SQLite)", label: "feedback per pattern" },
      ],
    },
  },
  decisions: [
    {
      chose: "hybrid keyword + semantic detection",
      over: "pure LLM analysis",
      body: "Rules first: keyword/regex patterns catch known predatory language deterministically, and ChromaDB semantic search catches the paraphrases rules miss. The merge step gives keywords priority and tags every violation as keyword, semantic, or both — so the risk score is reproducible and every hit cites a real section of law. The LLM is confined to explaining findings, where a hallucination is low-stakes.",
    },
    {
      chose: "three databases",
      over: "one",
      body: "SQLite ships the static legal corpus with the repo, Postgres holds per-user data that must survive deployments, and ChromaDB does the one thing neither does well: similarity search. The cost is real — three connection layers to maintain — but each store does the single job it's best at, and local dev works with just the SQLite piece.",
    },
    {
      chose: "a deterministic weighted scorer",
      over: "an LLM-assigned score",
      body: "The 0-100 score is per-section base scores times industry weight matrices — Section 27 non-compete weighted 1.5x for freelancers but 0.7x for employees, whose salary continues — plus contract-value and duration modifiers. The same contract always scores the same, which is essential for output users may actually act on. An LLM score would drift run to run and be unexplainable.",
    },
    {
      chose: "HuggingFace with token rotation",
      over: "the Gemini SDK",
      body: "The Gemini SDK is installed and the README still says Gemini 2.0 Flash, but the live code paths all call the HuggingFace service, which rotates between two tokens when one gets rate-limited. It trades model quality for a genuinely free inference tier with built-in failover — a pragmatic pivot the docs haven't caught up with.",
    },
    {
      chose: "in-memory rate limiting",
      over: "Redis",
      body: "A hand-rolled Map-based token bucket keyed by route and user, with its own comment admitting counters reset on serverless cold starts. For a single-server deployment it's a zero-dependency abuse brake, and the file documents its own upgrade path: swap for Upstash + Redis once the app moves to Vercel.",
    },
  ],
  funFacts: [
    "The repo contains a brutally honest self-audit, AUDIT_REPORT.md, rating the codebase 'Overall Risk: CRITICAL' — and the current code shows the remediation happened: routes now enforce auth and rate limits, and .env.example warns 'Never commit real secrets.'",
    "The ground truth is a real government artifact: the 53-page Indian Contract Act PDF is committed to the repo, and every violation links back to the official indiacode.nic.in URL.",
    "It ships a deliberately predatory test contract alongside a fair-contract template, purely for demoing the score spread.",
    "Explanations come from one LLM call that returns both the freelancer's and the company's perspective, and the schema carries parallel explanation_en / explanation_hi columns for Hindi support.",
    "The pipeline logs like a flight recorder: box-drawing-character banners and emoji-tagged lines for every clause decision, making the hybrid merge auditable from the server console.",
    "Uploads are validated by magic bytes on the buffer, not file extension — a photo renamed to .pdf won't sneak into the wrong parser.",
  ],
};
