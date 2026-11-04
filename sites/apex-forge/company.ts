import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const company: SiteConfigInput["company"] = {
  name: "Apex Forge Industries",
  brandName: "Apex Forge",
  legalName: "Apex Forge Industries Pvt. Ltd.",
  logo: { primary: "/sites/apex-forge/logo.svg", secondary: "/sites/apex-forge/logo-light.svg", favicon: "/sites/apex-forge/favicon.svg", height: 38 },
  tagline: "Precision-engineered components for industries that can’t afford to fail.",
  description: "ISO-certified manufacturer of precision-machined, forged and fabricated metal components for automotive, energy, aerospace and heavy-equipment OEMs worldwide.",
  established: 1994,
  industry: "Industrial Manufacturing",
  category: "Precision engineering & metal components",
  registration: { number: "U28910MH1994PTC081234", taxId: "27AABCA1234F1Z5", other: [{ label: "IEC", value: "0394012345" }] },
  headOffice: { label: "Headquarters & Plant 1", line1: "Plot 42, MIDC Industrial Area", line2: "Chakan Phase II", city: "Pune", region: "Maharashtra", postalCode: "410501", country: "India", hours: "Mon–Sat · 8:30 – 18:00 IST" },
  branches: [
    { label: "Plant 2 – Forging", line1: "Survey 118, Ranjangaon MIDC", city: "Pune", region: "Maharashtra", postalCode: "412220", country: "India" },
    { label: "European Sales Office", line1: "Königsallee 61", city: "Düsseldorf", postalCode: "40215", country: "Germany" },
  ],
  phones: [{ label: "Sales", number: "+91 20 4000 1994" }, { label: "Export desk", number: "+49 211 555 0194" }],
  emails: [{ label: "Sales enquiries", address: "sales@apexforge.example" }, { label: "Careers", address: "careers@apexforge.example" }],
  websiteUrl: "https://apexforge.example",
  social: { linkedin: "https://linkedin.com/company/example", youtube: "https://youtube.com/@example", x: "https://x.com/example" },
  map: { embedUrl: "https://www.google.com/maps?q=Chakan+MIDC+Pune&output=embed", lat: 18.76, lng: 73.86 },
};

export const story: SiteConfigInput["story"] = {
  about: "For three decades {brand} has turned raw steel, aluminium and specialty alloys into mission-critical components. From a single CNC lathe in 1994 to three plants and 600+ engineers today, we combine forging, precision machining and in-house metallurgy under one roof – so OEMs get tighter tolerances, shorter lead times and one accountable partner.",
  aboutImage: img("photo-1504917595217-d4dc5ebe6122"),
  history: "Founded by mechanical engineer Rajesh Kulkarni with a single lathe and a commitment to zero-defect parts, {brand} grew alongside India’s automotive boom and now exports to 28 countries.",
  vision: "To be the world’s most trusted precision-component partner, recognised for engineering integrity and sustainable manufacturing.",
  mission: "Deliver zero-defect components on time, every time – through disciplined processes, continuous innovation and people who take pride in their craft.",
  values: [
    { title: "Precision", description: "Microns matter. We measure everything twice.", icon: "ruler" },
    { title: "Integrity", description: "Transparent pricing, honest timelines, full traceability.", icon: "shield-check" },
    { title: "Safety", description: "Zero-harm culture across every shift and site.", icon: "health" },
    { title: "Sustainability", description: "38% of plant energy now comes from on-site solar.", icon: "leaf" },
  ],
  leadership: [
    { name: "Rajesh Kulkarni", role: "Founder & Chairman", image: img("photo-1560250097-0b93528c311a", 600), bio: "Mechanical engineer with 35 years in precision manufacturing.", social: { linkedin: "https://linkedin.com" } },
    { name: "Ananya Rao", role: "Managing Director", image: img("photo-1573496359142-b8d87734a5a2", 600), bio: "Led the expansion into aerospace and EU markets.", social: { linkedin: "https://linkedin.com" } },
    { name: "Markus Weber", role: "Head of European Operations", image: img("photo-1519085360753-af0119f7cbe7", 600), social: { linkedin: "https://linkedin.com" } },
    { name: "Priya Shah", role: "VP Quality & Metallurgy", image: img("photo-1580489944761-15a19d654956", 600), social: { linkedin: "https://linkedin.com" } },
  ],
  founder: { name: "Rajesh Kulkarni", role: "Founder & Chairman", image: img("photo-1560250097-0b93528c311a", 800), quote: "A component is only as good as the discipline behind it. We built {brand} on that discipline.", bio: "Rajesh founded {brand} in 1994 after a decade in automotive tooling." },
  milestones: [
    { year: "1994", title: "Founded in Pune", description: "First CNC turning cell supplying local tier-2 auto suppliers." },
    { year: "2003", title: "ISO 9001 & first export", description: "Began supplying drivetrain parts to a German OEM." },
    { year: "2011", title: "Forging plant commissioned", description: "2,500-ton press line enables closed-die forging in-house." },
    { year: "2018", title: "AS9100 aerospace certification", description: "Entered aerospace with landing-gear machined parts." },
    { year: "2022", title: "Düsseldorf sales office", description: "Local engineering support for European customers." },
    { year: "2025", title: "2 MW rooftop solar", description: "Major step toward carbon-neutral manufacturing by 2030." },
  ],
  achievements: [
    { title: "Zero-ppm supplier award", description: "Three consecutive years with zero rejected parts at a global tier-1.", icon: "trophy" },
    { title: "98.7% on-time delivery", description: "Rolling 24-month OTD across 1,200+ active part numbers.", icon: "timer" },
    { title: "Export excellence", description: "Recognised by EEPC for outstanding engineering exports.", icon: "globe" },
  ],
  certifications: [
    { name: "ISO 9001:2015", issuer: "TÜV SÜD", year: "2003" },
    { name: "IATF 16949", issuer: "TÜV SÜD", year: "2009" },
    { name: "AS9100D", issuer: "Bureau Veritas", year: "2018" },
    { name: "ISO 14001:2015", issuer: "DNV", year: "2020" },
  ],
  awards: [
    { name: "Supplier of the Year – Powertrain", issuer: "Global Tier-1 Automotive", year: "2024" },
    { name: "EEPC Export Award (Gold)", issuer: "EEPC India", year: "2023" },
    { name: "Best Green Factory", issuer: "CII", year: "2025" },
  ],
  stats: [
    { label: "Years of engineering", value: 31, suffix: "+", icon: "calendar" },
    { label: "Components shipped / year", value: 12, suffix: "M", icon: "boxes" },
    { label: "Countries served", value: 28, icon: "globe" },
    { label: "Engineers & technicians", value: 640, suffix: "+", icon: "users" },
  ],
};

export const business: SiteConfigInput["business"] = {
  model: "B2B",
  types: ["manufacturer", "exporter"],
  categories: ["Precision machining", "Closed-die forging", "Fabrication", "Assemblies"],
  targetAudience: ["Automotive OEMs & tier-1s", "Energy & oil-and-gas", "Aerospace", "Heavy equipment"],
  usps: [
    { title: "Forge-to-finish under one roof", icon: "factory" },
    { title: "In-house metallurgy lab", icon: "microscope" },
    { title: "PPAP & FAI documentation", icon: "badge-check" },
    { title: "Global logistics & VMI", icon: "truck" },
  ],
  advantages: [
    { title: "Tolerances to ±5 µm", description: "5-axis machining centres with in-process probing and climate-controlled CMM rooms.", icon: "ruler" },
    { title: "Rapid prototyping", description: "First articles in as little as 10 days from approved drawings.", icon: "rocket" },
    { title: "Full traceability", description: "Heat-number traceability from raw material to dispatch on every part.", icon: "shield-check" },
    { title: "Scalable capacity", description: "From 50-piece pilot runs to 1M+ annual volumes across 3 plants.", icon: "trending" },
    { title: "Engineering partnership", description: "DFM reviews that typically cut part cost 8–15%.", icon: "handshake" },
    { title: "Sustainable production", description: "Solar-powered plants and closed-loop coolant recycling.", icon: "leaf" },
  ],
  serviceAreas: ["India", "Germany", "European Union", "United States", "Japan", "Middle East"],
};
