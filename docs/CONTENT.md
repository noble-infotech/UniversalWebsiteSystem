# Managing content: products, services, pages and more

All content lives in the company's folder in `sites/<id>/`. After editing, run `npm run validate:sites`.

## Adding a product (`products.ts`)

```ts
{
  slug: "oak-serving-board",            // URL: /products/oak-serving-board
  sku: "ML-OAK-01",
  name: "Oak Serving Board",
  type: "physical",                     // physical | digital | service | customizable
  category: "kitchen",                  // must exist in categories
  subcategory: "boards",                // optional, must exist with parent: "kitchen"
  shortDescription: "…",
  description: "Paragraphs.\n\n## Headings\n- bullet lists\n**bold**",
  images: [{ src: "/sites/my-co/oak.jpg", alt: "Oak board on a table" }],   // first image = thumbnail
  videos: [{ src: "/sites/my-co/oak.mp4" }],
  price: 60,
  salePrice: 48,                        // optional
  purchaseMode: "cart",                 // cart | quote | both
  options: [                            // variants
    { name: "Size", values: [{ value: "Small" }, { value: "Large", priceDelta: 20 }] },
    { name: "Color", values: [{ value: "Natural", swatch: "#d9c5a0" }] },
  ],
  customization: [{ id: "engraving", label: "Engraving", type: "text", maxLength: 30 }],
  stock: 25,                            // or stockStatus: "preorder" | "made_to_order" …
  specifications: [{ label: "Material", value: "European oak" }],
  features: ["Food-safe oil finish"],
  tags: ["kitchen", "gift"],
  reviews: [{ author: "Sam", rating: 5, body: "…", date: "2026-09-01", verified: true }],
  related: ["linen-napkins"],
  featured: true, newArrival: true, bestSeller: false,
  weightKg: 1.2,                        // used by per-kg shipping
  minOrderQty: 1,
  seo: { title: "…", description: "…" },
}
```

Filters (price, availability, rating, options, tags), facets, search, sitemap entries, JSON-LD and related products all derive from this data automatically.

### Product types

- **Physical:** shipping is applied.
- **Digital:** cart contents that are all digital only offer `digitalOnly` delivery methods, with no shipping charge.
- **Service:** sold like a digital item, e.g. a consultation.
- **Customizable:** collects `customization` fields; each configuration becomes a separate cart line.
- **Variants:** use `options` with `priceDelta`.

### Categories

`{ slug, name, description, image, parent? }`. A `parent` makes it a subcategory, so the parent category page includes products from its children.

## Adding a service (`services.ts`)

```ts
{
  slug: "seo-audit", name: "SEO Audit", category: "marketing", icon: "search",
  shortDescription: "…", description: "…", image: "…", gallery: ["…"],
  benefits: ["…"], features: [{ title: "…", description: "…", icon: "chart" }],
  process: [{ title: "Discover", description: "…" }],
  pricing: [{ name: "Starter", price: 990, unit: "/project", features: ["…"], highlighted: true }],
  faqs: [{ question: "…", answer: "…" }],
  cta: { label: "Book now", href: "/contact" },
  featured: true, seo: { … },
}
```

Each service automatically gets a detail page at `/services/<slug>`. That page includes structured data, a quick-enquiry form, pricing, FAQs and related services. Service categories group the `/services` listing.

## Adding a page (`pages.ts`)

```ts
page({
  slug: "sustainability",               // → /sustainability ; nested slugs like "legal/cookies" work too
  title: "Sustainability",
  visibility: "public",                 // "hidden" = reachable by URL, excluded from sitemap/search (campaign pages)
  template: "default",                  // default | narrow | full
  header: { show: true, subtitle: "…", image: "…", breadcrumbs: true },
  sections: [
    section({ id: "intro", type: "richText", settings: { body: "Markdown-lite text…" } }),
    section({ id: "stats", type: "stats", layout: "band" }),
    section({ id: "cta", type: "ctaBanner", title: "…", cta: { label: "…", href: "/contact" } }),
  ],
  seo: { title: "…", description: "…", ogImage: "…" },
})
```

Then link it from `navigation.ts` and/or `footer.ts`. Any of the 32 section types can be used on any page (see [SECTIONS.md](SECTIONS.md)).

- **Built-in pages** such as `/services`, `/portfolio` and `/blog` use a configured page with the same slug if one exists, so their layout is customisable too. Otherwise they fall back to a sensible default.
- **Legal pages:** `legalPages()` in `sites/_shared/helpers.ts` generates the privacy, terms, shipping and returns pages. You can replace them with your own `richText` pages.

## Other collections (`content.ts`)

| Collection | Used by |
|---|---|
| `testimonials` | `testimonials` section |
| `faqs` (with `category`) | `faq` section (`source: "<category>"` filters), product pages |
| `posts` | `/blog`, `/blog/<slug>`, `blog` section, search |
| `events` | `events` section |
| `offers` | `offers` section (cards / banner) |
| `gallery` (with `category`) | `gallery` section (filter tabs + lightbox) |
| `projects` | `projects` section, `/portfolio/<slug>` case-study pages |
| `clients`, `partners` | `clients` (marquee/grid), `partners` sections |
| `jobs` | `careers` section + application form |
| `whatWeDo`, `whyChooseUs`, `process`, `infrastructure` | the matching sections |

## Icons

Use names from `src/components/ui/Icon.tsx`, for example `factory`, `truck`, `shield-check`, `leaf`, `rocket`, `users`, `chart`, `brain`, `heart`. Unknown names fall back to a sparkle icon.

## Rich text

Text fields rendered with `RichText` support:
- paragraphs separated by blank lines
- `## Heading` and `### Subheading`
- `- list item`
- `**bold**`

## Name placeholders

Any text outside the company profile can use placeholders that are filled in from **Company profile**. Renaming the company in one place then updates every page, title and policy.

| Placeholder | Becomes |
|---|---|
| `{brand}` | Brand name |
| `{name}` | Company name |
| `{company}` | Legal name (or company name) |
| `{tagline}` | Tagline |
| `{phone}`, `{email}` | First phone number / email address |
| `{year}` | Current year |
| `{years}` | Years since the company was established |

Example: `seo.defaultTitle: "{brand} – Handmade Candles"`. The sample sites already use placeholders. Logo **images** are pictures, so the name inside them can't change: upload a new logo, or remove the logo images to show the brand name as a text logo.
