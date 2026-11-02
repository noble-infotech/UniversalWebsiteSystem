import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getSite } from "@/core/config/loader";
import { buildMetadata, absoluteUrl } from "@/core/seo/metadata";
import { serviceLd } from "@/core/seo/jsonld";
import { isEnabled } from "@/core/config/features";
import { ButtonLink, Container, JsonLd, RichText } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { SmartImage } from "@/components/ui/SmartImage";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaqList } from "@/components/sections/content";
import { PricingGrid, ServiceCard } from "@/components/sections/showcase";
import { ShareButtons } from "@/components/engagement/ShareButtons";
import { SmartForm } from "@/components/forms/SmartForm";
import { defaultFields } from "@/core/forms/schemas";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite();
  const { slug } = await params;
  const s = site.services.items.find((x) => x.slug === slug);
  if (!s) return {};
  return buildMetadata(site, { title: s.name, description: s.shortDescription, seo: s.seo, image: s.image, path: `/services/${s.slug}` });
}

export default async function ServiceDetail({ params }: Props) {
  const site = await getSite();
  const { slug } = await params;
  const s = site.services.items.find((x) => x.slug === slug);
  if (!s || !isEnabled(site, "services")) notFound();
  const cat = site.services.categories.find((c) => c.slug === s.category);
  const others = site.services.items.filter((x) => x.slug !== s.slug).slice(0, 3);
  const cta = s.cta ?? { label: "Request a quote", href: `/request-quote?service=${s.slug}` };
  return (
    <>
      <JsonLd data={serviceLd(site, s)} />
      <PageHeader site={site} eyebrow={cat?.name} title={s.name} subtitle={s.shortDescription} image={s.image} crumbs={[{ label: "Services", href: "/services" }, { label: s.name, href: `/services/${s.slug}` }]} />
      <Container className="py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <RichText text={s.description} className="text-lg" />
            {s.benefits.length > 0 && (
              <>
                <h2 className="mt-14 mb-6 text-2xl md:text-3xl">Key benefits</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {s.benefits.map((b) => <li key={b} className="flex gap-3 rounded-brand border border-border p-4"><Check className="mt-0.5 size-5 shrink-0 text-primary" />{b}</li>)}
                </ul>
              </>
            )}
            {s.features.length > 0 && (
              <>
                <h2 className="mt-14 mb-6 text-2xl md:text-3xl">What’s included</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {s.features.map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-brand bg-primary/10 text-primary"><Icon name={f.icon} /></span>
                      <div><h3 className="text-lg">{f.title}</h3>{f.description && <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {s.process.length > 0 && (
              <>
                <h2 className="mt-14 mb-6 text-2xl md:text-3xl">Our process</h2>
                <ol className="space-y-4">
                  {s.process.map((p, i) => (
                    <li key={p.title} className="flex gap-5 rounded-brand border border-border p-5">
                      <span className="font-heading text-3xl text-primary/40">{String(i + 1).padStart(2, "0")}</span>
                      <div><h3 className="text-lg">{p.title}</h3>{p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}</div>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {s.gallery.length > 0 && (
              <div className="mt-14 grid grid-cols-2 gap-4">
                {s.gallery.map((g, i) => <div key={i} className="relative aspect-[4/3] overflow-hidden img-brand"><SmartImage src={g} alt={`${s.name} ${i + 1}`} fill className="object-cover" /></div>)}
              </div>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-brand bg-primary p-8 text-primary-foreground">
              <h2 className="text-2xl">Interested in {s.name.toLowerCase()}?</h2>
              <p className="mt-3 text-sm opacity-85">Talk to a specialist and get a tailored proposal.</p>
              <ButtonLink href={cta.href} variant="light" className="mt-6 w-full">{cta.label} <ArrowRight className="size-4" /></ButtonLink>
              {site.company.phones[0] && <a href={`tel:${site.company.phones[0].number.replace(/\s/g, "")}`} className="mt-4 block text-center text-sm font-semibold underline">{site.company.phones[0].number}</a>}
            </div>
            <div className="rounded-brand border border-border p-6">
              <h3 className="mb-4 text-lg">Quick enquiry</h3>
              <SmartForm type="enquiry" compact submitLabel="Send enquiry" fields={defaultFields.enquiry.filter((f) => f.name !== "topic").map((f) => (f.name === "message" ? { ...f, label: `Tell us about your ${s.name.toLowerCase()} needs` } : f))} />
            </div>
            {site.integrations.socialShare.enabled && <ShareButtons url={absoluteUrl(site, `/services/${s.slug}`)} title={s.name} networks={site.integrations.socialShare.networks} />}
          </aside>
        </div>
        {s.pricing && s.pricing.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-12 text-center text-3xl md:text-4xl">Pricing</h2>
            <PricingGrid plans={s.pricing} site={site} cta={cta} />
          </section>
        )}
        {s.faqs.length > 0 && (
          <section className="mx-auto mt-24 max-w-3xl">
            <h2 className="mb-8 text-center text-3xl">Frequently asked questions</h2>
            <FaqList items={s.faqs} />
          </section>
        )}
        {others.length > 0 && (
          <section className="mt-24">
            <h2 className="mb-8 text-2xl md:text-3xl">Other services</h2>
            <div className="grid gap-6 md:grid-cols-3">{others.map((o) => <ServiceCard key={o.slug} service={o} site={site} />)}</div>
          </section>
        )}
      </Container>
    </>
  );
}
