# Architecture

## 1. Technology stack and why

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19 + TypeScript** | Server rendering for SEO, file-based dynamic routing, metadata API (titles, OG, sitemap, robots), route handlers for a thin backend, and image optimisation. One deployable that works on Vercel, Node, Docker and most hosts. |
| Styling | **Tailwind CSS v4** + runtime **CSS custom properties** | Tailwind utilities are mapped onto CSS variables (`bg-primary`, `rounded-brand`, `font-heading`…). Each company's theme config is turned into those variables at request time, so one stylesheet serves unlimited brands with no rebuild. |
| Validation | **Zod 4** | One schema is the single source of truth for config validation, TypeScript types (`z.infer`), form validation (client and server) and checkout validation. |
| Client state | **Zustand** (persisted) | Small, framework-agnostic store for cart, wishlist, coupon and demo account state, partitioned per site id. |
| Icons | **lucide-react** (curated map) + inline SVG brand glyphs | Configs reference icons by name; the curated map keeps client bundles small. |
| Testing | **Vitest** | Fast unit tests for pricing maths, coupons, catalogue queries and every site config. |

## 2. Architectural principles

1. **Core never contains company content.** Everything specific to a company lives in `sites/<id>/`. Components only receive validated config.
2. **Config is data, validated at the boundary.** `SiteConfigSchema` fills in defaults and rejects bad configs with readable errors. `validateSite()` adds cross-reference checks.
3. **Sections are a registry.** Pages are ordered lists of section configs; `SectionRenderer` maps `type` to a component. Any section works on any page.
4. **Feature flags gate everything.** `isEnabled(site, "shop")` hides routes (404), navigation items, footer columns, header icons and sections.
5. **Frontend, backend, data and integrations are separated.** UI → API route handlers → service interfaces (`src/services/types.ts`) → adapters. Swapping the database or payment gateway touches only adapters.
6. **Never trust the client.** Orders are re-priced on the server from the catalogue. Coupons are validated on the server and their codes are never shipped to the browser.

## 3. Folder structure

```
├── sites/                       ← ALL company-specific data (one folder per company)
│   ├── index.ts                 ← site registry (add one line per company)
│   ├── _shared/helpers.ts       ← authoring helpers (img(), section(), page(), legalPages())
│   ├── apex-forge/              ← manufacturing sample
│   │   ├── index.ts             ← MASTER CONFIG: composes the modules below + feature flags
│   │   ├── company.ts           ← company profile, story, business info
│   │   ├── theme.ts             ← brand identity / design tokens
│   │   ├── home.ts              ← homepage section arrangement
│   │   ├── pages.ts             ← all other pages (about, contact, legal, custom…)
│   │   ├── navigation.ts        ← header menu, announcement bar, top bar, icons, CTA
│   │   ├── footer.ts            ← footer columns, legal links, payment icons
│   │   ├── services.ts          ← service categories + services
│   │   ├── products.ts          ← product categories + products
│   │   ├── commerce.ts          ← currency, tax, shipping, coupons, payment, inventory
│   │   ├── content.ts           ← testimonials, FAQs, blog, events, gallery, projects, jobs…
│   │   ├── integrations.ts      ← analytics, WhatsApp, chat, forms, popup, sharing
│   │   └── seo.ts               ← default SEO, schema.org type, route overrides
│   ├── maison-lumiere/          ← retail sample (same file set)
│   └── northstar-advisory/      ← services sample (same file set)
├── public/sites/<id>/           ← brand assets (logos, favicon, images)
├── src/
│   ├── core/                    ← framework engine (no UI, no company data)
│   │   ├── config/              ← schema.ts, loader.ts, features.ts, client.ts, validate.ts
│   │   ├── theme/tokens.ts      ← theme → CSS variables, Google Fonts URL
│   │   ├── seo/                 ← metadata builder, JSON-LD builders
│   │   ├── commerce/            ← pricing, coupons, shipping, tax, catalogue queries, order types
│   │   ├── forms/schemas.ts     ← form definitions shared by client and server
│   │   └── search.ts            ← site-wide search
│   ├── services/                ← BACKEND BOUNDARY: interfaces + adapters
│   │   ├── types.ts             ← CatalogService, OrderRepository, PaymentProvider, ShippingProvider…
│   │   ├── index.ts             ← composition root (chooses adapters per site)
│   │   └── adapters/            ← config catalogue, memory orders, manual/Stripe payments, flat-rate shipping, console/webhook forms
│   ├── components/
│   │   ├── ui/                  ← primitives: Button, Badge, Rating, Icon, SmartImage, Reveal, Counter, RichText…
│   │   ├── layout/              ← Header (+mobile nav, mega menu, search), Footer (4 layouts), PageHeader
│   │   ├── sections/            ← 32 section components + registry.tsx
│   │   ├── commerce/            ← ProductCard, gallery, purchase panel, cart drawer, checkout, filters, orders, account
│   │   ├── forms/               ← SmartForm (generic validated form), newsletter, quote
│   │   ├── engagement/          ← WhatsApp/click-to-call, popup, share buttons, analytics & chat loaders
│   │   └── SiteProvider.tsx     ← client context + hooks (useCart, useWishlist, useAccount, useMoney)
│   ├── store/shop.ts            ← persisted client state (per site)
│   ├── lib/                     ← analytics `track()`, rate limiter
│   └── app/                     ← routes (thin: resolve config → render components)
│       ├── page.tsx             ← homepage (page with slug "")
│       ├── [...slug]/           ← every configured page (about, legal, custom pages…)
│       ├── shop/, products/, cart/, checkout/, wishlist/, account/, track-order/
│       ├── services/, blog/, portfolio/, search/
│       ├── api/                 ← forms, coupons, orders, search, site switcher
│       └── sitemap.ts, robots.ts, not-found.tsx, error.tsx
├── scripts/                     ← validate-sites.ts, new-site.ts
├── tests/                       ← vitest suites
└── docs/
```

## 4. Request flow

```
Request ─► getSite()  (SITE_ID env, or demo cookie)
          └─► SiteConfigSchema.parse(sites/<id>)  (memoised per site)
                 ├─► layout.tsx: theme → CSS variables + Google Fonts, Header, Footer, widgets
                 ├─► page route: findPage(slug) → <SectionRenderer sections=… />
                 └─► SiteProvider: safe client subset (toClientConfig) for cart, checkout, analytics
Browser cart/checkout ─► /api/coupons/validate, /api/orders  (re-price + validate)
                         └─► services: catalog, inventory, payments, orders
```

## 5. Multi-tenancy options

- **One deployment per client (recommended):** set `SITE_ID` and `ENABLE_SITE_SWITCHER=false`. The core is identical across all deployments.
- **Many clients on one deployment:** resolve the site id from the request hostname instead of the cookie, in `getSiteId()` in `src/core/config/loader.ts`. This is a one-function change.
- **Headless CMS / admin dashboard:** replace the static registry with a loader that fetches the same `SiteConfigInput` JSON from your CMS or database. The schema is the contract.

## 6. Admin dashboard readiness

Every entity an admin needs to manage already has a schema in `src/core/config/schema.ts`:

- company, theme, story and business info
- pages, sections, navigation and footer
- services and categories, products and categories
- commerce: coupons, shipping, tax, inventory
- content: testimonials, blog, FAQs, events, offers, gallery, projects and jobs
- integrations and SEO

A dashboard reads and writes JSON conforming to `SiteConfigInput`, validates it with `validateSite()`, and stores it. Orders, customers and enquiries flow through the `OrderRepository` and `FormHandler` interfaces.

## 7. Performance, accessibility and security notes

- **Performance:** server-rendered pages; client JS is limited to interactive islands (cart, filters, forms, carousels). Images go through `next/image` with responsive `sizes`. Fonts use `display=swap`. Icons are tree-shaken.
- **Rendering mode:** pages render dynamically because of the demo cookie. In single-site deployments with the switcher disabled you can add caching (`revalidate`) or static generation.
- **Accessibility:**
  - skip link, landmark roles and `aria-current` navigation
  - keyboard-operable menus, dialogs and lightboxes (Esc to close)
  - labelled form fields with `aria-invalid` and error messages, focus-visible rings
  - `prefers-reduced-motion` support and alt text on all images
- **Security:**
  - security headers in `next.config.ts`
  - server-side validation of all inputs, re-pricing of orders and coupon checks
  - per-IP rate limiting on forms and orders, honeypot field
  - no secrets in configs (environment variables only), JSON-LD output escaped
