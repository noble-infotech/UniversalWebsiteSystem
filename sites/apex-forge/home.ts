import { img, section } from "../_shared/helpers";

/** Homepage section arrangement – reorder, toggle or restyle without touching code. */
export const homeSections = [
  section({
    id: "hero",
    type: "hero",
    layout: "centered",
    eyebrow: "Since 1994 · ISO 9001 · IATF 16949 · AS9100D",
    title: "Precision parts for industries that can’t afford to fail",
    subtitle: "Forging, CNC machining and fabrication under one roof – trusted by OEMs in 28 countries.",
    media: { image: img("photo-1504917595217-d4dc5ebe6122", 2200), alt: "Welding sparks in fabrication bay" },
    background: { variant: "image", overlay: 0.62 },
    cta: { label: "Request a quote", href: "/request-quote" },
    secondaryCta: { label: "Explore capabilities", href: "/services" },
    settings: { highlights: [{ value: "±5 µm", label: "Tolerance" }, { value: "98.7%", label: "On-time delivery" }, { value: "0 ppm", label: "Key accounts" }] },
  }),
  section({ id: "clients", type: "clients", eyebrow: "Trusted by engineering leaders worldwide", layout: "marquee", background: { variant: "muted" } }),
  section({ id: "about", type: "about", layout: "image-left", eyebrow: "Who we are", title: "Three decades of engineering integrity", cta: { label: "Our story", href: "/about" } }),
  section({ id: "stats", type: "stats", layout: "band", title: "{brand} in numbers", background: { variant: "primary" } }),
  section({ id: "capabilities", type: "whatWeDo", layout: "image-cards", eyebrow: "Capabilities", title: "Forge-to-finish manufacturing", subtitle: "One accountable partner from raw material to tested assembly.", cta: { label: "All services", href: "/services" } }),
  section({ id: "categories", type: "productCategories", layout: "tiles", eyebrow: "Product range", title: "Components we manufacture", limit: 4 }),
  section({ id: "featured", type: "productsServices", source: "featured", eyebrow: "Featured", title: "Flagship product families", limit: 4, cta: { label: "Browse catalogue", href: "/shop" }, background: { variant: "muted" } }),
  section({ id: "why", type: "whyChooseUs", layout: "grid", eyebrow: "Why {brand}", title: "Built for zero-defect supply", columns: 3 }),
  section({ id: "infrastructure", type: "infrastructure", layout: "image-cards", eyebrow: "Infrastructure", title: "42,000 m² of modern manufacturing", columns: 4, background: { variant: "dark" } }),
  section({ id: "process", type: "process", layout: "steps", eyebrow: "How we work", title: "From RFQ to delivery", cta: { label: "Start your RFQ", href: "/request-quote" } }),
  section({ id: "certifications", type: "partners", eyebrow: "Quality", title: "Certified to global standards", background: { variant: "muted" } }),
  section({ id: "projects", type: "projects", layout: "featured", eyebrow: "Case studies", title: "Engineering results that ship", limit: 3, cta: { label: "View portfolio", href: "/portfolio" } }),
  section({ id: "testimonials", type: "testimonials", layout: "spotlight", background: { variant: "muted" } }),
  section({ id: "events", type: "events", eyebrow: "Meet us", title: "Events & announcements", limit: 3 }),
  section({ id: "faq", type: "faq", layout: "split", eyebrow: "FAQ", title: "Questions from buyers", limit: 5, cta: { label: "Contact sales", href: "/contact" } }),
  section({ id: "insights", type: "blog", eyebrow: "Insights", title: "From our engineers", limit: 3, cta: { label: "All articles", href: "/blog" }, background: { variant: "muted" } }),
  section({ id: "cta", type: "ctaBanner", layout: "card", title: "Have a drawing? Get a quote in 72 hours.", subtitle: "Send us your RFQ – our engineers will respond with DFM feedback and pricing.", cta: { label: "Request a quote", href: "/request-quote" }, media: { image: img("photo-1567789884554-0b844b597180", 1800) } }),
];
