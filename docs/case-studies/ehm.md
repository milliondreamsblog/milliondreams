# EHM (ESG Health Monitor at ClimAgro Analytics)

## Overview
EHM is an ESG SaaS platform built during an internship at ClimAgro Analytics, an IIT Kanpur-funded startup, whose live landing page pitches "Transforming ESG into Competitive Advantage." Per the site, EHM "delivers sustainability-focused solutions aligned with the UN SDGs, helping industries and governments strengthen ESG practices, comply with regulations, and enhance brand value." Behind the marketing page sits the product itself: ML-backed climate-risk dashboards covering 50+ regions and 5+ enterprise workflows, where machine-learning scoring models turn climate data into risk scores that drive enterprise ESG decisions. Its users are industrial and government sustainability teams that need regulatory compliance and defensible climate-risk assessments.

## Architecture
The public deployment at ehm-pi.vercel.app is a Next.js marketing/landing site on Vercel (confirmed by `_next/static/chunks/app/` assets); it is built on the Frontend Tribe "Light SaaS Landing Page" template (the page `<title>` and meta description still carry the template's defaults) customized with EHM/ClimAgro copy, a services section, pricing tiers, and a "Book a call" CTA. The footer reads "2025 ClimAgro Analytics, Inc." No login or dashboard routes are publicly reachable from this deployment (`/login` and `/dashboard` both 404), so the product application lives elsewhere — inferred to be an internal or separately hosted deployment.

Known facts about the product system: a Next.js frontend renders the climate-risk dashboards; Spring Boot services expose the APIs; PostgreSQL stores the data; and ML scoring models compute climate-risk scores across 50+ regions feeding 5+ enterprise workflows. Inferred (not verifiable from the public site): the ML models likely run either as a separate Python service called by Spring Boot or as batch jobs writing scores into PostgreSQL; regional climate data likely arrives from external climate/weather datasets; and dashboards likely query aggregated per-region scores through the Spring Boot API. All of these internals need author confirmation.

### Diagram spec
```json
{"nodes":[{"id":"landing","label":"Next.js landing site (Vercel)","kind":"client"},{"id":"dash","label":"Next.js dashboard app","kind":"client"},{"id":"api","label":"Spring Boot API services","kind":"service"},{"id":"pg","label":"PostgreSQL","kind":"db"},{"id":"ml","label":"ML climate-risk scoring models","kind":"service"},{"id":"climate","label":"External climate / regional datasets","kind":"external"},{"id":"enterprise","label":"Enterprise ESG workflows (5+)","kind":"service"}],"edges":[{"from":"landing","to":"dash","label":"book a call → onboarding"},{"from":"dash","to":"api","label":"REST API calls"},{"from":"api","to":"pg","label":"read/write ESG data"},{"from":"ml","to":"climate","label":"ingest regional data (50+ regions)"},{"from":"ml","to":"pg","label":"write risk scores"},{"from":"api","to":"ml","label":"request scoring (inferred)"},{"from":"enterprise","to":"api","label":"workflow orchestration"}]}
```

## Tech stack
| Tech | Role | Why this choice |
| --- | --- | --- |
| Next.js | Landing site and dashboard frontend | React ecosystem for data-dense dashboard UIs, plus fast static marketing pages from the same skill set; instant Vercel deploys for the public site |
| Spring Boot | Backend API services | JVM robustness, mature security/validation, and enterprise credibility — the natural backend for a startup selling to industries and governments |
| PostgreSQL | Primary datastore | Relational integrity for regulatory/ESG data plus strong support for analytical queries over regional time-series risk scores |
| ML scoring models | Climate-risk scoring across 50+ regions | Climate risk is multivariate and nonlinear; learned models produce region-level scores that rules or spreadsheets cannot |
| Vercel | Hosting for the public site | Zero-ops CDN-backed hosting so the team's effort stays on the product, not on serving a landing page |

## Data model
Likely main entities given the domain (inferred — needs author confirmation): Regions (the 50+ geographic units being scored) with climate attributes; RiskScores as time-stamped ML model outputs per region and risk category; Organizations/Clients (industrial and government customers) with their facilities or assets mapped to regions; Workflows (the 5+ enterprise ESG processes, e.g. compliance reporting or risk review) with steps and statuses; and ESG Indicators aligned to UN SDGs, which the site copy emphasizes. The public landing page reveals no schema; the pricing tiers shown (Free/Pro/Business) are template placeholders, so no subscription entities can be confirmed.

### DB diagram spec
```json
{"entities":[{"name":"Region","fields":["id","name","country","geo_bounds","climate_profile"]},{"name":"RiskScore","fields":["id","region_id","model_version","score","category","scored_at"]},{"name":"Organization","fields":["id","name","sector","regions_of_interest"]},{"name":"Workflow","fields":["id","org_id","type","status","created_at"]},{"name":"EsgIndicator","fields":["id","sdg_ref","name","unit","source"]}],"relations":[{"from":"RiskScore","to":"Region","label":"scores"},{"from":"Organization","to":"Region","label":"operates in"},{"from":"Workflow","to":"Organization","label":"belongs to"},{"from":"Workflow","to":"RiskScore","label":"consumes"},{"from":"RiskScore","to":"EsgIndicator","label":"measures (inferred)"}]}
```

## Why this, not that
### Why Spring Boot, not Node.js for the APIs
ClimAgro sells ESG compliance to industries and governments — buyers who expect JVM-grade reliability, mature security (Spring Security), and long-term maintainability. Spring Boot also fits an academic-linked (IIT Kanpur-funded) engineering culture where Java is a lingua franca. Whether this was a team-skills decision or an enterprise-requirements decision needs author confirmation.

### Why PostgreSQL, not a NoSQL or dedicated time-series store
ESG and compliance data demand auditability, constraints, and relational joins between organizations, regions, and scores; PostgreSQL provides that while still handling regional time-series risk scores well. Whether extensions (PostGIS for the 50+ regions' geography, or timescale features) are used needs author confirmation.

### Why separate ML scoring models, not rules-based scoring in the API
Climate risk across 50+ heterogeneous regions is exactly the multivariate problem ML fits: learned models can weigh many climate signals per region and be retrained as data grows, whereas hand-tuned rules would ossify. How the models are served (Python microservice, batch jobs, or embedded) is not publicly visible and needs author confirmation.

### Why a Next.js frontend, not server-rendered Spring templates
Climate-risk dashboards are interactive, chart-heavy interfaces; a React/Next.js frontend decouples the UI iteration speed from the JVM backend and let the intern contribute across a modern split-stack architecture. It also allowed the marketing site to ship independently on Vercel.

### Why a template-based landing page, not a bespoke marketing site
Standing up the public face on the Frontend Tribe "Light SaaS" template got a credible, polished landing page live with minimal effort, keeping engineering time on the actual dashboards — a rational startup trade-off. The un-replaced template `<title>` and placeholder pricing/testimonials confirm the marketing site was not the priority.

## Fun facts
- Built during an internship at ClimAgro Analytics, an IIT Kanpur-funded climate startup — the footer stamps "2025 ClimAgro Analytics, Inc."
- The ML scoring covers 50+ regions and feeds 5+ distinct enterprise workflows.
- The product positions ESG explicitly around the UN Sustainable Development Goals, targeting both industries and governments.
- The live landing page is a customized Frontend Tribe template — its `<title>` still reads "Light Saas Landing Page," a charming tell of startup speed over polish.
- The real product is a split-stack build: Vercel-hosted Next.js out front, Spring Boot + PostgreSQL + ML models behind — none of it exposed on the public site.

## Screenshot targets
- https://ehm-pi.vercel.app/ — hero section "Transforming ESG into Competitive Advantage" with the Version 2.0 badge and Book-a-call CTA.
- https://ehm-pi.vercel.app/#pricing (same page, pricing section) — note tiers are template placeholders, caption accordingly if used.
- The interesting UI — the ML-backed climate-risk dashboards — is not publicly reachable from this deployment (no login route exists here); author must supply dashboard screenshots from the internal app.

## Gaps
1. Where does the actual dashboard application live (separate deployment, internal network?), and how is it authenticated?
2. How are the ML models built and served — what algorithms/framework (scikit-learn, XGBoost?), Python microservice vs batch scoring, and how often are scores refreshed?
3. What climate/regional data sources feed the 50+ regions, and does PostgreSQL use PostGIS or time-series extensions?
4. What exactly are the 5+ enterprise workflows (compliance reporting, risk review, disclosure?), and which parts did you personally build during the internship?
5. Where are the Spring Boot services and PostgreSQL hosted (AWS, on-prem, university infra?), and what does the deployment pipeline look like?
6. Is the Free/Pro/Business pricing on the landing page real or template placeholder — what is the actual commercial model?
7. War stories: hardest integration between the Next.js frontend and Spring Boot APIs (auth, CORS, data volume)?
8. What does "EHM" stand for, and is "Version 2.0" on the landing page a real product milestone?
