import type { CaseStudy } from "./types";

export const brandvoiceagent: CaseStudy = {
  slug: "brandvoiceagent",
  tldr: "BrandVoiceAgent is an AI brand-voice critic and rewrite engine built for Bricx Labs, a design agency. A writer drafts social posts; the app judges each draft against a 19-rule voice system codified from the founder's approved posts, then generates three publish-ready rewrites in his voice — a minimal fix, a reangle, and the sharpest cut. The founder reviews, picks, edits, and plays a this-or-that calibration game, and every signal is promoted into a taste_examples table that retrieval feeds back into the next generation call. The team calls it the Compounding Taste Loop: the more the founder reviews, the more the model writes like him — replacing him as the copy bottleneck while keeping him as the taste authority.",
  architecture: {
    intro:
      "A single Next.js 15 App Router app: seven client pages talking to API routes, with all voice work funneling through one ~7.4K-token rubric file sent as a prompt-cached system block to Claude Opus 4.8. The 19 rules are enforced in the prompt, not in code — what code enforces is the output contract, via Anthropic structured outputs against JSON schemas, plus post-processing that de-duplicates labels and repairs the recommended pick. Generation is taste-aware: bucket-first keyword retrieval over taste_examples injects the top 4 before/after pairs into each call, and a 111-assertion e2e script drives the real HTTP endpoints as a pre-deploy gate.",
    diagram: {
      nodes: [
        { id: "ui", label: "Next.js pages (write / review / train / ideas / critic)", kind: "client" },
        { id: "api", label: "API routes (posts, reactions, train, ideas, rehook)", kind: "service" },
        { id: "genlib", label: "Generation pipeline (rewrites + retrieval + persist)", kind: "service" },
        { id: "opus", label: "Claude Opus 4.8 (all voice work)", kind: "external" },
        { id: "haiku", label: "Claude Haiku 4.5 (ideation + pair generation)", kind: "external" },
        { id: "neon", label: "Neon Postgres (Drizzle)", kind: "db" },
        { id: "blob", label: "Vercel Blob (legacy chat-pushed drafts)", kind: "db" },
        { id: "r2", label: "Cloudflare R2 (media, presigned PUT)", kind: "external" },
        { id: "scripts", label: "Offline scripts (seed, genPairs, e2e gate)", kind: "service" },
      ],
      edges: [
        { from: "ui", to: "api", label: "fetch JSON" },
        { from: "api", to: "genlib", label: "submit draft / draft idea" },
        { from: "genlib", to: "neon", label: "retrieve taste, persist rewrites" },
        { from: "genlib", to: "opus", label: "cached rubric, structured output" },
        { from: "api", to: "haiku", label: "extract idea seeds" },
        { from: "api", to: "neon", label: "posts, reactions, train choices" },
        { from: "api", to: "blob", label: "legacy /api/drafts JSON" },
        { from: "ui", to: "r2", label: "browser uploads via presigned URL" },
        { from: "scripts", to: "neon", label: "seed, gen pairs, verify e2e" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 15 + React 19",
      role: "Full-stack app: 7 pages plus all API routes",
      why: "One deployable on Vercel, with maxDuration = 300 on generation routes to cover parallel Opus calls.",
    },
    {
      tech: "Claude Opus 4.8",
      role: "All founder-facing voice output",
      why: "The decision log is explicit — 'never silently switch prod' — with a TONE_MODEL env override for cheap test runs.",
    },
    {
      tech: "Claude Haiku 4.5",
      role: "Idea extraction and /train pair generation",
      why: "Explicitly 'NOT voice work' — calibration pairs are training data, with structural validators backstopping quality.",
    },
    {
      tech: "Structured outputs (json_schema)",
      role: "Guaranteed-parseable critiques, rewrites, hooks, ideas",
      why: "JSON.parse straight into typed contracts — no regex extraction of model prose, ever.",
    },
    {
      tech: "Neon Postgres + Drizzle",
      role: "System of record: posts, rewrites, reactions, taste tables",
      why: "Serverless-friendly HTTP driver, and FK cascades mean deleting a draft literally 'untrains' its example.",
    },
    {
      tech: "Prompt caching",
      role: "The 7.4K-token rubric shared across all four Opus call sites",
      why: "Written once per 5-minute window, read back at ~10% input cost — the batch route even sequences the first post alone to warm the cache before fanning out.",
    },
    {
      tech: "Cloudflare R2",
      role: "Image/video attachments",
      why: "Browsers upload bytes directly via short-lived presigned PUT URLs, so files never pass through the serverless function.",
    },
    {
      tech: "Vercel Blob",
      role: "Legacy review-queue for drafts pushed from chat",
      why: "Simple private JSON blobs feeding the /critique slash-command flow — now flagged in the handoff doc as dead code to prune.",
    },
  ],
  dataModel: {
    intro:
      "The spine is batches → posts → rewrites → reactions, with taste_examples as the flywheel the whole product exists to grow. Every founder signal is one reactions row, and a pick promotes the winning text — preferring the founder's hand-edit — into taste_examples with an ON DELETE CASCADE back to the source post, so deleting a draft untrains it. The /train subsystem adds pre-generated contrast pairs and the choices made on them; ideas are Haiku-mined seeds that link forward to the posts they become.",
    diagram: {
      entities: [
        { name: "batches", fields: ["id", "author", "createdAt"] },
        { name: "posts", fields: ["id", "batchId", "body", "pillar", "status", "media (jsonb)"] },
        { name: "rewrites", fields: ["id", "postId", "label (A|B|C)", "text", "publishScore", "recommended"] },
        { name: "reactions", fields: ["id", "postId", "type (like|pick|edit|comment|disapprove)", "payload"] },
        { name: "taste_examples", fields: ["id", "original", "approvedText", "editNotes", "pillar", "source (seed|flywheel|game)"] },
        { name: "taste_pairs", fields: ["id", "pillar", "axis", "leftText", "rightText"] },
        { name: "taste_choices", fields: ["id", "pairId", "chosen (left|right|neither)", "editedText", "sessionId"] },
        { name: "ideas", fields: ["id", "seed", "angle", "bucket", "confidence", "postId"] },
      ],
      relations: [
        { from: "posts", to: "batches", label: "batchId (cascade delete)" },
        { from: "rewrites", to: "posts", label: "postId (cascade)" },
        { from: "reactions", to: "posts", label: "postId (cascade)" },
        { from: "taste_examples", to: "posts", label: "sourcePostId (cascade = delete untrains)" },
        { from: "taste_choices", to: "taste_pairs", label: "pairId (cascade)" },
        { from: "ideas", to: "posts", label: "postId (set null, history survives)" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
