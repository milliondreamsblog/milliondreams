# Kirtanam

## Overview
Kirtanam (repo name "Ashram-Connect", package name `yt-lectures-app`) is a private community portal for a monastic/ashram organisation, live at https://kirtanam.vercel.app. It has two pillars, described in docs/PROGRESS.md: a curated "spiritual library" — a YouTube-style viewer restricted to admin-approved channels, with no ads or related-video rabbit holes — and an operations platform covering biometric attendance (ZKTeco hardware), manual Harinam session marking, a member directory, policy documents, and admin dashboards. Its users are monks (default role 6 "Viewer") who watch only the channels an admin has assigned to them, and a small set of admins (role 1 "Super Admin") who manage channels, accounts, monks, and attendance. It is built with Next.js 16 (App Router), React 19, Supabase (Postgres + Auth + RLS), and TanStack Query, and ships to Android as a Capacitor WebView wrapper (capacitor.config.ts, android/) pointed at the live Vercel deployment.

## Architecture
The system is a single Next.js app deployed on Vercel that serves both the UI and all backend logic as route handlers under src/app/api/. Browsers and the Android app hit the same deployment: capacitor.config.ts sets `server.url` to https://kirtanam.vercel.app with `allowNavigation` locked to that domain, so the APK is a thin WebView shell (app id `com.ashramconnect.app`, name "Kritaman" in android/app/src/main/res/values/strings.xml) that auto-updates on every web deploy. Client pages authenticate against Supabase Auth (PKCE flow, src/lib/supabase.ts) and send the session token as a Bearer header; API routes verify it with the anon client, then do data access through a service-role admin client so RLS quirks never bite server code (src/lib/auth-server.ts).

Video data flows in two directions. Inbound, src/lib/youtube-sync.ts pulls each approved channel's uploads playlist from the YouTube Data API v3 (with exponential backoff and an atomic `sync_status` lock on the `youtube_channels` row) and upserts metadata into `yt_videos` / `yt_playlists` in Postgres; Vercel Cron (vercel.json) triggers an incremental sync of the latest 50 videos daily at 02:00 via src/app/api/admin/youtube/sync-all/route.ts and a full re-sync weekly via sync-all-full, both gated by a `CRON_SECRET` bearer token. Outbound, browsing and search (src/app/api/youtube/feed/route.ts, search/route.ts) read from Postgres — using GIN tsvector and pg_trgm indexes from supabase/migrations/040_fuzzy_search.sql and 041_youtube_search.sql — filtered through a per-monk channel allowlist computed in `getUserAllowedChannelIds()` (src/lib/auth-server.ts) from direct grants (`user_channel_access`) and reusable account bundles (`channel_accounts` via `user_account_access` and `account_channel_access`). Playback itself is a sandboxed YouTube IFrame in src/components/OptimizedVideoPlayer.tsx, with overlay shields, a fallback embed, and Media Session API integration.

A third, unusual ingress exists for attendance: ZKTeco biometric terminals speak the ADMS push protocol directly to src/app/iclock/cdata/route.ts (plus a catch-all src/app/iclock/[...slug]/route.ts). The route impersonates a "ZK Web Server", authenticates devices by serial number against `attendance_machines`, parses tab-separated ATTLOG payloads, filters punches to each machine's ingestion window (default 02:00-11:00), and inserts rows into `physical_attendance`. Every user action (view_channel, play_video, search, access_denied, open_external) is fire-and-forget logged to `user_activity_log` for the admin activity dashboard.

### Diagram spec
```json
{
  "nodes": [
    {"id": "browser", "label": "Web browser (Next.js UI)", "kind": "client"},
    {"id": "android", "label": "Android APK (Capacitor WebView)", "kind": "client"},
    {"id": "next", "label": "Next.js app + API routes (Vercel)", "kind": "service"},
    {"id": "supabase", "label": "Supabase (Postgres + Auth, RLS)", "kind": "db"},
    {"id": "ytapi", "label": "YouTube Data API v3", "kind": "external"},
    {"id": "ytplayer", "label": "YouTube IFrame player", "kind": "external"},
    {"id": "zk", "label": "ZKTeco biometric terminals", "kind": "external"},
    {"id": "cron", "label": "Vercel Cron (daily 02:00 / weekly)", "kind": "queue"}
  ],
  "edges": [
    {"from": "browser", "to": "next", "label": "HTTPS + Bearer session token"},
    {"from": "android", "to": "next", "label": "WebView loads kirtanam.vercel.app"},
    {"from": "next", "to": "supabase", "label": "anon client (auth) + service-role client (data)"},
    {"from": "next", "to": "ytapi", "label": "channel/playlist/video sync with backoff"},
    {"from": "cron", "to": "next", "label": "GET /api/admin/youtube/sync-all (CRON_SECRET)"},
    {"from": "zk", "to": "next", "label": "ADMS push to /iclock/cdata (ATTLOG)"},
    {"from": "browser", "to": "ytplayer", "label": "sandboxed embed, shields + fallback"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
| --- | --- | --- |
| Next.js 16 (App Router) | UI, API route handlers, cron endpoints in one deployable | One codebase serves web, Android WebView, and device webhooks; Vercel free tier hosts it all |
| React 19 + TypeScript | Client UI | Standard pairing with Next.js; TS adoption is partial (docs/PROGRESS.md tracks `any`-type cleanup) |
| Supabase | Postgres, Auth (PKCE), Row Level Security | Free-tier managed Postgres with built-in auth; RLS enforced on every table (supabase/migrations/) |
| TanStack Query v5 | Client data fetching/caching | Replaced 20+ hand-rolled loading/data/error triplets and a manual Map cache (docs/PROGRESS.md T3) |
| Tailwind CSS v4 | Styling per a documented design system | docs/design.md defines a calm Pine/Sage/Linen palette and density rules |
| Capacitor 6 | Android wrapper (android/, capacitor.config.ts) | Remote `server.url` means every Vercel deploy updates every installed APK with no rebuild |
| YouTube Data API v3 | Source of channel/video/playlist metadata | Content lives on YouTube; only metadata is synced into Postgres to save quota and enable search |
| Vercel Cron | Scheduled sync triggers (vercel.json) | Daily incremental + weekly full sync without any worker infrastructure |
| Recharts | Admin analytics charts | Lightweight charting for the visits/activity dashboards |
| xlsx (SheetJS) | BCDB roster import (src/app/api/admin/bcdb/import/route.ts) | Membership master data arrives as an Excel workbook ("NVCC Kritaman.xlsx" per 015_attendance_bcdb.sql) |

## Data model
The schema lives in 20+ numbered SQL migrations under supabase/migrations/ (run in filename order; see supabase/migrations/README.md). The hub is `profiles` (001_core_schema.sql), keyed to `auth.users` with an integer role 1-6 enforced by a CHECK constraint and auto-created by a trigger on signup (002_rbac.sql, which also defines the `is_admin()` / `is_uploader()` SECURITY DEFINER helpers used by every RLS policy). Content is `youtube_channels` (admin-approved list with `sync_status`, `last_sync_at`, `sync_error` from 021_sync_refinements.sql) parenting `yt_videos` and `yt_playlists` (041_youtube_search.sql), plus a legacy `lectures` table for hand-uploaded BC class videos. Access control is two-layered (004_account_access.sql, 005_channel_access.sql): direct grants in `user_channel_access`, and reusable bundles — `channel_accounts` (e.g. "Engineering Student Monk") joined to channels via `account_channel_access` and to users via `user_account_access`. The attendance subsystem (010-016) spans `physical_attendance` (raw ZKTeco punches with device serial, ZK user id, verify type), `attendance_machines` and `attendance_settings` (device whitelist + ingestion windows), `attendance_user_mapping` (ZK id to profile), `attendance_exceptions`, and `harinam_attendance` (manual per-session minutes keyed on user email + date). `bcdb` (015_attendance_bcdb.sql) is the imported membership master roster — 30+ columns from names and initiations to blood group and Aadhaar — matched to signups by email in src/app/api/auth/bcdb-check/route.ts. Engagement is tracked in `user_favorites`, `user_visits`, and `user_activity_log`.

### DB diagram spec
```json
{
  "entities": [
    {"name": "profiles", "fields": ["id (auth.users FK)", "email", "role 1-6", "full_name", "temple"]},
    {"name": "youtube_channels", "fields": ["channel_id (UC...)", "name", "is_active", "sync_status", "last_sync_at"]},
    {"name": "yt_videos", "fields": ["video_id", "channel_id", "title (tsvector GIN)", "kind video|short|live", "duration_seconds", "is_available"]},
    {"name": "channel_accounts", "fields": ["id", "slug", "name", "is_active"]},
    {"name": "physical_attendance", "fields": ["device_sn", "zk_user_id", "check_time", "verify_type", "raw_payload"]},
    {"name": "bcdb", "fields": ["email_id (unique)", "initiated_name", "legal_name", "counsellor", "is_deleted"]}
  ],
  "relations": [
    {"from": "yt_videos", "to": "youtube_channels", "label": "channel_id FK, cascade delete"},
    {"from": "profiles", "to": "youtube_channels", "label": "user_channel_access (direct grant)"},
    {"from": "profiles", "to": "channel_accounts", "label": "user_account_access (bundle membership)"},
    {"from": "channel_accounts", "to": "youtube_channels", "label": "account_channel_access"},
    {"from": "physical_attendance", "to": "profiles", "label": "attendance_user_mapping (zk_user_id)"},
    {"from": "bcdb", "to": "profiles", "label": "claimed at signup by matching email"}
  ]
}
```

## Why this, not that

### Why a remote-URL Capacitor shell, not a bundled static export
capacitor.config.ts sets `server.url` to the live Vercel deployment instead of packaging web assets into the APK (`webDir: "out"` is declared but explicitly noted as unused). The tradeoff is stated in the config comment: every Vercel deploy instantly updates every installed APK with no rebuild or Play Store review, at the cost of requiring connectivity and giving up offline capability — acceptable for an app whose content is streamed from YouTube anyway. `allowNavigation` pins the WebView to kirtanam.vercel.app so YouTube/share links escape to the system browser.

### Why syncing YouTube metadata into Postgres, not calling the API per request
src/lib/youtube-sync.ts mirrors channel uploads into `yt_videos` via daily incremental (first 50) and weekly full crons (vercel.json), rather than proxying the YouTube API live. This trades slight staleness for surviving the Data API's tight quota, and unlocks things the API cannot do: cross-channel full-text and trigram search over only the monk's allowed channels (040_fuzzy_search.sql, 041_youtube_search.sql), and history preservation — full syncs mark vanished videos `is_available = false` instead of deleting them, so favorites and activity logs keep resolving.

### Why an ADMS-compatible endpoint inside Next.js, not vendor attendance software
ZKTeco terminals normally push to a Windows "ADMS" server; here src/app/iclock/cdata/route.ts speaks just enough of the protocol (SN handshake, ATTLOG parsing, a spoofed `Server: ZK Web Server` header) that the devices believe they are talking to the real thing. That removes an entire self-hosted middleware box and lands punches directly in the same Postgres the dashboards read, at the cost of hand-maintaining a reverse-engineered parser — and the route deliberately returns "OK" even on failure so a confused device never retry-storms the serverless function.

### Why integer roles plus RLS helper functions, not an authorization framework
Roles are a single integer column (1 Super Admin through 6 Viewer) with a CHECK constraint, and authorization is enforced twice: SQL-side by `is_admin()` SECURITY DEFINER helpers embedded in every table's RLS policies (002_rbac.sql), and API-side by `requireAdmin()` / `requireUser()` in src/lib/auth-server.ts. For a single-tenant community app this is simpler and harder to bypass than an app-layer-only policy engine — even a leaked anon key hits RLS — though it hardwires the role list into the database.

### Why an embedded YouTube player with shields, not self-hosted video
Hosting hundreds of hours of lectures would cost real storage and bandwidth; the content already lives on YouTube. src/components/OptimizedVideoPlayer.tsx instead wraps the IFrame API and fights the platform's engagement machinery: sandbox attributes, overlay shields over the logo and title bar, a paused-state interceptor that hides the related-videos grid, and an automatic fallback to a plain youtube-nocookie embed when the IFrame API is blocked by ad-blockers. The tradeoff is a permanent cat-and-mouse dependency on YouTube's embed DOM.

## Fun facts
- The product name is spelled three ways in the same repo: the live site is "kirtanam.vercel.app", but capacitor.config.ts and android/app/src/main/res/values/strings.xml both name the app "Kritaman", and migration headers say "Kritaman" too — while the README calls the project "Ashram-Connect" and package.json calls it "yt-lectures-app".
- supabase/migrations/001_core_schema.sql is committed as UTF-16; the migrations README explicitly warns you to re-save it as UTF-8 before your SQL editor will accept it.
- docs/notes.md contains a brutally honest self-audit that scores the codebase 7/10, calling out a 2,700-line `AdminPanel.tsx` god component — and docs/PROGRESS.md then documents the refactor that split the 1,208-line `YouTubeChannelHub.tsx` into 5 hooks + 5 components + a 233-line orchestrator (src/components/youtube-hub/).
- Attendance punches are only ingested inside a per-machine time window (default 02:00-11:00 in src/app/iclock/cdata/route.ts) — the system deliberately records only the morning program, discarding all other biometric events. There is also a hardcoded `AUTHORIZED_SNS` whitelist of two device serials that is now dead code, superseded by the `attendance_machines` table lookup.
- `harinam_attendance` (016_harinam_attendance.sql) encodes spiritual practice as integer minutes per named session: the 7:00 AM and 7:40 AM sessions are worth 30 minutes each and "PDC" is worth 90, with a commented migration showing the columns used to be booleans.
- next.config.ts sets `unoptimized: true` on images with the comment "Bypass Vercel image optimization to stay within free plan limits" — the whole deployment is engineered around free tiers.

## Screenshot targets
- `/` (src/app/page.tsx) — the YouTube channel hub: channel picker grid, global search, then per-channel view with the shielded player (src/components/youtube-hub/views/). The flagship screen.
- `/login` (src/app/login/page.tsx) — auth screen with the BCDB membership gate (src/app/api/auth/bcdb-check/route.ts).
- `/dashboard/admin` and subpages `monks`, `accounts`, `youtube-channels`, `activity` (src/app/dashboard/admin/) — monk management, channel-access assignment, sync status, and the activity audit trail.
- `/admin` (src/app/admin/page.tsx) — the legacy 2,700-line AdminPanel with attendance machines, BCDB manager, and analytics (Recharts).
- `/attendance` (src/app/attendance/page.tsx) — biometric + Harinam attendance reports.
- `/directory` and `/policy-manual` — member directory and the "royal scroll" policy surfaces styled per docs/design.md.
- Local run: **not possible without secrets.** There is no `.env.example` committed (despite README.md referencing `cp .env.example .env.local` — the `.gitignore`'s `.env*` pattern likely swallowed it). You need a Supabase project (URL, anon key, service-role key), a YouTube Data API v3 key, and a `CRON_SECRET`, then run the migrations in supabase/migrations/ in filename order (minimum 001-005 plus 040/041), promote an admin with `node scripts/create-admin.js <email> <password>`, and start with `pnpm install && pnpm dev` on port 3100 (pinned in package.json). Full variable list is in docs/PROGRESS.md section 8.
- Live URL: https://kirtanam.vercel.app (also the URL the Android APK loads) — easiest source of real screenshots if you have an account.

## Gaps
- Role 5 ("Manager") is marked "TBD" in docs/PROGRESS.md — its intended access is undefined in both docs and code.
- No deployment scale data: number of real monks, channels, or attendance devices in production (only two device serials appear in dead code in src/app/iclock/cdata/route.ts).
- The `.env.example` situation should be confirmed by the author: PROGRESS.md marks task T8 "Done" but no such file exists in the repo snapshot.
- `supabase/migrations/070_data.sql` (seed data slot) is empty and `071_schema_utf8.sql` is a stub — unclear whether seed data exists elsewhere.
- License is "TBD" per README.md; the repo cannot be labeled open source yet.
- The story behind scripts/legacy/ (a Python "premium_redesign" script and a Harinam regex helper) is undocumented — worth a sentence from the author.
- Whether iOS was ever attempted (Capacitor supports it; only android/ exists) is unknown.
