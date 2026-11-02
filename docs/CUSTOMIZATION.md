# Customising the system for a new company

> **Rule:** you never edit `src/` to onboard a client. Everything below happens in `sites/<id>/`, `public/sites/<id>/` and environment variables.

## 1. Scaffold

```bash
npm run new-site -- acme-foods --from maison-lumiere
```

Pick the closest sample:
- `apex-forge` for B2B, manufacturing, quote-driven catalogues
- `maison-lumiere` for retail and online stores
- `northstar-advisory` for agencies, consultancies, clinics and other service firms

The script copies the folder and brand assets, sets the id, and registers the site in `sites/index.ts`.

Then run:

```bash
SITE_ID=acme-foods npm run dev
```

## 2. Company profile: `company.ts`

- `company`: name, brand name, legal name, logos (`primary` for light backgrounds, `secondary` for dark ones, `favicon`; leave them empty to use a text wordmark), tagline, description, established year, industry, registration numbers, head office, branches, phones, emails, website URL, social links, Google Maps `embedUrl`.
- `story`: about text, history, vision, mission, values, leadership, founder, milestones, achievements, certifications, awards, stats.
- `business`: model (B2B/B2C…), types (manufacturer, retailer, wholesaler, distributor, service provider…), categories, target audience, USPs, competitive advantages, service areas.

## 3. Brand identity: `theme.ts`

| Key | Effect |
|---|---|
| `mode` | `light` or `dark` |
| `colors.*` | primary/secondary/accent (+ foregrounds), background, surface, muted, text, textMuted, border, success, danger |
| `fonts` | any Google Fonts family for `heading` and `body`, plus `headingWeight`, `headingCase` (`none`/`uppercase`), `headingTracking` |
| `radius` | base corner radius (`0.25rem` gives sharp corners, `1rem` soft ones) |
| `button` | `shape` square/rounded/pill · `style` solid/gradient/outline · `uppercase` |
| `card.style` | `elevated` · `bordered` · `flat` · `glass` |
| `header` | `style` classic/centered/minimal/split · `sticky` · `transparentOnHero` · `logoPosition` |
| `footer` | `layout` columns/centered/minimal/mega · `variant` dark/light/brand |
| `animation` | `enabled` · `style` fade/slide-up/zoom · `durationMs` (always respects reduced-motion) |
| `images` | `style` square/rounded/soft · `treatment` natural/grayscale/duotone |
| `container`, `sectionSpacing` | page width and vertical rhythm |

## 4. Homepage: `home.ts`

The homepage is an ordered array of sections. To customise it:
- **Reorder** by moving entries.
- **Disable** a section with `enabled: false`.
- **Hide per device** with `visibility: { mobile: false }`.
- **Change copy** with `eyebrow`, `title`, `subtitle` and `description`.
- **Change images and video** with `media`.
- **Change the background** with `background: { variant: "muted" | "primary" | "secondary" | "dark" | "image" | "gradient", image, overlay }`.
- **Change layout** with `layout` (each section's options are in [SECTIONS.md](SECTIONS.md)).
- **Change CTAs** with `cta` and `secondaryCta`.
- **Change item counts** with `limit` and `columns`.
- **Pick a data source** with `source`.
- **Supply inline items** with `items` to override the content collection for that section.

```ts
section({ id: "featured", type: "productsServices", source: "bestSeller", layout: "carousel", title: "Best sellers", limit: 6 })
```

## 5. Navigation: `navigation.ts`

- `menu`: unlimited nested `children`. Set `mega: true` for a wide panel, `description` for sub-labels, and `requires: "shop"` to hide an item when a feature is off.
- `announcement`: bar text, link, dismissible.
- `topBar`: phone, email, hours and social icons above the header.
- `icons`: search, account, wishlist, cart. These are also auto-hidden when the related feature is off.
- `cta`: header button.

## 6. Footer: `footer.ts`

Column `type`s:
- `links`
- `productCategories`, `services` (auto-generated from data)
- `contact`, `newsletter`, `social`, `text`, `about`

Also configurable: `paymentIcons`, `legalLinks`, `copyright` (supports `{year}` and `{company}`) and a newsletter band. The layout and colour come from `theme.footer`.

## 7. Features: `index.ts`

```ts
features: { shop, catalog, services, blog, portfolio, gallery, careers, quote, search, newsletter, accounts, wishlist }
```

- **No shopping at all:** `shop: false, catalog: false` and `commerce.enabled: false`. Cart, checkout, wishlist and account routes return 404, and their icons and links disappear.
- **Catalogue without cart (B2B):** `shop: false, catalog: true`, with products set to `purchaseMode: "quote"`.
- **Full store:** `shop: true` plus a configured `commerce.ts`.

## 8. Commerce: `commerce.ts`

- Currency and locale (all money is formatted with `Intl`).
- Tax: `rate`, `label`, `inclusive`.
- Shipping methods: flat `rate`, `perKg`, `freeOver`, `countries`, `digitalOnly`.
- Coupons: percent, fixed or free shipping, with `minSubtotal`, `expires` and `categories`.
- Payment: `provider` and `methods`.
- Inventory: `trackStock`, `lowStockThreshold`, `allowBackorders`.
- Guest checkout, accounts, wishlist, reviews, order number prefix, products per page.

## 9. Integrations: `integrations.ts`

These are all optional:
- Google Analytics 4 / GTM / Meta Pixel IDs. Conversion events fire automatically: `add_to_cart`, `begin_checkout`, `purchase`, `generate_lead`, `sign_up`, `search`, `view_item`.
- WhatsApp floating button and click-to-call.
- Live chat: Tawk, Crisp, Intercom or a custom script.
- Form delivery: `console` or `webhook`.
- Popup announcement with delay and frequency capping, optional newsletter capture.
- Social share networks.

## 10. SEO: `seo.ts`

Settings include the default title, `titleTemplate` (`%s | {brand}`), description, keywords, OG image, Twitter handle, locale, schema.org type (Organization, Manufacturer, Store, ProfessionalService…), robots rules and search-console verification. `routes` overrides SEO for built-in pages (`shop`, `services`, `blog`, `portfolio`, `cart`…). Every page, product, service, category and post also accepts its own `seo` block.

## 11. Launch checklist

1. Run `npm run validate:sites` with zero errors.
2. Run `npm test`.
3. Set environment variables: `SITE_ID`, `SITE_URL`, `ENABLE_SITE_SWITCHER=false`.
4. Replace Unsplash demo images with licensed assets in `public/sites/<id>/`.
5. Have legal pages reviewed. The generated text is generic.
6. Connect the production integrations from [INTEGRATIONS.md](INTEGRATIONS.md) if selling online.
