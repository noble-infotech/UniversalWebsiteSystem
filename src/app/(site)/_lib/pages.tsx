import { notFound } from "next/navigation";
import type { PageConfig, SiteConfig } from "@/core/config/schema";
import { SectionRenderer } from "@/components/sections/registry";
import { PageHeader } from "@/components/layout/PageHeader";

export function findPage(site: SiteConfig, slug: string) {
  const p = site.pages.find((x) => x.slug === slug);
  return p && p.enabled ? p : undefined;
}

export function requireFeature(ok: boolean) {
  if (!ok) notFound();
}

/** Renders any configured page: optional page header + its sections. */
export function ConfiguredPage({ page, site }: { page: PageConfig; site: SiteConfig }) {
  const showHeader = page.slug !== "" && page.header.show;
  return (
    <>
      {showHeader && (
        <PageHeader site={site} title={page.header.title ?? page.title} subtitle={page.header.subtitle} image={page.header.image} crumbs={page.header.breadcrumbs ? [{ label: page.title, href: `/${page.slug}` }] : undefined} />
      )}
      <div className={page.template === "narrow" ? "mx-auto max-w-4xl" : undefined}>
        <SectionRenderer sections={page.sections} site={site} />
      </div>
    </>
  );
}
