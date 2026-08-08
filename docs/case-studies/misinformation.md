# Misinformation Agent

## Overview
Misinformation Agent is an agentic content-credibility pipeline built on Google's Agent Development Kit (ADK), created during the author's ML research internship at MANIT Bhopal. It takes user-submitted content (claims, posts, articles) and runs it through a fixed sequence of three LLM agents: a validator that judges whether the content is misleading, false, or unverified (citing clues and inconsistencies), followed by a scorer and an action recommender that turn the assessment into a graded verdict and concrete next steps. The system's core idea is that misinformation detection is better decomposed into deterministic, auditable stages than crammed into one mega-prompt — each stage writes a named key into shared session state that downstream agents read. All three agents run Gemini 2.0 Flash via ADK's `LlmAgent`, orchestrated by a `SequentialAgent`, and are driven through ADK's built-in web UI.

## Architecture
The entry point is `lead_qualification_agent/agent.py` (the package keeps the name of the ADK pipeline it was forked from), which constructs a `SequentialAgent` named `LeadQualificationPipeline` with three sub-agents executed strictly in order. Stage 1, the validator (`lead_qualification_agent/subagents/validator/agent.py`), carries the misinformation-specific system prompt: it analyzes the submitted content and must output either `valid` (credible) or `invalid: [reason]` (misleading/unverified, with cited clues), storing the result in session state under `output_key="validation_status"`. Stage 2, the scorer (`subagents/scorer/agent.py`), reads the state and emits a 1–10 score with a one-sentence justification into `lead_score`. Stage 3, the recommender (`subagents/recommender/agent.py`), interpolates both prior state keys directly into its prompt (`{lead_score}`, `{validation_status}`) and produces a tiered recommendation into `action_recommendation`. There is no database — ADK session state is the only data flow between stages, which is exactly what makes the pipeline deterministic and each stage's output independently inspectable. The whole thing is served by `adk web`, ADK's local dev UI, which calls the Gemini API using a `GOOGLE_API_KEY` from `.env` (with `GOOGLE_GENAI_USE_VERTEXAI=FALSE`, i.e. AI Studio rather than Vertex).

### Diagram spec
```json
{
  "nodes": [
    {"id": "webui", "label": "ADK web UI (adk web)", "kind": "client"},
    {"id": "root", "label": "SequentialAgent pipeline (agent.py)", "kind": "service"},
    {"id": "validator", "label": "Validator: misinformation check", "kind": "service"},
    {"id": "scorer", "label": "Scorer: 1-10 credibility grade", "kind": "service"},
    {"id": "recommender", "label": "Recommender: next actions", "kind": "service"},
    {"id": "state", "label": "ADK session state (output_key store)", "kind": "cache"},
    {"id": "gemini", "label": "Gemini 2.0 Flash API", "kind": "external"}
  ],
  "edges": [
    {"from": "webui", "to": "root", "label": "user submits content"},
    {"from": "root", "to": "validator", "label": "stage 1 (fixed order)"},
    {"from": "root", "to": "scorer", "label": "stage 2"},
    {"from": "root", "to": "recommender", "label": "stage 3"},
    {"from": "validator", "to": "state", "label": "validation_status"},
    {"from": "scorer", "to": "state", "label": "lead_score"},
    {"from": "state", "to": "recommender", "label": "{lead_score} {validation_status} injected"},
    {"from": "validator", "to": "gemini", "label": "LlmAgent calls (all 3 stages)"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| Google ADK 0.3.0 (`google-adk[database]`) | Agent orchestration framework | `SequentialAgent` gives deterministic stage ordering and state passing out of the box |
| Gemini 2.0 Flash | LLM behind all three `LlmAgent` stages | Fast and cheap enough to run three chained calls per query on a free AI Studio key |
| ADK session state (`output_key`) | Inter-agent data flow | Named keys (`validation_status`, `lead_score`, `action_recommendation`) make every stage's verdict auditable |
| `adk web` dev UI | Interactive front end | Zero front-end code; select the agent from a dropdown and chat with the pipeline |
| LiteLLM 1.66.3 | Provider abstraction (available, not wired in) | Would let stages swap Gemini for other models without code changes |
| python-dotenv | Config | Keeps `GOOGLE_API_KEY` in `.env`, toggles AI Studio vs Vertex via `GOOGLE_GENAI_USE_VERTEXAI` |

## Data model
There is no database — this project's "data model" is the pipeline contract flowing through ADK session state. Input: free-text content pasted by the user (a claim, article, or social post). Stage outputs, each written to a named session-state key: `validation_status` — the validator's strict-format verdict (`valid`, or `invalid: [reason]` with cited inconsistencies, exaggerated claims, or missing sources); `lead_score` — the scorer's `N: one-sentence justification` grade on a 1–10 scale; `action_recommendation` — the recommender's tiered guidance, which branches on score bands (1–3, 4–7, 8–10) and on invalid verdicts (what additional information/sources to gather). The recommender's prompt template literally interpolates the two upstream keys, so the contract between stages is enforced by prompt structure rather than schemas. `requirements.txt` pins `google-adk[database]==0.3.0`, whose database extra enables persistent session storage, though this project runs with in-memory sessions.

### DB diagram spec
```json
{
  "entities": [
    {"name": "SessionState", "fields": ["session_id", "user_content (input text)", "validation_status", "lead_score", "action_recommendation"]},
    {"name": "ValidatorVerdict", "fields": ["format: valid | invalid: [reason]", "cited clues/inconsistencies", "source-credibility notes"]},
    {"name": "CredibilityScore", "fields": ["score: 1-10", "one-sentence justification"]},
    {"name": "Recommendation", "fields": ["band: 1-3 | 4-7 | 8-10", "invalid branch: info to gather", "next-step guidance"]}
  ],
  "relations": [
    {"from": "ValidatorVerdict", "to": "SessionState", "label": "written as validation_status"},
    {"from": "CredibilityScore", "to": "SessionState", "label": "written as lead_score"},
    {"from": "SessionState", "to": "Recommendation", "label": "both keys injected into stage-3 prompt"}
  ]
}
```

## Why this, not that
### Why a sequential multi-agent pipeline, not one mega-prompt
A single prompt asking for "verdict + score + recommendation" produces entangled, unauditable output. The `SequentialAgent` in `lead_qualification_agent/agent.py` forces detection, grading, and response into separate LLM calls with separate instructions, so each stage can be inspected, tested, and re-prompted independently — the recommender can even see that the validator said `invalid: lacks credible sources` and respond specifically to that. The cost is three model calls (latency and tokens) per query.

### Why named state keys, not conversation-history passing
Each stage declares an `output_key` (`validation_status`, `lead_score`, `action_recommendation`), and the recommender's prompt in `subagents/recommender/agent.py` interpolates those keys explicitly rather than trusting the model to fish facts out of chat history. This makes the inter-stage contract structural: if the validator changes its output format, exactly one prompt template needs updating. The tradeoff is rigidity — free-form nuance the validator produces outside its strict format is dropped.

### Why Gemini 2.0 Flash, not a bigger model
All three agents pin `GEMINI_MODEL = "gemini-2.0-flash"`. Every user query costs three chained LLM calls, so per-call latency and price triple; Flash keeps an interactive pipeline snappy on a free AI Studio key (`GOOGLE_GENAI_USE_VERTEXAI=FALSE`), which matters for a research-internship prototype. The bet is that decomposition-plus-prompting recovers the reasoning quality a larger model would give a single call.

### Why LLM-as-judge, not a fine-tuned transformer classifier
A supervised classifier gives a probability but no explanation and needs labeled training data; the validator prompt in `subagents/validator/agent.py` demands the reason — "citing clues, inconsistencies, or context" — because the stated goal is "educating users about misinformation", not just flagging it. The tradeoff is no calibrated accuracy metric and prompt-level brittleness; the internship's model-training work (Transformers/PyTorch) is not in this repo (see Gaps).

## Fun facts
- The repo is a live refactor caught mid-transformation: it's forked from the ADK "lead qualification" tutorial, and only the validator's prompt has been rewritten for misinformation detection — the scorer and recommender in `subagents/scorer/agent.py` and `subagents/recommender/agent.py` still talk about budgets, decision-makers, and discovery calls, and the root agent is still named `LeadQualificationPipeline`.
- `requirements.txt` includes `yfinance==0.2.56` (a stock-market data library) and `psutil` — leftovers from the multi-example ADK course environment the project grew out of (`README (2).md` is literally the course's root README, pointing at a Skool community).
- `subagents/root_agent.yaml` exists but is completely empty — a placeholder for ADK's declarative config style that was never filled in.
- The `.env` file with a real `GOOGLE_API_KEY` is committed to the repository (the `.gitignore` didn't catch it) — it should be revoked.
- The validator enforces a machine-parseable output contract on a fuzzy task: exactly `valid` or `invalid: [reason]` — a one-line schema implemented purely in prompt text.

## Screenshot targets
- The ADK web UI (`adk web`) with `lead_qualification_agent` selected: one shot of a misleading claim getting `invalid: [reason]` plus the low-score recommendation, and one credible-content run for contrast.
- The ADK UI's state/trace inspector showing `validation_status`, `lead_score`, and `action_recommendation` populating in sequence — this is the money shot for "agentic pipeline".
- Runs locally but requires a secret: `python -m venv .venv && .venv\Scripts\activate`, `pip install -r requirements.txt`, copy `lead_qualification_agent/.env.example` to `.env` and set `GOOGLE_API_KEY` (free from aistudio.google.com/apikey), then `adk web` from the repo root and pick the agent from the dropdown.
- No live URL.

## Gaps
- The project brief describes Transformers/PyTorch-based misinformation detection from the MANIT Bhopal internship, but this repo contains no PyTorch, Transformers, datasets, notebooks, or evaluation code — only the ADK/Gemini agent pipeline. The author should link or push the model-training work, datasets used, and any accuracy/benchmark results, or reframe the case study around the agentic pipeline alone.
- The scorer and recommender prompts still describe sales-lead qualification; confirm whether misinformation-specific versions exist elsewhere or were planned.
- `README.md` is the unmodified ADK tutorial README (it even references a `9-sequential-agent/` folder that doesn't exist here); a project-specific README is needed.
- What the internship deliverable actually was (paper, report, demo?) and how this agent fit into it.
- The committed `.env` API key should be revoked and scrubbed from git history.
