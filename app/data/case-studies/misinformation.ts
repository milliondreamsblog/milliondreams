import type { CaseStudy } from "./types";

export const misinformation: CaseStudy = {
  slug: "misinformation",
  tldr: "Misinformation Agent is an agentic content-credibility pipeline built on Google's Agent Development Kit, started during an ML research internship at MANIT Bhopal. User-submitted content — claims, posts, articles — runs through a fixed sequence of three LLM agents: a validator that rules the content credible or 'invalid: [reason]' with cited clues, a scorer that grades it 1–10, and a recommender that turns both into concrete next steps. The core bet is that misinformation detection decomposes better into deterministic, auditable stages than into one mega-prompt — each stage writes a named key into shared session state that downstream agents read. All three stages are Gemini 2.0 Flash LlmAgents orchestrated by an ADK SequentialAgent, driven through ADK's built-in web UI.",
  architecture: {
    intro:
      "A SequentialAgent runs three sub-agents in strict order, and ADK session state is the only data flow between them — there is no database, which is precisely what keeps the pipeline deterministic and each stage's output independently inspectable. The validator writes its verdict to validation_status, the scorer writes lead_score, and the recommender's prompt literally interpolates both keys before producing action_recommendation. The whole thing is served by adk web against the Gemini API on a free AI Studio key.",
    diagram: {
      nodes: [
        { id: "webui", label: "ADK web UI (adk web)", kind: "client" },
        { id: "root", label: "SequentialAgent pipeline", kind: "service" },
        { id: "validator", label: "Validator: misinformation check", kind: "service" },
        { id: "scorer", label: "Scorer: 1-10 credibility grade", kind: "service" },
        { id: "recommender", label: "Recommender: next actions", kind: "service" },
        { id: "state", label: "ADK session state (output_key store)", kind: "cache" },
        { id: "gemini", label: "Gemini 2.0 Flash API", kind: "external" },
      ],
      edges: [
        { from: "webui", to: "root", label: "user submits content" },
        { from: "root", to: "validator", label: "stage 1 (fixed order)" },
        { from: "root", to: "scorer", label: "stage 2" },
        { from: "root", to: "recommender", label: "stage 3" },
        { from: "validator", to: "state", label: "validation_status" },
        { from: "scorer", to: "state", label: "lead_score" },
        { from: "state", to: "recommender", label: "both keys injected into prompt" },
        { from: "validator", to: "gemini", label: "LlmAgent calls (all 3 stages)" },
      ],
    },
  },
  stack: [
    {
      tech: "Google ADK 0.3.0",
      role: "Agent orchestration framework",
      why: "SequentialAgent gives deterministic stage ordering and state passing out of the box — no orchestration code to write or debug.",
    },
    {
      tech: "Gemini 2.0 Flash",
      role: "LLM behind all three stages",
      why: "Fast and cheap enough that three chained calls per query stay interactive on a free AI Studio key.",
    },
    {
      tech: "ADK session state (output_key)",
      role: "Inter-agent data flow",
      why: "Named keys make every stage's verdict a discrete, auditable artifact instead of prose buried in chat history.",
    },
    {
      tech: "adk web dev UI",
      role: "Interactive front end",
      why: "Zero front-end code — pick the agent from a dropdown, chat with the pipeline, and inspect state in the trace viewer.",
    },
    {
      tech: "LiteLLM 1.66.3",
      role: "Provider abstraction (installed, not wired in)",
      why: "Would let any stage swap Gemini for another model without code changes — an escape hatch held in reserve.",
    },
    {
      tech: "python-dotenv",
      role: "Config",
      why: "Keeps GOOGLE_API_KEY in .env and toggles AI Studio vs Vertex with a single flag.",
    },
  ],
  dataModel: {
    intro:
      "No database — the 'data model' here is the pipeline contract flowing through ADK session state. Each stage writes exactly one named key, and the recommender's prompt template interpolates the two upstream keys directly, so the contract between stages is enforced by prompt structure rather than schemas. Sessions run in-memory, though the installed google-adk[database] extra could persist them.",
    diagram: {
      entities: [
        {
          name: "SessionState",
          fields: ["session_id", "user_content (input text)", "validation_status", "lead_score", "action_recommendation"],
        },
        {
          name: "ValidatorVerdict",
          fields: ["format: valid | invalid: [reason]", "cited clues / inconsistencies", "source-credibility notes"],
        },
        {
          name: "CredibilityScore",
          fields: ["score: 1-10", "one-sentence justification"],
        },
        {
          name: "Recommendation",
          fields: ["band: 1-3 | 4-7 | 8-10", "invalid branch: info to gather", "next-step guidance"],
        },
      ],
      relations: [
        { from: "ValidatorVerdict", to: "SessionState", label: "written as validation_status" },
        { from: "CredibilityScore", to: "SessionState", label: "written as lead_score" },
        { from: "SessionState", to: "Recommendation", label: "both keys injected into stage-3 prompt" },
      ],
    },
  },
  decisions: [
    {
      chose: "a sequential multi-agent pipeline",
      over: "one mega-prompt",
      body: "A single prompt asking for 'verdict + score + recommendation' produces entangled, unauditable output. The SequentialAgent forces detection, grading, and response into separate LLM calls with separate instructions, so each stage can be inspected, tested, and re-prompted independently — the recommender can see the validator said 'invalid: lacks credible sources' and respond to exactly that. The cost is three model calls of latency and tokens per query.",
    },
    {
      chose: "named state keys",
      over: "conversation-history passing",
      body: "Each stage declares an output_key, and the recommender interpolates those keys explicitly rather than trusting the model to fish facts out of chat history. That makes the inter-stage contract structural: if the validator's output format changes, exactly one prompt template needs updating. The tradeoff is rigidity — nuance the validator produces outside its strict format is simply dropped.",
    },
    {
      chose: "Gemini 2.0 Flash",
      over: "a bigger model",
      body: "Every query costs three chained LLM calls, so per-call latency and price triple. Flash keeps the pipeline snappy on a free AI Studio key — which matters for a research-internship prototype — and the bet is that decomposition-plus-prompting recovers the reasoning quality a larger model would bring to a single call.",
    },
    {
      chose: "LLM-as-judge",
      over: "a fine-tuned transformer classifier",
      body: "A supervised classifier gives a probability but no explanation, and needs labeled training data. The validator prompt demands the reason — cited clues, inconsistencies, missing sources — because the stated goal is educating users about misinformation, not just flagging it. The tradeoff is honest: no calibrated accuracy metric, and prompt-level brittleness in place of a test set.",
    },
  ],
  funFacts: [
    "The repo is a refactor caught mid-transformation: it's forked from ADK's 'lead qualification' tutorial, and only the validator's prompt has been rewritten for misinformation — the scorer and recommender still talk about budgets and discovery calls, and the root agent is still named LeadQualificationPipeline.",
    "requirements.txt includes yfinance, a stock-market data library — a leftover from the multi-example ADK course environment the project grew out of.",
    "subagents/root_agent.yaml exists but is completely empty — a placeholder for ADK's declarative config style that never got filled in.",
    "The validator enforces a machine-parseable output contract on a fundamentally fuzzy task: exactly 'valid' or 'invalid: [reason]' — a one-line schema implemented purely in prompt text.",
    "The package directory is still named lead_qualification_agent, so running it means selecting a misinformation detector from a dropdown that swears it qualifies sales leads.",
  ],
};
