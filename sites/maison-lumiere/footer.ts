import type { SiteConfigInput } from "@/core/config/schema";

export const footer: SiteConfigInput["footer"] = {
  description: "Objects for slow, beautiful living – designed in Brooklyn, handmade by independent artisans.",
  columns: [
    { title: "Shop", type: "productCategories", limit: 6 },
    { title: "Help", type: "links", links: [{ label: "FAQ", href: "/faq" }, { label: "Track your order", href: "/track-order" }, { label: "Shipping policy", href: "/shipping-policy" }, { label: "Returns & refunds", href: "/returns-policy" }, { label: "Contact", href: "/contact" }] },
    { title: "Maison", type: "links", links: [{ label: "Our story", href: "/about" }, { label: "Sustainability", href: "/sustainability" }, { label: "Journal", href: "/blog" }, { label: "Careers", href: "/careers" }, { label: "My account", href: "/account" }] },
  ],
  paymentIcons: ["visa", "mastercard", "amex", "paypal", "applepay", "gpay"],
  legalLinks: [{ label: "Privacy", href: "/privacy-policy" }, { label: "Terms", href: "/terms" }, { label: "Shipping", href: "/shipping-policy" }, { label: "Returns", href: "/returns-policy" }],
  newsletter: { enabled: false },
};
