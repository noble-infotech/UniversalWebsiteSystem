/**
 * Short explanations shown under admin fields. Keys are dot paths without list
 * indexes (e.g. "catalog.products.slug"). Tokens like {brand} are explained in TOKEN_HELP.
 */
export const TOKEN_HELP = "Tip: write {brand}, {name}, {company}, {phone}, {email}, {year} or {years} in any text and it’s replaced automatically – so renaming the company updates every page.";

export const FIELD_HELP: Record<string, string> = {
  // Company
  "company.name": "Full trading name. Used in Google’s structured data and the footer copyright (when Legal name is empty). Placeholder: {name}",
  "company.brandName": "Short brand name shown in browser-tab titles, the text logo and around the site. Placeholder: {brand}",
  "company.legalName": "Registered legal name, shown in the footer copyright and legal pages. Placeholder: {company}",
  "company.tagline": "One-line slogan. Used as the hero title when the homepage hero has no title.",
  "company.description": "Two or three sentences about the company. Used for SEO and as the hero subtitle fallback.",
  "company.logo": "Logo images. While an image is set, the header/footer show the image (any name inside it won’t change). Remove both images to show the Brand name as a text logo.",
  "company.logo.primary": "Logo image for light backgrounds (URL or /sites/<id>/logo.svg). Remove it to use a text logo.",
  "company.logo.secondary": "Logo image for dark backgrounds (footer, transparent header).",
  "company.logo.favicon": "Small square icon shown in the browser tab.",
  "company.logo.text": "Custom wording for the text logo (defaults to Brand name). Used only when no logo image is set.",
  "company.logo.height": "Logo height in pixels.",
  "company.websiteUrl": "Your live domain, e.g. https://www.example.com – used for SEO links and the sitemap.",
  "company.established": "Year founded. Enables the “years of excellence” badge and the {years} placeholder.",
  "company.map": "Google Maps → Share → Embed a map → copy the src=\"…\" URL into Embed URL.",
  "company.social": "Full profile URLs. Leave empty to hide an icon.",
  // Theme
  "theme.mode": "light or dark website.",
  "theme.colors": "Brand colours. Foreground colours are the text colours used on top of each colour – keep them readable.",
  "theme.fonts.heading": "Any Google Fonts family name, e.g. Playfair Display, Poppins, Archivo.",
  "theme.fonts.body": "Any Google Fonts family name for body text, e.g. Inter, DM Sans.",
  "theme.radius": "Corner roundness, e.g. 0rem (square) … 1rem (soft).",
  "theme.header.transparentOnHero": "Homepage header floats over the hero image until you scroll.",
  // Pages
  "pages.slug": "URL of the page: “about” → /about. Leave empty only for the homepage. Lowercase letters, numbers and dashes.",
  "pages.visibility": "hidden = reachable by its URL but left out of the sitemap and search (good for campaign pages).",
  "pages.sections": "The blocks on the page, top to bottom. Use the arrows to reorder and the switch to turn one off.",
  "pages.sections.type": "Which kind of block this is (hero, about, products, testimonials…). See docs/SECTIONS.md.",
  "pages.sections.layout": "Visual variant – each section type supports different layouts (see docs/SECTIONS.md).",
  "pages.sections.source": "Where items come from, e.g. featured, newArrival, bestSeller, services, category:<slug>.",
  "pages.sections.limit": "Maximum number of items to show.",
  "pages.sections.items": "Optional: your own items for this block instead of the shared content library.",
  // Catalogue
  "catalog.categories.slug": "URL part: “candles” → /shop/category/candles. Lowercase letters, numbers and dashes.",
  "catalog.categories.parent": "Slug of a parent category to make this a subcategory.",
  "catalog.products.slug": "URL part: “linen-throw” → /products/linen-throw. Must be unique.",
  "catalog.products.category": "Slug of an existing product category.",
  "catalog.products.price": "Regular price. Add Sale Price for a discount.",
  "catalog.products.purchaseMode": "cart = buy online · quote = “Request a quotation” only · both.",
  "catalog.products.images": "First image is the main/thumbnail image. Always add Alt text describing the image.",
  "catalog.products.options": "Variants such as Size or Color; price delta adds to (or subtracts from) the price.",
  "catalog.products.stock": "Units in stock. Leave out if you don’t track stock.",
  // Services
  "services.items.slug": "URL part: “seo-audit” → /services/seo-audit.",
  "services.items.category": "Slug of an existing service category.",
  // SEO
  "seo.defaultTitle": "Title of the homepage in Google and browser tabs. Use {brand} instead of typing the name.",
  "seo.titleTemplate": "Pattern for other pages: %s = page title, {brand} = brand name.",
  "seo.description": "About 150 characters shown under your link in Google results.",
  // Features / commerce
  "features": "Turn whole parts of the website on or off. Turning the shop off hides cart, checkout and account pages.",
  "commerce.tax.rate": "As a decimal: 0.18 = 18 %.",
  "commerce.tax.inclusive": "On = your prices already include tax.",
  "commerce.coupons": "Coupon codes stay secret on the server; customers type them at checkout.",
  "footer.copyright": "Use {year} and {company} – filled in automatically.",
};

export function fieldHelp(path: string) {
  return FIELD_HELP[path];
}
