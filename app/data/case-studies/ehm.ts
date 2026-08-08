import type { CaseStudy } from "./types";

export const ehm: CaseStudy = {
  slug: "ehm",
  heroImage: "/case-studies/ehm/hero.png",
  heroCaption: "EHM — \"Transforming ESG into Competitive Advantage\"",
  tldr: "EHM is an ESG SaaS platform built during an internship at ClimAgro Analytics, an IIT Kanpur-funded climate startup. Behind the public landing page sits the actual product: ML-backed climate-risk dashboards covering 50+ regions and feeding 5+ enterprise workflows, where machine-learning scoring models turn climate data into risk scores that drive ESG decisions. Its users are industrial and government sustainability teams that need regulatory compliance and defensible climate-risk assessments, aligned explicitly to the UN SDGs. The product application itself is not publicly reachable, so this case study describes the system as built and designed rather than a public codebase.",
  architecture: {
    intro:
      "A split-stack build: a Next.js landing site on Vercel out front, and the product behind — a Next.js dashboard frontend over Spring Boot API services backed by PostgreSQL. ML scoring models compute climate-risk scores across 50+ regions, designed to write scores into Postgres for the dashboards to query through the API. The dashboard application lives on a separate, non-public deployment; no login or dashboard route is reachable from the marketing site.",
    diagram: {
      nodes: [
        { id: "landing", label: "Next.js landing site (Vercel)", kind: "client" },
        { id: "dash", label: "Next.js dashboard app", kind: "client" },
        { id: "api", label: "Spring Boot API services", kind: "service" },
        { id: "pg", label: "PostgreSQL", kind: "db" },
        { id: "ml", label: "ML climate-risk scoring models", kind: "service" },
        { id: "climate", label: "External climate / regional datasets", kind: "external" },
        { id: "enterprise", label: "Enterprise ESG workflows (5+)", kind: "service" },
      ],
      edges: [
        { from: "landing", to: "dash", label: "book a call → onboarding" },
        { from: "dash", to: "api", label: "REST API calls" },
        { from: "api", to: "pg", label: "read/write ESG data" },
        { from: "ml", to: "climate", label: "ingest regional data (50+ regions)" },
        { from: "ml", to: "pg", label: "write risk scores" },
        { from: "api", to: "ml", label: "request scoring" },
        { from: "enterprise", to: "api", label: "workflow orchestration" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js",
      role: "Landing site and dashboard frontend",
      why: "The React ecosystem for data-dense dashboard UIs, plus fast static marketing pages from the same skill set.",
    },
    {
      tech: "Spring Boot",
      role: "Backend API services",
      why: "JVM robustness, mature security and validation, and enterprise credibility — the natural backend for selling to industries and governments.",
    },
    {
      tech: "PostgreSQL",
      role: "Primary datastore",
      why: "Relational integrity for regulatory ESG data, with strong support for analytical queries over regional time-series risk scores.",
    },
    {
      tech: "ML scoring models",
      role: "Climate-risk scoring across 50+ regions",
      why: "Climate risk is multivariate and nonlinear; learned models produce region-level scores that rules or spreadsheets cannot.",
    },
    {
      tech: "Vercel",
      role: "Hosting for the public site",
      why: "Zero-ops CDN-backed hosting so the team's effort stays on the product, not on serving a landing page.",
    },
    {
      tech: "UN SDG alignment",
      role: "ESG framing",
      why: "Indicators positioned explicitly around the Sustainable Development Goals give industrial and government buyers a shared compliance language.",
    },
  ],
  dataModel: {
    intro:
      "The public landing page reveals no schema, so this is the likely model given the domain: the 50+ geographic regions being scored, time-stamped risk scores as ML model outputs per region and category, the client organizations mapped to the regions they operate in, the 5+ enterprise ESG workflows with their statuses, and ESG indicators aligned to the UN SDGs. Treat it as the designed shape of the system, not a verified dump.",
    diagram: {
      entities: [
        { name: "Region", fields: ["id", "name", "country", "geo_bounds", "climate_profile"] },
        { name: "RiskScore", fields: ["id", "region_id", "model_version", "score", "category", "scored_at"] },
        { name: "Organization", fields: ["id", "name", "sector", "regions_of_interest"] },
        { name: "Workflow", fields: ["id", "org_id", "type", "status", "created_at"] },
        { name: "EsgIndicator", fields: ["id", "sdg_ref", "name", "unit", "source"] },
      ],
      relations: [
        { from: "RiskScore", to: "Region", label: "scores" },
        { from: "Organization", to: "Region", label: "operates in" },
        { from: "Workflow", to: "Organization", label: "belongs to" },
        { from: "Workflow", to: "RiskScore", label: "consumes" },
        { from: "RiskScore", to: "EsgIndicator", label: "measures" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
