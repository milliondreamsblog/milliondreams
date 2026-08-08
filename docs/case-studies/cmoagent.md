# CMO Agent

## Overview

CMO Agent is a weekly content-intelligence agent for X/Twitter: every Monday it pulls the week's top posts from a curated set of tracked accounts, scores them with a deterministic engine, asks an LLM to explain *why* the winners worked (grounded in a named pattern taxonomy), drafts 5-7 on-brand post ideas, and packages everything into an executable weekly brief a content writer can run cold. It was built in Claude Code as a Founder's Office take-home for Bricx Labs (a UI/UX agency for AI and B2B SaaS) and is now an MIT-licensed open-source engine. Its users are marketing operators and founders who own the config (which accounts to track, the brand voice) and approve every brief before anything posts -- the agent drafts, it never publishes. The two ideas that make it more than a "sort by likes" script: engagement is measured relative to each author's own baseline (separating one-off viral spikes from repeatable formulas), and a relevance filter plus controversy guard apply judgement before ranking (a 718K-view off-topic post gets excluded; a reply-ratio'd hot take gets flagged "verify").

## Architecture

The system is a weekly batch pipeline deliberately split into a deterministic half (cheap, testable, zero tokens) and a judgement half (LLM), with the volatile part -- X data access -- isolated behind a single `getPosts()` adapter contract (`src/providers/index.js`).

**Data layer.** `src/providers/sampleProvider.js` (the default) reads `data/sample_posts.json`, a curated 30-odd-post set where every post is tagged `real` or `synthetic` and the whole set is engineered to fire every designed behavior. `src/providers/apifyProvider.js` fetches real posts by POSTing to Apify's REST `run-sync-get-dataset-items` endpoint for the `apidojo~tweet-scraper` actor (one synchronous call, no polling), then normalizes wildly inconsistent scraper field names (`likeCount` / `favorite_count` / `likes`...) into the canonical `Post` shape via `normalizeTweet()`. `scripts/scrape.js` runs a one-time paid scrape and caches it to `data/live_posts.json` so the demo can iterate offline for free via `DATA_FILE=data/live_posts.json` -- cost control is everywhere (`MAX_ACCOUNTS`, `APIFY_MAX_ITEMS` caps in `.env.example`).

**Deterministic core.** `src/pipeline.js` orchestrates provider -> score -> filter -> rank. `src/core/score.js` computes intent-weighted engagement (`weighted = likes*1 + reposts*3 + replies*3 + quotes*5 + bookmarks*5`, weights from `config/scoring.yaml`), a size-normalized rate (`weighted / views`, falling back to followers), a per-author median baseline (only "reliable" with >= 3 posts and median weighted >= 25), and the two axes: `breakout = weighted / author's median weighted` (self-relative spike) and `baseline_pct = percentile rank of the author's median rate among reliable authors` (cross-author consistency). Thresholds `breakout_high: 2.0` and `baseline_high_pct: 66` bucket each post into a quadrant: `proven_peak`, `trend`, `durable`, or `noise`. `src/core/filter.js` applies a keyword relevance gate plus the controversy guard (`replies >= 30 AND replies/likes >= 2.0` => flag "verify"). `src/core/rank.js` builds the shortlists: Ride-Now (trend + peak, sorted by breakout) and Build-the-Engine (durable + peak, sorted by rate), keeping `excluded` and `unrated` lists for transparency. `scripts/run-analysis.js` prints a badge-and-chip terminal report and writes `output/analysis.json`.

**LLM layer.** Three roles -- Analyst (why it worked, named patterns from `knowledge/pattern_taxonomy.md`), Ideator (5-7 on-brand ideas checked against `knowledge/brand_voice.md`), Packager (fills `templates/brief_template.md`) -- defined as prompt files in `agents/*.md`. They run three ways: (1) interactively, via the Claude Code slash command `.claude/commands/weekly-brief.md`, where Claude Code itself is the orchestrator and executes all three roles; (2) headlessly, via `scripts/generate-brief.js`, which concatenates the same agent prompts + knowledge files + template into one system prompt and calls the OpenAI or Google Gemini REST API (default `gemini-2.5-flash`, free tier) in a single shot, writing `briefs/<date>.md`; (3) in the web app's serverless route. Notably, despite an `@anthropic-ai/sdk` dependency in `package.json`, no shipped code path calls the Anthropic API -- headless generation runs on Gemini's free tier.

**Automation.** `.github/workflows/weekly-brief.yml` is a GitHub Actions cron (Mondays 06:00 UTC): `npm run analyze` -> `node scripts/generate-brief.js` (with `GEMINI_API_KEY` from secrets) -> `peter-evans/create-pull-request` opens a PR containing `briefs/` and `output/` for a human to review. The human gate is structural: the agent proposes via PR, never posts.

**Presentation.** `scripts/build-dashboard.js` reads `output/analysis.json` plus the latest brief, pre-renders the brief markdown to HTML with `marked`, and writes everything into `web/data.js` as a `window.__BRICX__` global -- so `web/index.html` and `web/dashboard.html` open by double-click, fully static, offline-safe. Separately, `web-app/` is an interactive Next.js 14 demo (live on Vercel): the scoring engine is ported as pure browser functions in `web-app/lib/engine/`, so "Analyze" runs entirely client-side with no key; "Generate brief" POSTs the analysis to `web-app/app/api/brief/route.js`, which holds `GEMINI_API_KEY` server-side, applies a best-effort in-memory rate limit (5 briefs per 10 minutes per IP), and calls Gemini with the condensed 3-role system prompt in `web-app/lib/prompts.js`.

### Diagram spec

```json
{
  "nodes": [
    {"id": "apify", "label": "Apify tweet-scraper (real X data)", "kind": "external"},
    {"id": "sample", "label": "data/sample_posts.json (default)", "kind": "db"},
    {"id": "engine", "label": "Deterministic core: score, filter, rank (src/)", "kind": "service"},
    {"id": "analysis", "label": "output/analysis.json", "kind": "db"},
    {"id": "llm", "label": "LLM: Gemini/OpenAI API or Claude Code (Analyst-Ideator-Packager)", "kind": "external"},
    {"id": "brief", "label": "briefs/<date>.md", "kind": "db"},
    {"id": "gha", "label": "GitHub Actions cron (Mon 06:00) -> PR", "kind": "queue"},
    {"id": "dashboard", "label": "Static dashboard (web/)", "kind": "client"},
    {"id": "webapp", "label": "Next.js web-app (client-side engine)", "kind": "client"},
    {"id": "briefapi", "label": "/api/brief serverless route (Vercel)", "kind": "service"}
  ],
  "edges": [
    {"from": "gha", "to": "engine", "label": "npm run analyze"},
    {"from": "apify", "to": "engine", "label": "getPosts() adapter"},
    {"from": "sample", "to": "engine", "label": "getPosts() adapter"},
    {"from": "engine", "to": "analysis", "label": "scored shortlists"},
    {"from": "analysis", "to": "llm", "label": "slimmed payload + agent prompts"},
    {"from": "llm", "to": "brief", "label": "markdown brief"},
    {"from": "brief", "to": "gha", "label": "PR for human approval"},
    {"from": "analysis", "to": "dashboard", "label": "build-dashboard.js -> web/data.js"},
    {"from": "webapp", "to": "briefapi", "label": "POST in-browser analysis"},
    {"from": "briefapi", "to": "llm", "label": "Gemini generateContent"}
  ]
}
```

## Tech stack

| Tech | Role | Why this choice |
|---|---|---|
| Node.js >= 18 (ESM, no framework) | The whole CLI pipeline (`src/`, `scripts/`) | One runtime dependency (`js-yaml`); native `fetch` for all API calls; hostable anywhere including GitHub Actions |
| js-yaml | Loads `config/*.yaml` (accounts, topics, scoring knobs) | Config is human-owned judgement; YAML with inline "why" comments beats JSON for that |
| Apify (`apidojo~tweet-scraper`) | Real X data provider (`src/providers/apifyProvider.js`) | Official X API is ~$200/mo; Apify's sync REST endpoint needs one call and the free tier covers a cost spike |
| Claude Code + agent prompt files | Interactive orchestration (`.claude/commands/weekly-brief.md`, `agents/*.md`) | The assignment was to build Claude Code marketing agents; prompts-as-markdown-files keep one source of truth across all three run modes |
| Google Gemini API (`gemini-2.5-flash`) | Headless + serverless brief generation (`scripts/generate-brief.js`, `web-app/app/api/brief/route.js`) | Free tier makes the public demo and weekly cron cost nothing; OpenAI supported as an alternative |
| GitHub Actions + peter-evans/create-pull-request | Weekly cron that opens a brief PR (`.github/workflows/weekly-brief.yml`) | The PR is the human-in-the-loop gate -- review, edit, approve; no deploy infra needed |
| marked | Pre-renders brief markdown to HTML (`scripts/build-dashboard.js`) | Lets the dashboard be a double-clickable static file with zero runtime fetch |
| Next.js 14 on Vercel | Interactive demo (`web-app/`) | Client Components run the ported engine keylessly in-browser; one serverless route holds the LLM key server-side |
| Vanilla HTML/CSS/JS | Static dashboard (`web/`) | Zero dependencies, works offline, cannot break mid-demo |

## Data model

Everything is file-based JSON/Markdown/YAML -- no database. The central contract is the **Post** (documented in `data/sample_posts.json` `_meta.schema` and README's LLD): identity (`id`, `url`, `created_at`), an embedded **Author** (`handle`, `name`, `followers`, `following`, `verified`, `tier` -- tier comes from `config/accounts.yaml`'s five tiers: design craft, SaaS founders, growth operators, AI builders, competitive watch), an **Engagement** block (`likes`, `reposts`, `replies`, `quotes`, `bookmarks`, `views`), and a **Content** block (`text`, `media_type`, `is_thread`, `has_link`, `post_type`). Sample posts carry provenance fields `_source: real|synthetic` and `_followers_estimated`.

The pipeline enriches each post in place: `src/core/score.js` attaches a computed **Metrics** object (`weighted`, `reach`, `rate`, `author_baseline_weighted`, `author_baseline_rate`, `breakout`, `baseline_pct`, `quadrant`) and `src/pipeline.js` attaches **Flags** (`relevant`, `relevance_score`, `matched` keyword list, `controversial`). Derived values are always computed, never stored in the source data.

The **Analysis** document (`output/analysis.json`) is the deterministic half's output: `provider`, `window`, `counts` (total/relevant/excluded/ride_now/engine), and five arrays of enriched posts -- `ride`, `engine`, `unrated`, `excluded`, `all`. The LLM never sees the full document; `scripts/generate-brief.js` and `web-app/lib/prompts.js` both slim each post down to ~10 fields (handle, url, text, quadrant, breakout, baseline_pct, controversial, views, bookmarks, likes) to keep the prompt small.

The **Brief** (`briefs/<YYYY-MM-DD>.md`) is the output contract defined by `templates/brief_template.md`: header, TL;DR, Ride-Now / Build-the-Engine analysis with badges and metric chips, a Pattern Watch tally, a dated content calendar where every idea traces modeled-on post -> named pattern -> why -> full draft (+ a brand-amplify variant), voice reminders, and a system note flagging what needs human judgement. `web/data.js` is the dashboard's denormalized snapshot of analysis + rendered brief. A `state/pattern_library.json` that compounds pattern counts week over week is designed (referenced in `agents/analyst.md` and the README diagrams) but not yet implemented.

### DB diagram spec

```json
{
  "entities": [
    {"name": "Post", "fields": ["id", "url", "created_at", "content.text", "content.media_type", "_source (real|synthetic)"]},
    {"name": "Author", "fields": ["handle", "followers", "verified", "tier (from accounts.yaml)"]},
    {"name": "Engagement", "fields": ["likes", "reposts", "quotes", "bookmarks", "views"]},
    {"name": "Metrics", "fields": ["weighted", "rate", "breakout", "baseline_pct", "quadrant"]},
    {"name": "Analysis", "fields": ["provider", "counts", "ride[]", "engine[]", "excluded[]", "unrated[]"]},
    {"name": "Brief", "fields": ["week_of", "tldr", "pattern_watch", "calendar[idea: modeled_on -> pattern -> draft]", "system_note"]}
  ],
  "relations": [
    {"from": "Post", "to": "Author", "label": "embeds (baselines grouped by handle)"},
    {"from": "Post", "to": "Engagement", "label": "embeds"},
    {"from": "Post", "to": "Metrics", "label": "enriched by score.js (computed, never stored)"},
    {"from": "Analysis", "to": "Post", "label": "shortlists of enriched posts"},
    {"from": "Analysis", "to": "Brief", "label": "slimmed payload -> LLM -> markdown"}
  ]
}
```

## Why this, not that

### Why curated sample data behind an adapter, not live scraping

`docs/DECISIONS.md` (#1) is explicit: the official X API is ~$200/mo and rate-limited, and scrapers break mid-demo, while the assignment graded the *system* over live data. So the full pipeline was built against `data/sample_posts.json` behind the swappable `getPosts()` contract in `src/providers/index.js` -- live data is a one-file drop-in, and the demo is guaranteed to run. The sample set is itself engineered like a test fixture: every designed behavior (the relevance exclusion, the controversy flag, each quadrant, the dead-account guard) demonstrably fires.

### Why a distilled pattern taxonomy file, not RAG

`knowledge/pattern_taxonomy.md` is ~30 named patterns in roughly 2k tokens, read whole in every prompt. `docs/DECISIONS.md` (#5) argues that at this corpus size prompt caching makes "read everything in one pass" nearly free and fully deterministic, while a vector DB would add infrastructure plus a wrong-retrieval failure mode for zero token savings. RAG is explicitly deferred to the productionization story, when the corpus grows to hundreds of full essays.

### Why deterministic scoring in code, not asking the LLM

The split is a stated design principle (README, `docs/DECISIONS.md` #2): "never ask the LLM to do arithmetic; never ask code to judge a hook." All math -- weights, medians, percentiles, quadrants in `src/core/score.js` -- costs zero tokens, is reproducible, and is tunable via `config/scoring.yaml` knobs labeled "hypotheses, not truths." The LLM only receives the already-scored shortlist and does what code cannot: explain mechanisms and write in a brand voice.

### Why two axes (breakout vs baseline), not one engagement sort

A one-off viral spike and a consistently strong author teach different things (`docs/DECISIONS.md` #4, the flagged "key judgement"). Breakout (this post vs the author's own median) yields a time-sensitive trend with n=1 confidence; baseline percentile (the author's sustained size-normalized rate vs peers) yields a durable formula with n=many confidence. The 2x2 becomes the brief's spine -- "Ride Now" vs "Build the Engine" -- and deliberately uses two different bases (raw weighted spike vs normalized rate) for the two axes.

### Why a PR gate via GitHub Actions, not auto-posting

`.github/workflows/weekly-brief.yml` ends with `peter-evans/create-pull-request` rather than any posting step, and the header comment says why: "it never posts -- it proposes." The human trust boundary brackets the automation: humans own the config before the run and approve the brief after it, and the voice-learning loop only ingests human-approved posts (never raw drafts) to avoid model drift (`knowledge/brand_voice.md`).

## Fun facts

- The repo is branded as a Claude/Claude Code project and ships `@anthropic-ai/sdk` in both `package.json` files, yet no shipped code imports it -- headless and serverless brief generation actually run on Google Gemini's free tier (`scripts/generate-brief.js`, `web-app/app/api/brief/route.js`), with OpenAI as a fallback. Claude is only in the loop when you run the `/weekly-brief` slash command inside Claude Code itself, where the IDE's model plays all three agents.
- The judgement showcase is baked into the sample data: a Rolex vintage-ad post with 718,000 views is deliberately included so the relevance filter excludes it (proving the engine is not an engagement sort), and a Figma hot take with replies >> likes triggers the controversy guard's "verify" flag so the system never teaches the writer to make rage-bait.
- The baseline reliability guard (`min_posts_for_baseline: 3`, `min_baseline_weighted: 25` in `config/scoring.yaml`) exists partly to protect the client from itself: the dormant @bricxlabs brand account (110 followers, portfolio posts at 0-3 likes) is left `unrated` instead of being false-crowned a "breakout" the moment one post gets 10 likes.
- `docs/DECISIONS.md` (#7) records the Loom pitch hook: the founder being studied had posted a job ad on 2026-05-22 hiring an "X content strategist to research trends and create viral content" -- this agent is that exact job posting, productized. The take-home's subject company was also its dataset.
- There is a quiet config/code drift: `src/config.js` loads `config/topics.yaml` and passes it into `relevanceOf(p, config.topics)`, but `src/core/filter.js` ignores the `_topics` parameter and matches against its own hardcoded `RELEVANCE_TERMS` keyword array. The YAML topics currently only document intent.
- The Apify provider comment culture treats field-mapping archaeology as the deliverable: "On the FIRST real run, log a raw item... discovering the real shape IS the point of this spike" (`src/providers/apifyProvider.js`), and `docs/DATA.md`'s phase gate is literally "look at the output, look at the bill."

## Screenshot targets

- **Live web app:** https://web-app-self-mu.vercel.app (per `docs/DEPLOY.md`) -- paste-JSON textarea, "Load sample data", the in-browser analysis dashboard with quadrant badges, and a generated brief. Analyze works with no key; Generate brief depends on `GEMINI_API_KEY` being set in the Vercel project.
- **Static dashboard:** `web/dashboard.html` after a local build -- stat row, Ride-Now / Build-the-Engine cards with badges and metric chips, the "Filtered out" section showing the excluded 718K-view post (the judgement proof), and the full rendered-brief tab. `web/index.html` is the landing page.
- **A generated brief:** `briefs/2026-06-08.md` (LLM-generated full week) or `briefs/2026-06-03.md` (the hand-orchestrated original with the fully-worked Day-1 teardown thread).
- **Terminal output:** `npm run analyze` prints a badge-annotated report (RIDE NOW / BUILD THE ENGINE / EXCLUDED / CONTEXT sections) that photographs well.
- **Runs locally with zero secrets:** yes -- the default provider is `sample`. Exact commands: `npm install`, then `npm run analyze` (writes `output/analysis.json`), then `npm run web` (builds `web/data.js`; double-click `web/index.html`). For the web app: `cd web-app && npm install && npm run dev` at http://localhost:3000 (Analyze is keyless; brief generation needs `GEMINI_API_KEY` in `.env.local`, or `OPENAI_API_KEY`/`GEMINI_API_KEY` for the CLI `npm run brief`). A live Apify scrape additionally needs `APIFY_TOKEN`.

## Gaps

- **Was the Apify spike ever run on real data?** `docs/DATA.md` defines the cost-measurement gate ("write the numbers in docs/DECISIONS.md") but no cost numbers appear in `docs/DECISIONS.md`, and no `data/live_posts.json` is committed (it may simply be gitignored). Confirm whether real-data cost-per-post was measured and what the verdict was.
- **Did the GitHub Actions cron produce `briefs/2026-06-08.md`?** June 8, 2026 was a Monday, matching the `0 6 * * 1` schedule, which suggests the pipeline ran end-to-end in CI -- worth confirming for the case study ("the cron actually fired" is a good line).
- **The pattern library (`state/pattern_library.json`)** is central to the "compounds weekly" story in the README diagrams and `agents/analyst.md`, but no `state/` directory exists. Clarify that it is roadmap, or implement it before presenting the learning-loop claim.
- **README vs code drift:** the README and `docs/ARCHITECTURE.md` say the web app's serverless route holds `ANTHROPIC_API_KEY` and calls Claude, but `web-app/app/api/brief/route.js` and both `.env.example` files use `GEMINI_API_KEY`. Decide which story to tell (or reconcile the code).
- **The Astro/Cloudflare marketing site** (`content-engine/`) is described in `docs/ROADMAP.md` as "built and verified locally, not yet in git" -- unverifiable from this repo.
- **Was the Loom recorded?** `docs/DECISIONS.md` lists it as the remaining human task; a `docs/LOOM_SCRIPT.md` is referenced in the README module table but is not present in the repo.
- **Outcome:** the take-home's result (hired? shortlisted?) and any real-world usage since are not in the repo but would anchor the case study.
