import type { Metadata } from "next";
import { getSite } from "@/core/config/loader";
import { buildMetadata, routeSeo } from "@/core/seo/metadata";

/** Metadata helper for built-in system routes (overridable via seo.routes.<key>). */
export async function systemMetadata(key: string, title: string, path: string, noIndex = false): Promise<Metadata> {
  const site = await getSite();
  const seo = routeSeo(site, key);
  return buildMetadata(site, { title, path, seo: { ...seo, noIndex: noIndex || seo?.noIndex } });
}
