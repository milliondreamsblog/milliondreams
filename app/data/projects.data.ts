export type ProjectTier = "tier1" | "tier2";
export type BadgeVariant = "live" | "ai" | "work" | "client" | "event" | "backend" | "research";

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
  badge: string;
  badgeVariant: BadgeVariant;
  stats: ProjectStat[];
  bullets: string[];
  stack: string[];
  githubUrl?: string;
  liveUrl?: string;
  /** Controls special layout: "hero" = 2-col wide, "sidebar" = left sidebar stats, "standard" = default */
  layout?: "hero" | "sidebar" | "standard";
}

export const PROJECTS: Project[] = [
  {
    id: "bawarchie",
    index: "01",
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
    ],
    stack: ["Next.js", "PostgreSQL", "Razorpay", "TypeScript", "Tailwind"],
    githubUrl: "https://github.com/milliondreamsblog/orderbyqr",
    liveUrl: "https://www.bawarchie.com",
  },
  {
    id: "roborumble",
    index: "02",
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
    index: "03",
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
    index: "04",
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
    index: "05",
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
    id: "rbac",
    index: "06",
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
    index: "07",
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
    index: "08",
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
