/**
 * MASTER CONFIG – Maison Lumière (Retail / D2C e-commerce)
 */
import type { SiteConfigInput } from "@/core/config/schema";
import { company, story, business } from "./company";
import { theme } from "./theme";
import { pages } from "./pages";
import { navigation } from "./navigation";
import { footer } from "./footer";
import { catalog } from "./products";
import { commerce } from "./commerce";
import { content } from "./content";
import { integrations } from "./integrations";
import { seo } from "./seo";

const config: SiteConfigInput = {
  id: "maison-lumiere",
  company,
  theme,
  story,
  business,
  features: { shop: true, catalog: true, services: false, blog: true, portfolio: false, gallery: true, careers: true, quote: false, search: true, newsletter: true, accounts: true, wishlist: true },
  navigation,
  footer,
  pages,
  services: { categories: [], items: [] },
  catalog,
  commerce,
  content,
  integrations,
  seo,
};

export default config;
