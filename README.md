# Universal Website System

A **configuration-driven corporate website + e-commerce framework**. One core application produces completely different company websites (branding, layout, content, catalogue, enabled features) from configuration alone. Onboarding a new client means adding a folder under `sites/`. No core code changes.

Three sample companies are included to show this:

| Site id | Business type | Look & feel | Commerce |
|---|---|---|---|
| `apex-forge` | Manufacturing (B2B) | Navy + safety orange, uppercase Archivo, square buttons, mega footer | Product catalogue with **request-a-quote** (no cart) |
| `maison-lumiere` | Retail / D2C e-commerce | Linen + terracotta, Cormorant serif, pill buttons, centred transparent header | **Full shop**: variants, customisation, digital and service products, coupons, shipping, tax, checkout, accounts, wishlist, order tracking |
| `northstar-advisory` | Service-based consultancy | **Dark mode**, violet/lime, Space Grotesk, glass cards, gradient CTAs | **Commerce disabled entirely** |

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000 and use the **"Switch demo"** button (bottom-left) to flip between the three companies. To serve a single company:

```bash
SITE_ID=maison-lumiere npm run dev
```

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js development / production build / production server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (pricing, coupons, catalogue queries, config validation for every site) |
| `npm run validate:sites` | Schema + cross-reference validation of every site config (catches broken links, unknown categories, duplicate slugs and similar) |
| `npm run new-site -- <id> --from <existing-id>` | Scaffold and register a new company site |

## Environment variables

See `.env.example`.

| Variable | Meaning |
|---|---|
| `SITE_ID` | Which `sites/<id>` to serve |
| `ENABLE_SITE_SWITCHER` | `false` in real client deployments (hides the demo switcher; disables the cookie override) |
| `SITE_URL` | Public origin for canonical URLs, sitemap and Open Graph tags |
| `FORMS_WEBHOOK_URL` | Deliver form submissions to a webhook (Zapier, Make, n8n, CRM) |
| `STRIPE_SECRET_KEY` | Enables the Stripe Checkout adapter when a site uses `payment.provider: "stripe"` |
| `FIREBASE_SERVICE_ACCOUNT` | **This site's own** Firebase project (service-account JSON): Firestore stores admin edits, enquiries, orders and images. No SQL database |
| `FIREBASE_SERVICE_ACCOUNT_<SITE_ID>` | Per-site Firebase project when several sites share one deployment |
| `ISOLATE_SITE_STORAGE` | `true` = a site never falls back to the shared Firebase credentials |
| `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_<SITE_ID>`) | Admin login password |
| `ADMIN_SECRET` | Key for signing admin sessions |
| `NEXT_IMAGE_UNOPTIMIZED` | `true` where the server can't reach remote image hosts |

## Admin dashboard

Each website has an admin at **`/admin`** with **image upload and a media library**, for editing company details, brand colours and fonts, pages and homepage sections, menus, products, services, content, shop settings and SEO. It also lists **enquiries** and **orders**. Changes are validated and go live immediately. Setup is the site's own free Firebase project (Firestore, one per site) plus an `ADMIN_PASSWORD`; see [docs/ADMIN.md](docs/ADMIN.md). Locally it works with zero setup: open http://localhost:3000/admin and use the password `admin`.

## Hosting

Runs on **Cloudflare Workers** (via OpenNext; one Worker per customer site, see [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md)) or on **Vercel**, unchanged. Data is stored in each site's own **Firebase Firestore** project.

```bash
npm run cf:build
```
```bash
npm run cf:deploy -- --env <site-id>
```

## Documentation

- [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md): **new customer checklist on Cloudflare**: Worker, Firebase, secrets, custom domain
- [docs/ADMIN.md](docs/ADMIN.md): **admin dashboard**, its setup on Vercel (Firebase and password), and how editing works
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): technology stack, architecture, folder structure, request flow
- [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md): **onboard a new company** (branding, theme, homepage, navigation, footer, features)
- [docs/CONTENT.md](docs/CONTENT.md): add **products, services, pages**, blog posts, case studies and more
- [docs/SECTIONS.md](docs/SECTIONS.md): reference for all 32 section types and their layouts and settings
- [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md): backend, storage (Firestore), payment, shipping, auth, analytics, and **what is production-ready vs. demo**

## Honest status: what works vs. what needs a backend

**Works today, end to end:** every page, all 32 configurable sections, theming, navigation, search, product filtering and sorting, product pages with variants, customisation, gallery and zoom, wishlist, cart, coupons (validated on the server), shipping and tax calculation, checkout with validation, **server-side re-pricing of orders** (client prices are never trusted), order confirmation, form validation and submission (server-validated, rate-limited, honeypot), webhook delivery of forms, SEO metadata, JSON-LD, sitemap, robots.txt, and analytics/pixel/live-chat loaders.

**With Firebase connected** (see docs/ADMIN.md), the following are stored and managed in the admin:
- orders, with real status-based tracking
- enquiries
- all website edits

**Still demo-grade (clearly labelled in the UI), needs work before launch:**

- **Without Firebase:** orders are kept in memory and tracking stages are simulated from the order date.
- **Customer accounts:** these are stored in the browser's localStorage.
- **Review submission.**
- **Live payment:** Stripe Checkout is implemented but untested here. Razorpay and PayPal are interface stubs.
- **Live shipping rates.**

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for the exact interfaces to implement.
