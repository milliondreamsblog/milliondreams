import type { CaseStudy } from "./types";

export const evolvesanga: CaseStudy = {
  slug: "evolvesanga",
  heroImage: "/case-studies/evolvesanga/hero.png",
  heroCaption: "Evolve Sangh Foundation — Living, Loving, Learning",
  tldr: "EvolveSanga is the production website for Evolve Sangh Foundation, a registered Section 8 nonprofit in Kanpur uplifting underprivileged youth under the motto 'Living, Loving, Learning.' The site is the organization's public face and its operational funnel: nine activity programs across the three pillars, three named donation campaigns, and a single registration form that captures volunteer, internship, and CSR-partnership interest. It replaces word-of-mouth outreach with a credible, always-on web presence — animated impact counters, audit-report transparency, and 12+ live routes deep.",
  architecture: {
    intro:
      "A Next.js + TypeScript + Tailwind application deployed on Vercel, spanning nine activity pages plus the core routes — all verified live. Two dynamic behaviors show through from outside: the /support-a-cause page renders a loading shell and hydrates campaign content client-side by a ?cause= query parameter, and the /join-us interest form submits somewhere behind an API route. Everything else is prerendered content served through Vercel's CDN, with next/image optimization carrying a photo-heavy site to low-end phones.",
    diagram: {
      nodes: [
        { id: "visitor", label: "Donor / volunteer browser", kind: "client" },
        { id: "next", label: "Next.js site (12+ routes)", kind: "service" },
        { id: "api", label: "API routes (campaigns, forms)", kind: "service" },
        { id: "campaigns", label: "Campaign data source", kind: "db" },
        { id: "forms", label: "Interest form handler", kind: "service" },
        { id: "notify", label: "Email notification to NGO team", kind: "external" },
        { id: "pay", label: "Payment gateway (donations)", kind: "external" },
        { id: "img", label: "Vercel image optimization / CDN", kind: "external" },
      ],
      edges: [
        { from: "visitor", to: "next", label: "browse pages" },
        { from: "next", to: "img", label: "optimized images" },
        { from: "visitor", to: "api", label: "fetch campaign by ?cause=" },
        { from: "api", to: "campaigns", label: "read campaign content" },
        { from: "visitor", to: "forms", label: "submit interest form" },
        { from: "forms", to: "notify", label: "alert NGO team" },
        { from: "visitor", to: "pay", label: "donate" },
      ],
    },
  },
  stack: [
    {
      tech: "Next.js",
      role: "Site framework: static pages + dynamic campaigns",
      why: "Prerendered content pages give an NGO the SEO it needs, while campaign pages stay dynamic via client-side loading — one codebase for both.",
    },
    {
      tech: "TypeScript",
      role: "Application language",
      why: "Type safety keeps a many-routed content site maintainable, especially around campaign data and form payloads.",
    },
    {
      tech: "Tailwind CSS",
      role: "Styling system",
      why: "Rapid, consistent styling across 12+ routes with no CSS architecture to maintain, purging to a tiny bundle for mobile donors.",
    },
    {
      tech: "Vercel",
      role: "Hosting, CDN, image optimization",
      why: "Free-tier friendly for an NGO, zero-ops git-push deploys, and built-in image optimization for a photo-heavy site.",
    },
    {
      tech: "Client-side campaign loading",
      role: "One route, three donation campaigns",
      why: "All three causes share /support-a-cause and hydrate by query parameter, so campaign content can change without redeploying page markup.",
    },
    {
      tech: "Count-up impact counters",
      role: "Homepage credibility",
      why: "Plates served, weekly meals, education kits, and children coached animate up from zero — impact you watch instead of read.",
    },
  ],
  dataModel: {
    intro:
      "The likely entities behind the site, read off what it exposes publicly: the three donation campaigns fetched client-side by cause, donations linked to a campaign, interest registrations from the /join-us form with an area-of-interest enum, the nine activity programs, and the impact stats behind the homepage counters. Whether these live in a database, a headless CMS, or flat files is not observable from outside — the shape below is the honest read, not a verified schema.",
    diagram: {
      entities: [
        { name: "Campaign", fields: ["id", "slug", "title", "story", "goal_amount"] },
        { name: "Donation", fields: ["id", "campaign_id", "donor_name", "amount", "payment_ref"] },
        { name: "InterestRegistration", fields: ["id", "name", "contact", "area_of_interest", "message"] },
        { name: "Activity", fields: ["id", "slug", "pillar", "title", "description"] },
        { name: "ImpactStat", fields: ["id", "label", "value", "updated_at"] },
      ],
      relations: [
        { from: "Donation", to: "Campaign", label: "funds" },
        { from: "Activity", to: "ImpactStat", label: "reports" },
        { from: "InterestRegistration", to: "Activity", label: "interested in" },
      ],
    },
  },
  decisions: [],
  funFacts: [],
};
