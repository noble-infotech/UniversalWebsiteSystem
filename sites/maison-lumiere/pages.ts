import type { SiteConfigInput } from "@/core/config/schema";
import { img, page, section, legalPages } from "../_shared/helpers";
import { homeSections } from "./home";

export const pages: SiteConfigInput["pages"] = [
  page({ slug: "", title: "Home", sections: homeSections, seo: { title: "Handmade Candles, Ceramics & Linen", description: "Shop hand-poured soy candles, studio ceramics and natural linens. Free US shipping over $75." } }),
  page({
    slug: "about",
    title: "Our story",
    header: { show: true, breadcrumbs: true, subtitle: "From a kitchen table in Brooklyn to homes in 30 countries.", image: img("photo-1567016432779-094069958ea5", 2000) },
    sections: [
      section({ id: "about", type: "about", layout: "image-right", eyebrow: "Since 2016", title: "Objects with a story" }),
      section({ id: "values", type: "visionMission", title: "What we believe", background: { variant: "muted" } }),
      section({ id: "timeline", type: "story", layout: "timeline", title: "Milestones" }),
      section({ id: "team", type: "team", columns: 3, title: "The studio", background: { variant: "muted" } }),
      section({ id: "stats", type: "stats", layout: "cards" }),
      section({ id: "certs", type: "partners", title: "Certified for good" }),
    ],
  }),
  page({
    slug: "sustainability",
    title: "Sustainability",
    header: { show: true, breadcrumbs: true, subtitle: "Our promise to people and planet." },
    sections: [
      section({ id: "intro", type: "richText", layout: "two-column", title: "Better materials, fairer making", media: { image: img("photo-1610701596007-11502861dcfa", 1400) }, settings: { body: "We believe beautiful things shouldn’t cost the earth.\n\n- 100% plastic-free packaging\n- Above-living-wage pay for every maker\n- Carbon-neutral shipping since 2022\n- Refill programme for candle vessels" } }),
      section({ id: "values", type: "whyChooseUs", items: [{ title: "Natural waxes", icon: "leaf" }, { title: "Recycled glass", icon: "recycle" }, { title: "Local makers", icon: "handshake" }, { title: "B Corp certified", icon: "badge-check" }], background: { variant: "muted" } }),
    ],
  }),
  page({ slug: "gallery", title: "Lookbook", sections: [section({ id: "gallery", type: "gallery", layout: "masonry" })] }),
  page({ slug: "faq", title: "Help & FAQ", header: { show: true, breadcrumbs: true, subtitle: "Shipping, returns, care and more." }, sections: [section({ id: "faq", type: "faq" }), section({ id: "contact", type: "ctaBanner", layout: "band", title: "Still need help?", subtitle: "Our customer care team replies within 24 hours.", cta: { label: "Contact us", href: "/contact" } })] }),
  page({ slug: "contact", title: "Contact", header: { show: true, breadcrumbs: true, subtitle: "We’d love to hear from you." }, sections: [section({ id: "contact", type: "contact", layout: "split" })] }),
  page({ slug: "careers", title: "Careers", sections: [section({ id: "jobs", type: "careers" })] }),
  page({ slug: "gift-guide", title: "The Gift Guide", visibility: "hidden", header: { show: true, breadcrumbs: true, subtitle: "Hidden campaign landing page – reachable by URL, excluded from sitemap." }, sections: [section({ id: "offers", type: "offers" }), section({ id: "gifts", type: "productsServices", source: "category:gifts", title: "Gift-ready" })] }),
  ...legalPages({ company: "{company}", email: "hello@maisonlumiere.example", country: "the State of New York, USA", updated: "15 September 2026", shop: true, returnsDays: 30 }),
];
