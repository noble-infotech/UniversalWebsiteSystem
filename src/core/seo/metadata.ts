import type { Metadata } from "next";
import type { SeoMeta, SiteConfig } from "../config/schema";

export function siteUrl(site: SiteConfig) {
  return (process.env.SITE_URL || site.company.websiteUrl).replace(/\/$/, "");
}

export function absoluteUrl(site: SiteConfig, path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl(site)}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build Next.js Metadata for any page from site defaults + page overrides. */
export function buildMetadata(site: SiteConfig, opts: { title?: string; description?: string; path?: string; seo?: SeoMeta; image?: string; type?: "website" | "article" } = {}): Metadata {
  const seo = opts.seo ?? {};
  const rawTitle = seo.title ?? opts.title;
  const template = site.seo.titleTemplate.replace("{brand}", site.company.brandName);
  const title = rawTitle ? template.replace("%s", rawTitle) : site.seo.defaultTitle;
  const description = seo.description ?? opts.description ?? site.seo.description;
  const image = seo.ogImage ?? opts.image ?? site.seo.ogImage;
  const url = absoluteUrl(site, opts.path ?? "/");
  const index = site.seo.robots.index && !seo.noIndex;
  return {
    metadataBase: new URL(siteUrl(site)),
    title: { absolute: title },
    description,
    keywords: seo.keywords ?? site.seo.keywords,
    alternates: { canonical: seo.canonical ?? url },
    robots: { index, follow: index },
    openGraph: {
      title,
      description,
      url,
      siteName: site.company.brandName,
      locale: site.seo.locale,
      type: opts.type ?? "website",
      images: image ? [{ url: absoluteUrl(site, image) }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      site: site.seo.twitterHandle,
      images: image ? [absoluteUrl(site, image)] : undefined,
    },
    verification: site.seo.verification ? { google: site.seo.verification.google, other: site.seo.verification.bing ? { "msvalidate.01": site.seo.verification.bing } : undefined } : undefined,
    icons: site.company.logo.favicon ? { icon: site.company.logo.favicon } : undefined,
  };
}

/** SEO overrides for built-in routes, e.g. routeSeo(site, "shop"). */
export function routeSeo(site: SiteConfig, key: string): SeoMeta | undefined {
  return site.seo.routes[key];
}
