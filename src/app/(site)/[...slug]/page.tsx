import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSite } from "@/core/config/loader";
import { buildMetadata } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import type { PageConfig } from "@/core/config/schema";
import { ConfiguredPage, findPage } from "../_lib/pages";

type Props = { params: Promise<{ slug: string[] }> };

/** Built-in fallbacks so feature links work even if a company hasn't configured the page. */
function fallbackPage(slug: string, site: Awaited<ReturnType<typeof getSite>>): PageConfig | undefined {
  const base = { enabled: true, visibility: "public" as const, template: "default" as const, header: { show: true, breadcrumbs: true } };
  if (slug === "request-quote" && isEnabled(site, "quote"))
    return { ...base, slug, title: "Request a quotation", header: { ...base.header, subtitle: "Tell us what you need and we’ll prepare a tailored proposal." }, sections: [{ id: "quote", type: "quoteForm", enabled: true, visibility: { mobile: true, desktop: true } }] };
  if (slug === "contact")
    return { ...base, slug, title: "Contact us", sections: [{ id: "contact", type: "contact", enabled: true, visibility: { mobile: true, desktop: true } }] };
  return undefined;
}

async function resolve(params: Props["params"]) {
  const { slug } = await params;
  const path = slug.join("/");
  const site = await getSite();
  const page = findPage(site, path) ?? fallbackPage(path, site);
  return { site, page, path };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site, page, path } = await resolve(params);
  if (!page) return {};
  return buildMetadata(site, { title: page.title, seo: { ...page.seo, noIndex: page.seo?.noIndex || page.visibility === "hidden" }, path: `/${path}` });
}

export default async function DynamicPage({ params }: Props) {
  const { site, page } = await resolve(params);
  if (!page) notFound();
  return <ConfiguredPage page={page} site={site} />;
}
