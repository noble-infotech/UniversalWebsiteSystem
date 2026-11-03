/**
 * Content & conversion sections: FAQ, blog, events, offers, rich text, CTA banner,
 * careers, newsletter, contact, quote form, shop.
 */
import Link from "next/link";
import { Suspense } from "react";
import { clsx } from "clsx";
import { ArrowRight, Calendar, Clock, Mail, MapPin, Phone, Plus, Tag, Briefcase } from "lucide-react";
import type { FaqItem } from "@/core/config/schema";
import { formatDate } from "@/core/commerce/format";
import { faqLd } from "@/core/seo/jsonld";
import { isEnabled } from "@/core/config/features";
import { ButtonLink, JsonLd, RichText } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { SmartForm, NewsletterForm } from "@/components/forms/SmartForm";
import { QuoteFormWithParams } from "@/components/forms/QuoteFormWithParams";
import { ShopTabs } from "@/components/commerce/ShopTabs";
import { ProductCard } from "@/components/commerce/ProductCard";
import { selectProducts } from "@/core/commerce/catalog";
import { Section, SectionHeader, SectionFooterCta, gridCols, itemsFor, cardClass } from "./Section";
import type { SectionProps } from "./types";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((f, i) => (
        <details key={i} className="group py-1" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {f.question}
            <Plus className="size-5 shrink-0 text-primary transition group-open:rotate-45" aria-hidden />
          </summary>
          <p className="pb-6 leading-relaxed text-muted-foreground">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** layouts: centered | split. source: category name to filter */
export function FaqSection({ section, site }: SectionProps) {
  const all = section.source ? site.content.faqs.filter((f) => f.category === section.source) : site.content.faqs;
  const items = itemsFor<FaqItem>(section, all);
  if (!items.length) return null;
  return (
    <Section section={section}>
      <JsonLd data={faqLd(items)} />
      {section.layout === "split" ? (
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeader section={{ ...section, align: "left" }} fallbackTitle="Frequently asked questions" className="!mb-6" action={false} />
            {section.cta && <ButtonLink href={section.cta.href} variant="outline">{section.cta.label}</ButtonLink>}
          </div>
          <FaqList items={items} />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <SectionHeader section={section} fallbackTitle="Frequently asked questions" />
          <FaqList items={items} />
          <SectionFooterCta section={section} />
        </div>
      )}
    </Section>
  );
}

/** layouts: grid | featured | list */
export function BlogSection({ section, site }: SectionProps) {
  const posts = [...site.content.posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, section.limit ?? 3);
  if (!posts.length) return null;
  const featured = section.layout === "featured";
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Latest insights" align={section.align ?? "left"} />
      <div className={clsx("grid gap-8", featured ? "lg:grid-cols-2" : gridCols(section.columns ?? 3))}>
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 60} className={clsx(featured && i === 0 && "lg:row-span-2")}>
            <PostCard post={p} site={site} large={featured && i === 0} horizontal={featured && i > 0} />
          </Reveal>
        ))}
      </div>
      <SectionFooterCta section={section} />
    </Section>
  );
}

export function PostCard({ post: p, site, large, horizontal }: { post: SectionProps["site"]["content"]["posts"][number]; site: SectionProps["site"]; large?: boolean; horizontal?: boolean }) {
  const mins = Math.max(1, Math.round(p.body.split(/\s+/).length / 200));
  return (
    <Link href={`/blog/${p.slug}`} className={clsx("group flex", horizontal ? "flex-row gap-5" : "flex-col")}>
      <div className={clsx("relative shrink-0 overflow-hidden img-brand", horizontal ? "aspect-square w-32 sm:w-44" : large ? "aspect-[4/3]" : "aspect-[16/10]")}>
        <SmartImage src={p.cover} alt={p.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className={clsx(!horizontal && "mt-5")}>
        <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {p.category && <span className="font-semibold uppercase tracking-wider text-primary">{p.category}</span>}
          <span>{formatDate(p.date, site.commerce.locale)}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" />{mins} min read</span>
        </p>
        <h3 className={clsx("mt-2 transition group-hover:text-primary", large ? "text-2xl md:text-3xl" : "text-lg md:text-xl")}>{p.title}</h3>
        {!horizontal && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
      </div>
    </Link>
  );
}

/** Events & announcements */
export function EventsSection({ section, site }: SectionProps) {
  const items = itemsFor(section, [...site.content.events].sort((a, b) => a.date.localeCompare(b.date)));
  if (!items.length) return null;
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Events & announcements" />
      <ul className="mx-auto max-w-4xl space-y-4">
        {items.map((e, i) => {
          const d = new Date(e.date);
          return (
            <Reveal as="li" key={i} delay={i * 50} className={clsx(cardClass(site.theme.card.style, false), "flex flex-col gap-5 p-6 sm:flex-row sm:items-center")}>
              <div className="grid size-20 shrink-0 place-items-center rounded-brand bg-primary text-center text-primary-foreground">
                <div>
                  <p className="text-2xl font-bold leading-none">{d.getDate()}</p>
                  <p className="text-xs uppercase">{d.toLocaleString(site.commerce.locale, { month: "short" })}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{e.type === "announcement" ? "Announcement" : "Event"}</p>
                <h3 className="mt-1 text-xl">{e.title}</h3>
                {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
                <p className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="size-3.5" />{formatDate(e.date, site.commerce.locale)}{e.endDate && ` – ${formatDate(e.endDate, site.commerce.locale)}`}</span>
                  {e.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{e.location}</span>}
                </p>
              </div>
              {e.href && <ButtonLink href={e.href} variant="outline" size="sm">Details</ButtonLink>}
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

/** Offers & promotions. layouts: cards | banner */
export function OffersSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.offers);
  if (!items.length) return null;
  if (section.layout === "banner") {
    const o = items[0];
    return (
      <Section section={section}>
        <Reveal className="relative grid overflow-hidden rounded-brand bg-secondary text-secondary-foreground md:grid-cols-2">
          <div className="relative z-10 p-8 md:p-14">
            {o.badge && <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">{o.badge}</span>}
            <h2 id={`${section.id}-title`} className="mt-5 text-3xl md:text-5xl">{o.title}</h2>
            {o.description && <p className="mt-4 text-lg opacity-85">{o.description}</p>}
            {o.code && <p className="mt-6 inline-flex items-center gap-2 rounded-brand border border-dashed border-current/40 px-4 py-2 font-mono text-sm"><Tag className="size-4" /> Use code <strong>{o.code}</strong></p>}
            {o.cta && <div className="mt-8"><ButtonLink href={o.cta.href} variant="light">{o.cta.label} <ArrowRight className="size-4" /></ButtonLink></div>}
            {o.validUntil && <p className="mt-4 text-xs opacity-70">Valid until {formatDate(o.validUntil, site.commerce.locale)}</p>}
          </div>
          <div className="relative min-h-64"><SmartImage src={o.image} alt={o.title} fill className="object-cover !rounded-none" /></div>
        </Reveal>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Current offers" />
      <div className={gridCols(Math.min(items.length, 3))}>
        {items.map((o, i) => (
          <Reveal key={i} delay={i * 60} className="group relative overflow-hidden rounded-brand">
            <div className="relative aspect-[4/3]"><SmartImage src={o.image} alt={o.title} fill className="object-cover transition duration-700 group-hover:scale-105 !rounded-none" /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              {o.badge && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">{o.badge}</span>}
              <h3 className="mt-3 text-2xl">{o.title}</h3>
              {o.description && <p className="mt-1 text-sm text-white/80">{o.description}</p>}
              {o.code && <p className="mt-2 font-mono text-xs">Code: {o.code}</p>}
              {o.cta && <Link href={o.cta.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">{o.cta.label}<ArrowRight className="size-4" /></Link>}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Free-form content. settings.body (markdown-lite). layout: narrow | wide | two-column (with media) */
export function RichTextSection({ section }: SectionProps) {
  const body = (section.settings?.body as string | undefined) ?? section.description ?? "";
  if (section.layout === "two-column") {
    return (
      <Section section={section}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
            {section.title && <h2 id={`${section.id}-title`} className="mb-6 text-3xl md:text-4xl">{section.title}</h2>}
            <RichText text={body} />
            {section.cta && <ButtonLink href={section.cta.href} className="mt-6">{section.cta.label}</ButtonLink>}
          </Reveal>
          <Reveal delay={100} className="relative aspect-[4/3] overflow-hidden img-brand"><SmartImage src={section.media?.image} alt={section.media?.alt ?? ""} fill className="object-cover" /></Reveal>
        </div>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <div className={clsx("mx-auto", section.layout === "wide" ? "max-w-5xl" : "max-w-3xl")}>
        {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
        {section.title && <h2 id={`${section.id}-title`} className="mb-8 text-3xl md:text-4xl">{section.title}</h2>}
        {section.settings?.updated && <p className="-mt-4 mb-8 text-sm text-muted-foreground">Last updated: {String(section.settings.updated)}</p>}
        <RichText text={body} />
        <SectionFooterCta section={section} center={false} />
      </div>
    </Section>
  );
}

/** Call-to-action banner. layouts: band | card | split */
export function CtaBannerSection({ section, site }: SectionProps) {
  const layout = section.layout ?? "card";
  const content = (
    <>
      {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
      <h2 id={`${section.id}-title`} className="text-3xl md:text-5xl">{section.title ?? "Ready to get started?"}</h2>
      {section.subtitle && <p className="mt-5 text-lg opacity-85">{section.subtitle}</p>}
    </>
  );
  const buttons = (
    <div className="flex flex-wrap gap-3">
      {section.cta && <ButtonLink href={section.cta.href} variant="light" size="lg">{section.cta.label} <ArrowRight className="size-4" /></ButtonLink>}
      {section.secondaryCta && <ButtonLink href={section.secondaryCta.href} variant="outline" size="lg">{section.secondaryCta.label}</ButtonLink>}
      {!section.secondaryCta && site.company.phones[0] && section.settings?.showPhone !== false && (
        <ButtonLink href={`tel:${site.company.phones[0].number.replace(/\s/g, "")}`} variant="outline" size="lg"><Phone className="size-4" /> {site.company.phones[0].number}</ButtonLink>
      )}
    </div>
  );
  if (layout === "band") {
    return (
      <Section section={{ ...section, background: section.background ?? { variant: "primary" } }}>
        <Reveal className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">{content}</div>
          {buttons}
        </Reveal>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <Reveal className="relative isolate overflow-hidden rounded-[calc(var(--radius)*2)] bg-primary px-6 py-14 text-center text-primary-foreground md:px-16 md:py-20">
        {section.media?.image && (
          <>
            <SmartImage src={section.media.image} alt="" fill brand={false} className="-z-20 object-cover" />
            <div className="absolute inset-0 -z-10 bg-primary/85" />
          </>
        )}
        <div className="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="mx-auto max-w-3xl [&_.eyebrow]:text-accent">{content}</div>
        <div className="mt-10 flex justify-center">{buttons}</div>
      </Reveal>
    </Section>
  );
}

/** Job openings + application form */
export function CareersSection({ section, site }: SectionProps) {
  const jobs = itemsFor(section, site.content.jobs);
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Open positions" />
      {jobs.length === 0 ? (
        <p className="text-center text-muted-foreground">There are no open positions right now – but we’d still love to hear from you.</p>
      ) : (
        <div className="mx-auto max-w-4xl space-y-4">
          {jobs.map((j) => (
            <details key={j.title} className={clsx(cardClass(site.theme.card.style, false), "group p-6")}>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <div>
                  <h3 className="text-xl">{j.title}</h3>
                  <p className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {j.department && <span className="flex items-center gap-1"><Briefcase className="size-3.5" />{j.department}</span>}
                    <span className="flex items-center gap-1"><MapPin className="size-3.5" />{j.location}</span>
                    <span>{j.type}</span>
                  </p>
                </div>
                <span className="btn btn-outline btn-sm">View role</span>
              </summary>
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-muted-foreground">{j.description}</p>
                {j.requirements.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{j.requirements.map((r) => <li key={r}>{r}</li>)}</ul>}
              </div>
            </details>
          ))}
        </div>
      )}
      <div className="mx-auto mt-16 max-w-3xl">
        <h3 className="mb-6 text-center text-2xl">Apply now</h3>
        <SmartForm type="careers" submitLabel="Submit application" successText="Thanks for applying! Our team will review your application." fields={[
          { name: "name", label: "Full name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone", type: "tel", required: true },
          { name: "position", label: "Position", type: "select", options: [...jobs.map((j) => j.title), "General application"], required: true },
          { name: "portfolio", label: "LinkedIn / portfolio URL", type: "url", full: true },
          { name: "message", label: "Tell us about yourself", type: "textarea", full: true, required: true },
        ]} />
      </div>
    </Section>
  );
}

/** layouts: split | centered | card */
export function NewsletterSection({ section, site }: SectionProps) {
  const layout = section.layout ?? "card";
  const dark = ["primary", "secondary", "dark", "image"].includes(section.background?.variant ?? "");
  const inner = (
    <>
      <div className={clsx(layout !== "split" && "mx-auto max-w-2xl text-center")}>
        <Mail className={clsx("size-10", layout !== "split" && "mx-auto", dark ? "text-accent" : "text-primary")} />
        <h2 id={`${section.id}-title`} className="mt-5 text-3xl md:text-4xl">{section.title ?? "Stay in the loop"}</h2>
        <p className="mt-3 opacity-80">{section.subtitle ?? `Get news, offers and insights from ${site.company.brandName}. No spam, unsubscribe anytime.`}</p>
      </div>
      <div className={clsx("w-full", layout === "split" ? "md:max-w-md" : "mx-auto mt-8 max-w-lg")}>
        <NewsletterForm dark={dark} />
      </div>
    </>
  );
  return (
    <Section section={section}>
      {layout === "split" ? (
        <Reveal className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">{inner}</Reveal>
      ) : layout === "card" ? (
        <Reveal className="rounded-[calc(var(--radius)*2)] border border-border bg-surface px-6 py-14 md:px-16">{inner}</Reveal>
      ) : (
        <Reveal>{inner}</Reveal>
      )}
    </Section>
  );
}

/** Contact info + form + map. layouts: split | stacked | info-only. settings.form: "contact" | "enquiry" */
export function ContactSection({ section, site }: SectionProps) {
  const c = site.company;
  const formType = (section.settings?.form as "contact" | "enquiry" | undefined) ?? "contact";
  const showMap = section.settings?.map !== false && c.map?.embedUrl;
  const info = (
    <div className="space-y-8">
      <div className="space-y-5">
        {[c.headOffice, ...(section.settings?.showBranches === false ? [] : c.branches)].map((a, i) => (
          <div key={i} className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><MapPin className="size-5" /></span>
            <div>
              <p className="font-semibold">{a.label ?? (i === 0 ? "Head office" : `Branch ${i}`)}</p>
              <address className="text-sm not-italic text-muted-foreground">{[a.line1, a.line2, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(", ")}</address>
              {a.hours && <p className="mt-1 text-xs text-muted-foreground">{a.hours}</p>}
            </div>
          </div>
        ))}
        {c.phones.map((p) => (
          <a key={p.number} href={`tel:${p.number.replace(/\s/g, "")}`} className="flex items-center gap-4 hover:text-primary">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Phone className="size-5" /></span>
            <span><span className="block text-xs text-muted-foreground">{p.label}</span><span className="font-semibold">{p.number}</span></span>
          </a>
        ))}
        {c.emails.map((e) => (
          <a key={e.address} href={`mailto:${e.address}`} className="flex items-center gap-4 hover:text-primary">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Mail className="size-5" /></span>
            <span><span className="block text-xs text-muted-foreground">{e.label}</span><span className="font-semibold">{e.address}</span></span>
          </a>
        ))}
      </div>
      <SocialIcons social={c.social} />
    </div>
  );
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Get in touch" />
      {section.layout === "info-only" ? (
        info
      ) : (
        <div className={clsx("grid gap-12", section.layout !== "stacked" && "lg:grid-cols-[1fr_1.4fr]")}>
          {info}
          <div className={clsx(cardClass(site.theme.card.style, false), "p-6 md:p-10")}>
            <h3 className="mb-6 text-2xl">{(section.settings?.formTitle as string) ?? "Send us a message"}</h3>
            <SmartForm type={formType} />
          </div>
        </div>
      )}
      {showMap && (
        <div className="mt-12 overflow-hidden rounded-brand border border-border">
          <iframe src={c.map!.embedUrl} title={`Map: ${c.brandName}`} className="h-96 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
    </Section>
  );
}

/** Request-a-quotation form. Prefills ?product= from the URL. */
export function QuoteFormSection({ section, site }: SectionProps) {
  const benefits = (section.settings?.benefits as string[] | undefined) ?? ["Response within one business day", "No-obligation, detailed proposal", "Dedicated account manager"];
  return (
    <Section section={section}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionHeader section={{ ...section, align: "left" }} fallbackTitle="Request a quotation" className="!mb-8" action={false} />
          <ul className="space-y-4">
            {benefits.map((b) => <li key={b} className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />{b}</li>)}
          </ul>
          {site.company.phones[0] && (
            <p className="mt-8 text-sm text-muted-foreground">Prefer to talk? Call <a href={`tel:${site.company.phones[0].number.replace(/\s/g, "")}`} className="font-semibold text-foreground">{site.company.phones[0].number}</a></p>
          )}
        </div>
        <div className={clsx(cardClass(site.theme.card.style, false), "p-6 md:p-10")}>
          <Suspense fallback={<SmartForm type="quote" submitLabel="Request quotation" />}>
            <QuoteFormWithParams products={site.catalog.products.map((p) => ({ slug: p.slug, name: p.name }))} services={site.services.items.map((s) => ({ slug: s.slug, name: s.name }))} />
          </Suspense>
        </div>
      </div>
    </Section>
  );
}

/** Shopping section: tabbed featured / new / best-seller products. layouts: tabs | grid */
export function ShopSection({ section, site }: SectionProps) {
  if (!isEnabled(site, "shop")) return null;
  const limit = section.limit ?? 8;
  const tabs = [
    { key: "featured", label: "Featured" },
    { key: "newArrival", label: "New arrivals" },
    { key: "bestSeller", label: "Best sellers" },
    { key: "onSale", label: "On sale" },
  ].filter((t) => site.catalog.products.some((p) => (t.key === "onSale" ? p.salePrice != null : p[t.key as "featured"])));
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle={site.commerce.shopTitle} />
      {section.layout === "grid" || tabs.length < 2 ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {selectProducts(site.catalog.products, section.source, limit).map((p) => <ProductCard key={p.slug} product={p} site={site} />)}
        </div>
      ) : (
        <ShopTabs tabs={tabs.map((t) => ({ label: t.label, content: (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {selectProducts(site.catalog.products, t.key, limit).map((p) => <ProductCard key={p.slug} product={p} site={site} />)}
          </div>
        ) }))} />
      )}
      <div className="mt-12 text-center"><ButtonLink href={section.cta?.href ?? "/shop"} variant="outline">{section.cta?.label ?? "View all products"} <ArrowRight className="size-4" /></ButtonLink></div>
    </Section>
  );
}
