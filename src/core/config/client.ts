import type { SiteConfig } from "./schema";
import { isEnabled } from "./features";

/**
 * The subset of configuration that is safe and useful to ship to the browser.
 * Never include secrets, coupon codes, or the full catalogue here.
 */
export function toClientConfig(site: SiteConfig) {
  return {
    id: site.id,
    brandName: site.company.brandName,
    companyName: site.company.name,
    phone: site.company.phones[0]?.number,
    email: site.company.emails[0]?.address,
    commerce: {
      enabled: site.commerce.enabled,
      currency: site.commerce.currency,
      locale: site.commerce.locale,
      tax: site.commerce.tax,
      shipping: { methods: site.commerce.shipping.methods, countries: site.commerce.shipping.countries, provider: site.commerce.shipping.provider },
      payment: { provider: site.commerce.payment.provider, methods: site.commerce.payment.methods, publicKey: site.commerce.payment.publicKey },
      guestCheckout: site.commerce.guestCheckout,
      maxQuantityPerItem: site.commerce.maxQuantityPerItem,
      orderPrefix: site.commerce.orderPrefix,
    },
    features: {
      shop: isEnabled(site, "shop"),
      catalog: isEnabled(site, "catalog"),
      wishlist: isEnabled(site, "wishlist"),
      accounts: isEnabled(site, "accounts"),
      search: isEnabled(site, "search"),
      quote: isEnabled(site, "quote"),
      newsletter: isEnabled(site, "newsletter"),
    },
    animation: site.theme.animation,
    analytics: site.integrations.analytics,
  };
}
export type ClientConfig = ReturnType<typeof toClientConfig>;
