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
  decisions: [],
  funFacts: [],
};
