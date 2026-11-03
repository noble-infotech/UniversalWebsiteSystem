import type { MetadataRoute } from "next";
import { getSite } from "@/core/config/loader";
import { siteUrl } from "@/core/seo/metadata";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  const base = siteUrl(site);
  if (!site.seo.robots.index) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/cart", "/checkout", "/account", "/wishlist", ...site.seo.robots.disallow] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
