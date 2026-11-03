import type { SiteConfigInput } from "@/core/config/schema";

export const footer: SiteConfigInput["footer"] = {
  description: "Precision forging, CNC machining and fabrication for automotive, energy and aerospace OEMs since 1994.",
  columns: [
    { title: "Company", type: "links", links: [{ label: "About us", href: "/about" }, { label: "Infrastructure", href: "/infrastructure" }, { label: "Careers", href: "/careers" }, { label: "Case studies", href: "/portfolio" }, { label: "Gallery", href: "/gallery" }] },
    { title: "Capabilities", type: "services", limit: 5 },
    { title: "Products", type: "links", links: [{ label: "Product catalogue", href: "/shop" }, { label: "Machined components", href: "/shop/category/machined-components" }, { label: "Forgings", href: "/shop/category/forgings" }, { label: "Request a quote", href: "/request-quote" }] },
    { title: "Contact", type: "contact" },
  ],
  legalLinks: [{ label: "Privacy policy", href: "/privacy-policy" }, { label: "Terms", href: "/terms" }],
  copyright: "© {year} {company}. CIN U28910MH1994PTC081234.",
  newsletter: { enabled: true, title: "Engineering insights, quarterly", text: "Case studies, materials guides and event invitations. No spam." },
};
