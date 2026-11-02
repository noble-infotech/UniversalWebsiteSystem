/**
 * Showcase sections: products & services, categories, service list, pricing,
 * gallery, projects, client logos, partners & certifications, testimonials, reviews.
 */
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, ArrowUpRight, Check, Quote } from "lucide-react";
import type { LogoItem, Service, Testimonial } from "@/core/config/schema";
import { selectProducts } from "@/core/commerce/catalog";
import { formatMoney, formatDate } from "@/core/commerce/format";
import { isEnabled } from "@/core/config/features";
import { ButtonLink, Rating } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { ProductCard } from "@/components/commerce/ProductCard";
import { GalleryGrid } from "./GalleryGrid";
import { TestimonialCarousel } from "./TestimonialCarousel";
import { Section, SectionHeader, SectionFooterCta, gridCols, itemsFor, cardClass } from "./Section";
import type { SectionProps } from "./types";

export function ServiceCard({ service: s, site, variant = "card" }: { service: Service; site: SectionProps["site"]; variant?: "card" | "image" }) {
  if (variant === "image")
    return (
      <Link href={`/services/${s.slug}`} className="group relative block aspect-[4/5] overflow-hidden img-brand">
        <SmartImage src={s.image} alt={s.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="text-xs uppercase tracking-wider text-white/70">{s.category}</p>
          <h3 className="mt-2 text-2xl">{s.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/80">{s.shortDescription}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Explore <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
        </div>
      </Link>
    );
  return (
    <Link href={`/services/${s.slug}`} className={clsx(cardClass(site.theme.card.style), "group flex h-full flex-col p-7")}>
      <span className="grid size-14 place-items-center rounded-brand bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon name={s.icon} className="size-7" /></span>
      <h3 className="mt-6 text-xl">{s.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.shortDescription}</p>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">Learn more <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
    </Link>
  );
}

/**
 * Products and/or services. source: "services" | "featured" | "newArrival" | "bestSeller" | "onSale" | "category:<slug>"
 * layouts: grid | image (services) | carousel
 */
export function ProductsServicesSection({ section, site }: SectionProps) {
  const source = section.source ?? (site.catalog.products.length ? "featured" : "services");
  if (source === "services") {
    const list = site.services.items.filter((s) => s.featured);
    const items = (section.limit ? (list.length ? list : site.services.items).slice(0, section.limit) : list.length ? list : site.services.items);
    return (
      <Section section={section}>
        <SectionHeader section={section} fallbackTitle="Our services" align={section.align ?? "left"} />
        <div className={gridCols(section.columns ?? 3)}>
          {items.map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}><ServiceCard service={s} site={site} variant={section.layout === "image" ? "image" : "card"} /></Reveal>
          ))}
        </div>
        <SectionFooterCta section={section} />
      </Section>
    );
  }
  const products = selectProducts(site.catalog.products, source, section.limit ?? 8);
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Featured products" align={section.align ?? "left"} />
      {section.layout === "carousel" ? (
        <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 scrollbar-none md:-mx-8 md:px-8">
          {products.map((p) => (
            <div key={p.slug} className="w-[75%] shrink-0 snap-start sm:w-[45%] lg:w-[23.5%]"><ProductCard product={p} site={site} /></div>
          ))}
        </div>
      ) : (
        <div className={clsx("grid grid-cols-2 gap-4 md:gap-6", (section.columns ?? 4) === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 50}><ProductCard product={p} site={site} /></Reveal>
          ))}
        </div>
      )}
      <SectionFooterCta section={section} />
    </Section>
  );
}

/** layouts: tiles | grid | list. source: "products" (default) | "services" */
export function ProductCategoriesSection({ section, site }: SectionProps) {
  const services = section.source === "services";
  const all = (services ? site.services.categories : site.catalog.categories).filter((c) => !c.parent);
  const cats = section.limit ? all.slice(0, section.limit) : all;
  const base = services ? "/services?category=" : "/shop/category/";
  const count = (slug: string) => (services ? site.services.items.filter((s) => s.category === slug).length : site.catalog.products.filter((p) => p.category === slug || p.subcategory === slug).length);
  if (section.layout === "list") {
    return (
      <Section section={section}>
        <SectionHeader section={section} fallbackTitle="Shop by category" />
        <ul className="divide-y divide-border border-y border-border">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link href={`${base}${c.slug}`} className="group flex items-center justify-between gap-6 py-6">
                <span className="font-heading text-2xl transition group-hover:translate-x-2 md:text-4xl">{c.name}</span>
                <span className="flex items-center gap-4 text-sm text-muted-foreground">{count(c.slug)} items <ArrowUpRight className="size-5" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    );
  }
  const tiles = section.layout !== "grid";
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Shop by category" align={section.align ?? "left"} />
      <div className={clsx("grid gap-4 md:gap-6", tiles ? "grid-cols-2 lg:grid-cols-4" : gridCols(section.columns ?? 3))}>
        {cats.map((c, i) => (
          <Reveal key={c.slug} delay={i * 50} className={clsx(tiles && i === 0 && cats.length > 4 && "col-span-2 lg:row-span-2")}>
            <Link href={`${base}${c.slug}`} className={clsx("group relative block overflow-hidden img-brand", tiles ? (i === 0 && cats.length > 4 ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[4/5]") : "aspect-[16/10]")}>
              <SmartImage src={c.image} alt={c.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                <div>
                  <h3 className="text-xl md:text-2xl">{c.name}</h3>
                  <p className="text-xs text-white/75">{count(c.slug)} {services ? "services" : "products"}</p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-black transition group-hover:rotate-45"><ArrowUpRight className="size-4" /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Every service grouped by category. layouts: grouped | grid | image */
export function ServiceListSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.services.items);
  if (section.layout === "grouped") {
    return (
      <Section section={section}>
        <SectionHeader section={section} fallbackTitle="All services" />
        <div className="space-y-16">
          {site.services.categories.map((cat) => {
            const list = items.filter((s) => s.category === cat.slug);
            if (!list.length) return null;
            return (
              <div key={cat.slug} id={`cat-${cat.slug}`} className="scroll-mt-28">
                <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl">{cat.name}</h3>
                    {cat.description && <p className="mt-2 max-w-2xl text-muted-foreground">{cat.description}</p>}
                  </div>
                </div>
                <div className={gridCols(section.columns ?? 3)}>{list.map((s) => <ServiceCard key={s.slug} service={s} site={site} />)}</div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Our services" />
      <div className={gridCols(section.columns ?? 3)}>{items.map((s) => <ServiceCard key={s.slug} service={s} site={site} variant={section.layout === "image" ? "image" : "card"} />)}</div>
    </Section>
  );
}

/** Pricing tables. items: [{name, price, priceLabel, unit, features[], highlighted, cta}] or source "service:<slug>" */
export function PricingSection({ section, site }: SectionProps) {
  const fromService = section.source?.startsWith("service:") ? site.services.items.find((s) => s.slug === section.source!.slice(8))?.pricing : undefined;
  const plans = (section.items as NonNullable<Service["pricing"]> | undefined) ?? fromService ?? [];
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Pricing" />
      <PricingGrid plans={plans} site={site} cta={section.cta} />
    </Section>
  );
}

export function PricingGrid({ plans, site, cta }: { plans: NonNullable<Service["pricing"]>; site: SectionProps["site"]; cta?: { label: string; href: string } }) {
  const money = (n: number) => formatMoney(n, site.commerce.currency, site.commerce.locale);
  return (
    <div className={clsx("grid gap-6", plans.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3")}>
      {plans.map((p, i) => (
        <Reveal key={p.name} delay={i * 80} className={clsx("relative flex flex-col rounded-brand border p-8", p.highlighted ? "border-primary bg-primary text-primary-foreground shadow-2xl md:-my-4 md:py-12" : "border-border bg-surface")}>
          {p.highlighted && <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Most popular</span>}
          <h3 className="text-xl">{p.name}</h3>
          <p className="mt-4 flex items-baseline gap-1">
            {p.priceLabel && <span className="text-sm opacity-75">{p.priceLabel}</span>}
            <span className="font-heading text-4xl">{p.price != null ? money(p.price) : "Custom"}</span>
            {p.unit && <span className="text-sm opacity-75">{p.unit}</span>}
          </p>
          <ul className="mt-8 flex-1 space-y-3 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3"><Check className={clsx("mt-0.5 size-4 shrink-0", p.highlighted ? "text-accent" : "text-primary")} />{f}</li>
            ))}
          </ul>
          <ButtonLink href={cta?.href ?? "/request-quote"} variant={p.highlighted ? "light" : "outline"} className="mt-8 w-full">{cta?.label ?? "Get started"}</ButtonLink>
        </Reveal>
      ))}
    </div>
  );
}

/** layouts: masonry | grid | carousel ; settings.filter (bool) shows category tabs */
export function GallerySection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.gallery);
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Gallery" />
      <GalleryGrid items={items} layout={section.layout ?? "masonry"} filter={section.settings?.filter !== false} />
      <SectionFooterCta section={section} />
    </Section>
  );
}

/** Projects & case studies. layouts: grid | featured | list */
export function ProjectsSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.projects);
  const featured = section.layout === "featured";
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Projects & case studies" align={section.align ?? "left"} />
      <div className={clsx("grid gap-6", featured ? "md:grid-cols-2" : gridCols(section.columns ?? 3))}>
        {items.map((p, i) => (
          <Reveal key={p.slug} delay={i * 60} className={clsx(featured && i === 0 && "md:col-span-2")}>
            <Link href={`/portfolio/${p.slug}`} className="group block">
              <div className={clsx("relative overflow-hidden img-brand", featured && i === 0 ? "aspect-[21/9]" : "aspect-[4/3]")}>
                <SmartImage src={p.image} alt={p.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes={featured && i === 0 ? "100vw" : "50vw"} />
                {p.category && <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">{p.category}</span>}
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{[p.client, p.year].filter(Boolean).join(" · ")}</p>
                  <h3 className="mt-2 text-xl md:text-2xl">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
                </div>
                <ArrowUpRight className="size-6 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <SectionFooterCta section={section} />
    </Section>
  );
}

function LogoTile({ item }: { item: LogoItem }) {
  const inner = item.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.logo} alt={item.name} className="h-9 w-auto max-w-[140px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" loading="lazy" />
  ) : (
    <span className="font-heading text-xl whitespace-nowrap opacity-60 transition hover:opacity-100">{item.name}</span>
  );
  return item.href ? <a href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a> : inner;
}

/** layouts: marquee | grid */
export function ClientsSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.clients);
  return (
    <Section section={section} className={!section.title ? "!py-12" : undefined}>
      {section.title ? <SectionHeader section={section} /> : section.eyebrow && <p className="mb-8 text-center text-sm text-muted-foreground">{section.eyebrow}</p>}
      {section.layout === "grid" ? (
        <ul className="grid grid-cols-2 items-center gap-px overflow-hidden rounded-brand border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {items.map((c) => <li key={c.name} className="grid h-28 place-items-center bg-background p-6"><LogoTile item={c} /></li>)}
        </ul>
      ) : (
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <ul className="animate-marquee flex w-max items-center gap-16">
            {[...items, ...items].map((c, i) => <li key={i} aria-hidden={i >= items.length}><LogoTile item={c} /></li>)}
          </ul>
        </div>
      )}
    </Section>
  );
}

/** Partners + certifications. */
export function PartnersSection({ section, site }: SectionProps) {
  const partners = itemsFor(section, site.content.partners);
  const certs = site.story.certifications;
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Partners & certifications" />
      {certs.length > 0 && section.settings?.showCertifications !== false && (
        <div className={clsx("grid gap-4", certs.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
          {certs.map((c, i) => (
            <Reveal key={c.name} delay={i * 50} className={clsx(cardClass(site.theme.card.style, false), "flex items-center gap-4 p-5")}>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon name="badge-check" /></span>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{[c.issuer, c.year].filter(Boolean).join(" · ")}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {partners.length > 0 && (
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {partners.map((p) => <li key={p.name}><LogoTile item={p} /></li>)}
        </ul>
      )}
    </Section>
  );
}

/** layouts: carousel | grid | spotlight */
export function TestimonialsSection({ section, site }: SectionProps) {
  const items = itemsFor<Testimonial>(section, site.content.testimonials);
  if (!items.length) return null;
  if (section.layout === "grid") {
    return (
      <Section section={section}>
        <SectionHeader section={section} fallbackTitle="What our clients say" />
        <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
          {items.map((t, i) => (
            <Reveal key={i} className={clsx(cardClass(site.theme.card.style, false), "mb-6 break-inside-avoid p-7")}>
              {t.rating && <Rating value={t.rating} />}
              <blockquote className="mt-4 leading-relaxed">“{t.quote}”</blockquote>
              <TestimonialAuthor t={t} />
            </Reveal>
          ))}
        </div>
      </Section>
    );
  }
  if (section.layout === "spotlight") {
    const t = items[0];
    return (
      <Section section={section}>
        <Reveal className="mx-auto max-w-4xl text-center">
          <Quote className="mx-auto size-12 text-primary" />
          <blockquote className="font-heading mt-8 text-2xl leading-snug md:text-4xl">“{t.quote}”</blockquote>
          <div className="mt-10 flex justify-center"><TestimonialAuthor t={t} /></div>
        </Reveal>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="What our clients say" />
      <TestimonialCarousel items={items} cardStyle={site.theme.card.style} />
    </Section>
  );
}

export function TestimonialAuthor({ t }: { t: Testimonial }) {
  return (
    <figcaption className="mt-6 flex items-center gap-3 text-left">
      {t.avatar ? (
        <span className="relative size-12 overflow-hidden rounded-full"><SmartImage src={t.avatar} alt={t.author} fill brand={false} className="object-cover" sizes="48px" /></span>
      ) : (
        <span className="grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{t.author[0]}</span>
      )}
      <span>
        <span className="block font-semibold">{t.author}</span>
        <span className="text-sm text-muted-foreground">{[t.role, t.company].filter(Boolean).join(", ")}</span>
      </span>
    </figcaption>
  );
}

/** Aggregated product reviews across the catalogue. */
export function ReviewsSection({ section, site }: SectionProps) {
  const reviews = site.catalog.products
    .flatMap((p) => p.reviews.map((r) => ({ ...r, product: p })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, section.limit ?? 6);
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Customer reviews" />
      <div className="mb-10 flex flex-col items-center gap-2">
        <p className="font-heading text-5xl">{avg.toFixed(1)}</p>
        <Rating value={avg} size="size-5" />
        <p className="text-sm text-muted-foreground">Based on {site.catalog.products.reduce((s, p) => s + p.reviews.length, 0)} verified reviews</p>
      </div>
      <div className={gridCols(3)}>
        {reviews.map((r, i) => (
          <Reveal key={i} delay={i * 50} className={clsx(cardClass(site.theme.card.style, false), "flex flex-col p-6")}>
            <div className="flex items-center justify-between"><Rating value={r.rating} /><span className="text-xs text-muted-foreground">{formatDate(r.date, site.commerce.locale)}</span></div>
            {r.title && <p className="mt-4 font-semibold">{r.title}</p>}
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.body}</p>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="font-medium">{r.author}{r.verified && <span className="ml-2 text-xs text-success">✓ Verified</span>}</span>
              {isEnabled(site, "shop") && <Link href={`/products/${r.product.slug}`} className="text-xs text-primary hover:underline">{r.product.name}</Link>}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
