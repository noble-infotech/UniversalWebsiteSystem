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

### 1. Connect Firebase (free) – one Firebase project per website

All data (admin edits, enquiries, orders and uploaded images) is stored in **Google Firebase Cloud Firestore**. No SQL database is involved. **Each website gets its own Firebase project**, so customers' data is never stored together. Ideally, create it under the **customer's own Google account** so they own their data.

1. Go to **console.firebase.google.com → Add project**. Name it after the customer; Google Analytics is optional.
2. In the project, open **Build → Firestore Database → Create database**. Choose **production mode** and a location close to the customer (it can't be changed later).
   - Production mode blocks all access from browsers, which is what we want. The website talks to Firestore only from the server, using the key from the next step.
3. Open **Project settings (⚙) → Service accounts → Generate new private key**. A `.json` file downloads. **Keep it secret.**
4. In the website's **Vercel project → Settings → Environment Variables**, add:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** the **entire contents** of the downloaded `.json` file (open it in a text editor, copy everything and paste)
   - **Environments:** Production **and** Preview
5. Redeploy. The admin sidebar then shows **"Firestore (project …)"**.

Never commit the key file or paste it into `.env.example`, GitHub or chat. If a key leaks, delete it in Firebase (Service accounts → Manage service account permissions → Keys) and generate a new one.

Instead of the whole JSON you can use three variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`. The JSON may also be base64-encoded.

**Several sites on one deployment** (e.g. the demo with the site switcher): give each site its own key with a site-specific variable, and turn on strict isolation so a site can never fall back to another's project:

| Variable | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_MAISON_LUMIERE` | Maison's service-account JSON |
| `FIREBASE_SERVICE_ACCOUNT_APEX_FORGE` | Apex's service-account JSON |
| `ISOLATE_SITE_STORAGE` | `true` |

**What's stored where** (in the Firebase console → Firestore): `uws_sites/<site-id>/` contains:
- `modules`: admin edits, split into parts so even big catalogues fit;
- `enquiries`;
- `orders`;
- `media`: images, split into ~900 KB pieces.

**Free plan (Spark) limits:** 1 GiB stored, 50,000 reads and 20,000 writes per day. A typical business site stays well inside this. Images are cached by Vercel's CDN after the first view, so they rarely count as reads.

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
  - **The site's own Firebase project (Firestore)** when configured (see above).
  - **Local JSON files** in `.data/` during local development. Zero setup; the dev password is `admin`.
  - **Read-only** on a host without Firebase: you can browse the admin, but saving is disabled and a banner explains why.
  - Every store is bound to one site and refuses to read or write another site's data. Records also carry the site id as a second safeguard.
- **What's stored:** admin edits are saved per *module* (company, theme, pages, catalog…) as an override of the configuration files in `sites/<id>/`. The files remain the defaults. **Reset to file defaults** removes the override for that module.
- **When changes appear:** immediately on the server that saved them, and on other server instances within 10 seconds.
- **Orders and enquiries:** saved to the site's Firestore alongside its edits, so the "demo" order mode turns into real, persistent orders.
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

### Where images are stored

Images are stored in the website's own **Firestore**: no extra service and no paid plan needed. They are served from `/api/media/<site>/<file>` with year-long caching, so after the first view Vercel's CDN delivers them. In local development they're saved in `.data/media/`. Without Firebase, uploads are disabled (the admin explains why) and pasting image URLs still works. Images can also still be committed to `public/sites/<id>/`.

## Creating a website for a new company

The admin edits an existing website. A **new** company still needs its own folder and deployment:

1. Run `npm run new-site -- new-company --from maison-lumiere`, or ask Claude to do it. Push the change.
2. In Vercel, add a new project from the same repository:
   - set `SITE_ID=new-company`, `ENABLE_SITE_SWITCHER=false`, `ADMIN_PASSWORD`, `ADMIN_SECRET`;
   - create **a new Firebase project for this customer** and add its key as `FIREBASE_SERVICE_ACCOUNT` (step 1 above).
3. Open `https://<new-project>.vercel.app/admin` and customise everything from there.
