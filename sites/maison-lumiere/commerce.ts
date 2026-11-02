import type { SiteConfigInput } from "@/core/config/schema";

export const commerce: SiteConfigInput["commerce"] = {
  enabled: true,
  currency: "USD",
  locale: "en-US",
  tax: { rate: 0.08875, label: "Sales tax", inclusive: false },
  shipping: {
    provider: "flat-rate",
    countries: [{ code: "US", name: "United States" }, { code: "CA", name: "Canada" }, { code: "GB", name: "United Kingdom" }, { code: "AU", name: "Australia" }],
    methods: [
      { id: "standard", label: "Standard", rate: 8, freeOver: 75, estimate: "3–5 business days", countries: ["US"] },
      { id: "express", label: "Express", rate: 22, estimate: "1–2 business days", countries: ["US"] },
      { id: "international", label: "International tracked", rate: 28, freeOver: 250, estimate: "6–12 business days", countries: ["CA", "GB", "AU"] },
      { id: "email", label: "Email delivery", rate: 0, estimate: "Instant", digitalOnly: true },
    ],
  },
  coupons: [
    { code: "WELCOME10", type: "percent", value: 10, description: "10% off your first order" },
    { code: "GLOW25", type: "fixed", value: 25, minSubtotal: 150, description: "$25 off orders over $150" },
    { code: "FREESHIP", type: "free_shipping", description: "Free shipping on this order" },
    { code: "CANDLE20", type: "percent", value: 20, categories: ["home-fragrance"], description: "20% off home fragrance" },
    { code: "SUMMER24", type: "percent", value: 15, expires: "2024-09-01", description: "Expired summer promo" },
  ],
  payment: { provider: "stripe", methods: ["card", "paypal", "cod"] },
  inventory: { provider: "config", trackStock: true, lowStockThreshold: 5, allowBackorders: false },
  guestCheckout: true,
  accounts: true,
  wishlist: true,
  reviews: true,
  orderPrefix: "ML",
  maxQuantityPerItem: 20,
  shopTitle: "Shop all",
  shopDescription: "Considered objects for the home, made by hand.",
  productsPerPage: 9,
};
