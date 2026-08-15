# Arthenic — research notes

> Source of truth for the case study at `app/data/case-studies/arthenic.ts`. Facts verified 2026-08-15 against the GitHub repo (milliondreamsblog/Arthenic, updated 2026-08-13), its README, package.json, the repo file tree, and the live deployment.

## What it is

Premium redesign concept for **arthenic.com** — a real Jaipur heirloom-craft brand (hand-painted miniatures, Bandhani/Gharchola silk, kundan/temple jewellery, brass/wood/iron decor) selling to collectors worldwide (HQ Jaipur, operations noted for New York; free worldwide shipping above ₹15,000; Instagram @arthenic.luxe). Live at **https://arthenic-redesign.vercel.app**.

## Verified stack (from package.json)

- next **16.2.10**, react/react-dom **19.2.4**, tailwindcss **4** (@tailwindcss/postcss), shadcn 4.13, @base-ui/react
- **framer-motion** 12.x, **lenis** 1.3 (smooth scrolling)
- **gray-matter** + **marked** (+ gfm heading ids) — markdown content layer
- vitest 4 + @testing-library/react + jsdom — component tests exist for UI primitives (Button, Card, Container, Pill, Section, Prose per repo tree)
- devDeps: papaparse + turndown (+ gfm plugin) — likely catalog/content conversion tooling
- **No payment processor in dependencies** — purchase intent routes through enquiry/book-a-call, not checkout. Do not describe it as a transactional e-commerce build.

## Verified features (README + live site)

- Full-bleed parallax hero with **live Jaipur ✕ New York clocks**
- "The Vault" special-edition strip with add-to-bag interaction
- Craft wall, collection showcase, hover-expand category rows
- **Synthesized hover sound design via Web Audio API — zero audio assets shipped**
- **Footer brick-breaker easter egg** with retro synth SFX (component `FooterGame/BrickBreaker` in repo tree)
- Real product photography and pricing from the actual Arthenic catalog
- 4.8-star collector rating shown on site; enquiry via book-a-call (`/api/book-a-call/route.ts`)

## Repo caveats (important for accuracy)

- The repo was **bootstrapped from an earlier agency-site codebase**: the tree contains leftover routes (`/blogs/`, `/services/[slug]/`, `/industries/[slug]/`, `/ux-agencies/[slug]/`, `/work/camb-ai/`, `/work/thrust/`) and `content/agencies/` with 300+ agency-directory markdown files. **These are not Arthenic features** — the case study deliberately describes only the storefront experience.
- README self-describes as a "premium redesign concept," so the case study frames it as a client redesign, not a shipped replacement of arthenic.com.

## Screenshots

Captured 2026-08-15 from the live deployment at 1440×900 into `public/case-studies/arthenic/`:
- `hero.png` — parallax hero with category nav + rating badge
- `collections.png` — house collections rows
- `vault.png` — Vault strip

## Gaps (user to confirm)

- Was this commissioned by the Arthenic brand directly (paid client work), or a redesign pitch? Currently badged "Client Work" per the user's statement "we made a website for arthenic."
- Who else worked on it ("we")? If collaborators should be credited, add contributors on the LinkedIn project.
- Does the brand plan to adopt the redesign on arthenic.com?
- Should the leftover agency-directory routes be pruned from the public repo before recruiters browse it?
