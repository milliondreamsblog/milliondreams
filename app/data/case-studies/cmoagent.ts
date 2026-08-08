import type { CaseStudy } from "./types";

export const cmoagent: CaseStudy = {
  slug: "cmoagent",
  tldr: "CMO Agent is a weekly content-intelligence agent for X/Twitter: every Monday it pulls the week's top posts from tracked accounts, scores them with a deterministic engine, asks an LLM to explain why the winners worked, drafts 5-7 on-brand ideas, and packages an executable brief a content writer can run cold. Built in Claude Code as a Founder's Office take-home for Bricx Labs, now MIT-licensed open source. Two ideas make it more than a sort-by-likes script: engagement is measured relative to each author's own baseline — separating one-off viral spikes from repeatable formulas — and a relevance filter plus controversy guard apply judgement before ranking. The agent drafts; it never publishes.",
  architecture: {
    intro:
      "A weekly batch pipeline deliberately split in two: a deterministic half (scoring, filtering, ranking — cheap, testable, zero tokens) and a judgement half (three LLM roles: Analyst, Ideator, Packager, defined as markdown prompt files). Volatile X data access hides behind a single getPosts() adapter — a curated sample set by default, Apify's tweet scraper for real data. The LLM roles run three ways: interactively inside Claude Code via a slash command, headlessly via a script calling the Gemini (or OpenAI) REST API, or through the web demo's one serverless route — and a GitHub Actions cron ends every Monday run by opening a PR, never a post.",
    diagram: {
      nodes: [
        { id: "apify", label: "Apify tweet-scraper (real X data)", kind: "external" },
        { id: "sample", label: "sample_posts.json (default)", kind: "db" },
        { id: "engine", label: "Deterministic core: score, filter, rank", kind: "service" },
        { id: "analysis", label: "output/analysis.json", kind: "db" },
        { id: "llm", label: "LLM: Gemini/OpenAI API or Claude Code", kind: "external" },
        { id: "brief", label: "briefs/<date>.md", kind: "db" },
        { id: "gha", label: "GitHub Actions cron (Mon 06:00) -> PR", kind: "queue" },
        { id: "webapp", label: "Next.js web app (client-side engine)", kind: "client" },
        { id: "briefapi", label: "/api/brief serverless route", kind: "service" },
      ],
      edges: [
        { from: "gha", to: "engine", label: "npm run analyze" },
        { from: "apify", to: "engine", label: "getPosts() adapter" },
        { from: "sample", to: "engine", label: "getPosts() adapter" },
        { from: "engine", to: "analysis", label: "scored shortlists" },
        { from: "analysis", to: "llm", label: "slimmed payload + agent prompts" },
        { from: "llm", to: "brief", label: "markdown brief" },
        { from: "brief", to: "gha", label: "PR for human approval" },
        { from: "webapp", to: "briefapi", label: "POST in-browser analysis" },
        { from: "briefapi", to: "llm", label: "Gemini generateContent" },
      ],
    },
  },
  stack: [
    {
      tech: "Node.js 18+ (ESM, no framework)",
      role: "The whole CLI pipeline",
      why: "One runtime dependency and native fetch for every API call — hostable anywhere, including a GitHub Actions runner.",
    },
    {
      tech: "js-yaml",
      role: "Config: accounts, topics, scoring knobs",
      why: "Config is human-owned judgement, and YAML with inline 'why' comments beats JSON for that.",
    },
    {
      tech: "Apify (apidojo~tweet-scraper)",
      role: "Real X data provider",
      why: "The official X API is ~$200/mo; Apify's synchronous REST endpoint needs one call and the free tier absorbs a spike.",
    },
    {
      tech: "Claude Code + agent prompt files",
      role: "Interactive orchestration via a /weekly-brief slash command",
      why: "Prompts-as-markdown-files keep one source of truth across all three run modes, with Claude Code itself playing all three roles.",
    },
    {
      tech: "Google Gemini (gemini-2.5-flash)",
      role: "Headless and serverless brief generation",
      why: "The free tier makes the public demo and weekly cron cost nothing; OpenAI is supported as an alternative.",
    },
    {
      tech: "GitHub Actions + create-pull-request",
      role: "The Monday cron that opens a brief PR",
      why: "The PR is the human-in-the-loop gate — review, edit, approve — with no deploy infrastructure at all.",
    },
    {
      tech: "Next.js 14 on Vercel",
      role: "Interactive demo",
      why: "The scoring engine is ported to pure browser functions so Analyze runs keylessly client-side; one serverless route holds the LLM key.",
    },
    {
      tech: "Vanilla HTML/CSS/JS",
      role: "Static dashboard",
      why: "Zero dependencies, opens by double-click, works offline — it cannot break mid-demo.",
    },
  ],
  dataModel: {
    intro:
      "Everything is file-based JSON, Markdown, and YAML — no database. The central contract is the Post (identity, embedded author with a tier from accounts.yaml, engagement counts, content flags), which the pipeline enriches in place with computed metrics: intent-weighted engagement, a per-author median baseline, and the two axes — breakout and baseline percentile — that bucket each post into a quadrant. Derived values are always computed, never stored, and the LLM never sees the full analysis: each post is slimmed to ~10 fields before prompting.",
    diagram: {
      entities: [
        { name: "Post", fields: ["id", "url", "created_at", "content.text", "_source (real|synthetic)"] },
        { name: "Author", fields: ["handle", "followers", "verified", "tier (from accounts.yaml)"] },
        { name: "Engagement", fields: ["likes", "reposts", "quotes", "bookmarks", "views"] },
        { name: "Metrics", fields: ["weighted", "rate", "breakout", "baseline_pct", "quadrant"] },
        { name: "Analysis", fields: ["provider", "counts", "ride[]", "engine[]", "excluded[]", "unrated[]"] },
        { name: "Brief", fields: ["week_of", "tldr", "pattern_watch", "calendar (idea -> pattern -> draft)", "system_note"] },
      ],
      relations: [
        { from: "Post", to: "Author", label: "embeds (baselines grouped by handle)" },
        { from: "Post", to: "Engagement", label: "embeds" },
        { from: "Post", to: "Metrics", label: "enriched by score.js (computed, never stored)" },
        { from: "Analysis", to: "Post", label: "shortlists of enriched posts" },
        { from: "Analysis", to: "Brief", label: "slimmed payload -> LLM -> markdown" },
      ],
    },
  },
  decisions: [
    {
      chose: "curated sample data behind an adapter",
      over: "live scraping",
      body: "The official X API is ~$200/mo and rate-limited, scrapers break mid-demo, and the assignment graded the system over live data. So the full pipeline was built against a sample set behind a swappable getPosts() contract — live data is a one-file drop-in, and the demo is guaranteed to run. The sample set is engineered like a test fixture: every designed behavior, from the relevance exclusion to the controversy flag to each quadrant, demonstrably fires.",
    },
    {
      chose: "a distilled pattern taxonomy file",
      over: "RAG",
      body: "Roughly 30 named patterns in ~2K tokens, read whole in every prompt. At this corpus size, prompt caching makes 'read everything in one pass' nearly free and fully deterministic, while a vector DB would add infrastructure plus a wrong-retrieval failure mode for zero token savings. RAG is explicitly deferred to the productionization story, when the corpus grows to hundreds of essays.",
    },
    {
      chose: "deterministic scoring in code",
      over: "asking the LLM",
      body: "The stated design principle: never ask the LLM to do arithmetic; never ask code to judge a hook. All math — weights, medians, percentiles, quadrants — costs zero tokens, is reproducible, and is tunable via YAML knobs labeled 'hypotheses, not truths.' The LLM only receives the already-scored shortlist and does what code cannot: explain mechanisms and write in a brand voice.",
    },
    {
      chose: "two axes (breakout vs baseline)",
      over: "one engagement sort",
      body: "A one-off viral spike and a consistently strong author teach different things. Breakout — this post versus the author's own median — yields a time-sensitive trend with n=1 confidence; baseline percentile — the author's sustained size-normalized rate versus peers — yields a durable formula with n=many confidence. The resulting 2x2 becomes the brief's spine: 'Ride Now' versus 'Build the Engine.'",
    },
    {
      chose: "a PR gate via GitHub Actions",
      over: "auto-posting",
      body: "The weekly workflow ends with create-pull-request rather than any posting step, and the header comment says why: 'it never posts — it proposes.' The human trust boundary brackets the automation — humans own the config before the run and approve the brief after it — and the voice-learning loop only ingests human-approved posts, never raw drafts, to avoid model drift.",
    },
  ],
  funFacts: [
    "The repo is branded as a Claude Code project and ships @anthropic-ai/sdk in both package.json files — yet no shipped code imports it. Headless and serverless brief generation actually run on Gemini's free tier; Claude is only in the loop when you run the /weekly-brief slash command inside Claude Code itself.",
    "The judgement showcase is baked into the sample data: a Rolex vintage-ad post with 718,000 views is deliberately included so the relevance filter excludes it, and a hot take with far more replies than likes trips the controversy guard's 'verify' flag — so the system never teaches the writer to make rage-bait.",
    "The baseline reliability guard exists partly to protect the client from itself: the dormant @bricxlabs brand account (110 followers, posts at 0-3 likes) is left 'unrated' instead of being false-crowned a breakout the moment one post gets 10 likes.",
    "The decision log records the pitch hook: the founder being studied had posted a job ad hiring an 'X content strategist to research trends and create viral content' — this agent is that exact job posting, productized. The take-home's subject company was also its dataset.",
    "There's a quiet config/code drift: the pipeline dutifully loads topics.yaml and passes it to the relevance filter, which ignores the parameter and matches against its own hardcoded keyword array. The YAML topics currently only document intent.",
    "The Apify provider treats field-mapping archaeology as the deliverable — 'On the FIRST real run, log a raw item... discovering the real shape IS the point of this spike' — and the data doc's phase gate is literally 'look at the output, look at the bill.'",
  ],
};
