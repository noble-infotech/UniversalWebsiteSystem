import type { SiteConfigInput } from "@/core/config/schema";

/** B2B: online cart disabled (catalogue + quotations only). Flip features.shop to true to enable ordering of spares. */
export const commerce: SiteConfigInput["commerce"] = {
  enabled: true,
  currency: "USD",
  locale: "en-US",
  tax: { rate: 0.18, label: "GST", inclusive: false },
  shipping: { methods: [{ id: "freight", label: "Freight (EXW Pune)", rate: 45, perKg: 2.5, estimate: "5–10 business days" }], countries: [{ code: "IN", name: "India" }, { code: "DE", name: "Germany" }, { code: "US", name: "United States" }], provider: "flat-rate" },
  coupons: [],
  payment: { provider: "manual", methods: ["bank_transfer"] },
  inventory: { provider: "erp", trackStock: true, lowStockThreshold: 10, allowBackorders: false },
  guestCheckout: true,
  accounts: false,
  wishlist: false,
  reviews: false,
  orderPrefix: "AFI",
  shopTitle: "Product catalogue",
  shopDescription: "Forged, machined and fabricated component families. Every part is made to your drawing – request a quotation.",
};
