import type { Metadata } from "next";
import { getSite } from "@/core/config/loader";
import { buildMetadata, routeSeo } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import { SectionRenderer } from "@/components/sections/registry";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfiguredPage, findPage, requireFeature } from "../_lib/pages";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const page = findPage(site, "portfolio");
  return buildMetadata(site, { title: page?.title ?? "Portfolio", seo: page?.seo ?? routeSeo(site, "portfolio"), path: "/portfolio" });
}

export default async function PortfolioPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "portfolio"));
  const page = findPage(site, "portfolio");
  if (page) return <ConfiguredPage page={page} site={site} />;
  return (
    <>
      <PageHeader site={site} title="Portfolio" crumbs={[{ label: "Portfolio", href: "/portfolio" }]} />
      <SectionRenderer site={site} sections={[{ id: "projects", type: "projects", enabled: true, visibility: { mobile: true, desktop: true } }]} />
    </>
  );
}
