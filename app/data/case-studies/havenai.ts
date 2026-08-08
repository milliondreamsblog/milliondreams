import type { CaseStudy } from "./types";

export const havenai: CaseStudy = {
  slug: "havenai",
  heroImage: "/case-studies/havenai/chat.png",
  heroCaption:
    "Live agent answer with a typed property card — on a host page whose CSS is deliberately hostile",
  tldr: "Haven AI lets any real-estate business drop an AI property assistant onto its website with one script tag. Visitors chat to search listings, register as a lead, and book site visits; admins provision tenants, clients customize their bot and watch leads roll in. The hard problem it solves: putting an LLM agent with write access on an untrusted third-party page — solved with a public key that grants nothing, a private key that never reaches a browser, and a human click before any write.",
  architecture: {
    intro:
      "Four deployable apps, orchestrated by Docker Compose: a Preact widget compiled to a single 32.5 kB embed.js that renders in a Shadow DOM; a FastAPI platform API housing a LangGraph agent whose write tools are intercepted into durable pending-confirmation rows; a deliberately independent FastAPI CRM microservice with per-tenant API keys and Redis rate limiting; and one Next.js dashboard serving both admin and client route trees. The two Postgres databases never share a connection string — every agent data action must cross the CRM's REST contract with an X-API-Key.",
    diagram: {
      nodes: [
        { id: "host", label: "Host website (one script tag)", kind: "client" },
        { id: "widget", label: "Preact widget (Shadow DOM)", kind: "client" },
        { id: "dashboard", label: "Next.js dashboard", kind: "client" },
        { id: "platform", label: "Platform API (FastAPI + LangGraph)", kind: "service" },
        { id: "crm", label: "CRM service (FastAPI)", kind: "service" },
        { id: "platformdb", label: "Platform Postgres", kind: "db" },
        { id: "crmdb", label: "CRM Postgres", kind: "db" },
        { id: "redis", label: "Redis (rate limits)", kind: "cache" },
        { id: "openai", label: "OpenAI Responses API", kind: "external" },
      ],
      edges: [
        { from: "host", to: "widget", label: "loads embed.js" },
        { from: "widget", to: "platform", label: "public key + SSE" },
        { from: "dashboard", to: "platform", label: "HttpOnly session" },
        { from: "platform", to: "crm", label: "X-API-Key, REST only" },
        { from: "platform", to: "platformdb", label: "conversations" },
        { from: "platform", to: "openai", label: "tool-calling LLM" },
        { from: "crm", to: "crmdb", label: "properties, leads, visits" },
        { from: "crm", to: "redis", label: "fixed-window counters" },
      ],
    },
  },
  stack: [
    {
      tech: "FastAPI",
      role: "Both backend services",
      why: "Async-native with Pydantic validation everywhere — and two free OpenAPI surfaces that visually prove the platform/CRM split.",
    },
    {
      tech: "LangGraph",
      role: "Agent orchestration",
      why: "An explicit state graph makes the write-confirmation gate a graph edge, not a prompt convention the model can talk itself out of.",
    },
    {
      tech: "Preact + Vite",
      role: "Embeddable widget",
      why: "Tiny runtime; Vite lib-mode emits one self-contained IIFE — 32.5 kB, ~12 kB gzipped — so the embed is genuinely one script tag.",
    },
    {
      tech: "Shadow DOM",
      role: "Widget isolation",
      why: "Survives deliberately hostile host CSS while staying in-page — no iframe handshake, no resize dance.",
    },
    {
      tech: "Next.js 16",
      role: "Admin + client dashboard",
      why: "One App Router app with role-based route trees instead of two duplicated apps.",
    },
    {
      tech: "PostgreSQL ×2",
      role: "Separate platform & CRM stores",
      why: "A hard, physically-auditable data boundary between the SaaS control plane and tenant CRM records.",
    },
    {
      tech: "Redis",
      role: "CRM rate limiting",
      why: "Atomic Lua INCR+EXPIRE fixed-window counters per API key, plus a pre-auth per-IP cap.",
    },
    {
      tech: "Argon2id + Fernet",
      role: "Auth & secret storage",
      why: "Argon2id passwords, short-lived session JWTs, and Fernet-encrypted CRM credentials that are never logged.",
    },
  ],
  dataModel: {
    intro:
      "Two entirely separate schemas, one per database. The platform side models the SaaS control plane — tenants, users, chatbots with enforced business rules, durable conversations, and the pending confirmations that gate every write. The CRM side models the business data — properties, leads, and visits, where composite foreign keys on (tenant_id, id) make cross-tenant relationships unrepresentable at the database level.",
    diagram: {
      entities: [
        { name: "Tenant", fields: ["id", "name", "slug", "status"] },
        { name: "Chatbot", fields: ["public_key pk_live_...", "allowed_property_types", "min / max price", "persona"] },
        { name: "CrmCredential", fields: ["encrypted_api_key (Fernet)", "key_fingerprint (sha256:12)", "chatbot_id"] },
        { name: "Conversation", fields: ["session_token_hash", "state (JSON)", "chatbot_id"] },
        { name: "PendingConfirmation", fields: ["tool_name", "arguments (JSON)", "summary", "status"] },
        { name: "Property (CRM)", fields: ["title", "city / state", "price (INR)", "property_type"] },
        { name: "Lead (CRM)", fields: ["name", "phone", "source=chatbot"] },
        { name: "Visit (CRM)", fields: ["starts_at / ends_at", "timezone (IANA)", "status"] },
      ],
      relations: [
        { from: "Tenant", to: "Chatbot", label: "owns bots" },
        { from: "Chatbot", to: "CrmCredential", label: "1:1 encrypted key" },
        { from: "Chatbot", to: "Conversation", label: "hosts chats" },
        { from: "Conversation", to: "PendingConfirmation", label: "gates writes" },
        { from: "Property (CRM)", to: "Lead (CRM)", label: "composite FK" },
        { from: "Lead (CRM)", to: "Visit (CRM)", label: "books" },
      ],
    },
  },
  decisions: [
    {
      chose: "Shadow DOM",
      over: "an iframe",
      body: "The widget mounts a div with attachShadow and injects its stylesheet inside, so it survives a host page that globally forces magenta text and 8px dashed lime borders on every button. It stays in the host document — no cross-frame postMessage protocol, no resize dance, one bundle. The security cost is fine because there's nothing to steal: the embed key is public by design.",
    },
    {
      chose: "two databases",
      over: "one with schemas",
      body: "Separate Postgres instances, separate ORM models, separate migration histories — neither service imports the other's sessions. One database would be simpler to operate, but the core boundary ('the agent may never query the CRM directly') becomes trivially auditable when there is physically no connection string to misuse.",
    },
    {
      chose: "strict LangGraph tools",
      over: "free-form prompting",
      body: "Five Pydantic-validated tools bound with strict schemas; property cards are typed UI events from verified tool results — the widget never scrapes model prose. The bot can't improvise outside its tools, but business rules are enforced in server-side tool execution, and the tool stubs literally raise RuntimeError if invoked directly.",
    },
    {
      chose: "SSE",
      over: "WebSockets",
      body: "Chat traffic is almost entirely server-to-client — token deltas, property cards, confirmation prompts — so POST-based SSE covers it without connection upgrades or sticky sessions. The widget's hand-rolled SSE parser is tested against split-chunk, CRLF, and invalid-JSON frames, with a 90-second idle watchdog.",
    },
    {
      chose: "two keys per bot",
      over: "one",
      body: "The public pk_live_ key appears in host-page HTML by design and grants no CRM access. The private crm_live_ key is Fernet-encrypted where it must be recoverable, HMAC-hashed where it never needs to be read back, and rendered nowhere — the admin UI shows only a 12-character fingerprint. A single-key design would force the embed credential to be secret, which is impossible on a public page.",
    },
    {
      chose: "confirmation-gated writes",
      over: "direct tool execution",
      body: "Write tools never execute inline: the graph persists a PendingConfirmation and ends the turn. Only an explicit visitor click triggers the CRM call, with the confirmation ID as the idempotency key — so a replayed approval can't create a duplicate lead. The human, not the model, commits the transaction.",
    },
  ],
  funFacts: [
    "The widget's demo page is deliberately sabotaged — Georgia serif on everything, magenta buttons with dashed lime borders — and that hostile page ships as the production demo, purely to prove Shadow DOM isolation on camera.",
    "The entire agent test suite runs without a single paid API call: a fake chat model whose bind_tools is a no-op feeds the real LangGraph graph deterministic scripted tool calls.",
    "Double-booking prevention is a database trick, not application logic: partial unique indexes scoped to status = 'scheduled' mean cancelling a visit automatically frees the slot.",
    "Both services refuse to boot in production while any committed development default secret is still in use — settings compare live values against their own field defaults at startup.",
    "The system prompt injects today's UTC date each turn specifically so the model can resolve 'this Saturday' into a real calendar date before booking a site visit.",
  ],
  gallery: [
    {
      src: "/case-studies/havenai/hero.png",
      caption: "Widget opening on the hostile-CSS demo page",
    },
    {
      src: "/case-studies/havenai/customize.png",
      caption: "Client dashboard — bot branding, persona & business rules",
    },
    {
      src: "/case-studies/havenai/visits.png",
      caption: "Visits page with the bonus calendar view",
    },
  ],
};
