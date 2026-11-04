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

Most fields show a short explanation underneath. Text fields accept name placeholders such as `{brand}` and `{company}`, which are filled in automatically (see [CONTENT.md](CONTENT.md#name-placeholders)), so renaming the company in **Company profile** updates the whole site. To change the name shown in the **logo**, upload a new logo image or remove the logo images to use a text logo.

Every editor offers **Save**, **Discard**, **Reset to file defaults** and **Edit as JSON** (for power users). Before saving, the whole site configuration is validated, including broken menu links, unknown categories and duplicate URLs. Problems are listed and nothing is saved until they're fixed. Saved changes appear on the live site immediately.

## One-time setup on Vercel (per website)

### 1. Give the website its own database (free)

**Every website has its own separate database.** Customers' enquiries, orders and edits are never stored together.

1. In the website's Vercel project, open **Storage → Create Database → Neon (Serverless Postgres)**. Choose the free plan and connect it to **this project only**.
   - This sets `DATABASE_URL` / `POSTGRES_URL` for that project.
   - Repeat for every customer's project, so each one gets its own database.
   - Ideally, create it in the **customer's own** Vercel/Neon account, so they own their data and pay for it.
2. Tables are created automatically on first use. No SQL needed.

Supabase, Railway, AWS RDS or any Postgres also work: just set `DATABASE_URL`.

**Several sites on one deployment** (e.g. the demo with the site switcher): give each site its own URL with a site-specific variable, and turn on strict isolation so a site can never fall back to a shared database:

| Variable | Example |
|---|---|
| `DATABASE_URL_MAISON_LUMIERE` | `postgres://…/maison` |
| `DATABASE_URL_APEX_FORGE` | `postgres://…/apex` |
| `ISOLATE_SITE_DATABASES` | `true` |

Lookup order for a site is `DATABASE_URL_<SITE_ID>` → `POSTGRES_URL_<SITE_ID>` → `DATABASE_URL` / `POSTGRES_URL`. The last step is skipped when `ISOLATE_SITE_DATABASES=true`. The admin sidebar shows which database the current site is using.

**Data size:** the database stores only text, about 50–500 KB of site edits, ~1 KB per enquiry and ~4 KB per order. A typical business site uses around 10 MB per year, well within free tiers. Images are not stored in the database.

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

- **Storage (one per site):**
  - **The site's own Postgres database** when one is configured (see above).
  - **Local JSON files** in `.data/` during local development. Zero setup; the dev password is `admin`.
  - **Read-only** on a host without a database: you can browse the admin, but saving is disabled and a banner explains why.
  - Every store is bound to one site and refuses to read or write another site's data. Rows also carry the site id as a second safeguard.
- **What's stored:** admin edits are saved per *module* (company, theme, pages, catalog…) as an override of the configuration files in `sites/<id>/`. The files remain the defaults. **Reset to file defaults** removes the override for that module.
- **When changes appear:** immediately on the server that saved them, and on other server instances within 10 seconds.
- **Orders and enquiries:** saved to the site's own database alongside its edits, so the "demo" order mode turns into real, persistent orders.
- **Security:**
  - The password is compared in constant time.
  - Login is rate-limited (5 attempts per 5 minutes per IP).
  - The session cookie is HMAC-signed, httpOnly, `sameSite=strict`, lasts 8 hours and is bound to one site. Signing in to one company's admin does not grant access to another.
  - Admin API calls require a same-origin request.
  - `/admin` is excluded from search engines.
- **Backups and migration:** **Export config (JSON)** in the sidebar downloads the full effective configuration, for backup or to copy changes back into `sites/<id>/` files.

## Images (upload)

Every image field has **Upload** and **Library** buttons, and you can also drag an image onto it. Lists of images (product photos, galleries) appear as a thumbnail grid: upload several at once, edit alt text and captions, and reorder or remove images. **Media library** in the sidebar shows all uploaded images, where you can upload in bulk, copy an image's URL or delete it.

- **Large photos are resized in the browser** (max 2400 px, WebP) before uploading, so phone photos upload quickly. The maximum upload size is 4 MB after resizing.
- **Formats:** JPG, PNG, WebP, GIF, AVIF, SVG and ICO. The real file type is checked from the file's content, and scripts are removed from SVGs.
- **Pasting an image URL** still works.

### Where images are stored (per website, chosen automatically)

| Storage | When | Notes |
|---|---|---|
| **Vercel Blob** (recommended) | `BLOB_READ_WRITE_TOKEN` is set (Vercel → **Storage → Create → Blob** → connect to this project) | Global CDN, fastest; free tier available. Each project should have its own Blob store |
| The website's **database** | No Blob store, but the site has a database | Works with no extra setup; images are served from `/api/media/…` with long caching. Uses database space, so prefer Blob for image-heavy sites |
| Local files (`.data/media/`) | Local development | – |
| Disabled | Hosted without Blob or database | The admin shows how to enable uploads; pasting URLs still works |

When several sites share one deployment, use `BLOB_READ_WRITE_TOKEN_<SITE_ID>`. With `ISOLATE_SITE_DATABASES=true`, a shared token is never used. Images can also still be committed to `public/sites/<id>/`.

## Creating a website for a new company

The admin edits an existing website. A **new** company still needs its own folder and deployment:

1. Run `npm run new-site -- new-company --from maison-lumiere`, or ask Claude to do it. Push the change.
2. In Vercel, add a new project from the same repository:
   - set `SITE_ID=new-company`, `ENABLE_SITE_SWITCHER=false`, `ADMIN_PASSWORD`, `ADMIN_SECRET`;
   - create and connect **a new database for this customer** (Storage → Neon).
3. Open `https://<new-project>.vercel.app/admin` and customise everything from there.
