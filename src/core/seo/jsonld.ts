/** Schema.org structured data builders. */
import type { Post, Product, Service, SiteConfig, FaqItem } from "../config/schema";
import { absoluteUrl } from "./metadata";
import { averageRating, effectivePrice, stockState } from "../commerce/pricing";

export function organizationLd(site: SiteConfig) {
  const c = site.company;
  return {
    "@context": "https://schema.org",
    "@type": site.seo.schemaType,
    name: c.name,
    legalName: c.legalName,
    url: absoluteUrl(site, "/"),
    logo: c.logo.primary ? absoluteUrl(site, c.logo.primary) : undefined,
    description: c.description,
    foundingDate: c.established ? String(c.established) : undefined,
    telephone: c.phones[0]?.number,
    email: c.emails[0]?.address,
    address: {
      "@type": "PostalAddress",
      streetAddress: [c.headOffice.line1, c.headOffice.line2].filter(Boolean).join(", "),
      addressLocality: c.headOffice.city,
      addressRegion: c.headOffice.region,
      postalCode: c.headOffice.postalCode,
      addressCountry: c.headOffice.country,
    },
    sameAs: Object.values(c.social).filter(Boolean),
  };
}

export function productLd(site: SiteConfig, p: Product) {
  const rating = averageRating(p);
  const avail = stockState(p);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.shortDescription,
    image: p.images.map((i) => absoluteUrl(site, i.src)),
    brand: { "@type": "Brand", name: site.company.brandName },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(site, `/products/${p.slug}`),
      priceCurrency: site.commerce.currency,
      price: effectivePrice(p),
      availability: `https://schema.org/${avail === "out_of_stock" ? "OutOfStock" : avail === "preorder" ? "PreOrder" : "InStock"}`,
    },
    aggregateRating: p.reviews.length ? { "@type": "AggregateRating", ratingValue: rating, reviewCount: p.reviews.length } : undefined,
  };
}

export function serviceLd(site: SiteConfig, s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.category,
    description: s.shortDescription,
    provider: { "@type": site.seo.schemaType, name: site.company.name },
    areaServed: site.business.serviceAreas,
    url: absoluteUrl(site, `/services/${s.slug}`),
  };
}

export function articleLd(site: SiteConfig, p: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    image: p.cover ? absoluteUrl(site, p.cover) : undefined,
    datePublished: p.date,
    author: p.author ? { "@type": "Person", name: p.author } : undefined,
    publisher: { "@type": "Organization", name: site.company.name },
    mainEntityOfPage: absoluteUrl(site, `/blog/${p.slug}`),
  };
}

export function faqLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function breadcrumbLd(site: SiteConfig, crumbs: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(site, c.href) })),
  };
}
