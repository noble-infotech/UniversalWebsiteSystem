import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const company: SiteConfigInput["company"] = {
  name: "Northstar Advisory",
  brandName: "Northstar",
  legalName: "Northstar Advisory Group Ltd.",
  logo: { primary: "/sites/northstar-advisory/logo.svg", secondary: "/sites/northstar-advisory/logo-light.svg", favicon: "/sites/northstar-advisory/favicon.svg", height: 34 },
  tagline: "Strategy, data & digital transformation for ambitious companies.",
  description: "Northstar is a strategy and technology consultancy helping mid-market and enterprise leaders turn data and AI into measurable growth.",
  established: 2012,
  industry: "Professional Services",
  category: "Management & technology consulting",
  headOffice: { label: "London HQ", line1: "30 Finsbury Square", city: "London", postalCode: "EC2A 1AG", country: "United Kingdom", hours: "Mon–Fri · 9:00 – 18:00 GMT" },
  branches: [
    { label: "Singapore", line1: "8 Marina View, Asia Square Tower 1", city: "Singapore", postalCode: "018960", country: "Singapore" },
    { label: "New York", line1: "245 Park Avenue", city: "New York", region: "NY", postalCode: "10167", country: "United States" },
  ],
  phones: [{ label: "London", number: "+44 20 7946 0321" }, { label: "Singapore", number: "+65 6800 1212" }],
  emails: [{ label: "New business", address: "hello@northstar.example" }, { label: "Press", address: "press@northstar.example" }],
  websiteUrl: "https://northstar.example",
  social: { linkedin: "https://linkedin.com/company/example", x: "https://x.com/example", youtube: "https://youtube.com/@example" },
  map: { embedUrl: "https://www.google.com/maps?q=Finsbury+Square+London&output=embed" },
};

export const story: SiteConfigInput["story"] = {
  about: "{brand} was founded by former strategy partners and engineers who were tired of decks that never shipped. We pair senior strategists with data scientists and product engineers so recommendations turn into working software – and measurable P&L impact – within quarters, not years.",
  aboutImage: img("photo-1522071820081-009f0129c71c"),
  history: "Since 2012 we have delivered 400+ engagements across financial services, retail, healthcare and industrials, growing to 180 consultants across London, Singapore and New York.",
  vision: "A world where every organisation makes decisions with clarity, confidence and data.",
  mission: "Guide leaders from ambition to measurable outcomes by uniting strategy, data and engineering in one team.",
  values: [
    { title: "Outcomes over output", description: "We measure success in your KPIs, not our billable hours.", icon: "target" },
    { title: "Radical candour", description: "Honest advice, even when it’s uncomfortable.", icon: "chat" },
    { title: "Build, don’t just advise", description: "Every strategy ships with working software.", icon: "code" },
  ],
  leadership: [
    { name: "Eleanor Hughes", role: "Managing Partner", image: img("photo-1573496359142-b8d87734a5a2", 600), bio: "Ex-strategy partner; 20 years advising FTSE 100 boards.", social: { linkedin: "https://linkedin.com" } },
    { name: "Arjun Mehta", role: "Partner, Data & AI", image: img("photo-1507003211169-0a1dd7228f2d", 600), bio: "PhD in machine learning; built ML platforms at scale.", social: { linkedin: "https://linkedin.com" } },
    { name: "Lena Fischer", role: "Partner, Digital Product", image: img("photo-1531746020798-e6953c6e8e04", 600), social: { linkedin: "https://linkedin.com" } },
    { name: "David Chen", role: "Head of APAC", image: img("photo-1472099645785-5658abf4ff4e", 600), social: { linkedin: "https://linkedin.com" } },
  ],
  milestones: [
    { year: "2012", title: "Founded in London" },
    { year: "2016", title: "Data & AI practice launched" },
    { year: "2019", title: "Singapore office opens" },
    { year: "2023", title: "New York office opens" },
  ],
  achievements: [
    { title: "Top 10 Data Consultancy", description: "Industry analyst ranking, 2025", icon: "trophy" },
    { title: "Great Place to Work", description: "Four years running", icon: "smile" },
  ],
  certifications: [{ name: "ISO 27001", issuer: "BSI" }, { name: "AWS Advanced Partner" }, { name: "Microsoft Solutions Partner" }],
  awards: [{ name: "Consultancy of the Year – Data", issuer: "Management Consulting Awards", year: "2025" }],
  stats: [
    { label: "Client engagements", value: 400, suffix: "+", icon: "briefcase" },
    { label: "Avg. ROI delivered", value: 4.2, suffix: "×", icon: "trending" },
    { label: "Consultants & engineers", value: 180, icon: "users" },
    { label: "Client NPS", value: 72, icon: "smile" },
  ],
};

export const business: SiteConfigInput["business"] = {
  model: "B2B",
  types: ["service-provider"],
  categories: ["Strategy", "Data & AI", "Digital product"],
  targetAudience: ["CEOs & COOs", "Chief Data Officers", "PE portfolio companies"],
  usps: [],
  advantages: [
    { title: "Strategists who ship", description: "Senior advisors and engineers in one squad – no hand-offs.", icon: "rocket" },
    { title: "Outcome-based pricing", description: "Up to 30% of fees tied to the KPIs we agree upfront.", icon: "target" },
    { title: "Accelerators, not slideware", description: "20+ proven data & AI accelerators cut time-to-value by 40%.", icon: "zap" },
    { title: "Secure by design", description: "ISO 27001 certified with SOC 2-aligned controls.", icon: "lock" },
  ],
  serviceAreas: ["United Kingdom", "European Union", "United States", "Singapore", "Australia"],
};
