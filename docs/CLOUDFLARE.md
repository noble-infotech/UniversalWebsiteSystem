# Hosting on Cloudflare

Each customer website runs as its **own Cloudflare Worker**, built from this one repository, with its **own Firebase project** (Firestore) for data and its **own domain**. The Next.js app is adapted for Cloudflare by [OpenNext](https://opennext.js.org/cloudflare). Firestore is reached through its REST API, which works on Cloudflare.

The compressed Worker is about **1.7 MB**, inside the free plan's 3 MB limit. The free Workers plan allows 100,000 requests a day per account. For more traffic, Workers Paid costs $5/month per account and covers all your sites.

> Cloudflare's dashboard labels change from time to time. If a button below is named slightly differently, look for the closest match.

---

## New customer website: checklist

### 1. Create and customise the site (code)
```bash
npm run new-site -- customer-name --from maison-lumiere
```
This:
- creates `sites/customer-name/` and registers it in `sites/index.ts`;
- adds a Worker entry `customer-name` to `wrangler.jsonc`, which sets `SITE_ID` for you.

Edit the content and brand (see [CUSTOMIZATION.md](CUSTOMIZATION.md)), then check and publish:
```bash
npm run validate:sites
```
```bash
git add -A && git commit -m "Add customer-name" && git push
```
Merge it into `main`. After launch, most changes are made in `/admin` instead.

### 2. Create the customer's Firebase project (database)
1. Go to **console.firebase.google.com → Add project**. Ideally use the customer's Google account.
2. Open **Build → Firestore Database → Create database**. Choose **production mode** and a location near the customer.
3. Open **Project settings (⚙) → Service accounts → Generate new private key**. A `.json` file downloads. **Keep it secret.**

### 3. Create the Worker on Cloudflare
1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository** → connect GitHub → choose this repository.
2. Configure the build:

| Setting | Value |
|---|---|
| **Project / Worker name** | `customer-name` (exactly the site id; must match `wrangler.jsonc`) |
| **Build command** | `npm run cf:build` |
| **Deploy command** | `npx opennextjs-cloudflare deploy --env customer-name` |
| Production branch | `main` |

3. Deploy. Then open the Worker → **Settings → Variables and Secrets** and add these as **Secret** (encrypted) values:

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | the **entire contents** of the Firebase `.json` key file |
| `ADMIN_PASSWORD` | a strong password for this site's `/admin` |
| `ADMIN_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |

If pasting the multi-line JSON causes problems, paste a base64 version instead (`base64 -w0 key.json` on Linux, `base64 -i key.json` on macOS). Both formats are accepted.

4. Redeploy (Deployments → retry, or push a commit). Open `https://customer-name.<your-subdomain>.workers.dev`. The site should load, and `/admin` → sidebar should show **"Firestore (project …)"**.

`SITE_ID` and `ENABLE_SITE_SWITCHER=false` come from `wrangler.jsonc` automatically. Never put secrets in that file.

### 4. Connect the customer's domain
1. Cloudflare dashboard → **Add a domain** → enter `customer.com` → choose the **Free** plan.
2. Cloudflare imports the existing DNS records. **Check the email (MX) records** are there if the customer uses email on this domain.
3. Cloudflare shows two **nameservers**. At the domain registrar (GoDaddy, Namecheap, Hostinger…), replace the domain's nameservers with these. It can take from minutes to a few hours.
4. Once the domain shows **Active**, open the Worker → **Settings → Domains & Routes → Add → Custom domain** and add `customer.com`, then `www.customer.com`. HTTPS certificates are issued automatically.

### 5. Hand over
- `/admin` → **Company profile → Website URL**: set `https://customer.com` (used for SEO links and the sitemap).
- Give the customer `https://customer.com/admin` and their password.

---

## Deploying from your computer instead (optional)
```bash
npx wrangler login
```
```bash
npm run cf:build && npm run cf:deploy -- --env customer-name
```
```bash
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT --env customer-name
```
Repeat the last command for `ADMIN_PASSWORD` and `ADMIN_SECRET`.

## The 3-company demo
The top-level Worker in `wrangler.jsonc` (`uws-demo`) is the demo with the **Switch demo** button. Deploy it with `npx opennextjs-cloudflare deploy` (no `--env`). For it to save data, give each company its own key: `FIREBASE_SERVICE_ACCOUNT_APEX_FORGE`, `FIREBASE_SERVICE_ACCOUNT_MAISON_LUMIERE`, `FIREBASE_SERVICE_ACCOUNT_NORTHSTAR_ADVISORY`, plus `ISOLATE_SITE_STORAGE=true`.

## Testing the Cloudflare build locally
```bash
npm run emulator
```
Then, in a second terminal:
```bash
npm run cf:build
```
```bash
npx wrangler dev
```
`wrangler dev` runs the real Cloudflare runtime (workerd) on your machine. For local secrets, create a git-ignored `.dev.vars` file with lines such as `ADMIN_PASSWORD=...`. To use the Firestore emulator, also add `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` and `FIREBASE_PROJECT_ID=demo-uws`. In that case also remove `global_fetch_strictly_public` from `compatibility_flags` while testing, because that production safety flag blocks requests to local addresses.

## Notes
- **Images:** Vercel-style automatic image resizing isn't used on Cloudflare (`cf:build` turns it off). Uploaded photos are already resized in the admin before upload, and are cached by Cloudflare's CDN.
- **Rate limiting** of forms and logins is per Worker instance. For stronger protection, add a Cloudflare **WAF rate-limiting rule** for `/api/forms/*` and `/api/admin/login`.
- **Vercel still works.** The same code deploys there unchanged (see [ADMIN.md](ADMIN.md)).
