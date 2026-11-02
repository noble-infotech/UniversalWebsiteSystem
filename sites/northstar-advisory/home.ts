import { img, section } from "../_shared/helpers";

/** Service-business homepage – authority & lead generation, no shop. */
export const homeSections = [
  section({
    id: "hero",
    type: "hero",
    layout: "minimal",
    eyebrow: "Strategy · Data · AI · Product",
    title: "From ambition to measurable outcomes",
    subtitle: "We unite senior strategists, data scientists and engineers to turn your boldest plans into working software and real P&L impact.",
    cta: { label: "Book a discovery call", href: "/contact" },
    secondaryCta: { label: "See our work", href: "/portfolio" },
    media: { image: img("photo-1522071820081-009f0129c71c", 2400), alt: "Consultants collaborating" },
    settings: { highlights: [{ value: "400+", label: "Engagements" }, { value: "4.2×", label: "Average ROI" }, { value: "72", label: "Client NPS" }] },
  }),
  section({ id: "clients", type: "clients", eyebrow: "Trusted by leaders at", layout: "marquee" }),
  section({ id: "services", type: "productsServices", source: "services", layout: "image", eyebrow: "What we do", title: "Capabilities built for impact", limit: 3, columns: 3, cta: { label: "All services", href: "/services" } }),
  section({ id: "stats", type: "stats", layout: "cards", eyebrow: "Impact", title: "Results our clients can bank", background: { variant: "gradient" } }),
  section({ id: "why", type: "whyChooseUs", layout: "split", eyebrow: "Why Northstar", title: "Consultants who ship", media: { image: img("photo-1600880292203-757bb62b4baf", 1400) }, cta: { label: "Meet the team", href: "/about" } }),
  section({ id: "process", type: "process", layout: "steps", eyebrow: "How we work", title: "A proven path from insight to scale" }),
  section({ id: "work", type: "projects", layout: "featured", eyebrow: "Selected work", title: "Case studies", limit: 3, cta: { label: "All case studies", href: "/portfolio" } }),
  section({ id: "pricing", type: "pricing", source: "service:growth-strategy", eyebrow: "Engagement models", title: "Transparent ways to start", cta: { label: "Talk to a partner", href: "/contact" }, background: { variant: "muted" } }),
  section({ id: "testimonials", type: "testimonials", layout: "carousel", eyebrow: "Client voices", title: "What leaders say" }),
  section({ id: "team", type: "team", eyebrow: "Leadership", title: "Partners who stay hands-on", columns: 4, background: { variant: "muted" } }),
  section({ id: "insights", type: "blog", layout: "featured", eyebrow: "Insights", title: "Thinking from the front line", limit: 3, cta: { label: "All insights", href: "/blog" } }),
  section({ id: "faq", type: "faq", layout: "split", eyebrow: "FAQ", title: "Good questions", cta: { label: "Ask us anything", href: "/contact" } }),
  section({ id: "cta", type: "ctaBanner", layout: "card", eyebrow: "Let’s talk", title: "What would you build with the right team?", subtitle: "A 30-minute call with a partner – no slides, just a candid conversation about your goals.", cta: { label: "Book a discovery call", href: "/contact" }, secondaryCta: { label: "Email us", href: "mailto:hello@northstar.example" } }),
];
