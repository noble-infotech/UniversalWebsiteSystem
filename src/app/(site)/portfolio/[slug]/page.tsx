import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getSite } from "@/core/config/loader";
import { buildMetadata } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectsSection } from "@/components/sections/showcase";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite();
  const { slug } = await params;
  const p = site.content.projects.find((x) => x.slug === slug);
  if (!p) return {};
  return buildMetadata(site, { title: p.title, description: p.summary, image: p.image, path: `/portfolio/${p.slug}` });
}

export default async function ProjectPage({ params }: Props) {
  const site = await getSite();
  const { slug } = await params;
  const p = site.content.projects.find((x) => x.slug === slug);
  if (!p || !isEnabled(site, "portfolio")) notFound();
  const facts = [["Client", p.client], ["Category", p.category], ["Year", p.year]].filter(([, v]) => v) as [string, string][];
  return (
    <>
      <PageHeader site={site} eyebrow="Case study" title={p.title} subtitle={p.summary} image={p.image} crumbs={[{ label: "Portfolio", href: "/portfolio" }, { label: p.title, href: `/portfolio/${p.slug}` }]} />
      <Container className="py-16 md:py-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
          <dl className="h-fit space-y-6 rounded-brand border border-border p-8">
            {facts.map(([k, v]) => <div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-1 text-lg font-semibold">{v}</dd></div>)}
            <ButtonLink href="/request-quote" className="w-full">Start a similar project</ButtonLink>
          </dl>
          <div className="space-y-12">
            {p.challenge && <section><h2 className="mb-4 text-2xl md:text-3xl">The challenge</h2><p className="text-lg leading-relaxed text-muted-foreground">{p.challenge}</p></section>}
            {p.solution && <section><h2 className="mb-4 text-2xl md:text-3xl">Our solution</h2><p className="text-lg leading-relaxed text-muted-foreground">{p.solution}</p></section>}
            {p.results.length > 0 && (
              <section>
                <h2 className="mb-6 text-2xl md:text-3xl">Results</h2>
                <ul className="grid gap-4 sm:grid-cols-2">{p.results.map((r) => <li key={r} className="flex gap-3 rounded-brand bg-muted p-5"><Check className="mt-0.5 size-5 shrink-0 text-primary" />{r}</li>)}</ul>
              </section>
            )}
          </div>
        </div>
      </Container>
      <ProjectsSection site={site} section={{ id: "more", type: "projects", enabled: true, visibility: { mobile: true, desktop: true }, title: "More projects", align: "left", limit: 3, items: site.content.projects.filter((x) => x.slug !== p.slug) as never, background: { variant: "muted" } }} />
    </>
  );
}
