import Link from "next/link";
import { clsx } from "clsx";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteConfig } from "@/core/config/schema";
import { isEnabled } from "@/core/config/features";
import { Logo } from "@/components/ui/Logo";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { PaymentIcons } from "@/components/ui/PaymentIcons";
import { NewsletterForm } from "@/components/forms/SmartForm";

type Column = SiteConfig["footer"]["columns"][number];

function ColumnBody({ col, site }: { col: Column; site: SiteConfig }) {
  const link = "text-sm opacity-75 transition hover:opacity-100";
  switch (col.type) {
    case "links":
      return <ul className="space-y-3">{col.links?.map((l) => <li key={l.href + l.label}><Link href={l.href} className={link}>{l.label}</Link></li>)}</ul>;
    case "productCategories":
      if (!isEnabled(site, "shop")) return null;
      return <ul className="space-y-3">{site.catalog.categories.filter((c) => !c.parent).slice(0, col.limit ?? 6).map((c) => <li key={c.slug}><Link href={`/shop/category/${c.slug}`} className={link}>{c.name}</Link></li>)}</ul>;
    case "services":
      return <ul className="space-y-3">{site.services.items.slice(0, col.limit ?? 6).map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} className={link}>{s.name}</Link></li>)}</ul>;
    case "contact": {
      const c = site.company;
      return (
        <ul className="space-y-4 text-sm">
          <li className="flex gap-3 opacity-80"><MapPin className="mt-0.5 size-4 shrink-0" /><address className="not-italic">{[c.headOffice.line1, c.headOffice.city, c.headOffice.country].join(", ")}</address></li>
          {c.phones.slice(0, 2).map((p) => <li key={p.number}><a href={`tel:${p.number.replace(/\s/g, "")}`} className="flex gap-3 opacity-80 hover:opacity-100"><Phone className="size-4 shrink-0" />{p.number}</a></li>)}
          {c.emails.slice(0, 2).map((e) => <li key={e.address}><a href={`mailto:${e.address}`} className="flex gap-3 opacity-80 hover:opacity-100"><Mail className="size-4 shrink-0" />{e.address}</a></li>)}
        </ul>
      );
    }
    case "newsletter":
      return (
        <div className="space-y-4">
          {col.text && <p className="text-sm opacity-75">{col.text}</p>}
          <NewsletterForm dark={site.theme.footer.variant !== "light"} />
        </div>
      );
    case "social":
      return <SocialIcons social={site.company.social} />;
    case "text":
    case "about":
      return <p className="text-sm leading-relaxed opacity-75">{col.text ?? site.company.description}</p>;
  }
}

export function Footer({ site }: { site: SiteConfig }) {
  const f = site.footer;
  const variant = site.theme.footer.variant;
  const layout = site.theme.footer.layout;
  const year = new Date().getFullYear();
  const copyright = (f.copyright ?? "© {year} {company}. All rights reserved.").replace("{year}", String(year)).replace("{company}", site.company.legalName ?? site.company.name);
  const columns = f.columns.filter((c) => !(c.type === "productCategories" && !isEnabled(site, "shop")) && !(c.type === "newsletter" && !isEnabled(site, "newsletter")));
  const tone = variant === "dark" ? "bg-[#0b0d12] text-white [--c-border:rgb(255_255_255/.12)]" : variant === "brand" ? "bg-secondary text-secondary-foreground [--c-border:rgb(255_255_255/.15)]" : "bg-surface text-foreground border-t border-border";

  const brandBlock = (
    <div className={clsx("space-y-5", layout === "centered" && "flex flex-col items-center text-center")}>
      {f.showLogo && <Logo company={site.company} variant={variant === "light" ? "primary" : "secondary"} />}
      {f.description && <p className="max-w-sm text-sm leading-relaxed opacity-75">{f.description}</p>}
      <SocialIcons social={site.company.social} />
    </div>
  );

  const bottom = (
    <div className={clsx("flex flex-col gap-6 border-t border-[var(--c-border)] py-8 text-sm md:flex-row md:items-center md:justify-between", layout === "centered" && "md:flex-col")}>
      <p className="opacity-70">{copyright}</p>
      {f.legalLinks.length > 0 && (
        <ul className="flex flex-wrap gap-x-6 gap-y-2">{f.legalLinks.map((l) => <li key={l.href}><Link href={l.href} className="opacity-70 hover:opacity-100">{l.label}</Link></li>)}</ul>
      )}
      <PaymentIcons icons={isEnabled(site, "shop") ? f.paymentIcons : []} />
    </div>
  );

  return (
    <footer className={clsx(tone, "mt-auto")} aria-label="Site footer">
      {f.newsletter.enabled && isEnabled(site, "newsletter") && (
        <div className="border-b border-[var(--c-border)]">
          <div className="container-brand flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl">{f.newsletter.title ?? "Join our newsletter"}</h2>
              {f.newsletter.text && <p className="mt-2 opacity-75">{f.newsletter.text}</p>}
            </div>
            <div className="w-full md:max-w-md"><NewsletterForm dark={variant !== "light"} /></div>
          </div>
        </div>
      )}
      <div className="container-brand">
        {layout === "minimal" ? (
          <div className="flex flex-col items-center gap-6 py-12 text-center">
            {f.showLogo && <Logo company={site.company} variant={variant === "light" ? "primary" : "secondary"} />}
            <nav aria-label="Footer"><ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">{columns.flatMap((c) => c.links ?? []).map((l) => <li key={l.href + l.label}><Link href={l.href} className="text-sm opacity-75 hover:opacity-100">{l.label}</Link></li>)}</ul></nav>
            <SocialIcons social={site.company.social} />
          </div>
        ) : layout === "centered" ? (
          <div className="space-y-12 py-16">
            {brandBlock}
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 text-center">
              {columns.filter((c) => c.type !== "social").map((c) => (
                <div key={c.title}><h3 className="mb-5 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{c.title}</h3><ColumnBody col={c} site={site} /></div>
              ))}
            </div>
          </div>
        ) : (
          <div className={clsx("grid gap-12 py-16", layout === "mega" ? "lg:grid-cols-[1.4fr_repeat(4,1fr)]" : "md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]")}>
            {brandBlock}
            {columns.map((c) => (
              <div key={c.title}>
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{c.title}</h3>
                <ColumnBody col={c} site={site} />
              </div>
            ))}
          </div>
        )}
        {bottom}
      </div>
    </footer>
  );
}
