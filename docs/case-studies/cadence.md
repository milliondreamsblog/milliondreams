# Cadence

## Overview
Cadence is a content intelligence engine — the live site's tagline is "Know what to post. And exactly why." A user pastes or uploads a week of X (Twitter) posts, and the engine scores each post against its author's own baseline, separates one-off viral spikes from durable, repeatable formulas, filters off-topic noise, and then drafts an on-brand content brief. It turns unstructured social content into structured, queryable insight and orchestrates the workflow from ingestion to a ready-to-approve brief. It is aimed at creators and content teams who want data-backed weekly publishing decisions, with an explicit human-in-the-loop guarantee: "The agent drafts — a human approves before anything posts."

## Architecture
The live deployment (web-app-self-mu.vercel.app) is a Next.js App Router application on Vercel — confirmed by `_next/static/chunks/app/` assets in the page source. The public page is a single-screen workflow UI: step "1 · Import posts" with "Load sample data", "Upload .json", and "Analyze" controls, so ingestion happens client-side via JSON upload (a week of X posts) rather than a live X API connection, at least in this deployment.

Known facts: the stack is Next.js, TypeScript, and GenAI, deployed on Vercel. The engine's pipeline — ingest, analyze, orchestrate — maps naturally onto Next.js API routes/server actions that call an LLM for scoring and brief drafting. Inferred (not verified): the per-author baseline scoring implies some statistical normalization computed over the uploaded corpus; the analysis and brief-generation steps likely run as server-side GenAI calls; whether results persist in a database or live only in the browser session is not visible from outside. The site badge "built in Claude Code" indicates the GenAI tooling used to build it, and plausibly (unconfirmed) that Anthropic models power the analysis.

### Diagram spec
```json
{"nodes":[{"id":"browser","label":"Next.js UI (import / analyze / brief)","kind":"client"},{"id":"upload","label":"JSON post ingestion","kind":"service"},{"id":"analyzer","label":"Scoring engine (baseline, spikes, noise filter)","kind":"service"},{"id":"llm","label":"GenAI model API","kind":"external"},{"id":"brief","label":"Brief drafting orchestrator","kind":"service"},{"id":"store","label":"Insight store (session or DB)","kind":"db"},{"id":"vercel","label":"Vercel serverless runtime","kind":"external"}],"edges":[{"from":"browser","to":"upload","label":"upload .json of X posts"},{"from":"upload","to":"analyzer","label":"normalized posts"},{"from":"analyzer","to":"llm","label":"classify / score content"},{"from":"analyzer","to":"store","label":"structured insights"},{"from":"brief","to":"llm","label":"draft on-brand brief"},{"from":"store","to":"brief","label":"queryable insight"},{"from":"brief","to":"browser","label":"brief for human approval"},{"from":"vercel","to":"analyzer","label":"hosts API routes"}]}
```

## Tech stack
| Tech | Role | Why this choice |
| --- | --- | --- |
| Next.js | Full-stack app: workflow UI plus server-side analysis routes | One framework covers the interactive stepper UI and the API layer calling GenAI, with zero-config Vercel deployment |
| TypeScript | End-to-end typing of posts, scores, and briefs | The pipeline transforms unstructured input into structured records; types keep every stage's contract explicit |
| GenAI (LLM APIs) | Content analysis, spike-vs-formula classification, brief drafting | Understanding *why* a post worked and writing an on-brand brief are language tasks no rules engine can do |
| Vercel | Hosting and serverless execution | Instant deploys and serverless functions fit a bursty, on-demand analysis workload with no servers to manage |

## Data model
Likely main entities (inferred from the visible workflow; needs author confirmation): an Author (the X account whose baseline is computed), Posts (the uploaded week of content with engagement metrics), Scores/Insights per post (baseline-relative score, spike-vs-formula label, on-topic flag), an AnalysisRun that groups one week's import, and the generated Brief with its drafted recommendations awaiting human approval. The site shows JSON upload and sample data, which suggests the post schema mirrors X post exports (text, timestamps, engagement counts). Whether any of this persists server-side or is session-only is not publicly visible.

### DB diagram spec
```json
{"entities":[{"name":"Author","fields":["id","handle","baseline_stats","topic_profile"]},{"name":"Post","fields":["id","author_id","text","posted_at","engagement_metrics"]},{"name":"AnalysisRun","fields":["id","author_id","imported_at","post_count","status"]},{"name":"PostInsight","fields":["id","post_id","run_id","score_vs_baseline","label"]},{"name":"Brief","fields":["id","run_id","draft_content","approved","created_at"]}],"relations":[{"from":"Post","to":"Author","label":"written by"},{"from":"AnalysisRun","to":"Author","label":"analyzes"},{"from":"PostInsight","to":"Post","label":"scores"},{"from":"PostInsight","to":"AnalysisRun","label":"produced in"},{"from":"Brief","to":"AnalysisRun","label":"drafted from"}]}
```

## Why this, not that
### Why per-author baselines, not absolute engagement metrics
A post with 10k likes is a flop for a huge account and a breakout for a small one; scoring "against each author's own baseline" (the site's own words) makes insights transferable across account sizes. This also enables the product's key distinction — separating viral spikes from durable formulas — which absolute numbers cannot do.

### Why JSON upload, not a live X API integration
Uploading a .json of posts sidesteps X API pricing, rate limits, and OAuth complexity, letting the engine focus on analysis rather than ingestion plumbing. It also keeps the deployment stateless and demo-friendly ("Load sample data"). Whether a live integration is planned needs author confirmation.

### Why GenAI analysis, not pure statistics
Statistics can find outliers, but explaining *why* a post worked, filtering off-topic noise, and drafting an on-brand brief require understanding the content itself — language-model territory. The hybrid shape (statistical baseline plus LLM interpretation) is the natural reading of the site copy; the exact split needs author confirmation.

### Why human-in-the-loop, not auto-posting
The site states it outright: "The agent drafts — a human approves before anything posts." Brand voice mistakes on a public account are expensive and irreversible, so the agent's autonomy deliberately stops at the draft. This also keeps the product safely on the analysis side of X's automation rules.

### Why Vercel serverless, not a hosted backend
Analysis happens in bursts when a user clicks "Analyze" — a serverless runtime that scales to zero fits far better than an always-on server, and Vercel is the zero-friction home for a Next.js app. Needs author confirmation whether any long-running analysis required workarounds for serverless timeouts.

## Fun facts
- The landing page proudly wears a "built in Claude Code" badge — the tool was itself built with an AI agent, and it produces agent-drafted briefs.
- The core promise fits in one sentence on the page: separate "viral spikes from durable formulas" — luck versus repeatable strategy.
- The whole product is operable from one screen: load sample data, upload a JSON of a week's X posts, hit Analyze.
- It is deliberately not an auto-poster: the visible footer note insists a human approves before anything ships.
- Deployed under a default Vercel preview-style domain (web-app-self-mu.vercel.app) — a working product ahead of a vanity domain.

## Screenshot targets
- https://web-app-self-mu.vercel.app/ — the entire public product: hero ("Know what to post. And exactly why."), the "1 · Import posts" step, and the Claude Code badge.
- The same URL after clicking "Load sample data" and "Analyze" — the scoring results and generated brief are the interesting UI, reachable without login but requiring interaction (screenshot via a real browser session).
- No other public routes exist (probed /about → 404; no robots.txt or sitemap.xml).

## Gaps
1. Which GenAI model/provider powers scoring and brief drafting (Claude? OpenAI?), and are calls made from API routes, server actions, or the edge?
2. Do analysis results and briefs persist anywhere (Postgres, KV, blob), or is everything session-only in the browser?
3. What exactly is the baseline algorithm — rolling mean/median engagement, z-scores, something learned?
4. What is the expected JSON schema for uploaded posts, and where do users get it (X export, third-party scraper)?
5. Is multi-user auth planned, or is this a single-operator tool today?
6. How is "off-topic noise" filtering implemented — embedding similarity, LLM classification, keyword rules?
7. War stories: hardest part of prompt/orchestration design, and any serverless timeout or token-cost battles?
8. Roadmap: live X API ingestion, scheduled weekly runs, or publishing integrations?
