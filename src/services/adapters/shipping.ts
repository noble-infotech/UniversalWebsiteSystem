import type { SiteConfig } from "@/core/config/schema";
import { availableShippingMethods, shippingCost } from "@/core/commerce/pricing";
import type { ShippingProvider } from "../types";

/** Rules from config: flat rate + optional per-kg, free-over threshold, country restrictions. */
export function flatRateShipping(site: SiteConfig): ShippingProvider {
  return {
    id: "flat-rate",
    async quote(lines, country, merch) {
      return availableShippingMethods(site.commerce.shipping.methods, lines, country).map((method) => ({ method, amount: shippingCost(method, lines, merch) }));
    },
  };
}
