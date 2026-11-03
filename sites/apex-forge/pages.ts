import type { SiteConfigInput } from "@/core/config/schema";
import { img, page, section, legalPages } from "../_shared/helpers";
import { homeSections } from "./home";

export const pages: SiteConfigInput["pages"] = [
  page({ slug: "", title: "Home", sections: homeSections, seo: { title: "Precision Forging & CNC Machining Manufacturer", description: "ISO-certified manufacturer of forged, machined and fabricated components for automotive, energy and aerospace OEMs." } }),
  page({
    slug: "about",
    title: "About us",
    header: { show: true, breadcrumbs: true, subtitle: "Engineering integrity since 1994.", image: img("photo-1567789884554-0b844b597180", 2000) },
    sections: [
      section({ id: "about", type: "about", layout: "image-right", eyebrow: "Our company", title: "Who we are" }),
      section({ id: "story", type: "story", layout: "timeline", eyebrow: "Since 1994", title: "Our journey", background: { variant: "muted" } }),
      section({ id: "vm", type: "visionMission", layout: "cards", eyebrow: "Purpose", title: "Vision, mission & values" }),
      section({ id: "team", type: "team", layout: "founder", eyebrow: "Leadership", title: "The people behind the parts", background: { variant: "muted" } }),
      section({ id: "achievements", type: "achievements", eyebrow: "Recognition", title: "Achievements & awards" }),
      section({ id: "stats", type: "stats", layout: "band" }),
      section({ id: "certs", type: "partners", title: "Certifications & technology partners" }),
    ],
    seo: { description: "Learn about {name} – 30+ years of precision manufacturing, leadership team and certifications." },
  }),
  page({
    slug: "vision-mission",
    title: "Vision & Mission",
    sections: [section({ id: "vm", type: "visionMission", layout: "split" }), section({ id: "why", type: "whyChooseUs", layout: "list", title: "How we live our values", background: { variant: "muted" } })],
  }),
  page({
    slug: "industries",
    title: "Industries we serve",
    header: { show: true, breadcrumbs: true, subtitle: "Custom page built purely from configuration." },
    sections: [
      section({
        id: "industries",
        type: "whatWeDo",
        layout: "image-cards",
        columns: 2,
        items: [
          { title: "Automotive & EV", description: "Powertrain, chassis and e-axle components with PPAP Level 3.", image: img("photo-1581091226825-a6a2a5aee158", 1000) },
          { title: "Energy & oil-and-gas", description: "NACE-compliant flanges, valve bodies and skids.", image: img("photo-1530124566582-a618bc2615dc", 1000) },
          { title: "Aerospace", description: "AS9100 titanium and high-strength steel machined parts.", image: img("photo-1517976487492-5750f3195933", 1000) },
          { title: "Heavy equipment & rail", description: "Large forgings and fabricated structures.", image: img("photo-1513828583688-c52646db42da", 1000) },
        ],
      }),
      section({ id: "cta", type: "ctaBanner", layout: "band", title: "Not sure we fit your application?", subtitle: "Talk to an application engineer.", cta: { label: "Contact us", href: "/contact" } }),
    ],
  }),
  page({ slug: "infrastructure", title: "Manufacturing & infrastructure", header: { show: true, breadcrumbs: true, image: img("photo-1504917595217-d4dc5ebe6122", 2000) }, sections: [section({ id: "infra", type: "infrastructure", layout: "split", title: "Our facilities", media: { image: img("photo-1567789884554-0b844b597180", 1400) } }), section({ id: "gallery", type: "gallery", layout: "grid", title: "Inside our plants", background: { variant: "muted" } })] }),
  page({ slug: "gallery", title: "Gallery", sections: [section({ id: "gallery", type: "gallery", layout: "masonry", settings: { filter: true } })] }),
  page({ slug: "portfolio", title: "Case studies", header: { show: true, breadcrumbs: true, subtitle: "Real programmes, measurable outcomes." }, sections: [section({ id: "projects", type: "projects", layout: "grid", columns: 3 }), section({ id: "testimonials", type: "testimonials", layout: "grid", title: "Client feedback", background: { variant: "muted" } })] }),
  page({ slug: "careers", title: "Careers", header: { show: true, breadcrumbs: true, subtitle: "Build what moves the world.", image: img("photo-1581092160562-40aa08e78837", 2000) }, sections: [section({ id: "values", type: "visionMission", title: "Life at {brand}" }), section({ id: "jobs", type: "careers", eyebrow: "Join us", title: "Open positions", background: { variant: "muted" } })] }),
  page({ slug: "faq", title: "FAQ", sections: [section({ id: "faq", type: "faq" })] }),
  page({ slug: "contact", title: "Contact us", header: { show: true, breadcrumbs: true, subtitle: "Sales, export and engineering support." }, sections: [section({ id: "contact", type: "contact", layout: "split", settings: { form: "enquiry", formTitle: "Send an enquiry" } })] }),
  page({ slug: "request-quote", title: "Request a quotation", header: { show: true, breadcrumbs: true, subtitle: "Send drawings and requirements – we reply within 72 hours." }, sections: [section({ id: "quote", type: "quoteForm", settings: { benefits: ["DFM feedback with every quote", "NDA signed on request", "Quote within 72 hours", "Samples in as little as 10 days"] } })] }),
  ...legalPages({ company: "{company}", email: "legal@apexforge.example", country: "India", updated: "1 October 2026", shop: false }),
];
