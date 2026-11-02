import { clsx } from "clsx";
import { Breadcrumbs, Container, JsonLd } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { breadcrumbLd } from "@/core/seo/jsonld";
import type { SiteConfig } from "@/core/config/schema";

/** Inner-page hero with breadcrumbs (+ BreadcrumbList structured data). */
export function PageHeader({ site, title, subtitle, image, crumbs, eyebrow, compact }: { site: SiteConfig; title: string; subtitle?: string; image?: string; crumbs?: { label: string; href: string }[]; eyebrow?: string; compact?: boolean }) {
  const trail = crumbs ? [{ label: "Home", href: "/" }, ...crumbs] : undefined;
  return (
    <section className={clsx("relative isolate overflow-hidden", image ? "bg-variant-image text-white" : "bg-variant-gradient border-b border-border")}>
      {trail && <JsonLd data={breadcrumbLd(site, trail)} />}
      {image && (
        <>
          <SmartImage src={image} alt="" fill priority brand={false} className="-z-20 object-cover" sizes="100vw" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
        </>
      )}
      <Container className={clsx(compact ? "py-12 md:py-16" : image ? "py-24 md:py-36" : "py-16 md:py-24")}>
        {trail && <Breadcrumbs items={trail} className="mb-6" />}
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="max-w-4xl text-4xl md:text-6xl">{title}</h1>
        {subtitle && <p className={clsx("mt-5 max-w-2xl text-lg", image ? "text-white/85" : "text-muted-foreground")}>{subtitle}</p>}
      </Container>
    </section>
  );
}
