import type { CaseStudy } from "./types";

export const arthenic: CaseStudy = {
  slug: "arthenic",
  heroImage: "/case-studies/arthenic/hero.png",
  heroCaption:
    "Full-bleed parallax hero — real miniature-painting photography under live Jaipur ✕ New York clocks",
  tldr: "Arthenic is a premium redesign for a real Jaipur heirloom-craft house — hand-painted miniatures, Bandhani silk, kundan jewellery, and handcrafted decor — presented as an editorial luxury storefront rather than a grid of product cards. The build leans into feel: a full-bleed parallax hero with live city clocks for the brand's two homes (Jaipur ✕ New York), a special-editions 'Vault' strip with add-to-bag interaction, hover-expand collection rows, and a sound layer synthesized entirely in the Web Audio API — no audio files shipped. Real product photography and pricing come from the actual Arthenic catalog, driven by a markdown content layer instead of a CMS.",
  architecture: {
    intro:
      "A content-driven Next.js 16 App Router site with no database: the catalog and editorial copy live as markdown parsed at build/render time by gray-matter and marked, so the whole storefront deploys as one zero-config Vercel app. Interaction runs client-side — Lenis smooth scrolling, Framer Motion section reveals, and a Web Audio synthesizer that generates hover and easter-egg sounds at runtime. The only server endpoint is the book-a-call API route backing the enquiry flow.",
    diagram: {
      nodes: [
        { id: "visitor", label: "Visitor (desktop / mobile)", kind: "client" },
        { id: "next", label: "Next.js 16 App Router (React 19)", kind: "service" },
        { id: "content", label: "Markdown content layer (gray-matter + marked)", kind: "db" },
        { id: "motion", label: "Lenis + Framer Motion + Web Audio synth", kind: "service" },
        { id: "call", label: "/api/book-a-call route", kind: "service" },
        { id: "vercel", label: "Vercel (zero-config deploy)", kind: "external" },
      ],
      edges: [
        { from: "visitor", to: "next", label: "RSC-rendered pages" },
        { from: "next", to: "content", label: "catalog + editorial copy" },
        { from: "visitor", to: "motion", label: "scroll, hover, easter egg" },
        { from: "visitor", to: "call", label: "enquiry / booking" },
        { from: "next", to: "vercel", label: "deployed on" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js 16 + React 19",
      role: "App Router frontend on the newest stable line (Turbopack dev)",
      why: "A concept-quality redesign is the right place to run the bleeding edge — RSC keeps the content-heavy pages light, and there is no legacy surface to migrate.",
    },
    {
      tech: "Tailwind CSS 4",
      role: "Styling for the editorial layout system",
      why: "The luxury look is mostly typography, spacing, and restraint — utility classes keep the design language consistent across dozens of sections without a bespoke CSS layer.",
    },
    {
      tech: "gray-matter + marked",
      role: "Markdown content layer for catalog and editorial copy",
      why: "One developer, a real client catalog, no CMS budget: versioned markdown in the repo gives the client-facing content a review trail and deploys atomically with the code.",
    },
    {
      tech: "Lenis + Framer Motion",
      role: "Smooth scrolling and section-reveal choreography",
      why: "The brief was 'calm luxury' — Lenis evens out scroll velocity so parallax and reveals feel weighted rather than springy.",
    },
    {
      tech: "Web Audio API",
      role: "Synthesized hover sound design and retro SFX",
      why: "Shipping audio files for micro-interactions is weight and latency; synthesizing tones at runtime costs zero network bytes and stays perfectly tweakable in code.",
    },
    {
      tech: "Vitest + Testing Library",
      role: "Component tests on the UI primitives",
      why: "The primitives (Button, Card, Section, Prose) are reused everywhere; cheap tests there protect the whole page tree.",
    },
  ],
  decisions: [
    {
      chose: "Synthesized Web Audio sound",
      over: "shipped audio assets",
      body: "Hover sounds from .mp3 files mean network requests, decode latency, and a payload tax on a site that lives on imagery. Generating tones with the Web Audio API costs nothing to ship, plays instantly, and every parameter — pitch, envelope, decay — stays tunable in code review like any other change.",
    },
    {
      chose: "Markdown catalog in the repo",
      over: "a headless CMS",
      body: "A CMS earns its keep when non-developers edit content weekly. For a concept redesign with a stable catalog, gray-matter over versioned markdown gives atomic deploys, a git review trail, and zero extra infrastructure — the entire stack is one Vercel app.",
    },
    {
      chose: "Editorial storefront experience",
      over: "a conventional product-grid shop",
      body: "Heirloom pieces with four-figure prices don't sell from a 4-column grid. The redesign treats each craft as a story — full-bleed photography, hover-expand rows, a 'Vault' for single-run pieces — and routes purchase intent through an enquiry flow, which matches how the brand actually sells.",
    },
    {
      chose: "Live dual city clocks (Jaipur ✕ New York)",
      over: "a static 'about us' line",
      body: "The brand's identity is artisan workshops in Jaipur serving collectors abroad. Two ticking clocks in the hero say that in zero words and give the page a quiet sense of being alive — cheap to build, disproportionate in feel.",
    },
  ],
  funFacts: [
    "The footer hides a playable brick-breaker easter egg, complete with retro synth sound effects — also generated in the Web Audio API.",
    "Every hover tone on the site is synthesized at runtime; the repo ships zero audio files.",
    "The hero clocks tick live for Jaipur and New York — the brand's workshop city and its biggest collector market.",
    "All product photography and pricing are real, pulled from the actual Arthenic catalog rather than placeholder content.",
  ],
  gallery: [
    {
      src: "/case-studies/arthenic/collections.png",
      caption: "The house collections — hover-expand category rows over real catalog photography",
    },
    {
      src: "/case-studies/arthenic/vault.png",
      caption: "The Vault — special-edition, single-run pieces with add-to-bag interaction",
    },
  ],
};
