/**
 * MASTER CONFIG – Apex Forge Industries (Manufacturing / B2B)
 * Composes the per-module config files. Nothing in /src needs to change for this company.
 */
import type { SiteConfigInput } from "@/core/config/schema";
import { company, story, business } from "./company";
import { theme } from "./theme";
import { pages } from "./pages";
import { navigation } from "./navigation";
import { footer } from "./footer";
import { services } from "./services";
import { catalog } from "./products";
import { commerce } from "./commerce";
import { content } from "./content";
import { integrations } from "./integrations";
import { seo } from "./seo";

const config: SiteConfigInput = {
  id: "apex-forge",
  company,
  theme,
  story,
  business,
  features: { shop: false, catalog: true, services: true, blog: true, portfolio: true, gallery: true, careers: true, quote: true, search: true, newsletter: true, accounts: false, wishlist: false },
  navigation,
  footer,
  pages,
  services,
  catalog,
  commerce,
  content,
  integrations,
  seo,
};

export default config;
