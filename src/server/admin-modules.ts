/** Modules editable in the admin dashboard (top-level keys of the site config). */
export const ADMIN_MODULES = [
  { key: "company", label: "Company profile", group: "Brand", help: "Name, logos, tagline, addresses, phones, emails, social links, map." },
  { key: "theme", label: "Brand & theme", group: "Brand", help: "Colours, fonts, buttons, cards, header/footer style, animations, light/dark mode." },
  { key: "story", label: "Company story", group: "Brand", help: "About, history, vision, mission, values, leadership, milestones, awards, stats." },
  { key: "business", label: "Business info", group: "Brand", help: "Business model, types, audiences, USPs, competitive advantages, service areas." },
  { key: "pages", label: "Pages & homepage", group: "Website", help: "The homepage (slug empty) and all other pages with their sections, SEO and visibility." },
  { key: "navigation", label: "Header & menu", group: "Website", help: "Menu items and dropdowns, announcement bar, top bar, header icons, header button." },
  { key: "footer", label: "Footer", group: "Website", help: "Footer columns, legal links, payment icons, copyright, newsletter band." },
  { key: "features", label: "Features on/off", group: "Website", help: "Enable or disable the shop, catalogue, services, blog, portfolio, careers, quotes, search, accounts…" },
  { key: "content", label: "Content library", group: "Website", help: "Testimonials, FAQs, blog posts, events, offers, gallery, projects, clients, partners, jobs." },
  { key: "services", label: "Services", group: "Catalogue", help: "Service categories and services (each gets its own page)." },
  { key: "catalog", label: "Products & categories", group: "Catalogue", help: "Product categories and products: prices, variants, stock, images, specifications." },
  { key: "commerce", label: "Shop settings", group: "Catalogue", help: "Currency, tax, shipping methods, coupons, payment methods, inventory rules." },
  { key: "integrations", label: "Integrations", group: "Settings", help: "Analytics & pixel IDs, WhatsApp, click-to-call, live chat, form delivery, popup, social sharing." },
  { key: "seo", label: "SEO", group: "Settings", help: "Default titles and descriptions, title template, social image, schema type, robots, per-route SEO." },
] as const;
export type AdminModuleKey = (typeof ADMIN_MODULES)[number]["key"];
export const isAdminModule = (k: string): k is AdminModuleKey => ADMIN_MODULES.some((m) => m.key === k);
