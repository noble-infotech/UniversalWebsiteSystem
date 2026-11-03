import type { SiteConfigInput } from "@/core/config/schema";

export const navigation: SiteConfigInput["navigation"] = {
  menu: [
    { label: "Home", href: "/" },
    {
      label: "Company",
      href: "/about",
      children: [
        { label: "About us", href: "/about", description: "Our story, leadership and certifications" },
        { label: "Vision & mission", href: "/vision-mission" },
        { label: "Infrastructure", href: "/infrastructure", description: "Plants, lab and equipment" },
        { label: "Careers", href: "/careers", requires: "careers" },
      ],
    },
    {
      label: "Capabilities",
      href: "/services",
      mega: true,
      children: [
        { label: "Contract manufacturing", href: "/services", children: [{ label: "CNC machining", href: "/services/cnc-machining" }, { label: "Closed-die forging", href: "/services/closed-die-forging" }, { label: "Fabrication & welding", href: "/services/fabrication-welding" }] },
        { label: "Engineering services", href: "/services", children: [{ label: "Design for manufacturing", href: "/services/design-for-manufacturing" }] },
        { label: "Supply chain", href: "/services", children: [{ label: "Vendor-managed inventory", href: "/services/vendor-managed-inventory" }] },
      ],
    },
    { label: "Products", href: "/shop", requires: "catalog", children: [{ label: "Machined components", href: "/shop/category/machined-components" }, { label: "Forgings", href: "/shop/category/forgings" }, { label: "Fabrications", href: "/shop/category/fabrications" }, { label: "Assemblies", href: "/shop/category/assemblies" }] },
    { label: "Industries", href: "/industries" },
    { label: "Case studies", href: "/portfolio", requires: "portfolio" },
    { label: "Insights", href: "/blog", requires: "blog" },
    { label: "Contact", href: "/contact" },
  ],
  announcement: { enabled: true, text: "Meet us at Hannover Messe 2027 · Hall 4, Stand C21", link: { label: "Book a meeting", href: "/contact" }, dismissible: true },
  topBar: { enabled: true, showContact: true, showSocial: true },
  icons: { search: true, account: false, wishlist: false, cart: false },
  cta: { label: "Get a quote", href: "/request-quote" },
};
