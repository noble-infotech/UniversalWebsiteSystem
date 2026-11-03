import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const seo: SiteConfigInput["seo"] = {
  defaultTitle: "Apex Forge Industries – Precision Forging & CNC Machining",
  titleTemplate: "%s | {brand}",
  description: "ISO 9001, IATF 16949 and AS9100D certified manufacturer of precision forged, machined and fabricated components.",
  keywords: ["precision machining", "closed die forging", "CNC manufacturer India", "automotive components", "contract manufacturing"],
  ogImage: img("photo-1504917595217-d4dc5ebe6122", 1200),
  schemaType: "Manufacturer",
  locale: "en_IN",
  routes: { shop: { title: "Product Catalogue", description: "Browse forged, machined and fabricated component families. Request a quotation online." } },
};
