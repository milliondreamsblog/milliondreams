# Ganga Tiram

Reviewed 18 September 2026 against the project repository.

## Overview

Ganga Tiram brings a heritage book, the FACE mission, and Dev Deepawali participation into one website. The book follows the Ganga through 75 places, and the site presents that journey through photography, river chapters, and a rotatable book. Visitors can order the printed edition or dedicate lamps through a UPI payment-proof flow. A private admin panel handles the resulting orders and offerings. The engineering work connects an editorial website to the practical tasks of collecting delivery details, preserving payment evidence, and tracking fulfillment.

## Architecture

Next.js serves the public pages, purchase flow, festival pages, and admin panel. TypeScript content modules supply the book and river stories. Order and lamp endpoints validate multipart submissions, compress image evidence with Sharp, and save records in Neon Postgres. Notifications run after persistence, with delivery flags stored for the admin view. UPI payments are reviewed through submitted proof rather than automatically verified by a payment gateway.

```json
{
  "nodes": [
    {
      "id": "visitor",
      "label": "Reader / festival participant",
      "kind": "client"
    },
    {
      "id": "site",
      "label": "Next.js public pages + content",
      "kind": "service"
    },
    {
      "id": "api",
      "label": "Order + lamp API routes",
      "kind": "service"
    },
    {
      "id": "db",
      "label": "Neon Postgres",
      "kind": "db"
    },
    {
      "id": "notify",
      "label": "Email / WhatsApp notifications",
      "kind": "external"
    },
    {
      "id": "admin",
      "label": "Authenticated admin panel",
      "kind": "client"
    }
  ],
  "edges": [
    {
      "from": "visitor",
      "to": "site",
      "label": "explore river, book + event"
    },
    {
      "from": "visitor",
      "to": "api",
      "label": "delivery details / dedication + proof"
    },
    {
      "from": "api",
      "to": "db",
      "label": "save submission and compressed image"
    },
    {
      "from": "api",
      "to": "notify",
      "label": "notify after save"
    },
    {
      "from": "admin",
      "to": "db",
      "label": "server routes: review + update status"
    }
  ]
}
```

## Tech stack

- Next.js 16 + React 19: Public site and admin application. App Router pages and API routes keep the content, purchase steps, and order management in one deployment.
- TypeScript: Content and request handling. The book, navigation, and river chapters live in versioned content modules alongside the forms that use them.
- Tailwind CSS 4: Responsive page styling. Shared spacing and typography carry the same design through long editorial pages and compact checkout steps.
- Framer Motion + Lenis: Animation and scrolling. Section transitions and smooth scrolling support the river journey and interactive book presentation.
- Neon Postgres: Orders and lamp offerings. The serverless driver lets the Next.js routes persist submissions without a separate database service layer.
- Sharp: Payment-proof image compression. Image uploads are resized and converted to JPEG before storage. PDFs retain their original bytes.

## Data model

Book orders and lamp offerings are separate records because delivery and dedication need different information. Both keep payment-proof metadata and notification status. These are submission records for staff review, not evidence that a payment has been automatically verified.

```json
{
  "entities": [
    {
      "name": "book_orders",
      "fields": [
        "id, name, phone",
        "address, pincode, country, state",
        "screenshot_filename, screenshot_mime",
        "screenshot, email_sent, whatsapp_sent"
      ]
    },
    {
      "name": "lamp_offerings",
      "fields": [
        "id, name_on_lamp, dedication",
        "email, whatsapp",
        "screenshot_filename, screenshot_mime",
        "screenshot, email_sent"
      ]
    }
  ],
  "relations": []
}
```

## Decisions

### Save before notifying

The order route inserts into Postgres before sending alerts. An email or WhatsApp failure does not discard a saved order, and notification flags let the admin see which alerts went out.

### UPI proof with staff review

Visitors submit payment evidence with their delivery details or dedication. This supports the current purchase process with fewer integrations, but staff must reconcile payments before treating orders as paid.

### Compressed proof in Postgres

Images are resized to fit within 1,000 by 1,000 pixels and encoded as JPEG. Keeping the evidence with the record simplifies retrieval from the admin panel, while putting binary storage costs on the database.

### River chapters and a book preview

The site gives the book's subject room before asking for a purchase. Chapter pages and the interactive book connect the physical edition to the wider FACE mission and the festival offering flow.

## Sources

- [Project repository](https://github.com/milliondreamsblog/gangatiramV2)
- [README](https://github.com/milliondreamsblog/gangatiramV2/blob/main/README.md)

- [Order endpoint](https://github.com/milliondreamsblog/gangatiramV2/blob/main/app/api/order/route.ts)
- [Lamp endpoint](https://github.com/milliondreamsblog/gangatiramV2/blob/main/app/api/lamp/route.ts)
- [Database client](https://github.com/milliondreamsblog/gangatiramV2/blob/main/lib/server/db.ts)
- [Content and navigation](https://github.com/milliondreamsblog/gangatiramV2/blob/main/content/site.ts)

## Visuals

The hero uses `public/book/stage.png` from the project, a heritage photograph used as the background for the interactive book presentation.

## Gaps

The local project's `app/layout.tsx` identifies `https://gangatiram.in` as the canonical domain. The GitHub homepage points to the older Vercel alias. No order volume, conversion improvement, or environmental-impact metrics have been inferred. Payments use uploaded proof and staff review. The lamp endpoint can partially persist a multi-name submission, so the case study does not claim atomic batch handling.
