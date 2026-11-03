/**
 * SITE REGISTRY – the only file you touch (besides your new site folder) to onboard a company.
 * The active site is chosen by SITE_ID env var (or the demo switcher cookie).
 */
import type { SiteConfigInput } from "@/core/config/schema";
import apexForge from "./apex-forge";
import maisonLumiere from "./maison-lumiere";
import northstar from "./northstar-advisory";

export const siteRegistry: Record<string, SiteConfigInput> = {
  [apexForge.id]: apexForge,
  [maisonLumiere.id]: maisonLumiere,
  [northstar.id]: northstar,
};

export const defaultSiteId = apexForge.id;
