# ProjectManager

## Overview
ProjectManager is a production-grade, full-stack MERN project and task management platform modeled on enterprise PM suites, built for consulting/operations teams (the codebase brands itself "SGC Project Management Tool"). It models the full work hierarchy — Projects → Milestones → Tasks → Subtasks → Comments — on top of a three-tier, runtime-configurable role-based access control system (Admin → Manager → OPIC). Every mutation is audit-logged with hierarchical visibility, a cron scheduler watches deadlines and fires real-time Pusher notifications, and dashboards render Recharts analytics plus an interactive D3.js task-dependency graph. It ships as a pnpm/Turborepo monorepo with three apps: an Express/MongoDB API (`apps/api`), a React 19 + Vite web client (`apps/web`), and an Expo React Native mobile app (`apps/mobile`).

## Architecture
The system is a classic API-centric MERN split, organized as a monorepo. The React web client (Vite, port 5174) and the Expo mobile client both talk to a single Express API (`apps/api/server.js`, port 5001) over REST (`/api/auth`, `/api/project`, `/api/task`, `/api/comment`, `/api/audit`, `/api/notifications`, `/api/calendar`, `/api/role-config`, `/api/templates`, `/api/zoho`). Every authenticated request passes through a JWT auth middleware, then a `permissionMiddleware` that looks the user's role up in a `RoleConfig` collection in MongoDB — so an admin can re-edit each role's permission set at runtime without redeploying. Controllers write to MongoDB via Mongoose and call `logActivity` (`apps/api/middlewares/auditLogMiddleware.js`), which resolves the actor's manager to a `parentId` so audit logs are visible hierarchically. A `node-cron` job (`apps/api/cron/notificationCron.js`) scans every minute for tasks due within 24 hours and pushes per-user Pusher Channels events (`user-<id>` channels) plus persisted in-app notifications; the mobile app additionally registers Expo push tokens. Files attach to comments via Multer → Cloudinary; Google OAuth handles login, and separate Google credentials drive two-way Google Calendar sync. Deployment targets are Vercel (web) + Render (API) + MongoDB Atlas, with a GitHub Actions keepalive workflow pinging `/health` every 12 minutes so Render's free tier never cold-starts.

### Diagram spec
```json
{
  "nodes": [
    {"id": "web", "label": "React 19 + Vite web app", "kind": "client"},
    {"id": "mobile", "label": "Expo React Native app", "kind": "client"},
    {"id": "api", "label": "Express API (JWT + RBAC + audit middleware)", "kind": "service"},
    {"id": "cron", "label": "node-cron deadline watcher", "kind": "service"},
    {"id": "mongo", "label": "MongoDB (Atlas / in-memory fallback)", "kind": "db"},
    {"id": "pusher", "label": "Pusher Channels", "kind": "external"},
    {"id": "cloudinary", "label": "Cloudinary file storage", "kind": "external"},
    {"id": "google", "label": "Google OAuth / Calendar / Drive", "kind": "external"},
    {"id": "smtp", "label": "Nodemailer SMTP", "kind": "external"}
  ],
  "edges": [
    {"from": "web", "to": "api", "label": "REST /api/* (Axios, JWT)"},
    {"from": "mobile", "to": "api", "label": "REST /api/* (Expo)"},
    {"from": "api", "to": "mongo", "label": "Mongoose models + RoleConfig lookup"},
    {"from": "cron", "to": "mongo", "label": "scan tasks due < 24h"},
    {"from": "cron", "to": "pusher", "label": "trigger user-<id> channel"},
    {"from": "pusher", "to": "web", "label": "real-time notifications"},
    {"from": "api", "to": "cloudinary", "label": "Multer upload attachments"},
    {"from": "api", "to": "google", "label": "OAuth login + Calendar sync"},
    {"from": "api", "to": "smtp", "label": "password reset emails"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| React 19 + Vite | Web SPA (`apps/web`) | Fast dev server/HMR; SPA fits a dashboard-heavy internal tool |
| Express 4 + Node 20 | REST API (`apps/api/server.js`) | Simple middleware chain suits layered auth → permission → audit pipeline |
| MongoDB + Mongoose | Primary datastore | Flexible schemas for evolving PM hierarchy; Atlas M0 free tier for deploys |
| mongodb-memory-server | Zero-config dev DB (`apps/api/config/db.js`) | If `MONGO_URI` is unset, an in-memory Mongo spins up and auto-seeds demo data |
| JWT + bcryptjs + Passport (Google OAuth) | Authentication | Stateless tokens for two client apps; OAuth lowers login friction |
| Pusher Channels | Real-time notifications | Managed WebSockets — no socket server to host on Render's free tier |
| node-cron | Deadline watcher (`apps/api/cron/notificationCron.js`) | In-process scheduling, no external job queue needed |
| D3.js | Task dependency/hierarchy graph (`apps/web/src/Components/Projects/ProjectsTable/TaskGraphView.jsx`) | Full control over custom node/edge rendering that chart libs can't do |
| Recharts + FullCalendar | Analytics dashboards + calendar views | Declarative charts; FullCalendar pairs with two-way Google Calendar sync |
| Multer + Cloudinary | Comment file attachments | Free-tier managed storage/CDN; replaced an earlier S3 integration |
| Expo (React Native) + Expo Router | Mobile app (`apps/mobile`) | Shares the same REST API; EAS builds; Expo push tokens for mobile notifications |
| pnpm workspaces + Turborepo | Monorepo tooling | Shared `packages/types`, `packages/api-client`, `packages/config` across web/mobile/api |

## Data model
The schema (all in `apps/api/models/`) mirrors the org hierarchy and the work hierarchy. `User` has a `role` enum (`admin`/`manager`/`opic`) plus a `managerId` self-reference, which powers both RBAC and audit-log visibility. `Project` owns arrays of `Milestone`, `Task`, and assigned `User` refs, and auto-validates completion rules in `pre('save')` hooks (e.g. a completed project's status can never be reverted). `Task` (in `Task1.js`) references an assignee, assigner, milestone, subtasks, comments, and an embedded `dependencies` array of `{personId, description, status}` — a save hook refuses to mark a task Completed while any dependency is incomplete. `Milestone` has a `updateStatus()` method that auto-completes when all its tasks complete. `Comment` embeds Cloudinary attachments (with a legacy `s3Key` field kept for backward compatibility) and Google Drive links. `RoleConfig` stores each role's permission list (14 permission enums) and is read on every guarded request by `permissionMiddleware`. `AuditLog` records every mutation with `userId`, `action`, `objectType`, and a computed `parentId`. Supporting models: `Notification`, `ProjectTemplate`, `ClientName`, `Event` (calendar), `GoogleToken`/`ZohoToken` (OAuth token storage).

### DB diagram spec
```json
{
  "entities": [
    {"name": "User", "fields": ["email", "role: admin|manager|opic", "managerId → User", "permissions[]", "expoPushTokens[]"]},
    {"name": "Project", "fields": ["projectId (PJYYMMDD-0001)", "owner → User", "milestones[] → Milestone", "team", "totalBudget", "status"]},
    {"name": "Milestone", "fields": ["milestoneId (M1, M2…)", "projectId → Project", "budget", "dueDate", "status"]},
    {"name": "Task", "fields": ["taskId", "assignee → User", "dependencies[{personId, status}]", "progress 0-100", "milestone → Milestone"]},
    {"name": "Comment", "fields": ["task → Task", "user → User", "attachments[{fileUrl, publicId, s3Key}]", "driveLinks[]"]},
    {"name": "AuditLog", "fields": ["userId → User", "action", "objectType", "parentId → User", "timestamp"]}
  ],
  "relations": [
    {"from": "User", "to": "User", "label": "managerId (org hierarchy)"},
    {"from": "Project", "to": "Milestone", "label": "has many"},
    {"from": "Milestone", "to": "Task", "label": "has many"},
    {"from": "Task", "to": "Comment", "label": "has many"},
    {"from": "AuditLog", "to": "User", "label": "actor + parent visibility"},
    {"from": "Task", "to": "User", "label": "assignee / assigner / dependency person"}
  ]
}
```

## Why this, not that
### Why runtime-configurable RBAC, not hard-coded role checks
Permissions live in a `RoleConfig` MongoDB collection and are fetched per-request in `apps/api/middlewares/permissionMiddleware.js`, so an admin can add or revoke a permission (e.g. give managers `delete_task`) from the Admin UI with zero redeploys. The tradeoff is an extra DB read on every guarded request and the risk of a missing config locking a role out (the middleware returns a 403 with "contact administrator" for exactly that case); admin bypasses the lookup entirely.

### Why Pusher Channels, not self-hosted Socket.IO
`apps/api/server.js` still contains the commented-out Socket.IO server that was tried first; it was replaced by Pusher (`apps/api/PusherNotification/Pusher.js`) with one channel per user (`user-<id>`). On Render's free tier, long-lived WebSocket servers fight with instance sleep and cold starts — a managed pub/sub service sidesteps that, at the cost of a vendor dependency, which the code softens by making Pusher a safe no-op when credentials are absent.

### Why an in-memory MongoDB fallback, not requiring Atlas for dev
`apps/api/config/db.js` boots `mongodb-memory-server` and auto-runs the seed script whenever `MONGO_URI` is unset, so `pnpm --filter @pm/api dev` works with literally zero configuration (login: `admin@demo.com` / `Demo@12345`). Data evaporates on restart — acceptable for demos and recruiter walkthroughs, and a real Atlas URI switches it off.

### Why a pnpm/Turborepo monorepo, not three separate repos
Web, mobile, and API share `packages/types`, `packages/api-client`, and `packages/config`, so the Expo app and the React app consume the same typed API surface instead of drifting apart (the migration is documented in `MONOREPO_MOBILE_PLAN.md`). The cost is heavier tooling (pnpm workspaces, Turborepo, per-app Dockerfiles) for what is functionally one product.

### Why Cloudinary, not AWS S3
The `Comment` schema still carries a legacy `s3Key` field "kept for backward compatibility" next to the Cloudinary `publicId` — evidence of a deliberate migration. Cloudinary's free tier bundles storage, CDN delivery, and transformations behind one API key set, versus S3's IAM/bucket-policy setup; `.env.example` still lists the optional AWS variables as an alternative.

## Fun facts
- A GitHub Actions workflow (`.github/workflows/keepalive.yml`) pings the API's `/health` endpoint every 12 minutes explicitly "so Render's free tier doesn't sleep (and recruiters don't hit a 30–60s cold start)".
- The deadline cron in `apps/api/cron/notificationCron.js` is scheduled at `*/1 * * * *` — every single minute — even though the header comment says "Cron job that runs every hour"; it is currently disabled (the `require` in `server.js` is commented out).
- The Task model lives in `models/Task1.js` and guards its export with `mongoose.models.Task || mongoose.model(...)` — scars from an earlier duplicate-model-registration bug.
- The Pusher notification payload misspells `progress` as `prograss` (`apps/api/PusherNotification/Pusher.js`), and the frontend has to match it.
- Project IDs are auto-generated in the format `PJYYMMDD-0001` and milestone IDs as `M1, M2, …`; the seed script (`apps/api/scripts/seed.js`) rebuilds the date stamp on every run so demo data always looks current.
- Business-logic invariants live in Mongoose `pre('save')` hooks: you cannot complete a task with incomplete dependencies, set a completion date in the future, or un-complete a completed project.

## Screenshot targets
- Login page (`/` → `LoginForm.jsx`) — Google OAuth button plus seeded demo credentials.
- Dashboard (`Dashboard.jsx`) — stats cards, workload/performance Recharts, task alert panel.
- Project detail with the D3 dependency graph (`TaskGraphView.jsx`) — the single most distinctive screen.
- Task management view (`TaskManagement.jsx`) with threaded comments and Cloudinary attachments.
- Calendar (`Calender.jsx`) showing Google Calendar sync; Audit Logs page (`AuditLogs.jsx`); Admin role-permission editor (`Admin.jsx`).
- Runs locally without any secrets: `pnpm install`, then `pnpm --filter @pm/api dev` (http://localhost:5001 — in-memory DB auto-seeds) and `pnpm --filter @pm/web dev` (http://localhost:5174); log in with `admin@demo.com` / `Demo@12345`. Mobile: `pnpm --filter @pm/mobile start` with `EXPO_PUBLIC_API_URL` set.
- No live URL is committed in the repo; README targets Vercel (web) + Render (API). Author should supply the deployed URL if one exists.

## Gaps
- The deployed production URL (Vercel/Render) is not recorded anywhere in the repo — confirm whether a live demo exists and its address.
- Real usage numbers (team size, projects tracked) and whether "SGC" is a real client/organization the tool was built for.
- The Zoho Books client-sync routes (`apps/api/routes/zoho.js`) are described in `.env.example` as "mocked/seeded in portfolio build" — clarify how much of the Zoho integration is real.
- Socket.IO → Pusher migration story and the current status of the disabled notification cron (commented out in `server.js`).
- Whether the Expo mobile app has shipped via EAS/TestFlight/Play Store or remains dev-only.
