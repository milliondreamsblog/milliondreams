# Elvyn Chess

## Overview

Elvyn is a chess coaching SaaS for a small coaching team ("Elvyn Team"): coaches and admins schedule 1-on-1 classes, manage rosters and teaching materials, and run live shared chess boards, while students see an agenda of their classes, solve curated Lichess puzzles, submit assignments, and request reschedules into a coach's open slots. It ships as a Turborepo monorepo with two surfaces over the same domain logic — a Next.js web portal (`apps/web`) and an Expo/React Native mobile app (`apps/mobile`) — backed by Supabase (Postgres, Auth, Realtime, Row Level Security) with Drizzle ORM for schema and tRPC for business-logic writes. Its distinguishing problem-solve is the "Playground": a realtime coach-plus-student chess room with a driver/handoff control model, presence, a synced analysis move tree, and an optional broadcast-synced chess clock, working identically on web and phone.

## Architecture

The system is a hybrid of direct-to-Supabase reads and tRPC-mediated writes, a pattern the repo explicitly locks in (`CLAUDE.md`: "Hybrid data pattern — do not collapse it"). Both clients read and subscribe with the Supabase JS client directly — RLS policies (`packages/db/migrations/sql/0001_rls_and_triggers.sql` and later migrations) guarantee a student can only ever see their own rows, so simple reads never pass through an app server. Complex writes (class creation, reschedule approval, playground moves, roster changes) go through tRPC routers in `packages/api/src/routers/`, which run with the caller's own Supabase session so RLS still applies underneath the business logic.

There is only one server: the Next.js app. Its `/api/trpc` route (`apps/web/src/app/api/trpc/[trpc]/route.ts`) serves both surfaces — web authenticates via cookies (`@supabase/ssr`), while mobile sends a Supabase access token as a bearer header, which the route turns into a token-scoped client via `apps/web/src/lib/supabase/bearer.ts`. Shared code lives in `packages/`: `validators` (Zod, the single source of truth for shapes), `db` (Drizzle schema + SQL migrations), `features` (pure platform-agnostic domain logic like `deriveDisplayStatus` and the analysis move tree), `supabase` (client factories), and `ui`/`config` (design tokens, primitives, shared configs).

Realtime flows on two rails. The Playground uses per-room Supabase Realtime channels (`playground:{sessionId}`) carrying Presence plus Zod-validated Broadcast messages for moves, control handoff, cursor sync, and clock state (`apps/web/src/features/playground/use-playground-room.ts` and its mobile twin), with the `playground_sessions` DB row as the authoritative snapshot for reconnects. Notifications are DB-driven: SECURITY DEFINER triggers on `classes`/`class_attendees` fan out rows into `notifications` (`packages/db/migrations/sql/0009_notifications.sql`), clients subscribe to their own INSERTs for the in-app bell, and a Database Webhook fires the `supabase/functions/send-push` edge function, which delivers phone banners via the Expo Push API. Errors from both apps report to two Sentry projects; mobile ships JS updates over the air via `expo-updates` (`apps/mobile/src/lib/updates.tsx`).

### Diagram spec

```json
{
  "nodes": [
    { "id": "web", "label": "Next.js web app (apps/web)", "kind": "client" },
    { "id": "mobile", "label": "Expo mobile app (apps/mobile)", "kind": "client" },
    { "id": "trpc", "label": "tRPC API route (/api/trpc, packages/api)", "kind": "service" },
    { "id": "pg", "label": "Supabase Postgres + RLS (Drizzle schema)", "kind": "db" },
    { "id": "auth", "label": "Supabase Auth", "kind": "service" },
    { "id": "realtime", "label": "Supabase Realtime (Broadcast/Presence/CDC)", "kind": "service" },
    { "id": "edge", "label": "send-push edge function", "kind": "service" },
    { "id": "expopush", "label": "Expo Push API", "kind": "external" },
    { "id": "sentry", "label": "Sentry (web + mobile)", "kind": "external" }
  ],
  "edges": [
    { "from": "web", "to": "pg", "label": "direct reads (RLS-scoped)" },
    { "from": "mobile", "to": "pg", "label": "direct reads (RLS-scoped)" },
    { "from": "web", "to": "trpc", "label": "writes (cookie auth)" },
    { "from": "mobile", "to": "trpc", "label": "writes (bearer token)" },
    { "from": "trpc", "to": "pg", "label": "user-scoped Supabase client" },
    { "from": "web", "to": "realtime", "label": "playground channel + notification INSERTs" },
    { "from": "mobile", "to": "realtime", "label": "playground channel + notification INSERTs" },
    { "from": "pg", "to": "edge", "label": "webhook on notifications INSERT" },
    { "from": "edge", "to": "expopush", "label": "batched push messages" },
    { "from": "web", "to": "auth", "label": "session" },
    { "from": "mobile", "to": "auth", "label": "session" },
    { "from": "web", "to": "sentry", "label": "errors" },
    { "from": "mobile", "to": "sentry", "label": "errors" }
  ]
}
```

## Tech stack

| Tech | Role | Why this choice |
| --- | --- | --- |
| Turborepo + pnpm workspaces | Monorepo build/task orchestration (`turbo.json`, root `package.json`) | One repo, two apps, seven shared packages; task graph with `^build` deps and cached outputs |
| Next.js 15 (App Router) | Web portal + the only server (hosts `/api/trpc`) | SSR for the agenda, one deployment serves both clients' API (`apps/web/package.json`) |
| Expo SDK 54 + Expo Router | Mobile app with file-based routing (`apps/mobile/app/`) | EAS build channels + `expo-updates` OTA lets JS-only fixes ship without store review |
| Supabase | Postgres, Auth, Realtime, Storage, Edge Functions | One backend covers auth, RLS-enforced data access, live channels, and push fan-out — no custom server fleet |
| Drizzle ORM + drizzle-kit | Schema definition and migrations (`packages/db/src/schema/`) | Typed schema in TS; hand-written SQL migrations layer RLS/triggers on top (`packages/db/migrations/sql/`) |
| tRPC v11 + superjson | Type-safe business-logic API (`packages/api`) | End-to-end types from router to both React clients with zero codegen |
| Zod (`packages/validators`) | Single source of truth for shapes | Same schemas validate tRPC inputs, DB JSONB payloads, and hostile realtime broadcasts |
| chess.js + react-chessboard | Chess rules engine and web board UI | chess.js validates legality server-side too (`validateTree`); react-chessboard renders the web board |
| TanStack Query | Client cache on web and mobile | Pairs with tRPC hooks; mobile got it when notifications needed the shared API (`CHANGELOG.md`) |
| Tailwind CSS / NativeWind | Styling with one shared token set (`packages/config/tailwind/tokens.js`) | Same design tokens compile to web CSS and RN styles |
| Sentry | Error reporting, two projects (elvyn-web, elvyn-mobile) | Repo convention: "Errors go to Sentry, not console" (`CLAUDE.md`) |
| date-fns + Intl | Date parsing and timezone display (`packages/features/src/availability/index.ts`) | Wall-clock rendering per IANA zone without a heavy TZ library |

## Data model

The schema (`packages/db/src/schema/`, one file per table) centers on `profiles`, a 1:1 mirror of Supabase `auth.users` created by a signup trigger, carrying a `role` enum (`student` / `coach` / `admin`) and an IANA `timezone` (default `Asia/Kolkata`). Coaching relationships live in `coach_students`, an admin-managed many-to-many roster with a per-student `reschedule_enabled` kill switch. A `classes` row (1-on-1 lessons with `starts_at`/`ends_at`, a manual `zoom_url`, and a five-state status enum) links to its student via `class_attendees`; the UI derives extra states like `starting_soon` from the clock rather than the DB (`packages/features/src/calendar/display-status.ts`).

Around classes hang the teaching artifacts: `class_materials` (per-class file/link uploads), `coach_library_items` + `class_material_attachments` (upload an asset once, attach it to many classes, soft-delete via `archived_at`), `class_notes` (one private coach note per class+student), and `class_assignments` + `class_submissions` (homework with a trigger-enforced column split between what the student and the coach may write). Scheduling is derived, not stored: `coach_availability` holds recurring weekly windows as minutes-from-midnight in the coach's timezone, and open slots are computed live by the `get_coach_open_slots()` SECURITY DEFINER RPC; `reschedule_requests` capture a student's proposal that only moves the class on coach approval. The chess side comprises `puzzles` (imported Lichess CC0 positions with UCI solutions), `puzzle_lists`/`puzzle_list_items` (admin-curated, publish-gated), `puzzle_attempts`, `analyses` (a whole study stored as one recursive JSONB `tree`), and `playground_sessions` (live rooms reusing the same `AnalysisNode` tree, plus a `driver_id` for board control). `notifications` and `push_tokens` complete the picture — notification rows are written only by SECURITY DEFINER triggers and the `broadcast_notification` RPC, never by clients.

### DB diagram spec

```json
{
  "entities": [
    { "name": "profiles", "fields": ["id (auth.users 1:1)", "role: student|coach|admin", "timezone", "full_name", "email"] },
    { "name": "classes", "fields": ["coach_id", "starts_at / ends_at (timestamptz)", "status enum (5 states)", "zoom_url", "reschedule_count"] },
    { "name": "class_attendees", "fields": ["class_id + student_id (PK)", "attended", "joined_at"] },
    { "name": "coach_students", "fields": ["coach_id + student_id (PK)", "reschedule_enabled", "assigned_by"] },
    { "name": "playground_sessions", "fields": ["coach_id", "student_id", "driver_id (board control)", "start_fen", "tree (JSONB AnalysisNode)"] },
    { "name": "puzzles", "fields": ["lichess_id (unique)", "fen", "solution_moves (UCI)", "rating", "themes[]"] },
    { "name": "reschedule_requests", "fields": ["class_id", "proposed_starts_at / ends_at", "status: pending|approved|declined|cancelled", "decided_by"] },
    { "name": "notifications", "fields": ["recipient_id", "type", "class_id", "read_at", "created_at"] }
  ],
  "relations": [
    { "from": "profiles", "to": "classes", "label": "coach teaches" },
    { "from": "classes", "to": "class_attendees", "label": "has student via" },
    { "from": "profiles", "to": "class_attendees", "label": "student attends" },
    { "from": "profiles", "to": "coach_students", "label": "roster (m:n coach-student)" },
    { "from": "profiles", "to": "playground_sessions", "label": "coach + student + driver" },
    { "from": "puzzles", "to": "playground_sessions", "label": "seed positions (via analyses)" },
    { "from": "classes", "to": "reschedule_requests", "label": "student proposes move" },
    { "from": "classes", "to": "notifications", "label": "trigger fan-out on change" },
    { "from": "profiles", "to": "notifications", "label": "recipient" }
  ]
}
```

## Why this, not that

### Why hybrid Supabase-direct + tRPC, not an all-tRPC API

Reads and realtime subscriptions call `supabase.from(...)` straight from the client, while only multi-step writes (booking, reschedule approval, playground moves) go through `packages/api` routers — and the tRPC context itself runs on the caller's own RLS-scoped Supabase client (`packages/api/src/trpc.ts`). The tradeoff is two data paths to reason about, but it removes a server hop from every read and makes Supabase Realtime free to use; the repo treats RLS as the security backbone and explicitly bans duplicating role checks in JS (`CLAUDE.md`).

### Why Broadcast-mirror-plus-DB-snapshot for the Playground, not Postgres CDC or a game server

Every playground action is applied optimistically, mirrored to the peer over a Supabase Broadcast channel, and persisted via tRPC in parallel (`apps/web/src/features/playground/use-playground-room.ts`); a joiner or reconnector loads the authoritative `playground_sessions` row and then rides broadcasts. This gets sub-100ms move latency without waiting on a DB round-trip per move, at the cost of a brief window where the mirror can lead the DB. Crucially, broadcasts are untrusted: each payload is re-validated with `PlaygroundBroadcastSchema` on receipt, and the server-side `move` mutation re-checks driver identity and replays the whole tree through chess.js (`validateTree` in `packages/api/src/routers/playground.ts`) so a hostile client cannot persist an illegal board.

### Why DB-trigger notification fan-out, not application-side inserts

Notification rows are created by SECURITY DEFINER triggers on `classes`/`class_attendees` and the `broadcast_notification` RPC (`packages/db/migrations/sql/0009_notifications.sql`), never by app code. The changelog gives the real reasons: fan-out stays consistent no matter which client made the write, and RLS would block cross-user inserts from JS anyway — the existing tRPC mutations did not have to change at all. The cost is business logic living in SQL (harder to test, per-recipient timezone formatting done with `to_char ... at time zone` in the trigger), accepted for guaranteed consistency.

### Why one recursive JSONB tree per study, not a moves table

Analyses and playground boards store the entire variation tree as a single JSONB `AnalysisNode` document (`packages/db/src/schema/analyses.ts`, `playground-sessions.ts`) manipulated by pure structural-sharing functions in `packages/features/src/analysis/index.ts`. A normalized moves table would allow per-move queries the product never makes, while the document model makes load-render-save and the broadcast payload trivially the same shape; a 2,000-node budget enforced in Zod (`packages/validators/src/playground.ts`) keeps a pathological tree from blowing up the row.

### Why a hand-rolled tap-to-move board on mobile, not a native chessboard library

The RN board is ~130 lines: it parses FEN placement itself and renders Unicode chess glyphs in colored `Pressable` squares with tap-select/tap-move interaction (`apps/mobile/src/features/puzzles/chess-board-rn.tsx`), while the web uses `react-chessboard` with drag-and-drop. Legality never lives in the board — chess.js in `packages/features` decides what is legal on both platforms — so the mobile board could stay a dumb renderer with zero native dependencies, which matters in a repo where every new native module forces an EAS rebuild for all users (`CLAUDE.md` mobile release model).

## Fun facts

- The FK-naming war story: `drizzle-kit push` kept reverting foreign-key constraint names from PostgREST's `<table>_<col>_fkey` convention to Drizzle's default `_fk` style, which silently broke every supabase-js embedded join in the app (PGRST200) and caused a whole-app outage. The fix is two-layered: every FK in `packages/db/src/schema/` is now declared with an explicit `foreignKey({ name: '..._fkey' })` builder, and `packages/db/scripts/rename-fks.mjs` runs after every `db:push` as defense in depth (`CHANGELOG.md`, `CLAUDE.md`).
- The original RLS policies caused Postgres "infinite recursion detected in policy" errors because `classes` policies referenced `class_attendees` and vice versa; migration `packages/db/migrations/sql/0002_fix_rls_recursion.sql` breaks the cycle by wrapping cross-table lookups in SECURITY DEFINER helper functions (`is_class_coach`, `is_class_attendee`) that bypass RLS internally.
- The playground chess clock is deliberately never persisted: `ClockStateSchema` broadcasts a shared epoch-ms `since` timestamp so both clients independently compute the running side's remaining time as `storedMs - (now - since)` — clock sync without a server tick (`packages/validators/src/playground.ts`).
- Puzzles come from the Lichess CC0 dump: `packages/db/scripts/import-lichess.mjs` streams the `.csv.zst` file with in-process zstd decompression and upserts through the Supabase REST API instead of the Postgres pooler — the comment notes "the pooler host has had flaky DNS". The Lichess convention is preserved: the first UCI move in `solution_moves` is auto-played and the solver starts on move two (`packages/features/src/puzzle/index.ts`).
- Push notifications must no-op in Expo Go: SDK 53+ removed remote push there, so `apps/mobile/src/lib/push.ts` detects `ExecutionEnvironment.StoreClient` and silently skips registration instead of crashing. Reschedule guardrails are hard constants: 12 hours notice and a maximum of 2 moves per class (`packages/validators/src/availability.ts`), enforced against the DST-correct `get_coach_open_slots()` RPC that expands the coach's weekly minutes-from-midnight windows in their own timezone (`packages/db/migrations/sql/0012_reschedule.sql`).

## Screenshot targets

- Web (routes under `apps/web/src/app/(app)/`): `/calendar` (agenda list grouped by day with live/starting-soon badges), `/calendar/[id]` (class detail with materials, notes, assignments, analysis sections), `/playground` (the live shared board — best captured with two browser sessions to show presence and driver handoff), `/puzzles` (puzzle bank + practice board), `/analysis` (move-tree study board), `/availability` (coach weekly-window editor), `/roster` and `/students` (coach/admin views), `/dashboard`.
- Mobile (screens under `apps/mobile/app/(app)/`): `agenda/index` and `agenda/[id]`, `playground` (the hand-rolled Unicode board next to the web board makes a great side-by-side), `puzzles`, `notifications`, `availability`, `profile` (includes the OTA update toast if one is pending).
- Live URL: the web app's metadata points at `https://elvyn-chess-web.vercel.app` (`apps/web/src/app/layout.tsx`). Mobile ships via EAS internal distribution (`preview` channel APK) and store builds (`production`), not a public link.
- Local run requires secrets: there is no seed-free demo mode. You need a Supabase project with URL/keys and pooler URLs filled into `.env` (from `.env.example`, plus `apps/web/.env.local` and `apps/mobile/.env`), then `pnpm install`, `pnpm --filter @elvyn/db db:push`, run `packages/db/migrations/sql/0001_rls_and_triggers.sql` (and later SQL migrations) in the Supabase SQL editor, then `pnpm dev:web` (localhost:3000) and `pnpm dev:mobile` (Expo dev server). Feature flags (`NEXT_PUBLIC_FF_ROSTER`, `_PUZZLES`, `_MATERIALS` and Expo twins) must be `true` to see those sections.

## Gaps

- No live production screenshots or user counts: the repo does not reveal how many coaches/students use it, nor whether `elvyn-chess-web.vercel.app` is the final production domain (the README roadmap and OG metadata are the only hints). Confirm the live URL and app-store status.
- Version drift to reconcile in the narrative: the README says "Next.js 16" and "Expo SDK 52" but `apps/web/package.json` pins `next ^15.1.3` and `apps/mobile/package.json` pins `expo ~54.0.0` — state which the author considers current.
- No CI configuration was found (no `.github/workflows`, no `vercel.json`); deployment appears to be Vercel for web and manual EAS commands for mobile (`apps/mobile/package.json` scripts). Confirm the actual deploy pipeline.
- No automated tests exist anywhere in the repo — worth acknowledging or explaining (the Zod + RLS + chess.js validation layers carry the correctness story).
- Migration `0013` is missing from `packages/db/migrations/sql/` (sequence jumps 0012 to 0014_drop_course_content) — presumably an abandoned course-content experiment; the author should confirm the story.
- The email integration is only half-visible: `packages/api/src/email/welcome.ts` and `RESEND_API_KEY` in `turbo.json` imply Resend welcome emails, but whether they are wired into production was not verified.
