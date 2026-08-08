import type { CaseStudy } from "./types";

export const buildinfra: CaseStudy = {
  slug: "buildinfra",
  heroImage: "/case-studies/buildinfra/hero.png",
  heroCaption: "BuildInfra — construction ERP login, everything of substance behind it",
  tldr: "BuildInfra is an internal construction-operations platform serving a $2B real-estate portfolio and 1,000+ users across office and field roles. It attacks the coordination problem endemic to large construction portfolios: approvals, status updates, and payroll paperwork that otherwise crawl through phone calls and spreadsheets. Real-time approval and status workflows cut coordination delays by 40%, and a background pipeline generates and emails 700+ payroll PDFs every month — a print shop replaced by a cron job. The live app is locked down tight, so this case study leans on what the system is known to do rather than a public codebase.",
  architecture: {
    intro:
      "A modular set of Golang backend services fronted by two clients: a Next.js web app for office and management users, and a React Native field app for on-site crews. The production site redirects every unauthenticated visitor straight to /auth/login — the login shell renders entirely client-side and exposes nothing. Off the request path, the system is built around a background payroll pipeline: scheduled jobs render 700+ payslip PDFs a month through Puppeteer and deliver them via Resend, with AWS providing the infrastructure underneath.",
    diagram: {
      nodes: [
        { id: "web", label: "Next.js web app", kind: "client" },
        { id: "mobile", label: "React Native field app", kind: "client" },
        { id: "api", label: "Golang backend services", kind: "service" },
        { id: "db", label: "Primary database", kind: "db" },
        { id: "queue", label: "Job queue / scheduler", kind: "queue" },
        { id: "jobs", label: "Payroll PDF worker (Puppeteer)", kind: "service" },
        { id: "resend", label: "Resend (email delivery)", kind: "external" },
        { id: "aws", label: "AWS storage (PDFs, assets)", kind: "external" },
      ],
      edges: [
        { from: "web", to: "api", label: "HTTPS API + auth" },
        { from: "mobile", to: "api", label: "HTTPS API + real-time updates" },
        { from: "api", to: "db", label: "reads/writes" },
        { from: "api", to: "queue", label: "enqueue payroll runs" },
        { from: "queue", to: "jobs", label: "trigger monthly jobs" },
        { from: "jobs", to: "db", label: "read payroll data" },
        { from: "jobs", to: "resend", label: "email 700+ PDFs/month" },
        { from: "jobs", to: "aws", label: "store generated PDFs" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js",
      role: "Web app for office/management users",
      why: "Fast authenticated-dashboard building for an internal ERP, with file-based routing and SSR/CSR flexibility per screen.",
    },
    {
      tech: "Golang",
      role: "Modular backend services",
      why: "Goroutines and a low resource footprint make many small services cheap to run for 1,000+ users plus background jobs.",
    },
    {
      tech: "TypeScript",
      role: "Shared language across web and mobile",
      why: "One type system across a large multi-client codebase keeps integration bugs from hiding at the seams.",
    },
    {
      tech: "React Native",
      role: "Field app for on-site crews",
      why: "Android and iOS from one codebase — crews on construction sites need a mobile-first app, not a desktop web UI.",
    },
    {
      tech: "Puppeteer",
      role: "HTML-to-PDF payroll generation",
      why: "Headless Chrome renders styled HTML templates into pixel-accurate payslips at 700+/month, using normal web tooling instead of PDF primitives.",
    },
    {
      tech: "Resend",
      role: "Transactional payslip delivery",
      why: "A clean developer-focused email API with reliable delivery to hundreds of employees monthly — no SMTP to babysit.",
    },
    {
      tech: "AWS",
      role: "Hosting and infrastructure",
      why: "Managed compute, storage, and queueing for modular services running at portfolio scale.",
    },
  ],
  dataModel: {
    intro:
      "The live site reveals nothing beyond its login shell, so this is the likely shape of the schema rather than a verified one — reconstructed from the domain and the system's known features. Projects within the portfolio, users with roles (a project-manager demo role exists), approval requests whose status transitions are the real-time workflow backbone, and a payroll spine where monthly runs fan out into generated PDF documents and email deliveries.",
    diagram: {
      entities: [
        { name: "Project", fields: ["id", "name", "location", "status", "manager_id"] },
        { name: "User", fields: ["id", "name", "email", "role", "project_id"] },
        { name: "ApprovalRequest", fields: ["id", "project_id", "requested_by", "status", "type"] },
        { name: "Employee", fields: ["id", "name", "project_id", "wage_rate"] },
        { name: "PayrollRun", fields: ["id", "period", "project_id", "status", "generated_at"] },
        { name: "PayslipDocument", fields: ["id", "payroll_run_id", "employee_id", "pdf_url", "emailed_at"] },
      ],
      relations: [
        { from: "User", to: "Project", label: "works on" },
        { from: "ApprovalRequest", to: "Project", label: "belongs to" },
        { from: "ApprovalRequest", to: "User", label: "requested by" },
        { from: "PayrollRun", to: "Project", label: "covers" },
        { from: "PayslipDocument", to: "PayrollRun", label: "generated in" },
        { from: "PayslipDocument", to: "Employee", label: "issued to" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
