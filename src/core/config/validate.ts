/**
 * Deep validation beyond the schema: cross-references between products,
 * categories, services, pages and navigation. Used by `npm run validate:sites`
 * and the test-suite so broken configs are caught before deployment.
 */
import { SiteConfigSchema, type NavItem, type SiteConfig } from "./schema";
import { isEnabled } from "./features";

export type Issue = { level: "error" | "warning"; path: string; message: string };

const SYSTEM_ROUTES = ["/", "/shop", "/services", "/blog", "/portfolio", "/cart", "/checkout", "/wishlist", "/account", "/track-order", "/search", "/request-quote", "/contact"];

export function validateSite(raw: unknown): { config?: SiteConfig; issues: Issue[] } {
  const parsed = SiteConfigSchema.safeParse(raw);
  if (!parsed.success) return { issues: parsed.error.issues.map((i) => ({ level: "error", path: i.path.join("."), message: i.message })) };
  const s = parsed.data;
  const issues: Issue[] = [];
  const err = (path: string, message: string) => issues.push({ level: "error", path, message });
  const warn = (path: string, message: string) => issues.push({ level: "warning", path, message });

  const dupes = (list: string[], path: string) => {
    const seen = new Set<string>();
    for (const x of list) {
      if (seen.has(x)) err(path, `Duplicate slug "${x}"`);
      seen.add(x);
    }
  };
  dupes(s.pages.map((p) => p.slug), "pages");
  dupes(s.catalog.products.map((p) => p.slug), "catalog.products");
  dupes(s.catalog.products.map((p) => p.sku), "catalog.products(sku)");
  dupes(s.catalog.categories.map((c) => c.slug), "catalog.categories");
  dupes(s.services.items.map((x) => x.slug), "services.items");
  dupes(s.content.posts.map((x) => x.slug), "content.posts");

  // Names, titles and URL slugs must be filled in and URL-safe (prevents blank menu items / chips and broken links).
  const SLUG = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/;
  const need = (path: string, what: string, v: string | undefined) => {
    if (!v || !v.trim()) err(path, `${what} is required`);
  };
  const slugOk = (path: string, v: string) => {
    if (!v.trim()) err(path, "URL slug is required");
    else if (!SLUG.test(v)) err(path, `URL slug "${v}" may only contain lowercase letters, numbers and dashes (e.g. "linen-throw")`);
  };
  s.catalog.categories.forEach((c, i) => { slugOk(`catalog.categories[${i}].slug`, c.slug); need(`catalog.categories[${i}].name`, "Category name", c.name); });
  s.catalog.products.forEach((p, i) => { slugOk(`catalog.products[${i}].slug`, p.slug); need(`catalog.products[${i}].name`, "Product name", p.name); need(`catalog.products[${i}].sku`, "SKU", p.sku); });
  s.services.categories.forEach((c, i) => { slugOk(`services.categories[${i}].slug`, c.slug); need(`services.categories[${i}].name`, "Service category name", c.name); });
  s.services.items.forEach((x, i) => { slugOk(`services.items[${i}].slug`, x.slug); need(`services.items[${i}].name`, "Service name", x.name); });
  s.content.posts.forEach((x, i) => { slugOk(`content.posts[${i}].slug`, x.slug); need(`content.posts[${i}].title`, "Post title", x.title); });
  s.content.projects.forEach((x, i) => { slugOk(`content.projects[${i}].slug`, x.slug); need(`content.projects[${i}].title`, "Project title", x.title); });
  s.pages.forEach((p, i) => {
    if (p.slug !== "") slugOk(`pages[${i}].slug`, p.slug);
    need(`pages[${i}].title`, "Page title", p.title);
    p.sections.forEach((x, k) => need(`pages[${i}].sections[${k}].id`, "Section ID", x.id));
  });
  const labels = (items: NavItem[], path: string): void => items.forEach((i, k) => { need(`${path}[${k}].label`, "Menu label", i.label); if (i.children) labels(i.children, `${path}[${k}].children`); });
  labels(s.navigation.menu, "navigation.menu");

  if (!s.pages.some((p) => p.slug === "")) err("pages", 'No homepage (page with slug "") defined');
  for (const p of s.pages) {
    dupes(p.sections.map((x) => x.id), `pages[${p.slug || "home"}].sections(id)`);
  }

  const catSlugs = new Set(s.catalog.categories.map((c) => c.slug));
  const prodSlugs = new Set(s.catalog.products.map((p) => p.slug));
  for (const c of s.catalog.categories) if (c.parent && !catSlugs.has(c.parent)) err(`catalog.categories.${c.slug}`, `Unknown parent "${c.parent}"`);
  for (const p of s.catalog.products) {
    if (!catSlugs.has(p.category)) err(`catalog.products.${p.slug}`, `Unknown category "${p.category}"`);
    if (p.subcategory && !catSlugs.has(p.subcategory)) err(`catalog.products.${p.slug}`, `Unknown subcategory "${p.subcategory}"`);
    for (const r of p.related) if (!prodSlugs.has(r)) warn(`catalog.products.${p.slug}.related`, `Unknown related product "${r}"`);
    if (p.salePrice != null && p.salePrice >= p.price) warn(`catalog.products.${p.slug}`, "salePrice should be lower than price");
    if (p.purchaseMode !== "quote" && p.price <= 0) err(`catalog.products.${p.slug}`, "Purchasable products need a price > 0");
    for (const img of p.images) if (!img.alt) warn(`catalog.products.${p.slug}.images`, "Image is missing alt text");
  }
  const svcCats = new Set(s.services.categories.map((c) => c.slug));
  for (const sv of s.services.items) if (!svcCats.has(sv.category)) err(`services.items.${sv.slug}`, `Unknown service category "${sv.category}"`);

  if (isEnabled(s, "shop") && s.commerce.shipping.methods.length === 0 && s.catalog.products.some((p) => p.type === "physical")) err("commerce.shipping", "Shop is enabled with physical products but no shipping methods");
  if (isEnabled(s, "shop") && s.commerce.payment.methods.length === 0) err("commerce.payment", "Shop is enabled but no payment methods configured");

  // Internal links in navigation & footer must resolve.
  const known = new Set([...s.pages.map((p) => `/${p.slug}`.replace(/\/$/, "") || "/"), ...SYSTEM_ROUTES]);
  const resolves = (href: string) => {
    if (!href.startsWith("/")) return true;
    const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
    if (known.has(path)) return true;
    const m = path.match(/^\/(shop\/category|products|services|blog|portfolio)\/(.+)$/);
    if (!m) return path.startsWith("/account") || path.startsWith("/checkout");
    const [, kind, slug] = m;
    if (kind === "shop/category") return catSlugs.has(slug);
    if (kind === "products") return prodSlugs.has(slug);
    if (kind === "services") return svcCats.has(slug) || s.services.items.some((x) => x.slug === slug);
    if (kind === "blog") return s.content.posts.some((x) => x.slug === slug);
    if (kind === "portfolio") return s.content.projects.some((x) => x.slug === slug);
    return false;
  };
  const walk = (items: NavItem[], path: string) =>
    items.forEach((i, k) => {
      if (i.href && !resolves(i.href)) err(`${path}[${k}]`, `Link "${i.href}" does not resolve to a page`);
      if (i.children) walk(i.children, `${path}[${k}].children`);
    });
  walk(s.navigation.menu, "navigation.menu");
  s.footer.columns.forEach((c, k) => c.links?.forEach((l) => !resolves(l.href) && err(`footer.columns[${k}]`, `Link "${l.href}" does not resolve`)));
  s.footer.legalLinks.forEach((l) => !resolves(l.href) && err("footer.legalLinks", `Link "${l.href}" does not resolve`));

  return { config: s, issues };
}
