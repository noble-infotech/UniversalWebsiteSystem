import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const seo: SiteConfigInput["seo"] = {
  defaultTitle: "{brand} – Handmade Candles, Ceramics & Linen",
  titleTemplate: "%s — {brand}",
  description: "Hand-poured soy candles, studio ceramics and natural linens from independent makers. Free US shipping over $75.",
  keywords: ["soy candles", "handmade ceramics", "linen throw", "home decor gifts"],
  ogImage: img("photo-1513506003901-1e6a229e2d15", 1200),
  schemaType: "Store",
  twitterHandle: "@maisonlumiere",
  routes: { shop: { title: "Shop All – Candles, Ceramics & Linen" }, blog: { title: "The Journal" } },
};
