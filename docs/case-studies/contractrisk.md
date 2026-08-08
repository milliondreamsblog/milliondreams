# Contract-Risk.ai (AndhaKanoon / aiLegal)

## Overview
Contract-Risk.ai is an "AI legal sentinel" for Indian freelancers: it ingests a contract (PDF, DOCX, TXT, or a photo of one), detects predatory clauses, and returns a deterministic 0-100 risk score with plain-language explanations from both the freelancer's and the company's perspective, in English or Hindi. Its defining feature is that every finding is grounded in the Indian Contract Act, 1872 — all 225 sections are seeded into a local knowledge base, and violations link back to the specific section (e.g. non-compete clauses flagged as void under Section 27). Detection is hybrid: rule-based keyword/regex matching plus semantic similarity search over embedded clause patterns in ChromaDB, merged and re-weighted by contract context (freelance vs employment, industry, contract value). It also includes a contract drafting side: AI-generated contracts from templates, a clause library, signature storage, and Puppeteer-rendered PDF export emailed via Gmail SMTP.

## Architecture
This is a Next.js 15 App Router monolith where all intelligence lives in server-side services under `lib/services/`. The analysis pipeline (`app/api/analyze/route.ts`, ~500 lines) runs: `extractor.service.ts` (pdf-parse / mammoth / Tesseract.js OCR by MIME type, with magic-byte validation via `file-type`) → `parser.service.ts` (splits into numbered clauses) → two parallel validators: `indianLawValidator.service.ts` (keyword/regex matching against `clause_patterns` rows in a better-sqlite3 database seeded from the Act) and `semanticValidator.service.ts` (clause embeddings via HuggingFace `all-mpnet-base-v2`, cosine-matched against pattern embeddings in ChromaDB, cloud or Docker). Results are merged with keyword priority and deduplicated per clause, then `scorer.service.ts` applies industry/contract-type weight matrices and value/duration modifiers to produce the score, `deviationChecker.service.ts` compares against a fair-contract baseline, and `explainer.service.ts` asks a HuggingFace chat model for dual-perspective ELI5 explanations. Persistence is three-tiered: SQLite for the legal knowledge base and analytics, Supabase Postgres via Prisma for users and saved analyses (Clerk handles auth in `middleware.ts`), and ChromaDB for vectors. Reports render to PDF via Puppeteer (`app/api/generate-pdf/route.ts`) and go out through Nodemailer (`app/api/send-report/route.ts`). An in-memory token-bucket rate limiter (`lib/api/rateLimit.ts`) guards each authenticated route.

### Diagram spec
```json
{
  "nodes": [
    {"id": "browser", "label": "Next.js UI (upload / result / dashboard)", "kind": "client"},
    {"id": "api", "label": "Next.js API routes (analyze, contracts, generate-pdf)", "kind": "service"},
    {"id": "pipeline", "label": "Analysis pipeline (extract → parse → validate → score → explain)", "kind": "service"},
    {"id": "sqlite", "label": "SQLite: Indian Contract Act + clause patterns", "kind": "db"},
    {"id": "chroma", "label": "ChromaDB (clause_patterns embeddings)", "kind": "db"},
    {"id": "pg", "label": "Supabase Postgres (Prisma: User, SavedAnalysis)", "kind": "db"},
    {"id": "hf", "label": "HuggingFace Inference (embeddings + chat)", "kind": "external"},
    {"id": "clerk", "label": "Clerk auth", "kind": "external"},
    {"id": "smtp", "label": "Gmail SMTP (Nodemailer)", "kind": "external"}
  ],
  "edges": [
    {"from": "browser", "to": "api", "label": "upload contract / fetch results"},
    {"from": "api", "to": "pipeline", "label": "run analysis"},
    {"from": "pipeline", "to": "sqlite", "label": "keyword patterns + Act sections"},
    {"from": "pipeline", "to": "chroma", "label": "semantic similarity search"},
    {"from": "pipeline", "to": "hf", "label": "embed clauses / ELI5 explanations"},
    {"from": "api", "to": "pg", "label": "save analyses per user"},
    {"from": "browser", "to": "clerk", "label": "sign-in / session"},
    {"from": "api", "to": "smtp", "label": "email PDF report"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| Next.js 15 (App Router) + TypeScript | Full-stack framework | Single deployable for UI + heavy server-side pipeline; server routes keep contracts off the client |
| better-sqlite3 | Legal knowledge base (Act sections, clause patterns, analytics) | The Act is static reference data — an embedded, zero-latency, synchronous DB fits perfectly |
| Prisma + Supabase Postgres | User accounts and saved analyses | Multi-user durable data needs a real hosted DB; pooled + direct URLs for runtime vs migrations |
| ChromaDB (Cloud or local Docker) | Vector store for clause-pattern embeddings | Purpose-built vector search; dual-mode client (`lib/db/chromaClient.ts`) keeps local dev free |
| HuggingFace Inference (`all-mpnet-base-v2` + chat model) | Embeddings and explanation generation | Free-tier friendly; `huggingface.service.ts` rotates between HF_TOKEN and HF_TOKEN1 on rate limits |
| Clerk | Authentication | Drop-in auth with Next.js middleware; user IDs flow into Prisma and rate-limit keys |
| Tesseract.js + pdf-parse + mammoth | Multi-format text extraction | Covers PDF, DOCX, and photographed contracts entirely in Node, no external OCR API |
| Puppeteer | PDF report rendering | Headless-Chrome print of the styled report page gives pixel-faithful exports |
| Nodemailer (Gmail SMTP) | Report delivery | Simplest free path to "email me my risk report" |
| Tailwind CSS v4 + Radix UI + Recharts | UI and risk visualizations | shadcn-style components; Recharts drives the risk score meter/charts |

## Data model
The system deliberately splits data by lifecycle across three stores. SQLite (`lib/db/schema.sql`) holds the immutable legal corpus and analytics: `act_sections` (all 225 sections of the Indian Contract Act with plain-English summaries and page numbers from the 53-page government PDF), `clause_patterns` (detection rules with keywords, regex, risk scores, per-context modifiers, and English/Hindi explanations, each linked to a section), `fair_contract_baseline` (what "fair" looks like per clause category, with red-flag thresholds), `explanation_templates`, plus `contract_analysis_context` and `violation_feedback` for anonymous analytics and accuracy tracking. The drafting feature adds `contracts`, `signatures` (base64 PNG images), `clause_library`, and `contract_templates` with `{{PARTY_A}}`-style placeholders. Postgres via Prisma (`prisma/schema.prisma`) holds only the multi-user data: `User` (Clerk ID as primary key, freelancer/business role) and `SavedAnalysis` (full contract text plus the analysis result serialized as a JSON string, risk score, tags). ChromaDB stores one collection, `clause_patterns`, of 768-dim mpnet embeddings generated from each pattern's `semantic_examples` by `scripts/generateEmbeddings.ts`.

### DB diagram spec
```json
{
  "entities": [
    {"name": "act_sections (SQLite)", "fields": ["section_number (unique)", "section_title", "full_text", "summary", "gov_url"]},
    {"name": "clause_patterns (SQLite)", "fields": ["pattern_id", "keywords (JSON)", "regex_pattern", "risk_level / risk_score", "linked_section → act_sections", "explanation_en / explanation_hi"]},
    {"name": "contract_analysis_context (SQLite)", "fields": ["analysis_id", "contract_type / industry", "contract_value_inr", "risk_score", "keyword_matches / semantic_matches"]},
    {"name": "User (Postgres)", "fields": ["id (Clerk ID)", "email", "role: freelancer|business", "createdAt"]},
    {"name": "SavedAnalysis (Postgres)", "fields": ["id (uuid)", "userId → User", "contentText", "analysisJson", "riskScore", "tags[]"]},
    {"name": "clause_patterns (ChromaDB)", "fields": ["768-d mpnet embedding", "pattern_id metadata", "risk metadata"]}
  ],
  "relations": [
    {"from": "clause_patterns (SQLite)", "to": "act_sections (SQLite)", "label": "linked_section FK"},
    {"from": "SavedAnalysis (Postgres)", "to": "User (Postgres)", "label": "belongs to"},
    {"from": "clause_patterns (ChromaDB)", "to": "clause_patterns (SQLite)", "label": "embeddings of semantic_examples"},
    {"from": "contract_analysis_context (SQLite)", "to": "clause_patterns (SQLite)", "label": "violation_feedback per pattern"}
  ]
}
```

## Why this, not that

### Why hybrid keyword + semantic detection, not pure LLM analysis
Instead of handing the contract to an LLM and trusting its judgment, detection is rules-first: keyword/regex patterns in SQLite catch known predatory language deterministically, and ChromaDB semantic search catches paraphrases the rules miss. `mergeResults` in `app/api/analyze/route.ts` gives keyword matches priority and tags each violation as `keyword`, `semantic`, or `both` — so the risk score is reproducible and every hit cites a real section of law, while the LLM is confined to explaining findings, where hallucination is low-stakes.

### Why three databases, not one
SQLite holds the static legal corpus (fast, embedded, ships with the repo via `npm run seed`), Postgres holds per-user durable data (needs to survive deployments and scale), and ChromaDB holds vectors (needs similarity search neither of the others does well). The cost is real operational complexity — three connection layers in `lib/db/` — but each store is doing the one job it's best at, and local dev works with just the SQLite piece.

### Why a deterministic weighted scorer, not an LLM-assigned score
`scorer.service.ts` computes the 0-100 score from per-section base scores multiplied by industry weight matrices (e.g. Section 27 non-compete weighted 1.5x for freelancers but 0.7x for employees, whose salary continues) plus contract-value and duration modifiers. The same contract always scores the same — essential for a tool whose output users may act on — whereas an LLM score would drift run to run and be unexplainable.

### Why HuggingFace inference with token rotation, not the Gemini SDK
Although `@google/generative-ai` is in `package.json` and the README says Gemini 2.0 Flash, the live code paths (`explainer.service.ts`, `contractGenerator.service.ts`) all call `huggingface.service.ts`, which rotates between `HF_TOKEN` and `HF_TOKEN1` when one gets rate-limited. This trades model quality for a genuinely free inference tier with built-in failover — a pragmatic pivot the docs haven't caught up with.

### Why in-memory rate limiting, not Redis
`lib/api/rateLimit.ts` is a hand-rolled Map-based token bucket keyed by `${route}:${userId}`, with its own comment admitting counters reset on serverless cold starts and don't share across instances. For a single-server deployment it's a zero-dependency abuse brake; the file itself documents the upgrade path ("swap for @upstash/ratelimit + Redis once the app moves to Vercel").

## Fun facts
- The repo contains a brutally honest self-audit, `AUDIT_REPORT.md`, dated 2026-05-09, that rates the codebase "Overall Risk: CRITICAL — ship-blocking auth gaps + committed production secrets" and flags an XSS risk in the contract editor. The current code shows the remediation happened: routes now call `requireAuth` + `checkRateLimit`, and `.env.example` warns "Never commit real secrets."
- The ground truth is a real government artifact: `data/indian_contract_act.pdf` (the 53-page Act) is committed to the repo, and every violation links to the official indiacode.nic.in PDF URL.
- The repo ships a deliberately predatory test fixture, `data/test_predatory_contract.txt`, alongside `data/fair_contract_template.txt` for demoing the score spread.
- Clause explanations are generated in one LLM call that returns both the freelancer's and the company's perspective, and the schema carries parallel `explanation_en` / `explanation_hi` columns for Hindi support.
- The analysis pipeline logs like a flight recorder: box-drawing-character banners such as `[MERGE] ═══...` and emoji-tagged lines for every clause decision, making the hybrid merge auditable from the server console.
- File uploads are validated by magic bytes (`file-type` on the buffer), not just extension — a photo renamed to `.pdf` won't sneak through the wrong parser.

## Screenshot targets
- `/` — landing page (Hero, Features).
- `/result` after analyzing `data/test_predatory_contract.txt` — risk score meter, violation cards with section citations, the money shot.
- `/compare` — fair-contract deviation view; `/create-contract` — AI drafting editor; `/dashboard` — saved analyses.
- Cannot run meaningfully without secrets: requires `GEMINI_API_KEY`/HF tokens, Clerk keys, Supabase `DATABASE_URL`, and Chroma credentials per `.env.example` (local Docker Chroma via `CHROMA_URL=http://localhost:8000` avoids one cloud dependency). Setup: `npm install`, copy `.env.example` to `.env`, `npm run seed` (builds SQLite from the Act PDF), `npm run generate-embeddings`, then `npm run dev`.
- No live URL found in the repo.

## Gaps
- README/AUDIT say Gemini 2.0 Flash, and the SDK is installed, but no `GoogleGenerativeAI` usage was found in `lib/` or `app/` — confirm whether Gemini was fully replaced by HuggingFace or is used somewhere unsearched.
- No live deployment URL; author should confirm hosting status and whether the audit's "committed production secrets" were rotated.
- Which HuggingFace chat model `DEFAULT_MODEL` resolves to (checked only the header of `huggingface.service.ts`), and typical end-to-end analysis latency.
- Hindi explanations: schema columns exist (`explanation_hi`, `base_explanation_hi`) but how complete the Hindi corpus is is unclear.
- No automated tests found; unclear how detection accuracy is measured beyond the `violation_feedback` table.
