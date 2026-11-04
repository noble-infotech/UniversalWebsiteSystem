import type { SiteConfigInput } from "@/core/config/schema";

export const footer: SiteConfigInput["footer"] = {
  description: "Strategy, data & AI and digital product – delivered by one team. London · Singapore · New York.",
  columns: [
    { title: "Services", type: "services", limit: 4 },
    { title: "Company", type: "links", links: [{ label: "About", href: "/about" }, { label: "Case studies", href: "/portfolio" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
    { title: "Get in touch", type: "contact" },
  ],
  legalLinks: [{ label: "Privacy", href: "/privacy-policy" }, { label: "Terms", href: "/terms" }],
  copyright: "© {year} {company}. Registered in England & Wales.",
  newsletter: { enabled: true, title: "The {brand} Brief", text: "Monthly insights on strategy, data and AI for leaders." },
};
