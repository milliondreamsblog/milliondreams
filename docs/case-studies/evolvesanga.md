# Evolve Sangh Foundation (EvolveSanga)

## Overview
EvolveSanga is the production website for Evolve Sangh Foundation, a registered Section 8 nonprofit based in Kanpur (233D, Lakhanpur Housing Society, Awadhpuri, Kanpur 208024) dedicated to uplifting underprivileged youth in India under the motto "Living, Loving, Learning." The site is the organization's public face and operational funnel: it presents nine activity programs across the Living/Loving/Learning pillars, runs three named donation campaigns (Tyari Kal Ki, Hunger Free Night, Shiksha Na Ruke), and captures volunteer, internship, and CSR-partnership interest through a registration form. It serves donors, volunteers, corporate CSR partners, and beneficiaries' communities, replacing word-of-mouth outreach with a credible, always-on web presence including impact statistics and audit-report transparency.

## Architecture
The site is a Next.js + TypeScript + Tailwind application deployed on Vercel — confirmed by `_next/static` chunks and `next/image` optimization URLs in the page source. It spans 9+ routes, all verified live: `/`, `/about-us`, `/contact-us`, `/join-us`, `/support-a-cause`, and nine activity pages under `/activities/*` (free-food-drive, youth-welfare-centers, cloth-distribution, environment-care, mental-wellness-program, women-empowerment, access-to-education, skill-development, value-education-program).

Two dynamic behaviors are visible from outside. First, the `/support-a-cause` page initially renders "Loading campaign..." and takes a `?cause=` query parameter (education | food | future), meaning campaign content is fetched client-side — inferred to come from an API route or CMS/data source rather than being statically baked in. Second, the `/join-us` page hosts a "Register your interest" form (Volunteering / Internship / Corporate Partnership / Donation / Other), which must submit somewhere — inferred to be a Next.js API route feeding email or a datastore. The homepage impact counters ("plates served", "meals served weekly", "education kits", "children coached") animate from 0, implying client-side count-up components. Payment-gateway integration for donations is implied by the donation flows but not verifiable without submitting a payment — needs author confirmation.

### Diagram spec
```json
{"nodes":[{"id":"visitor","label":"Donor / volunteer browser","kind":"client"},{"id":"next","label":"Next.js site (9+ routes)","kind":"service"},{"id":"api","label":"API routes (campaigns, forms)","kind":"service"},{"id":"campaigns","label":"Campaign data source","kind":"db"},{"id":"forms","label":"Interest form handler","kind":"service"},{"id":"pay","label":"Payment gateway (donations)","kind":"external"},{"id":"img","label":"Vercel image optimization / CDN","kind":"external"},{"id":"notify","label":"Email notification to NGO team","kind":"external"}],"edges":[{"from":"visitor","to":"next","label":"browse pages"},{"from":"next","to":"img","label":"optimized images"},{"from":"visitor","to":"api","label":"fetch campaign by ?cause="},{"from":"api","to":"campaigns","label":"read campaign content"},{"from":"visitor","to":"forms","label":"submit interest form"},{"from":"forms","to":"notify","label":"alert NGO team"},{"from":"visitor","to":"pay","label":"donate"}]}
```

## Tech stack
| Tech | Role | Why this choice |
| --- | --- | --- |
| Next.js | Site framework: static marketing pages plus dynamic campaign/donation pages | Mixes prerendered content pages (SEO for an NGO that needs discoverability) with client-side dynamic campaign loading in one codebase |
| TypeScript | Application language | Type safety keeps a many-routed content site maintainable, especially around campaign data and form payloads |
| Tailwind CSS | Styling system | Rapid, consistent styling across 9+ routes without a CSS architecture to maintain — ideal for a small team shipping a nonprofit site |
| Vercel | Hosting, CDN, image optimization | Free-tier friendly for an NGO, zero-ops deployment, and built-in `next/image` optimization for a photo-heavy site |

## Data model
Likely main entities (inferred from what the site exposes; needs author confirmation): Campaigns — the three causes (education/food/future, i.e. Tyari Kal Ki, Hunger Free Night, Shiksha Na Ruke) with title, story, and donation target, fetched client-side on `/support-a-cause`; Donations linked to a campaign and donor details; Interest Registrations from the `/join-us` form with an area-of-interest enum (volunteering, internship, corporate partnership, donation, other) plus contact fields; Activities/Programs — the nine program pages, which may be static content or CMS-backed; and Impact Stats behind the homepage counters. Whether these live in a database, a headless CMS, or flat files is not observable from outside.

### DB diagram spec
```json
{"entities":[{"name":"Campaign","fields":["id","slug","title","story","goal_amount"]},{"name":"Donation","fields":["id","campaign_id","donor_name","amount","payment_ref","created_at"]},{"name":"InterestRegistration","fields":["id","name","contact","area_of_interest","message","created_at"]},{"name":"Activity","fields":["id","slug","pillar","title","description"]},{"name":"ImpactStat","fields":["id","label","value","updated_at"]}],"relations":[{"from":"Donation","to":"Campaign","label":"funds"},{"from":"Activity","to":"ImpactStat","label":"reports"},{"from":"InterestRegistration","to":"Activity","label":"interested in (optional)"}]}
```

## Why this, not that
### Why Next.js, not a website builder (Wix/WordPress)
An NGO site must be fast on low-end phones, rank on search, and cost nearly nothing to run — statically rendered Next.js on Vercel's free tier beats a paid builder subscription while giving full control over donation and form flows. It also lets the campaign pages be genuinely dynamic (client-fetched by `?cause=`) instead of duplicated static pages.

### Why client-side campaign loading, not fully static cause pages
`/support-a-cause` renders a "Loading campaign..." shell and hydrates by query parameter, so all three campaigns share one route and campaign content can change without redeploying page markup. The exact data source (API route, CMS, or JSON) needs author confirmation.

### Why Tailwind, not a component library or custom CSS
The site has a strong custom visual identity (campaign typography like "TYARI KAL KI", pillar-based sections) that off-the-shelf component libraries would fight; Tailwind gives that freedom with none of the specificity wars of hand-rolled CSS, and it purges to a tiny bundle for mobile donors.

### Why a single interest form, not separate volunteer/partner/donor funnels
The `/join-us` form routes every kind of engagement — volunteering, internships, CSR partnership, donations — through one "Area of Interest" selector. For a small NGO team, one inbox-style pipeline is far easier to actually follow up on than four separate systems. Whether submissions go to email or a database needs author confirmation.

### Why Vercel, not shared hosting in India
Vercel's global CDN plus image optimization keeps a photo-heavy nonprofit site fast for both Indian donors and diaspora donors abroad, with git-push deploys and no server maintenance — essential when engineering time is donated.

## Fun facts
- The foundation's motto structures the entire information architecture: activities are grouped under Living (food, shelter, clothing), Loving (environment, mental wellness, women empowerment), and Learning (education, skills, values).
- The three donation campaigns have memorable Hindi names: "Tyari Kal Ki" (preparation for tomorrow), "Hunger Free Night", and "Shiksha Na Ruke" (education must not stop).
- The homepage counts impact in plates and meals — plates served in underprivileged schools, weekly meals served in slums, education kits distributed, and children given free coaching — animating up from zero.
- The footer links an Audit Report section, a transparency signal for a Section 8 registered nonprofit courting CSR partners.
- Nine distinct program pages under `/activities/*` make this a genuinely deep site (12+ routes total), not a one-page brochure.

## Screenshot targets
- https://evolve-sanga.vercel.app/ — hero, mission statement, impact counters, and the three campaign cards.
- https://evolve-sanga.vercel.app/support-a-cause?cause=education (also ?cause=food and ?cause=future) — the donation campaign UI; note it loads client-side, so screenshot in a real browser after hydration.
- https://evolve-sanga.vercel.app/join-us — the "Ways to get involved" grid and interest-registration form.
- https://evolve-sanga.vercel.app/about-us and https://evolve-sanga.vercel.app/activities/youth-welfare-centers — organizational depth and a representative program page.
- Nothing is behind a login; the whole site is public.

## Gaps
1. Where does the `/support-a-cause` campaign data come from — a Next.js API route, a headless CMS, or a static JSON — and where do donations actually get processed (Razorpay? Instamojo? bank transfer instructions)?
2. Where do `/join-us` form submissions go — email (which service?), Google Sheets, or a database?
3. Are the homepage impact numbers hand-updated in code, or fed from a data source the NGO team can edit?
4. Is there any admin interface for the foundation's team, or are all content changes made through code deploys?
5. Does the site handle 80G/12A tax-receipt generation for donors, or is that manual?
6. What were the 3 causes' fundraising outcomes — any numbers on donations or volunteers acquired through the site?
7. War stories: constraints of building pro-bono for an NGO (content gathering, photo rights, Hindi/English copy decisions)?
8. Is `evolve-sanga.vercel.app` the primary production URL, or does a custom domain (e.g. evolve.org.in) point at it?
