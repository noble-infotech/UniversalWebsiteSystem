import type { Metadata } from "next";
import { getSite } from "@/core/config/loader";
import { buildMetadata, routeSeo } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import { SectionRenderer } from "@/components/sections/registry";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfiguredPage, findPage, requireFeature } from "../_lib/pages";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const page = findPage(site, "services");
  return buildMetadata(site, { title: page?.title ?? "Services", seo: page?.seo ?? routeSeo(site, "services"), path: "/services" });
}

/** Uses the configured "services" page if one exists, otherwise a sensible default layout. */
export default async function ServicesPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "services"));
  const page = findPage(site, "services");
  if (page) return <ConfiguredPage page={page} site={site} />;
  const v = { mobile: true, desktop: true };
  return (
    <>
      <PageHeader site={site} title="Our services" crumbs={[{ label: "Services", href: "/services" }]} />
      <SectionRenderer site={site} sections={[
        { id: "all-services", type: "serviceList", enabled: true, visibility: v, layout: "grouped" },
        { id: "process", type: "process", enabled: site.content.process.length > 0, visibility: v, background: { variant: "muted" } },
        { id: "cta", type: "ctaBanner", enabled: true, visibility: v, cta: { label: "Request a quote", href: "/request-quote" } },
      ]} />
    </>
  );
}
