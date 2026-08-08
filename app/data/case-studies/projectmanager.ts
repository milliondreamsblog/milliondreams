import type { CaseStudy } from "./types";

export const projectmanager: CaseStudy = {
  slug: "projectmanager",
  heroImage: "/case-studies/projectmanager/hero.png",
  heroCaption: "ProjectManager — running locally from a fresh clone, zero secrets",
  tldr: "ProjectManager is a full-stack MERN project-management platform — Projects → Milestones → Tasks → Subtasks → Comments — with a three-tier RBAC system whose permissions an admin can rewrite at runtime, no redeploy. Every mutation is audit-logged with manager-hierarchy visibility, a cron watcher fires real-time Pusher notifications for looming deadlines, and dashboards render Recharts analytics plus a D3 task-dependency graph. It ships as a pnpm/Turborepo monorepo: Express API, React 19 web app, and an Expo mobile app sharing one typed API client. The quiet star is the demo engineering: with no MONGO_URI set, an in-memory MongoDB spins up and seeds itself, and a GitHub Action pings /health every 12 minutes so Render's free tier never greets a recruiter with a cold start.",
  architecture: {
    intro:
      "A classic API-centric MERN split in one monorepo: the React web client and Expo mobile app both talk REST to a single Express API, where every authenticated request runs through JWT auth, then a permissionMiddleware that looks the caller's role up in a RoleConfig collection — so permission sets are data, editable from the Admin UI at runtime. Controllers write via Mongoose and call logActivity, which resolves the actor's manager into a parentId so audit logs read hierarchically. A node-cron job scans for tasks due within 24 hours and pushes per-user Pusher Channels events; files ride Multer → Cloudinary, and Google OAuth doubles as login and two-way Calendar sync.",
    diagram: {
      nodes: [
        { id: "web", label: "React 19 + Vite web app", kind: "client" },
        { id: "mobile", label: "Expo React Native app", kind: "client" },
        { id: "api", label: "Express API (JWT + RBAC + audit)", kind: "service" },
        { id: "cron", label: "node-cron deadline watcher", kind: "service" },
        { id: "mongo", label: "MongoDB (Atlas / in-memory fallback)", kind: "db" },
        { id: "pusher", label: "Pusher Channels", kind: "external" },
        { id: "cloudinary", label: "Cloudinary file storage", kind: "external" },
        { id: "google", label: "Google OAuth / Calendar", kind: "external" },
        { id: "smtp", label: "Nodemailer SMTP", kind: "external" },
      ],
      edges: [
        { from: "web", to: "api", label: "REST /api/* (Axios, JWT)" },
        { from: "mobile", to: "api", label: "REST /api/* (Expo)" },
        { from: "api", to: "mongo", label: "Mongoose + RoleConfig lookup" },
        { from: "cron", to: "mongo", label: "scan tasks due < 24h" },
        { from: "cron", to: "pusher", label: "trigger user-<id> channel" },
        { from: "pusher", to: "web", label: "real-time notifications" },
        { from: "api", to: "cloudinary", label: "Multer attachment uploads" },
        { from: "api", to: "google", label: "OAuth login + Calendar sync" },
        { from: "api", to: "smtp", label: "password-reset emails" },
      ],
    },
  },
  stack: [
    {
      tech: "React 19 + Vite",
      role: "Web SPA",
      why: "Fast HMR and an SPA shape that fits a dashboard-heavy internal tool.",
    },
    {
      tech: "Express 4 + Node 20",
      role: "REST API",
      why: "A plain middleware chain is exactly the right substrate for the layered auth → permission → audit pipeline.",
    },
    {
      tech: "MongoDB + Mongoose",
      role: "Primary datastore",
      why: "Flexible schemas for an evolving PM hierarchy, with business invariants enforced in pre-save hooks rather than app code.",
    },
    {
      tech: "mongodb-memory-server",
      role: "Zero-config dev database",
      why: "If MONGO_URI is unset, an in-memory Mongo boots and auto-seeds demo data — the whole platform runs from a fresh clone with zero secrets.",
    },
    {
      tech: "JWT + Passport (Google OAuth)",
      role: "Authentication",
      why: "Stateless tokens serve two client apps at once; OAuth removes signup friction for an internal tool.",
    },
    {
      tech: "Pusher Channels",
      role: "Real-time notifications",
      why: "Managed WebSockets mean no socket server fighting Render's free-tier instance sleep.",
    },
    {
      tech: "D3.js",
      role: "Task dependency graph",
      why: "Full control over custom node/edge rendering that off-the-shelf chart libraries can't express.",
    },
    {
      tech: "Multer + Cloudinary",
      role: "Comment attachments",
      why: "Free-tier storage, CDN, and transforms behind one key set — it replaced an earlier S3 integration.",
    },
    {
      tech: "pnpm + Turborepo",
      role: "Monorepo tooling",
      why: "Web, mobile, and API share typed packages so the two clients consume one API surface instead of drifting apart.",
    },
  ],
  dataModel: {
    intro:
      "The schema mirrors two hierarchies at once: the org chart and the work breakdown. User carries a role enum plus a managerId self-reference that powers both RBAC and audit-log visibility; Project owns Milestones, which own Tasks, which own Comments. Invariants live in Mongoose pre-save hooks — a task can't complete while a dependency is open, and a completed project can never be un-completed — while RoleConfig stores each role's editable permission list and is read on every guarded request.",
    diagram: {
      entities: [
        {
          name: "User",
          fields: ["email", "role: admin|manager|opic", "managerId → User", "expoPushTokens[]"],
        },
        {
          name: "Project",
          fields: ["projectId (PJYYMMDD-0001)", "owner → User", "milestones[]", "totalBudget", "status"],
        },
        {
          name: "Milestone",
          fields: ["milestoneId (M1, M2…)", "projectId → Project", "budget", "dueDate", "status"],
        },
        {
          name: "Task",
          fields: ["taskId", "assignee → User", "dependencies[{personId, status}]", "progress 0-100"],
        },
        {
          name: "Comment",
          fields: ["task → Task", "attachments[{fileUrl, publicId, s3Key}]", "driveLinks[]"],
        },
        {
          name: "AuditLog",
          fields: ["userId → User", "action", "objectType", "parentId → User"],
        },
      ],
      relations: [
        { from: "User", to: "User", label: "managerId (org hierarchy)" },
        { from: "Project", to: "Milestone", label: "has many" },
        { from: "Milestone", to: "Task", label: "has many" },
        { from: "Task", to: "Comment", label: "has many" },
        { from: "Task", to: "User", label: "assignee / dependency person" },
        { from: "AuditLog", to: "User", label: "actor + parent visibility" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
