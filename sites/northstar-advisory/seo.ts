import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const seo: SiteConfigInput["seo"] = {
  defaultTitle: "{name} – Strategy, Data & AI Consulting",
  titleTemplate: "%s · {brand}",
  description: "{brand} unites strategists, data scientists and engineers to turn ambition into measurable outcomes.",
  keywords: ["strategy consulting", "data consultancy", "AI consulting", "digital transformation"],
  ogImage: img("photo-1522071820081-009f0129c71c", 1200),
  schemaType: "ProfessionalService",
  locale: "en_GB",
  routes: { blog: { title: "Insights" } },
};
