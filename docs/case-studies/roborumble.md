# Robo Rumble

## Overview
Robo Rumble (roborumble.in) is the official event platform for ROBO RUMBLE 3.0, billed as "The Ultimate Robotics Competition at CSJMU" — Kanpur's largest student tech event, hosted by UIET on the CSJMU campus over three days (March 16–18) with a ₹1,50,000+ prize pool across 14 events. The site is both the event's marketing front (events catalog, schedule, gallery, patrons, sponsors) and its transactional backbone: account registration, per-event cart-based paid registration (₹400-class entry fees), and authenticated dashboard/onboarding areas hidden behind robots.txt. Per the author, the platform has served 30k+ visits, 1k+ registrations, and processed ₹1L+ in payments, with live team lobbies, find-a-teammate matching, and competition rooms in the logged-in app (author-reported; see Gaps). The whole experience is wrapped in a committed terminal/hacker aesthetic — the page literally boots with "LOADING THE RUMBLE… TERMINAL INACTIVE" before flipping to "// SYSTEM_ONLINE".

## Architecture
The site is a Next.js application (verified: pages are served from `/_next/static/chunks/` with a `turbopack-*.js` runtime chunk, indicating Next.js 15+ built with Turbopack) deployed behind a single domain. Public marketing routes (`/home`, `/events`, `/gallery`) are server-rendered with full content in the HTML, while `/login` and `/register` ship as thin client-rendered shells — the classic split between SEO-facing pages and the authenticated app. robots.txt explicitly disallows `/admin/`, `/dashboard/`, `/api/`, and `/onboarding/`, which maps out the private surface: an admin panel for organizers, a participant dashboard (team lobbies, competition rooms), an onboarding flow after signup, and a first-party API layer under `/api/` (Next.js route handlers). The events catalog drives a cart-based registration flow ("₹400 — GO TO CART") that feeds an in-app payment step. A reference to Ably appears in one of the site's JS bundles, consistent with the claimed real-time features (live team lobbies and competition-room presence) being delivered over a managed pub/sub channel service rather than a self-hosted socket server. Framer Motion animation code is present in the bundles, powering the terminal boot sequence, marquee banners, and countdown. Backend datastore and payment gateway are not externally observable (see Gaps).

### Diagram spec
```json
{
  "nodes": [
    {"id": "visitor", "label": "Public visitor (marketing pages)", "kind": "client"},
    {"id": "participant", "label": "Registered participant (dashboard)", "kind": "client"},
    {"id": "admin", "label": "Organizer admin panel (/admin)", "kind": "client"},
    {"id": "next", "label": "Next.js app (Turbopack, SSR + client shell)", "kind": "service"},
    {"id": "api", "label": "API routes (/api/*, robots-hidden)", "kind": "service"},
    {"id": "db", "label": "Datastore (users, teams, registrations) — unverified", "kind": "db"},
    {"id": "ably", "label": "Ably realtime (lobbies, rooms)", "kind": "external"},
    {"id": "pay", "label": "Payment gateway (₹ event fees) — provider unverified", "kind": "external"}
  ],
  "edges": [
    {"from": "visitor", "to": "next", "label": "/home /events /gallery (SSR)"},
    {"from": "participant", "to": "next", "label": "/login /register /onboarding /dashboard"},
    {"from": "admin", "to": "next", "label": "/admin"},
    {"from": "next", "to": "api", "label": "auth, cart, registration calls"},
    {"from": "api", "to": "db", "label": "persist users / teams / orders"},
    {"from": "api", "to": "pay", "label": "create + verify payment"},
    {"from": "participant", "to": "ably", "label": "live lobby / room presence"},
    {"from": "api", "to": "ably", "label": "publish room events"}
  ]
}
```

## Tech stack
| Tech | Role | Why this choice |
|---|---|---|
| Next.js (15+, Turbopack build) | Full-stack framework — SSR marketing pages + client app + API routes | One deployable serves SEO-critical event pages and the authenticated portal; verified via `/_next/static` and `turbopack-*.js` chunks |
| React | UI layer | Component reuse across a 14-event catalog, cart, and dashboard |
| Framer Motion | Animation | Powers the terminal boot sequence, scrolling marquee banners, and countdown that define the site's personality; found in site bundles |
| Ably | Real-time pub/sub | Managed channels for live team lobbies and competition rooms without operating a socket server; referenced in a site JS bundle |
| Terminal-aesthetic design system | Brand/UX | Monospace type, `// SYSTEM_ONLINE` status lines, `Register_Now` snake_case CTAs — makes an event site memorable to its student audience |
| Payment gateway (unverified provider) | In-app event-fee collection (₹400/event, ₹1L+ processed per author) | Indian-market UPI/card rails required for student payments; exact provider not externally observable |

## Data model
No code is available, so the model below is inferred from the site's observable flows and the author's feature list — it should be confirmed. A `User` registers (`/register`), completes `/onboarding`, and lands on `/dashboard`. Registration is commerce-shaped: events are catalog items with a fee ("₹400 — GO TO CART"), implying a `Cart`/`Order` holding one or more `EventRegistration` line items, each tied to a `Payment` record once the gateway confirms. Team events (Robo War, Robo Soccer, E-Sports squads of 4) imply a `Team` entity with membership, invite/join mechanics, and the find-a-teammate feature implies an open "looking for team" pool matched on event interest. Competition rooms and live lobbies imply a `Room` entity binding teams to an event bracket with a real-time presence channel (Ably channel name) per room. The 14 `Event` records themselves carry category (Robotics / Aerial / Gaming / Innovation / Entertainment), fee, prize pool (₹15,000–₹30,000 per event), and specs.

### DB diagram spec
```json
{
  "entities": [
    {"name": "User", "fields": ["name / email / phone", "college", "onboarding_complete", "role: participant|admin"]},
    {"name": "Event", "fields": ["name (Robo War, Line Follower…)", "category", "fee (₹400)", "prize_pool (₹15k-30k)", "team_size"]},
    {"name": "Team", "fields": ["name", "event → Event", "members[] → User", "looking_for_members flag"]},
    {"name": "Registration", "fields": ["user → User", "event → Event", "team → Team", "status: cart|paid|confirmed"]},
    {"name": "Payment", "fields": ["registration → Registration", "amount", "gateway_ref", "status"]},
    {"name": "Room", "fields": ["event → Event", "teams[] → Team", "ably_channel", "live_state"]}
  ],
  "relations": [
    {"from": "Registration", "to": "User", "label": "registrant"},
    {"from": "Registration", "to": "Event", "label": "for event"},
    {"from": "Team", "to": "User", "label": "members / find-a-teammate"},
    {"from": "Payment", "to": "Registration", "label": "confirms"},
    {"from": "Room", "to": "Team", "label": "hosts live lobby"}
  ]
}
```

## Why this, not that
### Why Next.js full-stack, not a separate SPA + backend
The site needs both: marketing pages (`/home`, `/events`) arrive fully server-rendered with meta descriptions and a sitemap for search/social reach, while `/login` and `/register` ship as minimal client shells for the app experience — and robots.txt shows the API living at `/api/` on the same origin. One Next.js deployment covers SEO, the authenticated portal, and the backend, which matters for a small student team shipping under event-deadline pressure.

### Why a managed realtime service (Ably), not self-hosted WebSockets
Event-day traffic is a brutal spike profile: near-zero for weeks, then thousands of concurrent participants in lobbies and competition rooms during three days. A managed channel service absorbs that spike without capacity planning, and serverless/edge hosting for Next.js can't hold long-lived socket connections anyway. The tradeoff is per-message vendor cost — acceptable when the alternative is a socket server falling over mid-finale.

### Why in-app cart-and-payments, not Google-Forms + UPI screenshots
The default for Indian college fests is a Google Form and a "send screenshot of UPI payment" honor system, which collapses at 1k+ registrations (manual reconciliation, disputed payments, no seat limits). Building payments into the platform — per-event fees, cart, gateway confirmation — gives automatic reconciliation of ₹1L+ in fees and lets the site enforce "REGISTER BEFORE SLOTS FILL!" in real time. The cost is gateway integration work and a refund policy (the footer links a dedicated Refund & Cancellation page).

### Why a terminal aesthetic, not a conventional event template
Every copy string is committed to the bit — "TERMINAL INACTIVE" boot screen, "// ROBO_RUMBLE_v3.0 // SYSTEM_ONLINE", "SYSTEM_ARENA_INITIALIZED", CTAs like `Register_Now` and `Brochure.pdf`, a "Deployment Countdown". For an audience of engineering students choosing which fest to attend, the site itself is proof of technical credibility; the risk (readability, accessibility of monospace-heavy UI) is contained by keeping the structure a conventional nav + cards underneath the styling.

## Fun facts
- The loading screen says "TERMINAL INACTIVE" and "LOADING THE RUMBLE…" before the app hydrates — the site roleplays booting an operating system, and the status line then flips to "// SYSTEM_ONLINE".
- The event lineup spans genuinely different worlds: combat robotics (Robo War, ₹20,000 pool), autonomous bots (Line Following), RC fixed-wing aircraft, mobile e-sports (BGMI + Free Fire squads, ₹30,000 pool), a Defence Expo/Defence Talk, and pure entertainment — Gokart, Paintball, a Silent DJ, and a band show with a Red Bull DJ opening.
- The 2026 edition's theme is "NEXUS — Circuit of Champions", and the homepage stats block deadpans "∞ Energy" next to "14 ACTIVE_EVENTS" and "03 Days".
- robots.txt is a mini architecture diagram: `Disallow: /admin/`, `/dashboard/`, `/api/`, `/onboarding/` reveals the entire private app surface the public never sees.
- The build is on Turbopack (a `turbopack-*.js` runtime chunk ships to production), placing the site on the current bleeding edge of the Next.js toolchain.
- Mentor hierarchy is rendered like a package tree: `Chief_Patron` (the Vice Chancellor), `Strategic_Patrons`, `Technical_Advisors` — even the university leadership gets snake_cased.

## Screenshot targets
- Live URL: https://roborumble.in (also `/home` directly). Capture the terminal boot/loading screen first — it's the signature.
- `/home` — hero ("Build Compete Dominate", ROBO RUMBLE 3.0 glitch title), marquee banner, deployment countdown, featured events with GO TO CART, theme section, mentors, footer.
- `/events` — the full 14-event arena grid grouped as BATTLES / EXPOS_PARADIGMS / ENTERTAINMENT with per-event prize pools and VIEW_SPECS buttons.
- `/gallery` — Memory_Archive photo wall from previous editions; `/login` and `/register` for the auth shell.
- Author-only (behind auth, not publicly reachable): `/dashboard` team lobby, find-a-teammate, a competition room live during the event, `/admin` — these need the author's screenshots to show the platform's real substance.
- No public repo and no local run: this is a closed-source live deployment; there are no commands to run it locally.

## Gaps
- No public repository — everything about the backend (datastore, ORM, auth mechanism, payment provider, hosting) is unverified. The author should confirm: database (Postgres? MongoDB? Firebase?), payment gateway (Razorpay/Cashfree/other), hosting (Vercel?), and auth approach.
- Ably appears in a site JS bundle and fits the "live lobbies/rooms" claims, but its exact role (presence, chat, bracket updates?) needs author confirmation.
- The traffic and revenue stats (30k+ visits, 1k+ registrations, ₹1L+ payments) are author-reported and cannot be verified from the site — worth backing with an analytics screenshot for the case study.
- The logged-in experience (dashboard, onboarding, team lobby, find-a-teammate, competition rooms) is invisible to crawlers; author screenshots/recordings are required to document it.
- Team structure and the author's specific role (solo build? web lead of an organizing team?) and the timeline across editions 1.0 → 3.0.
- Whether the schedule/team/patrons/sponsors sections are separate routes or homepage anchors (sitemap lists only `/`, `/home`, `/events`, `/gallery`, `/login`, `/register`).
