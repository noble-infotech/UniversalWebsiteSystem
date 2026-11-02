import type { Metadata } from "next";
import { getSite } from "@/core/config/loader";
import { buildMetadata } from "@/core/seo/metadata";
import { ConfiguredPage, findPage } from "./_lib/pages";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const page = findPage(site, "");
  return buildMetadata(site, { seo: page?.seo, path: "/" });
}

export default async function HomePage() {
  const site = await getSite();
  const page = findPage(site, "");
  if (!page) return <p className="container-brand py-24">No homepage configured. Add a page with slug "" to this site’s pages config.</p>;
  return <ConfiguredPage page={page} site={site} />;
}
