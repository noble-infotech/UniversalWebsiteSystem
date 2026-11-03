# Integration points: backend, database, payments, shipping and auth

This system **does not pretend to be a finished commerce backend**. The table below separates what is production-capable today from what is a demo stand-in behind a clean interface.

| Capability | Status today | Where to integrate |
|---|---|---|
| Pages, sections, theming, SEO, sitemap, robots, JSON-LD | ✅ Production-ready | – |
| Catalogue (products, categories, services) | ✅ Read from config files | `CatalogService` → `src/services/adapters/catalog.ts` (swap for CMS / PIM / DB) |
| Search, filters, sorting, facets | ✅ In-process over the catalogue | Replace with Algolia / Meilisearch for very large catalogues |
| Cart, wishlist, coupons UI | ✅ Client-side, persisted per site | – (optionally sync to the server for logged-in users) |
| Coupon validation | ✅ Server-side (`/api/coupons/validate`); codes never sent to the browser | Move coupons to the DB for admin management |
| Checkout validation and pricing | ✅ Server re-prices every order (`/api/orders`) | – |
| Tax | ✅ Flat rate, inclusive or exclusive | Swap `computeTotals` tax step for TaxJar / Avalara / Stripe Tax for multi-region tax |
| Shipping cost | ✅ Flat rate, per-kg, free-over, country rules | `ShippingProvider` → Shiprocket / EasyPost / Shippo for live rates and labels |
| **Order persistence** | ✅ **Postgres** when `DATABASE_URL` is set (local JSON files in development); ⚠️ in-memory demo otherwise | `src/server/store.ts`; or your own `OrderRepository` (Shopify, Medusa…) |
| **Payments** | ⚠️ Manual methods (COD / bank transfer) work. **Stripe Checkout adapter is implemented but untested here** (needs `STRIPE_SECRET_KEY`). Razorpay and PayPal are stubs. | `PaymentProvider` in `src/services/adapters/payments.ts` |
| Payment webhooks (mark paid) | ❌ Not implemented | Add `app/api/webhooks/<provider>/route.ts` + durable repo |
| **Customer accounts** | ⚠️ **Demo:** stored in browser localStorage (SHA-256 hashed password). **Not secure auth.** | Replace `AccountViews.tsx` flows with Auth.js / Clerk / Cognito; protect `/account` server-side |
| Order history and tracking | ✅ Tracking reads the real order status, which is updated in the admin (with a database); ⚠️ customer order history is per browser | Shipping-provider webhooks for automatic status updates |
| Inventory | ✅ Stock levels in config, enforced at order time; ⚠️ not decremented | `InventoryService.reserve()` → ERP / WMS / DB transaction |
| Forms (contact, enquiry, quote, careers, newsletter, callback) | ✅ Server-validated, rate-limited, honeypot. Stored in the admin inbox (with a database) and delivered to the server log or **any webhook** (`FORMS_WEBHOOK_URL`) | `FormHandler` → CRM, Resend/SES email, Mailchimp |
| Product review submission | ❌ Display only | Add `/api/reviews` + moderation storage |
| Analytics (GA4, GTM, Meta Pixel) + conversion events | ✅ Loads when IDs are configured | `src/lib/analytics.ts` |
| Live chat (Tawk, Crisp, Intercom, custom) | ✅ Loads when configured | `src/components/engagement/Integrations.tsx` |
| WhatsApp, click-to-call, social share, popups | ✅ | – |

## Service interfaces

All defined in `src/services/types.ts` and composed in `src/services/index.ts`:

```ts
interface CatalogService   { listProducts(); getProduct(slug); listCategories(); listServices(); getService(slug) }
interface InventoryService { available(product); reserve(lines) }
interface OrderRepository  { durable: boolean; create(order); find(number, email) }
interface PaymentProvider  { id; createPayment(order, { returnUrl, cancelUrl }) → { status, redirectUrl?, reference? } }
interface ShippingProvider { id; quote(lines, country, merchandiseTotal) }
interface FormHandler      { id; submit(form, data, meta) → { id } }
```

API routes depend only on these interfaces. To go live, implement an adapter and select it in `getServices()`.

## Orders and database

**Built in:** connect the site's own Postgres database (`DATABASE_URL`, or `DATABASE_URL_<SITE_ID>`; one database per site) and orders, enquiries and admin edits are stored automatically. See [ADMIN.md](ADMIN.md). Tables: `uws_orders`, `uws_enquiries`, `uws_site_overrides` (created on first use). For a different backend:

1. Create tables such as `orders`, `order_lines`, `customers` and `payments`. The `Order` type in `src/core/commerce/orders.ts` is the shape to store.
2. Implement `OrderRepository` with `durable: true` (Prisma, Drizzle, or a Supabase client).
3. Return it from `getServices()`.
4. The checkout demo notice disappears automatically once orders are stored durably and payments are configured.

Orders created by a durable repository get `mode: "live"`, so tracking uses the real `status` instead of simulated stages.

## Payments

- **Manual** (`payment.provider: "manual"`): COD and bank transfer. The order is created with `payment.status: "pending"`.
- **Stripe** (`payment.provider: "stripe"` + `STRIPE_SECRET_KEY`): creates a Checkout Session for the server-computed total and redirects the shopper. **You must add** a webhook handler for `checkout.session.completed` that marks the order paid in your durable repository.
- **Razorpay / PayPal / custom:** implement `createPayment` in `payments.ts` (return `redirect` with a URL, or `pending` with a reference for client-side widgets) and map the provider id in `getServices()`.
- If a provider is selected but not configured, orders are accepted as "pay later" and a warning is logged. Checkout never crashes.

Card data never touches this application: use hosted payment pages or provider SDKs.

## Authentication

The demo account system exists so that login, registration, order history and checkout prefill can be demonstrated. For production:

1. Add Auth.js (or Clerk, Cognito…) with a database adapter.
2. Replace `AuthForm` / `AccountDashboard` data access with server session calls.
3. Associate orders with `customerId` in `OrderRepository`.
4. Protect `/account` routes on the server.

## Forms and email

Set `integrations.forms.provider: "webhook"` and `FORMS_WEBHOOK_URL`. The webhook receives:

```json
{ "id": "SUB-…", "form": "quote", "site": "apex-forge", "company": "…", "notifyEmail": "…", "page": "/request-quote", "submittedAt": "…", "data": { … } }
```

Pipe this into Zapier, Make, n8n, Slack, HubSpot, Salesforce or an email service. For direct email, implement a `FormHandler` using Resend or SES.

## Rate limiting

`src/lib/rate-limit.ts` is per-instance and in-memory. On serverless or multi-instance deployments, replace it with Upstash Redis or similar.
