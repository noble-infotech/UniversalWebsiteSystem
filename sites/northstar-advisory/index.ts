/**
 * MASTER CONFIG – Northstar Advisory (Service-based business)
 * Commerce is disabled entirely: no shop, cart, checkout, wishlist or accounts.
 */
import type { SiteConfigInput } from "@/core/config/schema";
import { company, story, business } from "./company";
import { theme } from "./theme";
import { pages } from "./pages";
import { navigation } from "./navigation";
import { footer } from "./footer";
import { services } from "./services";
import { content } from "./content";
import { integrations } from "./integrations";
import { seo } from "./seo";

const config: SiteConfigInput = {
  id: "northstar-advisory",
  company,
  theme,
  story,
  business,
  features: { shop: false, catalog: false, services: true, blog: true, portfolio: true, gallery: false, careers: true, quote: true, search: true, newsletter: true, accounts: false, wishlist: false },
  navigation,
  footer,
  pages,
  services,
  catalog: { categories: [], products: [] },
  commerce: { enabled: false, currency: "GBP", locale: "en-GB", tax: { rate: 0.2, label: "VAT", inclusive: true }, shipping: {}, payment: {}, inventory: {} },
  content,
  integrations,
  seo,
};

export default config;
