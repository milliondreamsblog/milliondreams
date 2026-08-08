import type { CaseStudy } from "./types";

export const kirtanam: CaseStudy = {
  slug: "kirtanam",
  tldr: "Kirtanam is a private community portal for a monastic ashram with two pillars: a YouTube-style 'spiritual library' where monks watch only admin-approved channels — no ads, no related-video rabbit holes — and an operations platform covering biometric attendance, a member directory, policy documents, and admin dashboards. One Next.js app on Vercel serves the web UI, an Android APK that is just a Capacitor WebView pointed at the live deployment, and — improbably — the ZKTeco fingerprint terminals, which push attendance punches straight to a Next.js route impersonating their vendor's Windows server. The whole thing is deliberately engineered to run on free tiers: Supabase, Vercel Cron, and metadata-only YouTube sync.",
  architecture: {
    intro:
      "A single Next.js app serves the UI and every backend as API route handlers; the Android APK is a thin WebView shell that auto-updates on every Vercel deploy. YouTube channel metadata is mirrored into Supabase Postgres by cron-triggered sync jobs (daily incremental, weekly full), then browsed and full-text-searched through a per-monk channel allowlist — playback itself is a sandboxed YouTube IFrame wrapped in overlay shields. A third, stranger ingress exists for attendance: ZKTeco biometric terminals speak their native ADMS push protocol to /iclock/cdata, where the route authenticates devices by serial number, parses tab-separated ATTLOG payloads, and lands punches directly in Postgres.",
    diagram: {
      nodes: [
        { id: "browser", label: "Web browser (Next.js UI)", kind: "client" },
        { id: "android", label: "Android APK (Capacitor WebView)", kind: "client" },
        { id: "next", label: "Next.js app + API routes (Vercel)", kind: "service" },
        { id: "supabase", label: "Supabase (Postgres + Auth, RLS)", kind: "db" },
        { id: "ytapi", label: "YouTube Data API v3", kind: "external" },
        { id: "ytplayer", label: "YouTube IFrame player", kind: "external" },
        { id: "zk", label: "ZKTeco biometric terminals", kind: "external" },
        { id: "cron", label: "Vercel Cron (daily 02:00 / weekly)", kind: "queue" },
      ],
      edges: [
        { from: "browser", to: "next", label: "HTTPS + Bearer session token" },
        { from: "android", to: "next", label: "WebView loads kirtanam.vercel.app" },
        { from: "next", to: "supabase", label: "anon client (auth) + service-role client (data)" },
        { from: "next", to: "ytapi", label: "channel/video sync with backoff" },
        { from: "cron", to: "next", label: "sync-all endpoints (CRON_SECRET)" },
        { from: "zk", to: "next", label: "ADMS push to /iclock/cdata (ATTLOG)" },
        { from: "browser", to: "ytplayer", label: "sandboxed embed, shields + fallback" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 16 (App Router)",
      role: "UI, API routes, cron endpoints, device webhooks",
      why: "One codebase serves web, the Android WebView, and the biometric terminals — all on Vercel's free tier.",
    },
    {
      tech: "Supabase",
      role: "Postgres, Auth (PKCE), Row Level Security",
      why: "Free-tier managed Postgres with built-in auth, and RLS enforced on every table via 20+ numbered migrations.",
    },
    {
      tech: "TanStack Query v5",
      role: "Client data fetching and caching",
      why: "Replaced 20+ hand-rolled loading/data/error triplets and a manual Map cache in one refactor.",
    },
    {
      tech: "Capacitor 6",
      role: "Android wrapper",
      why: "A remote server.url means every Vercel deploy instantly updates every installed APK — no rebuild, no Play Store review.",
    },
    {
      tech: "YouTube Data API v3",
      role: "Source of channel/video/playlist metadata",
      why: "Content stays on YouTube; only metadata is synced into Postgres, saving quota and enabling search the API can't do.",
    },
    {
      tech: "Vercel Cron",
      role: "Scheduled sync triggers",
      why: "Daily incremental plus weekly full sync with zero worker infrastructure.",
    },
    {
      tech: "Tailwind CSS v4",
      role: "Styling per a documented design system",
      why: "A written design doc defines a calm Pine/Sage/Linen palette and density rules the whole app follows.",
    },
    {
      tech: "xlsx (SheetJS)",
      role: "Membership roster import",
      why: "The membership master data arrives as an Excel workbook, so the admin panel ingests it directly.",
    },
  ],
  dataModel: {
    intro:
      "The hub is profiles, keyed to auth.users with an integer role 1-6 enforced by a CHECK constraint and guarded twice: SQL-side by SECURITY DEFINER helpers baked into every RLS policy, and API-side by requireAdmin/requireUser. Channel access is two-layered — direct per-monk grants plus reusable named bundles like 'Engineering Student Monk' — and the attendance subsystem maps raw ZKTeco punches to profiles through its own device whitelist and user-mapping tables.",
    diagram: {
      entities: [
        { name: "profiles", fields: ["id (auth.users FK)", "email", "role 1-6", "full_name", "temple"] },
        { name: "youtube_channels", fields: ["channel_id (UC...)", "name", "is_active", "sync_status", "last_sync_at"] },
        { name: "yt_videos", fields: ["video_id", "channel_id", "title (tsvector GIN)", "kind video|short|live", "is_available"] },
        { name: "channel_accounts", fields: ["id", "slug", "name", "is_active"] },
        { name: "physical_attendance", fields: ["device_sn", "zk_user_id", "check_time", "verify_type", "raw_payload"] },
        { name: "bcdb", fields: ["email_id (unique)", "initiated_name", "legal_name", "counsellor", "is_deleted"] },
      ],
      relations: [
        { from: "yt_videos", to: "youtube_channels", label: "channel_id FK, cascade delete" },
        { from: "profiles", to: "youtube_channels", label: "user_channel_access (direct grant)" },
        { from: "profiles", to: "channel_accounts", label: "user_account_access (bundle membership)" },
        { from: "channel_accounts", to: "youtube_channels", label: "account_channel_access" },
        { from: "physical_attendance", to: "profiles", label: "attendance_user_mapping (zk_user_id)" },
        { from: "bcdb", to: "profiles", label: "claimed at signup by matching email" },
      ],
    },
  },
  decisions: [
    {
      chose: "a remote-URL Capacitor shell",
      over: "a bundled static export",
      body: "The APK doesn't package web assets — its WebView loads the live Vercel deployment, so every deploy instantly updates every installed phone with no rebuild or store review. The cost is requiring connectivity and giving up offline mode, which is acceptable for an app whose content streams from YouTube anyway. allowNavigation pins the WebView to the one domain so external links escape to the system browser.",
    },
    {
      chose: "syncing YouTube metadata into Postgres",
      over: "calling the API per request",
      body: "Daily incremental and weekly full crons mirror channel uploads into local tables, trading slight staleness for surviving the Data API's tight quota. It also unlocks what the API can't do: cross-channel full-text and trigram search scoped to a monk's allowed channels, and history preservation — vanished videos are marked unavailable rather than deleted, so favorites and activity logs keep resolving.",
    },
    {
      chose: "an ADMS-compatible endpoint inside Next.js",
      over: "vendor attendance software",
      body: "ZKTeco terminals normally push to a Windows 'ADMS' server; here a Next.js route speaks just enough of the protocol — SN handshake, ATTLOG parsing, a spoofed 'Server: ZK Web Server' header — that the devices believe they've found the real thing. That removes an entire self-hosted middleware box, at the cost of hand-maintaining a reverse-engineered parser. The route deliberately returns OK even on failure so a confused device never retry-storms the serverless function.",
    },
    {
      chose: "integer roles + RLS helpers",
      over: "an authorization framework",
      body: "Roles are one integer column (1 Super Admin through 6 Viewer) with a CHECK constraint, enforced twice — by SECURITY DEFINER helpers in every table's RLS policies and by requireAdmin/requireUser in API code. For a single-tenant community app that's simpler and harder to bypass than an app-layer-only policy engine: even a leaked anon key still hits RLS. The tradeoff is hardwiring the role list into the database.",
    },
    {
      chose: "an embedded YouTube player with shields",
      over: "self-hosted video",
      body: "Hosting hundreds of hours of lectures would cost real storage and bandwidth when the content already lives on YouTube. Instead the player wraps the IFrame API and fights the platform's engagement machinery: sandbox attributes, overlay shields over the logo and title bar, a paused-state interceptor that hides the related-videos grid, and an automatic fallback to a plain youtube-nocookie embed when ad-blockers kill the IFrame API. The price is a permanent cat-and-mouse dependency on YouTube's embed DOM.",
    },
  ],
  funFacts: [
    "The product name is spelled three ways in the same repo: the live site is 'kirtanam', the Android app and migration headers say 'Kritaman', the README calls the project 'Ashram-Connect', and package.json calls it 'yt-lectures-app'.",
    "The very first migration file is committed as UTF-16, and the migrations README explicitly warns you to re-save it as UTF-8 before your SQL editor will accept it.",
    "The repo contains a brutally honest self-audit that scores the codebase 7/10 and calls out a 2,700-line AdminPanel god component — followed by docs recording the refactor that split a 1,208-line component into 5 hooks, 5 components, and a 233-line orchestrator.",
    "Attendance punches are only ingested inside a per-machine time window (default 02:00-11:00) — the system deliberately records only the morning program and discards every other biometric event. A hardcoded two-serial device whitelist survives as dead code, superseded by a database table.",
    "The Harinam attendance table encodes spiritual practice as integer minutes per named session — the 7:00 AM and 7:40 AM sessions are worth 30 minutes each and 'PDC' is worth 90 — with a commented-out migration showing the columns used to be booleans.",
    "next.config.ts sets unoptimized: true on images with the comment 'Bypass Vercel image optimization to stay within free plan limits' — the entire deployment is engineered around free tiers.",
  ],
};
