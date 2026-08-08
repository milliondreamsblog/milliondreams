# BuildInfra (BuildEnfra)

## Overview
BuildInfra (branded on the live app as "BUILDENFRA - TTIPL") is an internal construction-operations platform serving a $2B real-estate portfolio, used by 1,000+ users across office and field roles. The live site's own meta description frames it as "the comprehensive construction ERP solution that streamlines project management, resource allocation, and workflow optimization for modern construction companies." It solves the coordination problem endemic to large construction portfolios: approvals, status updates, and payroll paperwork that otherwise crawl through phone calls and spreadsheets. Real-time approval and status workflows cut coordination delays by 40%, and background jobs generate 700+ payroll PDFs every month automatically.

## Architecture
The system is a modular set of backend services (Golang) fronted by two clients: a Next.js web app for office/management users and a React Native field app for on-site crews. The production web app at app.buildenfra.in is a Next.js application (confirmed by `_next/static` assets in the page source) that immediately redirects unauthenticated visitors from `/` to `/auth/login` — everything of substance sits behind authentication. A `/auth/register` route also exists publicly.

Known facts: background jobs render 700+ payroll PDFs per month using Puppeteer (headless-Chrome HTML-to-PDF) and deliver them via Resend (transactional email). Real-time approval/status workflows push state changes to users as they happen. The stack is Next.js, Golang, TypeScript, React Native, and AWS.

Inferred (not verified from the site): the Golang services likely expose REST/gRPC APIs consumed by both clients; a relational database likely backs projects, users, and payroll; the payroll PDF generation likely runs as a queued/scheduled worker separate from the request path; and the real-time layer is likely WebSockets or push notifications. The login page is fully client-rendered, so no internal routes or API endpoints are visible publicly.

### Diagram spec
```json
{"nodes":[{"id":"web","label":"Next.js web app","kind":"client"},{"id":"mobile","label":"React Native field app","kind":"client"},{"id":"api","label":"Golang backend services","kind":"service"},{"id":"db","label":"Primary database","kind":"db"},{"id":"jobs","label":"Payroll PDF worker (Puppeteer)","kind":"service"},{"id":"queue","label":"Job queue / scheduler","kind":"queue"},{"id":"resend","label":"Resend (email delivery)","kind":"external"},{"id":"aws","label":"AWS storage (PDFs, assets)","kind":"external"}],"edges":[{"from":"web","to":"api","label":"HTTPS API + auth"},{"from":"mobile","to":"api","label":"HTTPS API + real-time updates"},{"from":"api","to":"db","label":"reads/writes"},{"from":"api","to":"queue","label":"enqueue payroll runs"},{"from":"queue","to":"jobs","label":"trigger monthly jobs"},{"from":"jobs","to":"resend","label":"email 700+ PDFs/month"},{"from":"jobs","to":"aws","label":"store generated PDFs"},{"from":"jobs","to":"db","label":"read payroll data"}]}
```

## Tech stack
| Tech | Role | Why this choice |
| --- | --- | --- |
| Next.js | Web app for office/management users | Fast to build authenticated dashboards; file-based routing and SSR/CSR flexibility for an internal ERP UI |
| Golang | Modular backend services | Strong concurrency and low resource footprint for many small services handling 1,000+ users and background jobs |
| TypeScript | Shared language across web and mobile clients | Type safety across a large multi-client codebase reduces integration bugs |
| React Native | Field app for on-site crews | One codebase for Android/iOS field devices; crews need mobile-first workflows, not a desktop web UI |
| Puppeteer | HTML-to-PDF payroll generation | Reuses web templating skills to produce pixel-accurate payslips at scale (700+/month) |
| Resend | Transactional email delivery of payslips | Simple developer-focused email API; reliable delivery without managing SMTP |
| AWS | Hosting/infrastructure | Managed compute, storage, and queueing for modular services at portfolio scale |

## Data model
Likely core entities for a construction-ops ERP of this shape: Organizations/Projects (sites within the $2B portfolio), Users with roles (project manager, field worker, approver — a "projectmanager" demo account exists), Approval Requests with status transitions (the real-time workflow backbone), Workers/Employees with attendance or work records feeding payroll, and Payroll Runs that fan out into generated PDF documents and email deliveries. The live site reveals nothing beyond the login/register shell, so all entity details are inferred from the domain and the known payroll/approval features and need author confirmation.

### DB diagram spec
```json
{"entities":[{"name":"Project","fields":["id","name","location","status","manager_id"]},{"name":"User","fields":["id","name","email","role","project_id"]},{"name":"ApprovalRequest","fields":["id","project_id","requested_by","status","type","updated_at"]},{"name":"Employee","fields":["id","name","project_id","wage_rate","joined_at"]},{"name":"PayrollRun","fields":["id","period","project_id","status","generated_at"]},{"name":"PayslipDocument","fields":["id","payroll_run_id","employee_id","pdf_url","emailed_at"]}],"relations":[{"from":"User","to":"Project","label":"works on"},{"from":"ApprovalRequest","to":"Project","label":"belongs to"},{"from":"ApprovalRequest","to":"User","label":"requested by"},{"from":"PayrollRun","to":"Project","label":"covers"},{"from":"PayslipDocument","to":"PayrollRun","label":"generated in"},{"from":"PayslipDocument","to":"Employee","label":"issued to"}]}
```

## Why this, not that
### Why Golang services, not a Node.js monolith
An ERP serving 1,000+ users across a portfolio benefits from modular services that can be scaled and deployed independently, and Go's goroutine model handles concurrent approval streams and scheduled jobs cheaply. Keeping the backend in Go while clients stay TypeScript separates the performance-critical core from fast-moving UI code. Needs author confirmation on the exact service boundaries.

### Why React Native for field crews, not a mobile web app
Field crews work on construction sites with patchy connectivity and need a native-feeling app with push notifications for real-time approvals. React Native delivers Android and iOS from one TypeScript codebase, sharing types with the rest of the stack, rather than maintaining Swift/Kotlin apps or forcing crews through a mobile browser. Offline support is the natural motivator here — needs author confirmation.

### Why Puppeteer for payroll PDFs, not a PDF library
Payslips are essentially styled documents; rendering HTML/CSS templates through headless Chrome gives pixel-accurate layouts that designers and developers can iterate on with normal web tooling, versus fighting low-level PDF primitives in a library like pdfkit. At 700+ PDFs/month a batched background job amortizes browser startup cost.

### Why Resend, not raw SES/SMTP
Resend offers a clean API and deliverability tooling with minimal setup, which matters when payslips must reliably reach hundreds of employees monthly. Since the platform already runs on AWS, choosing Resend over SES suggests developer-experience won out — worth confirming with the author.

### Why real-time workflows, not polling dashboards
The headline result — coordination delays cut 40% — comes from approvals and status changes propagating instantly to the people waiting on them, instead of being discovered on the next dashboard refresh or phone call. The exact transport (WebSockets, SSE, push) is not publicly visible and needs author confirmation.

## Fun facts
- The background payroll pipeline produces 700+ PDF payslips every month with Puppeteer and emails them via Resend — a print shop replaced by a cron job.
- Real-time approval/status workflows measurably cut coordination delays by 40% across the portfolio.
- The platform serves 1,000+ users managing a $2B real-estate portfolio.
- The live app is locked down tight: the root URL 302s straight to `/auth/login`, and the login shell renders entirely client-side, exposing nothing.
- The browser title reveals the operating company suffix "TTIPL", and the meta description pitches it as a full construction ERP "from blueprint to completion".

## Screenshot targets
- https://app.buildenfra.in/auth/login — the public login page (branding, ERP positioning). Note: it is client-rendered, so screenshot in a real browser, not from raw HTML.
- https://app.buildenfra.in/auth/register — public registration page.
- All interesting UI (dashboards, approvals, payroll) is behind login; a demo account exists but per project policy no authenticated screenshots were captured. Author should supply dashboard/field-app screenshots.

## Gaps
1. What database(s) back the Golang services (Postgres? MySQL? DynamoDB?), and is it one DB or per-service?
2. How exactly are the modular services split (auth, payroll, approvals, projects?), and do clients talk REST, gRPC, or GraphQL?
3. What powers the real-time layer — WebSockets, SSE, Firebase/FCM push, or something else?
4. Which AWS services are in play (ECS/EKS/Lambda, S3, SQS, EventBridge?) and how are the Puppeteer jobs scheduled and scaled?
5. Does the React Native field app work offline, and how does it sync?
6. What does "TTIPL" stand for, and what is the relationship between BuildEnfra and the portfolio owner?
7. War stories: what broke at 700 PDFs/month (Puppeteer memory? email throttling?) and how was it fixed?
8. How is authentication/authorization handled (roles, per-project permissions), and why is public registration open?
