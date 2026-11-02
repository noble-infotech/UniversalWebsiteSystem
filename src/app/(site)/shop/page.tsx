import type { Metadata } from "next";
import { getSite } from "@/core/config/loader";
import { buildMetadata, routeSeo } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import { requireFeature } from "../_lib/pages";
import { CatalogListing, type SearchParams } from "../_lib/catalog-page";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return buildMetadata(site, { title: site.commerce.shopTitle, description: site.commerce.shopDescription, seo: routeSeo(site, "shop"), path: "/shop" });
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const site = await getSite();
  requireFeature(isEnabled(site, "catalog"));
  return <CatalogListing site={site} sp={await searchParams} basePath="/shop" />;
}
