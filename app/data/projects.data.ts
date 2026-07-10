export type ProjectTier = "tier1" | "tier2";
export type BadgeVariant = "live" | "ai" | "work" | "client" | "event" | "backend" | "research";

/**
 * A project may belong to several categories at once — they describe what the
 * work *is*, not where it sits in the page hierarchy (that's `tier`).
 *
 * design: visual or interaction craft is a headline feature of the project,
 *   not merely a byproduct of it having a UI. Reserve it for work where the
 *   design is the thing worth pointing at.
 */
export type ProjectCategory =
  | "ai"
  | "fullstack"
  | "design"
  | "backend"
  | "research";

/** Tab order on the projects page. "All" is prepended by the page itself. */
export const CATEGORY_ORDER: ProjectCategory[] = [
  "ai",
  "fullstack",
  "design",
  "backend",
  "research",
];

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  ai: "AI / Agents",
  fullstack: "Full-Stack",
  design: "Design",
  backend: "Backend",
  research: "Research",
};

export interface ProjectStat {
  value: string;
  label: string;
}

export interface Project {
  id: string;
  index: string;           // "01", "02" …
  title: string;
  tagline: string;
  description: string;
  tier: ProjectTier;
  /** One or more; a project can appear under several tabs. */
  categories: ProjectCategory[];
  badge: string;
  badgeVariant: BadgeVariant;
  stats: ProjectStat[];
  bullets: string[];
  stack: string[];
  githubUrl?: string;
  liveUrl?: string;
  /** Optional thumbnail (path under /public). Falls back to a typographic placeholder. */
  image?: string;
  /** Controls special layout: "hero" = 2-col wide, "sidebar" = left sidebar stats, "standard" = default */
  layout?: "hero" | "sidebar" | "standard";
}

export const PROJECTS: Project[] = [
  {
    id: "buildinfra",
    index: "01",
    categories: ["fullstack", "backend"],
    title: "BuildInfra",
    tagline: "Construction Project Management Platform",
    description:
      "Internal operations platform for a real-estate portfolio valued at $2B. Project tracking, approvals, payroll automation, and field workflows — backend services plus a React Native app used daily on construction sites.",
    tier: "tier1",
    badge: "Live Product",
    badgeVariant: "live",
    layout: "hero",
    stats: [
      { value: "1,000+", label: "Active users" },
      { value: "$2B",    label: "Portfolio managed" },
      { value: "700+",   label: "Payroll PDFs/mo" },
    ],
    bullets: [
      "Modular backend services + React Native mobile app — scaled from 120+ to 1,000+ users",
      "Background job system generating 700+ payroll PDFs/month with Puppeteer & Resend",
      "Real-time approval & project-status workflows — cut coordination delays by 40%",
      "Demo login — projectmanager@email.com / 12345678",
    ],
    stack: ["Next.js", "Golang", "TypeScript", "React Native", "AWS"],
    liveUrl: "https://app.buildenfra.in",
    image: "/projects/buildinfra.svg",
  },
  {
    id: "cadence",
    index: "02",
    categories: ["ai", "fullstack"],
    title: "Cadence",
    tagline: "Content Intelligence Engine",
    description:
      "A content intelligence engine that ingests, analyzes, and orchestrates content workflows — turning unstructured inputs into structured, queryable insight.",
    tier: "tier1",
    badge: "AI / GenAI",
    badgeVariant: "ai",
    stats: [
      { value: "AI",   label: "Content engine" },
      { value: "Live", label: "Production" },
    ],
    bullets: [
      "Content pipeline — ingestion, analysis, and orchestration end-to-end",
      "Turns unstructured content into structured, actionable insight",
      "Deployed live on Vercel",
    ],
    stack: ["Next.js", "TypeScript", "GenAI", "Vercel"],
    liveUrl: "https://web-app-self-mu.vercel.app",
    image: "/projects/cadence.svg",
  },
  {
    id: "bawarchie",
    index: "03",
    categories: ["fullstack", "backend"],
    title: "Bawarchie",
    tagline: "QR Restaurant Ordering System",
    description:
      "A live SaaS product handling real customer traffic end-to-end. Complete order lifecycle — menu discovery → UPI/card payment → kitchen dashboard. No app download required.",
    tier: "tier1",
    badge: "Live Product",
    badgeVariant: "live",
    layout: "hero",
    stats: [
      { value: "50+",  label: "Restaurants" },
      { value: "40%",  label: "Faster turnover" },
      { value: "100%", label: "Order accuracy" },
    ],
    bullets: [
      "Full-stack ownership: frontend, backend, payments, real-time tracking & analytics",
      "No app download — scan QR, order, pay; kitchen receives instantly",
      "Restaurant dashboard: live orders, menu management, revenue reporting",
      "Razorpay: UPI/Card/Wallet — order only fires after payment confirms",
      "Demo login — akshatsan23@gmail.com / 12345678",
    ],
    stack: ["Next.js", "PostgreSQL", "Razorpay", "TypeScript", "Tailwind"],
    githubUrl: "https://github.com/milliondreamsblog/orderbyqr",
    liveUrl: "https://www.bawarchie.com",
    image: "/projects/bawarchie.svg",
  },
  {
    id: "roborumble",
    index: "04",
    categories: ["fullstack", "design"],
    title: "RoboRumble 3.0",
    tagline: "Kanpur's largest tech event platform · roborumble.in",
    description:
      "Full competition platform — not a landing page. Registration, in-app payments, live team lobbies, find-a-teammate, competition-specific rooms, and real-time interaction for 1,000+ participants.",
    tier: "tier1",
    badge: "Event Platform",
    badgeVariant: "event",
    layout: "hero",
    stats: [
      { value: "30k+", label: "Page visits" },
      { value: "1k+",  label: "Registrations" },
      { value: "₹1L+", label: "Payments processed" },
    ],
    bullets: [
      "30,000+ page visits · 1,000+ user registrations with in-app payment flow",
      "Live team lobbies — find teammates, join competition-specific rooms in real time",
      "₹1,00,000+ in payment transactions processed end-to-end",
      "Terminal-aesthetic UI built to feel like the event it represents",
    ],
    stack: ["Next.js", "TypeScript", "Real-time", "Payments", "Tailwind"],
    liveUrl: "https://roborumble.in",
  },
  {
    id: "talk2pdf",
    index: "05",
    categories: ["ai", "backend"],
    title: "Talk2PDF",
    tagline: "Agentic Document Q&A",
    description:
      "Agentic RAG system with pluggable LLM and vector store backends. Used by 500+ users weekly to interrogate large PDFs. Swap models or stores without touching core logic.",
    tier: "tier1",
    badge: "AI / GenAI",
    badgeVariant: "ai",
    stats: [
      { value: "500+", label: "Weekly users" },
      { value: "60%",  label: "Less dev effort" },
    ],
    bullets: [
      "Modular retrieval: LLM and vector store are plugins, not hard dependencies",
      "Multi-step document reasoning — not just keyword search",
      "Reduces AI integration effort by 60% for downstream builders",
    ],
    stack: ["Python", "LangChain", "FastAPI", "OpenAI"],
    githubUrl: "https://github.com/milliondreamsblog/AskyourPDF",
  },
  {
    id: "evolvesanga",
    index: "06",
    categories: ["fullstack", "design"],
    title: "EvolveSanga",
    tagline: "NGO Platform · Section 8 Nonprofit",
    description:
      "Production website for a registered Section 8 NGO in Kanpur. Donation flows, volunteer registration, cause campaigns — shipped for real stakeholders with real requirements.",
    tier: "tier1",
    badge: "Real Client",
    badgeVariant: "client",
    stats: [
      { value: "Live", label: "Production" },
      { value: "9+",   label: "Page routes" },
      { value: "3",    label: "Cause campaigns" },
    ],
    bullets: [
      "Multi-page structure: activities, causes, volunteer, contact, donate",
      "Accessible, responsive UI built for a trust-driven charitable org",
      "Client delivery — real stakeholder requirements, not a side project",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    liveUrl: "https://evolve-sanga.vercel.app",
  },
  {
    id: "resumeai",
    index: "07",
    categories: ["ai", "fullstack", "design"],
    title: "ResumeAI",
    tagline: "Intelligent Resume Optimizer · Next.js 15",
    description:
      "GenAI resume coach analyzing 50+ dimensions — skills gap, tone, ATS keyword density — against a live job description. Custom LLM pipeline with 100% data privacy.",
    tier: "tier1",
    badge: "AI / GenAI",
    badgeVariant: "ai",
    layout: "sidebar",
    stats: [
      { value: "50+", label: "Data points" },
      { value: "98%", label: "Parser accuracy" },
      { value: "40%", label: "Faster LLM" },
    ],
    bullets: [
      "Parses PDF/DOCX up to 10MB with 98% accuracy via custom extraction pipeline",
      "Custom LLM chain with 40% faster responses than naive API calls",
      "Framer Motion staggered UI — measurably higher engagement",
      "Next.js 15 App Router, TypeScript strict mode throughout",
    ],
    stack: ["Next.js 15", "TypeScript", "GenAI", "Framer Motion", "Tailwind"],
    githubUrl: "https://github.com/milliondreamsblog/Resume_AI",
    liveUrl: "https://resume-ai-sigma-lime.vercel.app",
  },
  {
    id: "contractrisk",
    index: "08",
    categories: ["ai", "fullstack"],
    title: "Contract-Risk.ai",
    tagline: "AI contract analysis · Indian Contract Act",
    description:
      "Detects predatory clauses in Indian freelance contracts, grounded against the Indian Contract Act, and generates a 0–100 risk score. OCR intake handles scanned and photographed documents.",
    tier: "tier1",
    badge: "AI / GenAI",
    badgeVariant: "ai",
    stats: [
      { value: "0–100", label: "Risk score" },
      { value: "RAG",   label: "Statute-grounded" },
    ],
    bullets: [
      "RAG pipeline grounds every finding in statute text — not free-form LLM opinion",
      "OCR intake via Tesseract.js accepts scanned and photographed contracts",
      "ChromaDB vector retrieval over the Indian Contract Act, reasoned over by Gemini 2.0 Flash",
    ],
    stack: ["Next.js 15", "TypeScript", "Gemini 2.0 Flash", "ChromaDB", "Tesseract.js"],
    githubUrl: "https://github.com/milliondreamsblog/Contract-Risk.ai",
  },
  {
    id: "kirtanam",
    index: "09",
    categories: ["fullstack"],
    title: "Kirtanam",
    tagline: "Video-lecture platform · web + Android",
    description:
      "Personalized video-lecture platform for ashram communities — admin controls, attendance tracking, and analytics. Ships to web and Android from a single codebase.",
    tier: "tier1",
    badge: "Live Product",
    badgeVariant: "live",
    stats: [
      { value: "2",    label: "Platforms shipped" },
      { value: "Live", label: "Web + Android" },
    ],
    bullets: [
      "One codebase ships to web and Android via Capacitor",
      "Attendance tracking and analytics for community administrators",
      "YouTube Data API integration behind personalized lecture feeds",
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Capacitor"],
    githubUrl: "https://github.com/milliondreamsblog/Kirtanam",
  },
  {
    id: "brandvoiceagent",
    index: "10",
    categories: ["ai"],
    title: "BrandVoiceAgent",
    tagline: "AI brand-voice critic · 19-rule system",
    description:
      "Scores social drafts against a 19-rule brand voice system, paired with a training game, an approved-content library, and a human review queue.",
    tier: "tier2",
    badge: "AI / GenAI",
    badgeVariant: "ai",
    stats: [
      { value: "19", label: "Voice rules" },
      { value: "AI", label: "Review queue" },
    ],
    bullets: [
      "Scores drafts against a 19-rule voice system before a human sees them",
      "Approved-content library plus a review queue for edge cases",
      "Training game calibrates new writers on the voice",
    ],
    stack: ["TypeScript", "Next.js 15", "Anthropic Claude", "Vercel Blob", "TanStack Table"],
    githubUrl: "https://github.com/milliondreamsblog/BrandVoiceAgent",
  },
  {
    id: "cmoagent",
    index: "11",
    categories: ["ai"],
    title: "CMO Agent",
    tagline: "Weekly content-intelligence agent",
    description:
      "Finds top X/Twitter posts, analyzes why they resonate, and generates on-brand post ideas and briefs — closing the loop from trend mining to ideation.",
    tier: "tier2",
    badge: "AI / GenAI",
    badgeVariant: "ai",
    stats: [
      { value: "Weekly", label: "Cadence" },
      { value: "X",      label: "Trend source" },
    ],
    bullets: [
      "Mines top-performing X posts and extracts why they resonated",
      "Generates on-brand post ideas and writing briefs",
      "Runs unattended on a weekly cadence",
    ],
    stack: ["Node.js", "JavaScript", "Claude AI", "Next.js"],
    githubUrl: "https://github.com/milliondreamsblog/CMO_agent",
  },
  {
    id: "elvynchess",
    index: "12",
    categories: ["fullstack", "backend"],
    title: "Elvyn-Chess",
    tagline: "Chess coaching SaaS · web + mobile",
    description:
      "Students, coaches, and admins manage classes and schedules on a shared backend, with web and mobile clients living in one Turborepo monorepo.",
    tier: "tier2",
    badge: "Full-Stack SaaS",
    badgeVariant: "backend",
    stats: [
      { value: "3", label: "User roles" },
      { value: "2", label: "Clients" },
    ],
    bullets: [
      "Turborepo monorepo — Next.js web and Expo mobile share one tRPC API",
      "Role-based flows across students, coaches, and admins",
      "Supabase + Drizzle ORM with end-to-end type safety",
    ],
    stack: ["TypeScript", "Turborepo", "tRPC", "Expo", "Supabase", "Drizzle"],
    githubUrl: "https://github.com/milliondreamsblog/Elvyn-Chess",
  },
  {
    id: "projectmanager",
    index: "13",
    categories: ["fullstack", "backend"],
    title: "Project Manager",
    tagline: "Enterprise project management · MERN",
    description:
      "Project-management platform for multi-team enterprises — RBAC, audit logging, real-time notifications, and D3 dependency visualizations.",
    tier: "tier2",
    badge: "Enterprise SaaS",
    badgeVariant: "backend",
    stats: [
      { value: "RBAC", label: "Access control" },
      { value: "D3",   label: "Dependency graphs" },
    ],
    bullets: [
      "RBAC with audit logging across multi-team workspaces",
      "Real-time notifications delivered over Pusher",
      "D3.js dependency visualizations for task graphs",
    ],
    stack: ["React 19", "Node.js", "Express", "MongoDB", "D3.js", "Turborepo"],
    githubUrl: "https://github.com/milliondreamsblog/ProjectManger",
  },
  {
    id: "rbac",
    index: "14",
    categories: ["backend"],
    title: "RBAC Auth",
    tagline: "Role-based access control · Node.js",
    description:
      "Secure authentication with full RBAC hierarchy — admin, moderator, user — with route-level guards and JWT refresh token rotation.",
    tier: "tier2",
    badge: "Backend",
    badgeVariant: "backend",
    stats: [
      { value: "3+",  label: "Role tiers" },
      { value: "JWT", label: "Auth strategy" },
    ],
    bullets: [
      "Route-level guards enforced at middleware layer",
      "JWT refresh rotation — secure session management",
      "Production-ready RESTful API architecture",
    ],
    stack: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT"],
    githubUrl: "https://github.com/milliondreamsblog/RBAC_Authentication",
  },
  {
    id: "ehm",
    index: "15",
    categories: ["fullstack", "backend"],
    title: "EHM Platform",
    tagline: "ESG SaaS · ClimAgro Analytics",
    description:
      "Built at ClimAgro Analytics (IIT Kanpur-funded). ML-backed climate-risk dashboards powering ESG decisions across 50+ regions and 5+ enterprise workflows.",
    tier: "tier2",
    badge: "Work",
    badgeVariant: "work",
    stats: [
      { value: "50+", label: "Regions" },
      { value: "5+",  label: "Workflows" },
    ],
    bullets: [
      "Employer-grade SaaS built during active internship at a funded startup",
      "Spring Boot APIs + React frontend integrated across 5+ enterprise workflows",
      "ML scoring models for climate-risk decision support",
    ],
    stack: ["Next.js", "Spring Boot", "PostgreSQL", "TypeScript"],
    liveUrl: "https://ehm-pi.vercel.app",
  },
  {
    id: "misinformation",
    index: "16",
    categories: ["ai", "research"],
    title: "Misinformation Agent",
    tagline: "Agentic NLP · MANIT Bhopal Research",
    description:
      "Agentic misinformation detection built during ML Research internship at MANIT. Transformers + Transfer Learning. Same internship: reduced CNN inference latency 40%, saved $50k/year compute.",
    tier: "tier2",
    badge: "Research",
    badgeVariant: "research",
    stats: [
      { value: "NLP",  label: "Domain" },
      { value: "40%",  label: "Latency gain" },
    ],
    bullets: [
      "Agentic pipeline for multi-document misinformation reasoning",
      "Grounded in academic research — IEEE publication from same period",
      "$50,000/year compute savings from pipeline refactoring at MANIT",
    ],
    stack: ["Python", "Transformers", "PyTorch", "Transfer Learning"],
    githubUrl: "https://github.com/milliondreamsblog/misinformation_agent",
  },
];
