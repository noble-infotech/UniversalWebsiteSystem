# Admin dashboard

Every website has its own admin at **`/admin`**, for example `https://your-site.vercel.app/admin`.

## What you can do

| Area | What it manages |
|---|---|
| **Dashboard** | Counts of enquiries, orders, pages, products and services; latest enquiries; which sections have been edited |
| **Enquiries** | Every contact, enquiry, quote, careers, newsletter and callback submission. Filter by form, mark read or unread, archive, reply by email, export CSV |
| **Orders** (shop sites) | All orders with details. Changing the status (placed → processing → shipped → delivered / cancelled) updates the customer's order-tracking page |
| **Company profile, Company story, Business info** | Name, logos, addresses, contacts, social links, map; about, vision, mission, values, team, milestones, awards, stats |
| **Brand & theme** | Colours (with colour pickers), fonts, buttons, cards, header and footer style, animations, light/dark mode |
| **Pages & homepage** | The homepage and every page: add, duplicate, delete or reorder pages and sections; switch sections on/off; edit titles, images, buttons, layouts; page SEO |
| **Header & menu, Footer** | Menu items and dropdowns, announcement bar, header button; footer columns and links |
| **Features on/off** | Shop, catalogue, services, blog, portfolio, careers, quotes, search, newsletter, accounts, wishlist |
| **Content library** | Testimonials, FAQs, blog posts, events, offers, gallery, case studies, client logos, partners, jobs |
| **Services, Products & categories, Shop settings** | Services; products with prices, variants, stock and images; currency, tax, shipping, coupons, payment methods |
| **Integrations, SEO** | Analytics and pixel IDs, WhatsApp, chat, popups, social sharing; titles, descriptions, social image, robots |

Every editor offers **Save**, **Discard**, **Reset to file defaults** and **Edit as JSON** (for power users). Before saving, the whole site configuration is validated, including broken menu links, unknown categories and duplicate URLs. Problems are listed and nothing is saved until they're fixed. Saved changes appear on the live site immediately.

## One-time setup on Vercel (per website)

### 1. Add a database (free)
1. In the Vercel project, open **Storage → Create Database → Neon (Serverless Postgres)**. Choose the free plan and connect it to the project.
   - This adds `DATABASE_URL` / `POSTGRES_URL` automatically.
   - **One database can serve all your company websites:** connect the same database to each project. Data is separated by `SITE_ID`.
2. Tables are created automatically on first use. No SQL needed.

Supabase, Railway, AWS RDS or any Postgres also work: just set `DATABASE_URL`.

### 2. Set an admin password
In **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | a strong password for this website's admin |
| `ADMIN_SECRET` | a long random string used to sign login sessions (e.g. the output of `openssl rand -hex 32`) |

To give each company a different password on the **same** deployment, use site-specific variables instead: `ADMIN_PASSWORD_APEX_FORGE`, `ADMIN_PASSWORD_MAISON_LUMIERE` and so on.

### 3. Redeploy
Go to **Deployments → ⋯ → Redeploy**, then open `/admin`.

## How it works

- **Storage:**
  - **Postgres** when `DATABASE_URL` / `POSTGRES_URL` is set.
  - **Local JSON files** in `.data/` during local development. Zero setup; the dev password is `admin`.
  - **Read-only** on a host without a database: you can browse the admin, but saving is disabled and a banner explains why.
- **What's stored:** admin edits are saved per *module* (company, theme, pages, catalog…) as an override of the configuration files in `sites/<id>/`. The files remain the defaults. **Reset to file defaults** removes the override for that module.
- **When changes appear:** immediately on the server that saved them, and on other server instances within 10 seconds.
- **Orders and enquiries:** saved to the same database, so the "demo" order mode turns into real, persistent orders.
- **Security:**
  - The password is compared in constant time.
  - Login is rate-limited (5 attempts per 5 minutes per IP).
  - The session cookie is HMAC-signed, httpOnly, `sameSite=strict`, lasts 8 hours and is bound to one site. Signing in to one company's admin does not grant access to another.
  - Admin API calls require a same-origin request.
  - `/admin` is excluded from search engines.
- **Backups and migration:** **Export config (JSON)** in the sidebar downloads the full effective configuration, for backup or to copy changes back into `sites/<id>/` files.

## Images

Image fields take a URL or a path, and a preview appears next to the field. To use your own images, either:
- add them to `public/sites/<id>/` in the repository and reference them as `/sites/<id>/photo.jpg`, or
- paste a URL from any image host or CDN (Cloudinary, ImageKit, Vercel Blob, etc.).

Direct uploads from the admin are a planned extension (Vercel Blob).

## Creating a website for a new company

The admin edits an existing website. A **new** company still needs its own folder and deployment:

1. Run `npm run new-site -- new-company --from maison-lumiere`, or ask Claude to do it. Push the change.
2. In Vercel, add a new project from the same repository:
   - set `SITE_ID=new-company`, `ENABLE_SITE_SWITCHER=false`, `ADMIN_PASSWORD`, `ADMIN_SECRET`;
   - connect the shared database.
3. Open `https://<new-project>.vercel.app/admin` and customise everything from there.
