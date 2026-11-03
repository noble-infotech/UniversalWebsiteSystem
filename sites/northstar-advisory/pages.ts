import type { SiteConfigInput } from "@/core/config/schema";
import { img, page, section, legalPages } from "../_shared/helpers";
import { homeSections } from "./home";

export const pages: SiteConfigInput["pages"] = [
  page({ slug: "", title: "Home", sections: homeSections, seo: { title: "Strategy, Data & AI Consulting", description: "Northstar unites strategy, data science and engineering to deliver measurable outcomes." } }),
  page({
    slug: "about",
    title: "About",
    header: { show: true, breadcrumbs: true, subtitle: "Strategists, scientists and engineers – one team.", image: img("photo-1497366216548-37526070297c", 2000) },
    sections: [
      section({ id: "about", type: "about", layout: "centered", eyebrow: "Who we are", title: "Built to close the gap between strategy and execution" }),
      section({ id: "vm", type: "visionMission", eyebrow: "Purpose", title: "Vision, mission & values", background: { variant: "muted" } }),
      section({ id: "stats", type: "stats", layout: "band", background: { variant: "secondary" } }),
      section({ id: "team", type: "team", layout: "cards", title: "Leadership" }),
      section({ id: "story", type: "story", layout: "timeline", title: "Our journey", background: { variant: "muted" } }),
      section({ id: "achievements", type: "achievements", title: "Recognition" }),
      section({ id: "partners", type: "partners", title: "Certifications & alliances", background: { variant: "muted" } }),
    ],
  }),
  page({ slug: "services", title: "Services", header: { show: true, breadcrumbs: true, subtitle: "Strategy, data & AI and digital product – delivered by one team." }, sections: [section({ id: "list", type: "serviceList", layout: "grouped" }), section({ id: "process", type: "process", layout: "vertical", title: "How every engagement runs", background: { variant: "muted" } }), section({ id: "cta", type: "ctaBanner", title: "Not sure where to start?", cta: { label: "Book a discovery call", href: "/contact" } })] }),
  page({ slug: "portfolio", title: "Case studies", header: { show: true, breadcrumbs: true, subtitle: "Outcomes, not outputs." }, sections: [section({ id: "projects", type: "projects", layout: "grid", columns: 2 }), section({ id: "t", type: "testimonials", layout: "grid", title: "In their words", background: { variant: "muted" } })] }),
  page({ slug: "industries", title: "Industries", sections: [section({ id: "ind", type: "whatWeDo", layout: "list", title: "Sectors we know deeply", items: [{ title: "Financial services", description: "Banking, insurance and wealth.", icon: "wallet" }, { title: "Retail & consumer", description: "Omnichannel, pricing and supply chain.", icon: "bag" }, { title: "Healthcare", description: "Providers, payers and life sciences.", icon: "health" }, { title: "Energy & industrials", description: "Asset performance and energy transition.", icon: "bolt" }] })] }),
  page({ slug: "careers", title: "Careers", header: { show: true, breadcrumbs: true, subtitle: "Do the best work of your career with people who care.", image: img("photo-1517245386807-bb43f82c33c4", 2000) }, sections: [section({ id: "values", type: "visionMission" }), section({ id: "jobs", type: "careers", title: "Open roles", background: { variant: "muted" } })] }),
  page({ slug: "events", title: "Events", sections: [section({ id: "events", type: "events" })] }),
  page({ slug: "faq", title: "FAQ", sections: [section({ id: "faq", type: "faq" })] }),
  page({ slug: "contact", title: "Contact", header: { show: true, breadcrumbs: true, subtitle: "Tell us about your goals – a partner will respond within one business day." }, sections: [section({ id: "contact", type: "contact", layout: "split", settings: { form: "enquiry", formTitle: "Start a conversation" } })] }),
  page({ slug: "request-quote", title: "Request a proposal", sections: [section({ id: "q", type: "quoteForm", title: "Request a proposal", settings: { benefits: ["Partner-led response within 1 business day", "Scoped proposal within a week", "Outcome-based pricing available"] } })] }),
  ...legalPages({ company: "Northstar Advisory Group Ltd.", email: "privacy@northstar.example", country: "England and Wales", updated: "1 August 2026", shop: false }),
];
