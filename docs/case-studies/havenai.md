# Haven AI

## Overview

Haven AI is a multi-tenant platform that lets any real-estate business add an AI property assistant to its website with a single `<script>` tag. Site visitors chat with the assistant to search individual listings, inspect a property, register as a lead, and schedule or cancel a site visit — every data action flowing through a separate CRM microservice. Platform admins provision tenants and chatbots from an admin panel; each client business signs into a dashboard to customize its bot (title, colors, persona, enforced price/type business rules), copy the embed snippet, and monitor leads and visits (including a bonus calendar view). It solves the classic embed problem — putting an LLM agent with write access on an untrusted third-party page — with hard boundaries: a public embed key that grants no CRM access, a private per-tenant CRM key that never reaches a browser, and explicit user confirmation before any write.

## Architecture

The system is a monorepo with four deployable apps plus infrastructure, orchestrated by `infra/compose.yaml`: two Postgres 16 databases (`platform-db` on 5433, `crm-db` on 5434), Redis 7, two FastAPI services, a Next.js dashboard, and an nginx-served widget bundle.

The **widget** (`apps/widget`) is a Preact app compiled by Vite into a single 32.5 kB IIFE (`embed.js`). The loader in `apps/widget/src/embed.tsx` finds its own `data-chatbot-key`, prevents duplicate mounts, attaches a Shadow DOM root, and renders the chat UI fully isolated from host-page CSS. It talks only to the platform's public routes (`/v1/public/*`), which serve credential-less wildcard CORS; chat authentication is a high-entropy bearer token minted per anonymous session, never a cookie.

The **platform API** (`apps/platform-api`) is the brain: FastAPI with session auth (Argon2id passwords, HS256 JWTs in `HttpOnly` `SameSite=Lax` cookies), admin/client role separation, retry-safe tenant provisioning, conversation persistence, and a LangGraph agent (`app/agent/graph.py`). The agent binds five strict-schema tools (`app/agent/tool_schemas.py`); read tools (`search_properties`, `get_property`) execute immediately through the tenant's decrypted CRM credential, while write tools (`register_lead`, `schedule_visit`, `cancel_visit`) are intercepted by the graph's `prepare_confirmation` node and persisted as a `PendingConfirmation` row — no CRM write happens until the visitor clicks approve, and the confirmation ID becomes the CRM idempotency key. Responses stream to the widget over POST-based SSE (`message_delta`, `property_cards`, `confirmation_required`, `message_complete`, `error`, `done`).

The **CRM service** (`apps/crm-service`) is a deliberately independent FastAPI process with its own ORM models, Alembic migrations, and database — neither Python service imports the other's models or sessions (stated and enforced throughout `README.md` and the code layout). Every public request needs `X-API-Key: crm_live_...`; middleware HMAC-hashes the key against `API_KEY_PEPPER`, resolves it to a `TenantPrincipal`, and only then applies Redis fixed-window rate limiting (60 req/60 s per key, plus a pre-auth 240 req/60 s per-IP cap). Request bodies never accept `tenant_id` — tenant identity always derives from the authenticated key, and cross-tenant IDs return `404` instead of `403` to avoid existence leaks.

The **dashboard** (`apps/dashboard`) is one Next.js App Router app with role-based route trees (`/admin/*` vs `/dashboard/*`). Its CRM reads (leads, visits) are server-side proxies through the platform API, so the private CRM key never reaches dashboard JavaScript; the admin UI shows only a SHA-256-derived key fingerprint.

Security model in one line: the public `pk_live_...` key identifies a bot but grants nothing; the private `crm_live_...` key is Fernet-encrypted in the platform DB, HMAC-hashed in the CRM DB, and never returned to a browser or logged. Both services refuse to boot in production while any committed development default secret is still in use (`apps/platform-api/app/core/config.py`).

### Diagram spec

```json
{
  "nodes": [
    {"id": "host", "label": "Host website (one script tag)", "kind": "client"},
    {"id": "widget", "label": "Preact widget (Shadow DOM)", "kind": "client"},
    {"id": "dashboard", "label": "Next.js dashboard (admin + client)", "kind": "client"},
    {"id": "platform", "label": "Platform API (FastAPI + LangGraph)", "kind": "service"},
    {"id": "crm", "label": "CRM service (FastAPI)", "kind": "service"},
    {"id": "platformdb", "label": "Platform Postgres", "kind": "db"},
    {"id": "crmdb", "label": "CRM Postgres", "kind": "db"},
    {"id": "redis", "label": "Redis (rate limits)", "kind": "cache"},
    {"id": "openai", "label": "OpenAI Responses API", "kind": "external"}
  ],
  "edges": [
    {"from": "host", "to": "widget", "label": "loads embed.js"},
    {"from": "widget", "to": "platform", "label": "public key + bearer token, SSE"},
    {"from": "dashboard", "to": "platform", "label": "HttpOnly session cookie"},
    {"from": "platform", "to": "crm", "label": "X-API-Key, REST only"},
    {"from": "platform", "to": "platformdb", "label": "conversations, confirmations"},
    {"from": "platform", "to": "openai", "label": "tool-calling LLM"},
    {"from": "crm", "to": "crmdb", "label": "properties, leads, visits"},
    {"from": "crm", "to": "redis", "label": "fixed-window counters"}
  ]
}
```

## Tech stack

| Tech | Role | Why this choice |
|---|---|---|
| FastAPI (Python ≥3.12) | Both backend services (`apps/platform-api`, `apps/crm-service`) | Async-native, Pydantic validation everywhere, free OpenAPI docs at `/docs` for both services |
| LangGraph 1.x + langchain-openai | Agent orchestration in `app/agent/graph.py` | Explicit StateGraph (`model → read tools → model`, `model → confirm → END`) makes the confirmation gate a graph edge, not a prompt convention |
| OpenAI Responses API (`gpt-5.4-mini` default) | Tool-calling LLM | `LLM_MODEL`/`LLM_BASE_URL` env config keeps the agent portable — a Gemini-compatible endpoint works via Chat Completions fallback in `app/agent/model.py` |
| Preact + Vite 7 | Embeddable widget (`apps/widget`) | Tiny runtime; Vite lib-mode emits a single self-contained `embed.js` IIFE (32.5 kB, ~12 kB gzip) |
| Shadow DOM | Widget CSS/JS isolation | Survives deliberately hostile host CSS while staying in-page (no iframe handshake) |
| Next.js 16 + React 19 | Dashboard (`apps/dashboard`) | One App Router app with role-based route trees instead of two duplicated apps |
| PostgreSQL 16 (×2) | Separate platform and CRM stores | Hard data boundary between the SaaS control plane and tenant CRM records |
| SQLAlchemy 2 + Alembic | ORM and migrations per service | Each service owns its models and migration history; SQLite fallback for local/test runs |
| Redis 7 | CRM distributed rate limiting | Atomic Lua `INCR`+`EXPIRE` fixed-window counter (`app/core/rate_limit.py`); memory limiter fallback for tests |
| Argon2id + PyJWT + Fernet | Auth and secret storage (`app/core/security.py`) | Argon2id passwords, signed short-lived session JWTs, Fernet-encrypted CRM credentials |
| Docker Compose | Full-stack local orchestration (`infra/compose.yaml`) | Health-check-gated startup ordering; migrations and idempotent seeds run on boot |
| pytest / Vitest / MyPy strict / Ruff | Quality gates | 26 backend + 7 frontend tests; CI uses a deterministic fake chat model, zero paid API calls |

## Data model

There are two entirely separate schemas, one per database.

The **platform schema** (`apps/platform-api/app/models/entities.py`) models the SaaS control plane. `Tenant` owns `User` accounts (role `admin` or `client`) and `Chatbot` rows. Each `Chatbot` carries the public embed key, UI branding, persona, and the enforced business rules (`allowed_property_types` JSON, `minimum_price`/`maximum_price`). A one-to-one `CrmCredential` stores the Fernet-encrypted CRM API key plus a display-only SHA-256 fingerprint. Chat state is durable: `Conversation` (with a hashed session bearer token and a JSON `state` blob holding selected property/lead/visit IDs), `Message` (unique per-conversation `sequence`), and `PendingConfirmation` (the intercepted write tool call — name, arguments, human summary, status). `ProvisioningJob` makes admin provisioning retry-safe via a unique idempotency key.

The **CRM schema** (`apps/crm-service/app/models/entities.py`) models the tenant's business data. `Tenant` and its hashed `ApiKey` rows gate everything. `Property`, `Lead`, and `Visit` all carry `tenant_id`, and composite foreign keys (`ForeignKeyConstraint(["tenant_id", "property_id"], ...)`) make cross-tenant relationships unrepresentable at the database level. `Visit` uses partial unique indexes scoped to `status = 'scheduled'` so a cancelled visit releases its slot for rebooking. `IdempotencyRecord` stores the response of each keyed write for 24 hours, scoped by `(tenant_id, key, route)`.

### DB diagram spec

```json
{
  "entities": [
    {"name": "Tenant (platform)", "fields": ["id", "name", "slug", "status"]},
    {"name": "User", "fields": ["email", "password_hash (Argon2id)", "role", "tenant_id"]},
    {"name": "Chatbot", "fields": ["public_key pk_live_...", "allowed_property_types", "minimum_price / maximum_price", "persona", "config_version"]},
    {"name": "CrmCredential", "fields": ["encrypted_api_key (Fernet)", "key_fingerprint (sha256:12)", "chatbot_id"]},
    {"name": "Conversation", "fields": ["session_token_hash", "state (JSON)", "tenant_id", "chatbot_id"]},
    {"name": "PendingConfirmation", "fields": ["tool_name", "arguments (JSON)", "summary", "status"]},
    {"name": "ApiKey (CRM)", "fields": ["key_hash (HMAC-SHA256)", "prefix", "status", "tenant_id"]},
    {"name": "Property (CRM)", "fields": ["title", "city / state", "price (INR)", "bedrooms", "property_type"]},
    {"name": "Lead (CRM)", "fields": ["name", "phone", "source_property_id", "source=chatbot"]},
    {"name": "Visit (CRM)", "fields": ["property_id", "lead_id", "starts_at / ends_at", "timezone (IANA)", "status"]},
    {"name": "IdempotencyRecord (CRM)", "fields": ["key + route (unique per tenant)", "request_hash", "response_json", "expires_at (24h)"]}
  ],
  "relations": [
    {"from": "Tenant (platform)", "to": "User", "label": "has accounts"},
    {"from": "Tenant (platform)", "to": "Chatbot", "label": "owns bots"},
    {"from": "Chatbot", "to": "CrmCredential", "label": "1:1 encrypted key"},
    {"from": "Chatbot", "to": "Conversation", "label": "hosts chats"},
    {"from": "Conversation", "to": "PendingConfirmation", "label": "gates writes"},
    {"from": "ApiKey (CRM)", "to": "Property (CRM)", "label": "tenant-scoped access"},
    {"from": "Property (CRM)", "to": "Lead (CRM)", "label": "composite FK (tenant_id, id)"},
    {"from": "Lead (CRM)", "to": "Visit (CRM)", "label": "books, composite FK"},
    {"from": "Visit (CRM)", "to": "IdempotencyRecord (CRM)", "label": "replay-safe creation"}
  ]
}
```

## Why this, not that

### Why Shadow DOM, not an iframe

The widget mounts a `div` with `attachShadow({ mode: "open" })` and injects its full stylesheet inside (`apps/widget/src/embed.tsx`), so it survives a host page that globally applies `button { color: magenta !important; border: 8px dashed lime !important }`. Shadow DOM keeps the widget in the host document — no cross-frame postMessage protocol, no iframe resize dance, one bundle — while still guaranteeing style isolation both ways. The security cost is acceptable because there is nothing to steal: the embed key is public by design and chat auth is a per-session bearer token, so DOM access from the host page gains an attacker nothing beyond what the visitor already has.

### Why two databases, not one

`platform-db` and `crm-db` are separate Postgres instances with separate ORM models and separate Alembic histories, and neither service imports the other's sessions. A single database with schemas would have been operationally simpler, but the assignment's core boundary — "the agent may never query the CRM database directly" — becomes trivially auditable when there is physically no connection string to misuse: every agent data action must cross the CRM REST contract with an `X-API-Key`. It also lets the CRM stand alone as a genuinely independent product with its own rate limits and key lifecycle.

### Why LangGraph strict tools, not free-form prompting

The agent binds five Pydantic-validated tools with `bind_tools(TOOL_DEFINITIONS, strict=True, parallel_tool_calls=False)` (`app/agent/graph.py`), and property cards are typed UI events emitted from verified tool results — the widget never scrapes model prose to reconstruct data. The tradeoff is flexibility: the bot cannot improvise actions outside its five tools, but in exchange business rules (allowed types, price bands) are enforced in server-side tool execution (`ToolExecutor._apply_search_rules`), blocked searches never even reach the CRM, and the tool stubs literally raise `RuntimeError` if invoked directly (`_never_execute_directly` in `tool_schemas.py`).

### Why SSE, not WebSockets

Chat traffic is almost entirely server-to-client — token deltas, property cards, confirmation prompts — so POST-based SSE (`StreamingResponse` with `text/event-stream` in `app/api/chat.py`) covers the need without connection-upgrade infrastructure, sticky sessions, or a heartbeat protocol. The widget compensates for SSE's weaker client story with a hand-rolled parser tested against split-chunk, CRLF, multi-line, and invalid-JSON frames (`apps/widget/src/sse.test.ts`), a 90-second idle watchdog, and a Stop control. WebSockets would only pay off if visitors needed low-latency upstream messages mid-turn, which they do not.

### Why two keys per bot, not one

Each chatbot gets a public `pk_live_...` embed key and a private `crm_live_...` CRM key, generated with `secrets.token_urlsafe` (`app/core/security.py`). The public key can leak freely — it appears in host-page HTML by design and grants no CRM access. The private key follows a defense-in-depth split: Fernet-encrypted at rest in the platform DB (it must be recoverable to call the CRM), but only HMAC-peppered-hashed in the CRM DB (the CRM never needs the plaintext back), with the admin UI showing only a `sha256:...` 12-hex-char fingerprint. A single-key design would have forced the embed credential to be secret, which is impossible on a public web page.

### Why confirmation-gated writes with idempotency, not direct tool execution

Write tool calls never execute inline: the graph routes them to `prepare_confirmation`, persists a `PendingConfirmation`, and ends the turn. Only an explicit visitor approval triggers the CRM call, using the confirmation ID as the `Idempotency-Key`, so a replayed or crash-retried approval cannot create a second lead or visit — and a half-executed write can be retried but not rejected. The cost is an extra round-trip on every write, which is exactly the right price for an LLM that occasionally hallucinates intent: the human, not the model, commits the transaction.

## Fun facts

- The widget demo pages (`apps/widget/demo/index.html`, `demo/production.html`) are deliberately hostile: they globally force `box-sizing: content-box !important`, Georgia serif on everything, and magenta text with 8px dashed lime borders on every button — and the Vite config ships this sabotage page as the production demo (`copyDemoPage()` in `apps/widget/vite.config.ts`) purely to prove Shadow DOM isolation on camera.
- The entire agent test suite runs without a single paid API call: `apps/platform-api/tests/conftest.py` defines `ToolCallingFakeModel`, a `FakeMessagesListChatModel` subclass whose `bind_tools` is a no-op `return self`, feeding the real LangGraph graph deterministic scripted tool calls.
- The raw CRM key exists in plaintext only in transit: encrypted (Fernet) in the platform DB, HMAC-SHA256-with-pepper hashed in the CRM DB, and rendered nowhere — the admin panel gets only `secret_fingerprint()`, i.e. `sha256:` plus 12 hex chars, "a display-only identifier that reveals no secret material."
- Both services refuse to boot in production while any committed development default secret is still in use — `Settings.default_secret_fields_in_use()` in `apps/platform-api/app/core/config.py` compares live values against the model-field defaults.
- Double-booking prevention is a database trick, not application logic: `Visit` uses partial unique indexes on `(tenant_id, property_id, starts_at)` and `(tenant_id, lead_id, starts_at)` scoped to `status = 'scheduled'` (with both `sqlite_where` and `postgresql_where` variants), so cancelling a visit automatically frees the slot for rebooking.
- The date at the top of `plan.md` and throughout the seed data is July 2026, and the system prompt injects "Today's date (UTC)" each turn specifically so the model can resolve "this Saturday" into a real calendar date before booking.

## Screenshot targets

Run the full stack with `docker compose -f infra/compose.yaml up --build` from the repo root (needs `.env` copied from `.env.example` with `OPENAI_API_KEY`, `SESSION_SECRET`, `CRM_PROVISIONING_SECRET`, `API_KEY_PEPPER`, and a Fernet `CREDENTIAL_ENCRYPTION_KEY`), or use the Windows `start-demo.bat` which launches all four services natively (dashboard on port 3001 in that mode). Demo logins: admin `admin@example.com` / `ChangeMe123!`, client `client@acmerealty.com` / `ChangeMe123!`.

- `http://localhost:4173` — the money shot: the hostile-CSS host page (giant Georgia headline, "Host website with deliberately hostile CSS" eyebrow) with the pristine chat bubble in the corner; open the widget, search "2BHK apartment in Gurugram", and capture the streamed property cards and a write-confirmation card.
- `http://localhost:3000/login` — branded login page (Compose mode; `:3001` under `start-demo.bat`).
- `http://localhost:3000/admin` and `/admin/provision` — tenant/bot monitoring table with CRM key fingerprints, and the retry-safe provisioning form.
- `http://localhost:3000/dashboard/customize` — client bot configuration: colors, persona, allowed property types, price band.
- `http://localhost:3000/dashboard/embed` — the generated one-tag embed snippet with copy button.
- `http://localhost:3000/dashboard/leads` and `/dashboard/visits` — tenant-scoped lead list and the visits page toggled to its bonus calendar view (list/calendar segmented control).
- `http://localhost:8000/docs` and `http://localhost:8001/docs` — the two independent OpenAPI surfaces, visually proving the platform/CRM service split.

## Gaps

- **Live deployment**: `plan.md` lists deployment as a P1 bonus and the README mentions "versioned CDN widget publishing" as a follow-up, but no deployed URL exists in the repo — confirm whether the project was ever hosted publicly.
- **Which model actually ran the demo**: the code defaults to `LLM_MODEL=gpt-5.4-mini` via the OpenAI Responses API, but `DEMO-GUIDE.md` says the platform "talks to Gemini" (via the `LLM_BASE_URL` compatibility endpoint). State which provider/model the recorded demo used.
- **Timeline and authorship**: `plan.md` targets "3–4 focused days" and stamps completion on 20 July 2026, but actual hours spent, whether it was solo work, and the course/assignment context (folder says "cohort assignment" / "FinalYearProject") should come from the author.
- **Demo video**: `docs/demo-script.md` and `DEMO-SCRIPT.md` script a 3–5 minute recording and `plan.md` says only the recording remained; link the finished video if it exists.
- **Real-world usage/metrics**: no production traffic, tenant count, or latency numbers exist in the repo — any performance or usage claims for the case study must be supplied by the author.
- **Unrelated content**: `docs/ideas/`, `docs/outreach-contacts.md`, and `theo-video-transcript.txt` appear to be unrelated brainstorm material living in the repo; confirm they should be excluded from the case study narrative.
