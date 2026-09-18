import type { CaseStudy } from "./types";

export const gangatiram: CaseStudy = {
  slug: "gangatiram",
  tldr: "Ganga Tiram brings a heritage book, the FACE mission, and Dev Deepawali participation into one website. The book follows the Ganga through 75 places, and the site presents that journey through photography, river chapters, and a rotatable book. Visitors can order the printed edition or dedicate lamps through a UPI payment-proof flow. A private admin panel handles the resulting orders and offerings. The engineering work connects an editorial website to the practical tasks of collecting delivery details, preserving payment evidence, and tracking fulfillment.",
  architecture: {
    intro: "Next.js serves the public pages, purchase flow, festival pages, and admin panel. TypeScript content modules supply the book and river stories. Order and lamp endpoints validate multipart submissions, compress image evidence with Sharp, and save records in Neon Postgres. Notifications run after persistence, with delivery flags stored for the admin view. UPI payments are reviewed through submitted proof rather than automatically verified by a payment gateway.",
    diagram: {
      nodes: [
        {
          id: "visitor",
          label: "Reader / participant",
          kind: "client"
        },
        {
          id: "site",
          label: "Next.js website",
          kind: "service"
        },
        {
          id: "api",
          label: "Order + lamp API routes",
          kind: "service"
        },
        {
          id: "db",
          label: "Neon Postgres",
          kind: "db"
        },
        {
          id: "notify",
          label: "Email + WhatsApp",
          kind: "external"
        },
        {
          id: "admin",
          label: "Admin panel",
          kind: "client"
        }
      ],
      edges: [
        {
          from: "visitor",
          to: "site",
          label: "browse"
        },
        {
          from: "visitor",
          to: "api",
          label: "submit + proof"
        },
        {
          from: "api",
          to: "db",
          label: "persist"
        },
        {
          from: "api",
          to: "notify",
          label: "notify after save"
        },
        {
          from: "admin",
          to: "db",
          label: "API: review"
        }
      ]
    }
  },
  stack: [
    {
      tech: "Next.js 16 + React 19",
      role: "Public site and admin application",
      why: "App Router pages and API routes keep the content, purchase steps, and order management in one deployment."
    },
    {
      tech: "TypeScript",
      role: "Content and request handling",
      why: "The book, navigation, and river chapters live in versioned content modules alongside the forms that use them."
    },
    {
      tech: "Tailwind CSS 4",
      role: "Responsive page styling",
      why: "Shared spacing and typography carry the same design through long editorial pages and compact checkout steps."
    },
    {
      tech: "Framer Motion + Lenis",
      role: "Animation and scrolling",
      why: "Section transitions and smooth scrolling support the river journey and interactive book presentation."
    },
    {
      tech: "Neon Postgres",
      role: "Orders and lamp offerings",
      why: "The serverless driver lets the Next.js routes persist submissions without a separate database service layer."
    },
    {
      tech: "Sharp",
      role: "Payment-proof image compression",
      why: "Image uploads are resized and converted to JPEG before storage. PDFs retain their original bytes."
    }
  ],
  decisions: [],
  funFacts: []
};
