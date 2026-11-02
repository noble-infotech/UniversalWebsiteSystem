import type { SiteConfigInput } from "@/core/config/schema";

export const navigation: SiteConfigInput["navigation"] = {
  menu: [
    { label: "Services", href: "/services", children: [
      { label: "Strategy & transformation", href: "/services", children: [{ label: "Growth strategy", href: "/services/growth-strategy" }, { label: "Operating model", href: "/services/operating-model" }] },
      { label: "Data & AI", href: "/services", children: [{ label: "Modern data platforms", href: "/services/data-platform" }, { label: "Applied AI & GenAI", href: "/services/applied-ai" }] },
      { label: "Digital product", href: "/services", children: [{ label: "Product studio", href: "/services/digital-product" }, { label: "Cyber resilience", href: "/services/cyber-resilience" }] },
    ] },
    { label: "Industries", href: "/industries" },
    { label: "Work", href: "/portfolio" },
    { label: "Insights", href: "/blog" },
    { label: "About", href: "/about", children: [{ label: "About us", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Events", href: "/events" }] },
  ],
  icons: { search: true, account: false, wishlist: false, cart: false },
  cta: { label: "Let’s talk", href: "/contact" },
};
