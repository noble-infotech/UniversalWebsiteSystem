import type { MetadataRoute } from "next";
import { getSite } from "@/core/config/loader";
import { absoluteUrl } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const u = (p: string) => absoluteUrl(site, p);
  const now = new Date();
  const out: MetadataRoute.Sitemap = [];
  for (const p of site.pages) if (p.enabled && p.visibility === "public" && !p.seo?.noIndex) out.push({ url: u(`/${p.slug}`), lastModified: now, priority: p.slug === "" ? 1 : 0.7 });
  if (isEnabled(site, "services")) {
    out.push({ url: u("/services"), priority: 0.8 });
    site.services.items.forEach((s) => out.push({ url: u(`/services/${s.slug}`), priority: 0.7 }));
  }
  if (isEnabled(site, "catalog")) {
    out.push({ url: u("/shop"), priority: 0.8 });
    site.catalog.categories.forEach((c) => out.push({ url: u(`/shop/category/${c.slug}`), priority: 0.6 }));
    site.catalog.products.forEach((p) => out.push({ url: u(`/products/${p.slug}`), priority: 0.7 }));
  }
  if (isEnabled(site, "blog")) {
    out.push({ url: u("/blog"), priority: 0.6 });
    site.content.posts.forEach((p) => out.push({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.date), priority: 0.5 }));
  }
  if (isEnabled(site, "portfolio")) site.content.projects.forEach((p) => out.push({ url: u(`/portfolio/${p.slug}`), priority: 0.5 }));
  const seen = new Set<string>();
  return out.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}
