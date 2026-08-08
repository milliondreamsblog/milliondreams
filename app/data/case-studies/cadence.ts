import type { CaseStudy } from "./types";

export const cadence: CaseStudy = {
  slug: "cadence",
  heroImage: "/case-studies/cadence/hero.png",
  heroCaption: "Cadence — \"Know what to post. And exactly why.\"",
  tldr: "Cadence is a content intelligence engine: paste or upload a week of X posts and it scores each one against its author's own baseline, separates one-off viral spikes from durable, repeatable formulas, filters off-topic noise, and drafts an on-brand content brief. It turns unstructured social content into structured, queryable insight — luck versus repeatable strategy, told apart by the numbers. The whole workflow runs from a single screen, and the agent's autonomy deliberately stops at the draft: a human approves before anything posts.",
  architecture: {
    intro:
      "A Next.js App Router application on Vercel, designed as a pipeline in three acts: ingest, analyze, orchestrate. Ingestion is a client-side JSON upload of a week's X posts (no live X API in this deployment — sample data ships in the UI), and the analysis and brief-drafting stages are built around server-side GenAI calls layered on a per-author statistical baseline. The output loops back to the browser as a brief awaiting explicit human approval.",
    diagram: {
      nodes: [
        { id: "browser", label: "Next.js UI (import / analyze / brief)", kind: "client" },
        { id: "upload", label: "JSON post ingestion", kind: "service" },
        { id: "analyzer", label: "Scoring engine (baseline, spikes, noise filter)", kind: "service" },
        { id: "brief", label: "Brief drafting orchestrator", kind: "service" },
        { id: "store", label: "Insight store", kind: "db" },
        { id: "llm", label: "GenAI model API", kind: "external" },
        { id: "vercel", label: "Vercel serverless runtime", kind: "external" },
      ],
      edges: [
        { from: "browser", to: "upload", label: "upload .json of X posts" },
        { from: "upload", to: "analyzer", label: "normalized posts" },
        { from: "analyzer", to: "llm", label: "classify / score content" },
        { from: "analyzer", to: "store", label: "structured insights" },
        { from: "store", to: "brief", label: "queryable insight" },
        { from: "brief", to: "llm", label: "draft on-brand brief" },
        { from: "brief", to: "browser", label: "brief for human approval" },
        { from: "vercel", to: "analyzer", label: "hosts API routes" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js",
      role: "Full-stack app: workflow UI + analysis routes",
      why: "One framework covers the interactive stepper UI and the server-side layer calling GenAI, with zero-config Vercel deployment.",
    },
    {
      tech: "TypeScript",
      role: "End-to-end typing of posts, scores, and briefs",
      why: "The pipeline's whole job is turning unstructured input into structured records — types keep every stage's contract explicit.",
    },
    {
      tech: "GenAI (LLM APIs)",
      role: "Content analysis and brief drafting",
      why: "Understanding why a post worked and writing an on-brand brief are language tasks no rules engine can do.",
    },
    {
      tech: "Per-author baselines",
      role: "Scoring normalization",
      why: "Scoring against each author's own history makes insights transferable across account sizes — the prerequisite for telling spikes from formulas.",
    },
    {
      tech: "JSON upload ingestion",
      role: "Getting a week of posts in",
      why: "Sidesteps X API pricing, rate limits, and OAuth entirely, keeping the deployment stateless and demo-friendly.",
    },
    {
      tech: "Vercel",
      role: "Hosting and serverless execution",
      why: "Analysis happens in bursts when someone clicks Analyze — a runtime that scales to zero fits far better than an always-on server.",
    },
  ],
  dataModel: {
    intro:
      "The likely shape of the data, read off the visible workflow rather than a public schema: an author whose baseline gets computed, the uploaded posts with their engagement metrics, per-post insights carrying a baseline-relative score and a spike-versus-formula label, an analysis run grouping each week's import, and the drafted brief waiting on a human. Whether any of it persists server-side or lives only in the session isn't visible from outside.",
    diagram: {
      entities: [
        { name: "Author", fields: ["id", "handle", "baseline_stats", "topic_profile"] },
        { name: "Post", fields: ["id", "author_id", "text", "posted_at", "engagement_metrics"] },
        { name: "AnalysisRun", fields: ["id", "author_id", "imported_at", "post_count", "status"] },
        { name: "PostInsight", fields: ["id", "post_id", "run_id", "score_vs_baseline", "label"] },
        { name: "Brief", fields: ["id", "run_id", "draft_content", "approved", "created_at"] },
      ],
      relations: [
        { from: "Post", to: "Author", label: "written by" },
        { from: "AnalysisRun", to: "Author", label: "analyzes" },
        { from: "PostInsight", to: "Post", label: "scores" },
        { from: "PostInsight", to: "AnalysisRun", label: "produced in" },
        { from: "Brief", to: "AnalysisRun", label: "drafted from" },
      ],
    },
  },
  decisions: [
    {
      chose: "per-author baselines",
      over: "absolute engagement metrics",
      body: "A post with 10k likes is a flop for a huge account and a breakout for a small one; scoring against each author's own baseline makes insights meaningful at any account size. It's also what enables the product's key distinction — separating viral spikes from durable formulas — which absolute numbers simply cannot do.",
    },
    {
      chose: "JSON upload",
      over: "a live X API integration",
      body: "Uploading a .json of posts sidesteps X API pricing, rate limits, and OAuth complexity, letting the engine focus on analysis rather than ingestion plumbing. It also keeps the deployment stateless and demo-friendly — 'Load sample data' is one click, no account connection required.",
    },
    {
      chose: "GenAI analysis",
      over: "pure statistics",
      body: "Statistics can find outliers, but explaining why a post worked, filtering off-topic noise, and drafting an on-brand brief require understanding the content itself. The design pairs a statistical baseline with LLM interpretation — numbers find the signal, language models explain it.",
    },
    {
      chose: "human-in-the-loop",
      over: "auto-posting",
      body: "The site states it outright: the agent drafts, a human approves before anything posts. Brand-voice mistakes on a public account are expensive and irreversible, so the agent's autonomy deliberately stops at the draft — which also keeps the product safely on the analysis side of X's automation rules.",
    },
    {
      chose: "Vercel serverless",
      over: "a hosted backend",
      body: "Analysis happens in bursts when a user clicks Analyze; a runtime that scales to zero fits that shape far better than an always-on server. And Vercel is the zero-friction home for a Next.js app — deploy is a git push.",
    },
  ],
  funFacts: [
    "The landing page proudly wears a 'built in Claude Code' badge — a tool built with an AI agent that itself produces agent-drafted briefs.",
    "The core promise fits in one sentence on the page: separate 'viral spikes from durable formulas' — luck versus repeatable strategy.",
    "The whole product is operable from one screen: load sample data, upload a JSON of a week's X posts, hit Analyze.",
    "It is deliberately not an auto-poster: the visible footer note insists a human approves before anything ships.",
    "It shipped under a default Vercel preview-style domain — a working product ahead of a vanity domain.",
  ],
};
