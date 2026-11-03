import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/core/config/loader";
import { buildMetadata } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import { CatalogListing, type SearchParams } from "../../../_lib/catalog-page";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite();
  const { slug } = await params;
  const cat = site.catalog.categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return buildMetadata(site, { title: cat.name, description: cat.description, seo: cat.seo, image: cat.image, path: `/shop/category/${slug}` });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const site = await getSite();
  const { slug } = await params;
  const cat = site.catalog.categories.find((c) => c.slug === slug);
  if (!cat || !isEnabled(site, "catalog")) notFound();
  return <CatalogListing site={site} sp={await searchParams} category={cat} basePath={`/shop/category/${slug}`} />;
}
