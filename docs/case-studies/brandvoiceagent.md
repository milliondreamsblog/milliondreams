# BrandVoiceAgent

## Overview
BrandVoiceAgent (repo name `bricx-tone`, live as "tone-app") is an AI brand-voice critic and rewrite engine built for Bricx Labs, a design agency. A writer (Siddharth/Akshat) drafts social posts; the app judges each draft against a 19-rule voice system codified from the founder Divij's approved posts, then generates three publish-ready rewrites (A minimal fix, B reangled, C sharpest) in his voice. Divij reviews, picks, edits, and plays a this-or-that calibration game, and every signal is promoted into a `taste_examples` table that retrieval feeds back into the next generation call. The team calls this the "Compounding Taste Loop" (HANDOFF.md): the more the founder reviews, the more the model writes like him. It replaces the founder as a copy bottleneck while keeping him as the taste authority.

## Architecture
The system is a single Next.js 15 App Router application (package.json) with seven client pages (`app/write`, `app/review`, `app/train`, `app/ideas`, `app/library`, `app/competitors`, and the critic at `app/page.tsx`) talking to API routes under `app/api/`. All voice work funnels through one asset: the ~7.4K-token rubric at `tone-agent/voice-critic.system.md`, which is read from disk by every model-calling module (`lib/voiceCritic.ts`, `lib/generateRewrites.ts`, `app/api/rewrites/rehook/route.ts`, `scripts/genPairs.ts`) and sent as a prompt-cached system block via `cachedSystem()` in `lib/anthropic.ts`. The 19 rules are enforced in the prompt, not in code; what code enforces is the output contract: every call uses Anthropic structured outputs (`output_config.format: json_schema`) against schemas in `lib/schema.ts` and `lib/genSchema.ts`, and post-processing in `lib/persistRewrites.ts` de-duplicates labels and repairs the recommended pick.

Data flow: `/write` POSTs drafts to `app/api/posts/route.ts`, which persists them to Neon Postgres (Drizzle, `lib/db/schema.ts`), then generates three rewrites per post with `claude-opus-4-8`. Generation is taste-aware: `lib/retrieve.ts` does bucket-first keyword-overlap retrieval over `taste_examples` and injects the top 4 before/after pairs as a volatile system block. `/review` renders the queue; a "pick" reaction (`app/api/reactions/route.ts`) marks the post reviewed and promotes the chosen (or hand-edited) text into `taste_examples` with `source='flywheel'`. `/train` serves pre-generated contrast pairs from `taste_pairs` (built offline by `scripts/genPairs.ts` on Haiku) and logs picks to `taste_choices`, promoting winners with `source='game'`. `/ideas` mines idea seeds from pasted brain-dumps on Haiku (`lib/extractIdeas.ts`) and drafts approved seeds through the same Opus pipeline. Media uploads go browser-direct to Cloudflare R2 via presigned PUT URLs (`app/api/upload/route.ts`, `lib/r2.ts`); a legacy chat-push review queue stores draft JSON in Vercel Blob (`app/api/drafts/route.ts`, fed by the Claude Code slash command `.claude/commands/critique.md`). `scripts/e2e.ts` is a 111-assertion pre-deploy gate that drives the real HTTP endpoints and verifies side effects directly in Neon.

### Diagram spec
```json
{
  "nodes": [
    {"id": "ui", "label": "Next.js pages (write / review / train / ideas / critic)", "kind": "client"},
    {"id": "api", "label": "Next.js API routes (posts, reactions, train, ideas, rehook, critique)", "kind": "service"},
    {"id": "genlib", "label": "Generation pipeline (generateRewrites + retrieve + persistRewrites)", "kind": "service"},
    {"id": "opus", "label": "Claude Opus 4.8 (voice: generate / critique / rehook)", "kind": "external"},
    {"id": "haiku", "label": "Claude Haiku 4.5 (ideation + pair generation)", "kind": "external"},
    {"id": "neon", "label": "Neon Postgres (Drizzle)", "kind": "db"},
    {"id": "blob", "label": "Vercel Blob (chat-pushed draft queue)", "kind": "db"},
    {"id": "r2", "label": "Cloudflare R2 (media, presigned PUT)", "kind": "external"},
    {"id": "scripts", "label": "Offline scripts (seed, genPairs, e2e gate)", "kind": "service"}
  ],
  "edges": [
    {"from": "ui", "to": "api", "label": "fetch JSON"},
    {"from": "api", "to": "genlib", "label": "submit draft / draft idea"},
    {"from": "genlib", "to": "neon", "label": "retrieve taste_examples, persist rewrites"},
    {"from": "genlib", "to": "opus", "label": "cached rubric + calibration, structured output"},
    {"from": "api", "to": "haiku", "label": "extract idea seeds"},
    {"from": "api", "to": "neon", "label": "posts, reactions, picks, train choices"},
    {"from": "api", "to": "blob", "label": "legacy /api/drafts JSON"},
    {"from": "ui", "to": "r2", "label": "browser uploads bytes via presigned URL"},
    {"from": "scripts", "to": "neon", "label": "seed examples, generate taste_pairs, verify e2e"},
    {"from": "scripts", "to": "haiku", "label": "genPairs contrast pairs"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
| --- | --- | --- |
| Next.js 15 App Router + React 19 | Full-stack app: 7 pages plus all API routes | One deployable on Vercel; `maxDuration = 300` on generation routes covers parallel Opus calls (app/api/posts/route.ts) |
| Anthropic Claude Opus 4.8 (`@anthropic-ai/sdk`) | All founder-facing voice output: generate, critique, rehook | HANDOFF.md decision log: "Keep production on Claude Opus 4.8... never silently switch prod"; `TONE_MODEL` env override for cheap test runs (lib/anthropic.ts) |
| Claude Haiku 4.5 | Idea extraction and /train pair generation | "NOT voice work" (lib/extractIdeas.ts); calibration pairs are training data with structural validators backstopping quality (scripts/genPairs.ts) |
| Structured outputs (`output_config` json_schema) | Guaranteed-parseable critiques, rewrites, hooks, ideas | JSON.parse straight into typed contracts (lib/schema.ts, lib/genSchema.ts); no regex extraction of model prose |
| Neon Postgres + Drizzle ORM (`neon-http`) | System of record: posts, rewrites, reactions, taste tables | Serverless-friendly HTTP driver; typed schema with FK cascades so deleting a draft "untrains" its example (lib/db/schema.ts) |
| Prompt caching (`cache_control: ephemeral`) | The 7.4K-token rubric cached across all four Opus call sites | Written once per 5-minute window, read at ~10% input cost; batch route sequences the first post alone to write the cache before fanning out (lib/anthropic.ts, app/api/posts/route.ts) |
| Cloudflare R2 (`@aws-sdk/client-s3` presigner) | Image/video attachments | Browser uploads bytes directly via short-lived presigned PUT; files never pass through the serverless function (lib/r2.ts, app/api/upload/route.ts) |
| Vercel Blob | Legacy review-queue storage for drafts pushed from chat | Simple private JSON blobs keyed by id for the `/critique` slash-command flow (app/api/drafts/route.ts); HANDOFF.md now lists it as dead code to prune |
| TanStack Table | /library pagination over examples.json | Client-side paging of the 32-example ground-truth library with custom card rendering (app/library/page.tsx) |
| tsx + dotenv scripts | seed, genPairs, migrate, audit, backup, e2e | Standalone Node scripts parse DATABASE_URL from .env.local and hit Neon directly (scripts/) |

## Data model
The spine (documented at the top of `lib/db/schema.ts`) is `batches -> posts -> rewrites -> reactions`, with `taste_examples` as the flywheel the whole product exists to grow. A `batches` row groups one submission; each `posts` row holds the writer's draft, JSONB media, a `pillar` slug (design / company / experiment, typed against `lib/pillars.ts`), and a status that flips pending -> reviewed on pick. Each post gets three `rewrites` rows (label A/B/C, rationale, 0-100 `publishScore`, `recommended` flag). Every founder signal is one `reactions` row (`like | pick | edit | comment | disapprove`); the pick handler in `app/api/reactions/route.ts` promotes the winning text (preferring the founder's hand-edit) into `taste_examples` with `source='flywheel'`, `pillar` copied from the post, and `sourcePostId` set so an `ON DELETE CASCADE` untrains the example if the draft is deleted.

The /train subsystem adds `taste_pairs` (pre-generated this-or-that pairs, one contrast axis each: hook, length, register, claim_density, opener, rhythm) and `taste_choices` (the pick, denormalized pillar/axis, optional `editedText` hand-refinement, reason chip, strength, session id). A non-"neither" choice also inserts a `taste_examples` row with `source='game'`, storing the rejected side as `original` so the pair becomes a genuine before/after preference signal (app/api/train/choice/route.ts). The `ideas` table is the upstream front-stage: Haiku-mined seeds with bucket, confidence, and grounding `sourceQuote`; drafting an approved idea creates a batch-less post and links `postId` back with `ON DELETE SET NULL` so history survives.

### DB diagram spec
```json
{
  "entities": [
    {"name": "batches", "fields": ["id", "author", "createdAt"]},
    {"name": "posts", "fields": ["id", "batchId", "body", "pillar", "status", "media (jsonb)"]},
    {"name": "rewrites", "fields": ["id", "postId", "label (A|B|C)", "text", "publishScore", "recommended"]},
    {"name": "reactions", "fields": ["id", "postId", "rewriteId", "type (like|pick|edit|comment|disapprove)", "payload"]},
    {"name": "taste_examples", "fields": ["id", "original", "approvedText", "editNotes", "pillar", "source (seed|flywheel|game)"]},
    {"name": "taste_pairs", "fields": ["id", "pillar", "axis", "leftText", "rightText", "source"]},
    {"name": "taste_choices", "fields": ["id", "pairId", "chosen (left|right|neither)", "chosenText", "editedText", "sessionId"]},
    {"name": "ideas", "fields": ["id", "seed", "angle", "bucket", "confidence", "postId"]}
  ],
  "relations": [
    {"from": "posts", "to": "batches", "label": "batchId (cascade delete)"},
    {"from": "rewrites", "to": "posts", "label": "postId (cascade)"},
    {"from": "reactions", "to": "posts", "label": "postId (cascade)"},
    {"from": "reactions", "to": "rewrites", "label": "rewriteId (nullable)"},
    {"from": "taste_examples", "to": "posts", "label": "sourcePostId (cascade = delete untrains)"},
    {"from": "taste_choices", "to": "taste_pairs", "label": "pairId (cascade)"},
    {"from": "ideas", "to": "posts", "label": "postId (set null on delete)"}
  ]
}
```

## Why this, not that

### Why a prompt rubric with structured output, not code-side rule checking
The 19 rules live entirely in `tone-agent/voice-critic.system.md` and are applied by the model; the only rule mechanically checkable in code would be Rule 15 (no em-dashes), and none is. That is deliberate: nearly every rule carries a carve-out that requires judgment (Rule 10 bans manufactured punch but keeps honest reactions like "A ghost lead?"; Rule 1 bans "I" in the body but allows it in the headline), and the system prompt explicitly warns that "false positives destroy trust faster than misses." Code instead enforces the contract around the model: JSON schemas force every finding to carry `{rule, severity, quote, why, fix}` (lib/schema.ts), and `lib/persistRewrites.ts` filters empty/duplicate rewrites and repairs the recommended label.

### Why keyword-overlap retrieval, not embeddings
`lib/retrieve.ts` loads the whole `taste_examples` table and ranks by stop-word-filtered token overlap, with a +0.5 bonus for rows carrying the founder's edit notes. With a corpus of 19 seeds plus a slowly growing flywheel, a vector store is overkill; the file documents the upgrade path ("add a pgvector column... swap the scoring for cosine similarity — same function shape"). The interesting part is the bucket-first tiering added later: in-pillar examples win outright, and null-pillar globals then other pillars only backfill when the bucket is sparse, fixing the cross-bucket taste bleed diagnosed in HANDOFF.md PART 2.

### Why pre-generating three rewrites at submit time, not on-demand in review
`POST /api/posts` generates and persists all rewrites when the writer submits, so the founder's `/review` page is instant reads (schema comment: "pre-generated at submit time so Divij's review page is instant"). The cost of that choice is a long-running route (`maxDuration = 300`) and a wasted-spend risk, which the code bounds with `MAX_BATCH = 20` and a cache-aware sequencing trick: the first post runs alone to write the shared rubric cache, then the rest fan out in parallel as cache reads instead of all paying the 1.25x cache-write premium (app/api/posts/route.ts).

### Why a persisted /train calibration deck, not extending the existing /game quiz
`app/game/page.tsx` is a hardcoded quiz over eight real before/after pairs with a correct answer that saves nothing. HANDOFF.md records the decision to leave it in the tree but build `/train` fresh because the contract is opposite: /train has no right answer (the founder's pick defines correct) and must persist every pick. So `scripts/genPairs.ts` pre-generates ~54 pairs per pillar into `taste_pairs`, each pushing one axis to opposite extremes, and `app/api/train/choice/route.ts` logs every pick and promotes winners (or the founder's hand-refined `editedText`) straight into the live retrieval pool.

### Why named left/right fields, not arrays with length constraints
Both genPairs and the rehook endpoint learned the same SDK truth, recorded in HANDOFF.md: JSON-schema array length constraints are unsupported by structured outputs and silently stripped. So `scripts/genPairs.ts` models a pair as required string fields `left_text`/`right_text` (1:1 with columns), and `app/api/rewrites/rehook/route.ts` accepts an unconstrained `hooks` array and slices to exactly 3 in app code. Counting is done where it is reliable: in TypeScript, not in the schema.

## Fun facts
- The Anthropic account ran out of credits mid-session on demo day: two e2e runs plus a deck regeneration drained the balance, and HANDOFF.md's top blocker is literally "Top up at console.anthropic.com" because every Opus call on prod was returning "credit balance is too low." The deployed code was healthy; the wallet was not.
- That same credit starvation validated a safety guard for real: `scripts/genPairs.ts` has a `MIN_PER_PILLAR = 18` delete-guard floor, and the credit-starved regeneration aborted ("new run too thin") without wiping the live 54-pair deck. The script also carries a `CALL_CAP = 90` hard stop and a per-model price table that prints a cost line, described in-code as "cheapest early-warning against another surprise bill."
- Both `lib/anthropic.ts` and `lib/r2.ts` strip a leading Unicode BOM from env vars (`.replace(/^﻿/, "")`) because "PowerShell-pasted env vars sometimes carry a leading BOM" — a Windows-development war story fossilized as code.
- `lib/rateLimit.ts` opens with the comment "Limits: 2 requests per minute, 20 requests per day" directly above constants set to 10 and 50 — the comment preserves the original $5-budget limits that were later loosened.
- The genPairs contrast validator is structural, not vibes: the `claim_density` axis requires the left side to contain a hard number/date anchor and the right side to contain none, `length` enforces a 140+ character gap, and any pair whose sides share over 60% of words is rejected as "not extremes."
- The rubric file does double duty as a human skill: `.claude/commands/critique.md` turns the same `tone-agent/` specs into a Claude Code slash command that runs critique, rewrites, and distribution in chat, then offers to POST the results to the live app's Blob-backed review queue.

## Screenshot targets
- `/` — the Critic: paste a draft, get verdict + rule-by-rule findings + three rewrites (the original core feature).
- `/review` — the money shot: tweet-styled draft cards with A/B/C RewriteCards, like/edit/comment/pick controls, pillar filter tabs, and the rehook (change-hook) flow.
- `/train` — the calibration game: side-by-side contrast pairs, axis label, reason chips, mild/strong toggle, progress counter.
- `/write` — compose dialog with pillar tagging and media attach.
- `/ideas` — paste a brain-dump or tl;dv transcript, get bucketed idea seeds with confidence scores and source quotes.
- `/library` — the 32-example ground-truth library (annotated before/after pairs plus approved captions) with TanStack pagination; renders entirely from `tone-agent/examples.json`, so it works with no secrets.
- `/competitors` — static competitor snapshot from `lib/competitorData.ts`; also works with no secrets.
- `/game` — the older static voice quiz; still routable but replaced by Train in `app/nav.tsx`.
- Local run requires secrets: per `.env.local.example`, `DATABASE_URL` (Neon) is "Required — the app throws at import without a Neon Postgres URL" and `ANTHROPIC_API_KEY` is required for any model call; R2 and Blob vars are optional (upload/drafts routes degrade with clear errors). Commands: copy `.env.local.example` to `.env.local`, `npm install`, `npm run db:push`, `npm run db:seed`, optionally `npm run gen:pairs` (costs API credits), then `npm run dev`.
- Live URL: https://tone-app-phi.vercel.app (per HANDOFF.md; note the AI features error until the Anthropic account is topped up).

## Gaps
- README.md still describes an older shape of the app (rate limits, "Vercel Blob for review queue") and omits Neon/Drizzle, /train, /ideas, and R2 entirely; the author should confirm which storage paths are actually live in prod (HANDOFF.md flags `/api/drafts`, `/api/upload`, and `/api/critique` as dead-code candidates, yet the Critic page and slash command still use two of them).
- Whether the Anthropic credits were topped up after 2026-06-23 and whether the pending items shipped (high-contrast deck regen, prod e2e run, the three orphaned e2e posts in the live /review queue) is unknown from the code.
- `claude-opus-4-8` and `claude-haiku-4-5` are used as model IDs throughout; confirm these are the intended production aliases and current pricing (scripts/genPairs.ts hardcodes a price table).
- There is no authentication on any route; the code assumes a single trusted reviewer ("Single reviewer (Divij) assumed" in app/api/reactions/route.ts). Confirm this is acceptable for the deployed URL or note it as a known limitation.
- Media handling has two overlapping paths (in-browser-downscaled data URLs in Neon per HANDOFF.md PART 1, and R2 presigned uploads in app/api/upload/route.ts); which one the compose dialog currently uses in prod should be confirmed.
- No screenshots, analytics, or usage numbers (posts reviewed, taste_examples grown) were available in the repo; real flywheel-growth stats would strengthen the case study.
