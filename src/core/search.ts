import type { SiteConfig } from "./config/schema";
import { isEnabled } from "./config/features";
import { searchScore } from "./commerce/catalog";

export type SearchResult = { type: "product" | "service" | "post" | "page"; title: string; href: string; excerpt?: string; image?: string };

/** Site-wide search across products, services, posts and pages. */
export function siteSearch(site: SiteConfig, q: string, limit = 50): SearchResult[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const textScore = (...fields: (string | undefined)[]) => terms.reduce((s, t) => s + fields.reduce((a, f, i) => a + (f?.toLowerCase().includes(t) ? (i === 0 ? 5 : 1) : 0), 0), 0);
  const out: (SearchResult & { score: number })[] = [];
  if (isEnabled(site, "shop") || site.catalog.products.length)
    for (const p of site.catalog.products) {
      const score = searchScore(p, q);
      if (score > 0) out.push({ type: "product", title: p.name, href: `/products/${p.slug}`, excerpt: p.shortDescription, image: p.images[0]?.src, score: score + 1 });
    }
  if (isEnabled(site, "services"))
    for (const s of site.services.items) {
      const score = textScore(s.name, s.category, s.shortDescription, s.description);
      if (score > 0) out.push({ type: "service", title: s.name, href: `/services/${s.slug}`, excerpt: s.shortDescription, image: s.image, score });
    }
  if (isEnabled(site, "blog"))
    for (const p of site.content.posts) {
      const score = textScore(p.title, p.excerpt, p.tags.join(" "), p.body);
      if (score > 0) out.push({ type: "post", title: p.title, href: `/blog/${p.slug}`, excerpt: p.excerpt, image: p.cover, score });
    }
  for (const p of site.pages) {
    if (!p.enabled || p.visibility === "hidden") continue;
    const score = textScore(p.title, p.seo?.description, p.header.subtitle);
    if (score > 0) out.push({ type: "page", title: p.title, href: `/${p.slug}`, excerpt: p.seo?.description ?? p.header.subtitle, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit).map(({ score: _s, ...r }) => r);
}
