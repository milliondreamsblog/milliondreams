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
  decisions: [],
  funFacts: [],
};
