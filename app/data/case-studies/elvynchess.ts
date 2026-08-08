import type { CaseStudy } from "./types";

export const elvynchess: CaseStudy = {
  slug: "elvynchess",
  tldr: "Elvyn is a chess coaching SaaS for a small coaching team: coaches schedule 1-on-1 classes, manage rosters and teaching materials, and run live shared boards, while students see their class agenda, solve curated Lichess puzzles, submit assignments, and request reschedules into a coach's open slots. It ships as a Turborepo monorepo with two surfaces over the same domain logic — a Next.js web portal and an Expo/React Native mobile app — backed by Supabase with Drizzle for schema and tRPC for writes. The distinguishing problem-solve is the Playground: a realtime coach-plus-student chess room with driver/handoff board control, presence, a synced analysis move tree, and a broadcast-synced clock, working identically on web and phone.",
  architecture: {
    intro:
      "A hybrid the repo explicitly locks in ('Hybrid data pattern — do not collapse it'): both clients read and subscribe straight from Supabase with RLS as the security backbone, while complex writes go through tRPC routers running on the caller's own session so RLS still applies underneath the business logic. There is exactly one server — the Next.js app — whose /api/trpc route serves web via cookies and mobile via a bearer token. Realtime rides two rails: per-room Supabase channels carry Zod-validated Playground broadcasts with the DB row as the reconnect snapshot, and SECURITY DEFINER triggers fan notifications into a table whose INSERTs feed both the in-app bell and an edge function pushing phone banners through Expo.",
    diagram: {
      nodes: [
        { id: "web", label: "Next.js web app (apps/web)", kind: "client" },
        { id: "mobile", label: "Expo mobile app (apps/mobile)", kind: "client" },
        { id: "trpc", label: "tRPC API route (/api/trpc)", kind: "service" },
        { id: "pg", label: "Supabase Postgres + RLS (Drizzle schema)", kind: "db" },
        { id: "realtime", label: "Supabase Realtime (Broadcast/Presence)", kind: "service" },
        { id: "edge", label: "send-push edge function", kind: "service" },
        { id: "expopush", label: "Expo Push API", kind: "external" },
      ],
      edges: [
        { from: "web", to: "pg", label: "direct reads (RLS-scoped)" },
        { from: "mobile", to: "pg", label: "direct reads (RLS-scoped)" },
        { from: "web", to: "trpc", label: "writes (cookie auth)" },
        { from: "mobile", to: "trpc", label: "writes (bearer token)" },
        { from: "trpc", to: "pg", label: "user-scoped Supabase client" },
        { from: "web", to: "realtime", label: "playground channel + notification INSERTs" },
        { from: "mobile", to: "realtime", label: "playground channel + notification INSERTs" },
        { from: "pg", to: "edge", label: "webhook on notifications INSERT" },
        { from: "edge", to: "expopush", label: "batched push messages" },
      ],
    },
  },
  stack: [
    {
      tech: "Turborepo + pnpm workspaces",
      role: "Monorepo orchestration",
      why: "One repo, two apps, seven shared packages — with a cached task graph wiring it together.",
    },
    {
      tech: "Next.js 15 (App Router)",
      role: "Web portal and the only server",
      why: "One deployment serves the web UI and both clients' tRPC API.",
    },
    {
      tech: "Expo SDK 54 + Expo Router",
      role: "Mobile app with file-based routing",
      why: "EAS build channels plus expo-updates OTA let JS-only fixes ship without store review.",
    },
    {
      tech: "Supabase",
      role: "Postgres, Auth, Realtime, Storage, Edge Functions",
      why: "One backend covers auth, RLS-enforced data access, live channels, and push fan-out — no custom server fleet.",
    },
    {
      tech: "Drizzle ORM",
      role: "Schema definition and migrations",
      why: "Typed schema in TS, with hand-written SQL migrations layering RLS policies and triggers on top.",
    },
    {
      tech: "tRPC v11 + superjson",
      role: "Type-safe business-logic API",
      why: "End-to-end types from router to both React clients with zero codegen.",
    },
    {
      tech: "Zod",
      role: "Single source of truth for shapes",
      why: "The same schemas validate tRPC inputs, DB JSONB payloads, and hostile realtime broadcasts.",
    },
    {
      tech: "chess.js + react-chessboard",
      role: "Rules engine and web board UI",
      why: "Legality lives in chess.js on both platforms — including server-side tree replay — so boards stay dumb renderers.",
    },
    {
      tech: "Tailwind CSS / NativeWind",
      role: "Styling with one shared token set",
      why: "The same design tokens compile to web CSS and React Native styles.",
    },
  ],
  dataModel: {
    intro:
      "The schema centers on profiles — a 1:1 mirror of auth.users with a student/coach/admin role and an IANA timezone — with an admin-managed coach_students roster carrying a per-student reschedule kill switch. Around classes hang the teaching artifacts: materials, a reusable coach library, private notes, and trigger-guarded assignments. Scheduling is derived, not stored — weekly availability windows live as minutes-from-midnight in the coach's timezone, and open slots are computed live by a DST-correct RPC. The chess side stores whole variation trees as single recursive JSONB documents, shared between analyses and live playground rooms.",
    diagram: {
      entities: [
        { name: "profiles", fields: ["id (auth.users 1:1)", "role: student|coach|admin", "timezone", "full_name"] },
        { name: "classes", fields: ["coach_id", "starts_at / ends_at", "status enum (5 states)", "zoom_url", "reschedule_count"] },
        { name: "class_attendees", fields: ["class_id + student_id (PK)", "attended", "joined_at"] },
        { name: "coach_students", fields: ["coach_id + student_id (PK)", "reschedule_enabled", "assigned_by"] },
        { name: "playground_sessions", fields: ["coach_id", "student_id", "driver_id (board control)", "start_fen", "tree (JSONB)"] },
        { name: "puzzles", fields: ["lichess_id (unique)", "fen", "solution_moves (UCI)", "rating", "themes[]"] },
        { name: "reschedule_requests", fields: ["class_id", "proposed_starts_at / ends_at", "status", "decided_by"] },
        { name: "notifications", fields: ["recipient_id", "type", "class_id", "read_at"] },
      ],
      relations: [
        { from: "profiles", to: "classes", label: "coach teaches" },
        { from: "classes", to: "class_attendees", label: "has student via" },
        { from: "profiles", to: "coach_students", label: "roster (m:n coach-student)" },
        { from: "profiles", to: "playground_sessions", label: "coach + student + driver" },
        { from: "classes", to: "reschedule_requests", label: "student proposes move" },
        { from: "classes", to: "notifications", label: "trigger fan-out on change" },
        { from: "profiles", to: "notifications", label: "recipient" },
      ],
    },
  },
  decisions: [
    {
      chose: "hybrid Supabase-direct + tRPC",
      over: "an all-tRPC API",
      body: "Reads and realtime subscriptions call Supabase straight from the client — RLS guarantees a student only ever sees their own rows — while only multi-step writes go through tRPC routers, which themselves run on the caller's RLS-scoped client. The tradeoff is two data paths to reason about, but it removes a server hop from every read and makes Supabase Realtime free to use; the repo treats RLS as the security backbone and explicitly bans duplicating role checks in JS.",
    },
    {
      chose: "Broadcast mirror + DB snapshot",
      over: "Postgres CDC or a game server",
      body: "Every playground action applies optimistically, mirrors to the peer over a Broadcast channel, and persists via tRPC in parallel; a reconnector loads the authoritative DB row and then rides broadcasts. That gets sub-100ms move latency without a DB round-trip per move, at the cost of a brief window where the mirror leads the DB. Crucially, broadcasts are untrusted: each payload is re-validated with Zod on receipt, and the server-side move mutation re-checks driver identity and replays the whole tree through chess.js so a hostile client cannot persist an illegal board.",
    },
    {
      chose: "DB-trigger notification fan-out",
      over: "application-side inserts",
      body: "Notification rows are created only by SECURITY DEFINER triggers and one RPC, never by app code. Fan-out stays consistent no matter which client made the write, RLS would block cross-user inserts from JS anyway, and the existing tRPC mutations didn't have to change at all. The cost is business logic living in SQL — harder to test, with per-recipient timezone formatting done inside the trigger — accepted for guaranteed consistency.",
    },
    {
      chose: "one recursive JSONB tree per study",
      over: "a moves table",
      body: "Analyses and playground boards store the entire variation tree as a single JSONB document manipulated by pure structural-sharing functions in a shared package. A normalized moves table would allow per-move queries the product never makes, while the document model makes load-render-save and the broadcast payload trivially the same shape. A 2,000-node budget enforced in Zod keeps a pathological tree from blowing up the row.",
    },
    {
      chose: "a hand-rolled tap-to-move mobile board",
      over: "a native chessboard library",
      body: "The React Native board is ~130 lines: it parses FEN placement itself and renders Unicode chess glyphs in colored Pressable squares with tap-select/tap-move. Legality never lives in the board — chess.js decides what's legal on both platforms — so mobile could stay a dumb renderer with zero native dependencies. That matters in a repo where every new native module forces an EAS rebuild for all users.",
    },
  ],
  funFacts: [
    "The FK-naming war story: drizzle-kit push kept reverting foreign-key constraint names from PostgREST's _fkey convention to Drizzle's _fk default, silently breaking every embedded join in the app and causing a whole-app outage. The fix is two-layered — explicit foreignKey({ name }) builders on every FK, plus a rename script that runs after every push as defense in depth.",
    "The original RLS policies caused literal 'infinite recursion detected in policy' errors — classes policies referenced class_attendees and vice versa — fixed by wrapping cross-table lookups in SECURITY DEFINER helper functions that bypass RLS internally.",
    "The playground chess clock is deliberately never persisted: broadcasts share an epoch-ms 'since' timestamp and both clients independently compute the running side's remaining time as storedMs - (now - since) — clock sync without a server tick.",
    "Puzzles come from the Lichess CC0 dump, streamed from the .csv.zst file with in-process zstd decompression and upserted through the Supabase REST API instead of the Postgres pooler — the comment notes 'the pooler host has had flaky DNS.'",
    "Push notifications must no-op in Expo Go — SDK 53+ removed remote push there, so the app detects the environment and silently skips registration instead of crashing. Reschedule guardrails are hard constants: 12 hours notice and a maximum of 2 moves per class, checked against a DST-correct open-slots RPC that expands the coach's weekly windows in their own timezone.",
  ],
};
