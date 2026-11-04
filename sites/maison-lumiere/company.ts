import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const company: SiteConfigInput["company"] = {
  name: "Maison Lumière",
  brandName: "Maison Lumière",
  legalName: "Maison Lumière Living LLC",
  logo: { primary: "/sites/maison-lumiere/logo.svg", secondary: "/sites/maison-lumiere/logo-light.svg", favicon: "/sites/maison-lumiere/favicon.svg", height: 40 },
  tagline: "Objects for slow, beautiful living.",
  description: "Hand-poured candles, small-batch ceramics, natural linens and thoughtful gifts – designed in Brooklyn, made by independent artisans.",
  established: 2016,
  industry: "Retail & E-commerce",
  category: "Home décor, lifestyle & gifts",
  headOffice: { label: "Flagship studio", line1: "214 Wythe Avenue", city: "Brooklyn", region: "NY", postalCode: "11249", country: "United States", hours: "Daily 10:00 – 19:00" },
  branches: [{ label: "Los Angeles store", line1: "8451 Melrose Place", city: "Los Angeles", region: "CA", postalCode: "90069", country: "United States", hours: "Tue–Sun 11:00 – 18:00" }],
  phones: [{ label: "Customer care", number: "+1 (718) 555 0142" }],
  emails: [{ label: "Customer care", address: "hello@maisonlumiere.example" }, { label: "Wholesale", address: "trade@maisonlumiere.example" }],
  websiteUrl: "https://maisonlumiere.example",
  social: { instagram: "https://instagram.com/example", pinterest: "https://pinterest.com/example", tiktok: "https://tiktok.com/@example", facebook: "https://facebook.com/example" },
  map: { embedUrl: "https://www.google.com/maps?q=Wythe+Avenue+Brooklyn&output=embed" },
};

export const story: SiteConfigInput["story"] = {
  about: "{brand} began at a kitchen table with a single soy candle and a belief that the objects we live with should be made slowly, honestly and beautifully. Today we partner with 40+ independent makers to bring you pieces that feel personal – never mass-produced.",
  aboutImage: img("photo-1513506003901-1e6a229e2d15"),
  history: "Founded by designer Claire Moreau in 2016, {brand} grew from a weekend market stall in Brooklyn into a beloved online destination shipping to 30 countries – while still pouring every candle by hand.",
  vision: "A home filled with fewer, better things – each with a story worth telling.",
  mission: "Champion independent makers and natural materials, and make considered living accessible to everyone.",
  values: [
    { title: "Made by hand", description: "Every candle hand-poured, every vase thrown on a wheel.", icon: "heart" },
    { title: "Natural materials", description: "Soy & coconut wax, linen, stoneware – nothing synthetic.", icon: "leaf" },
    { title: "Fair to makers", description: "Our artisans earn above living wage, always.", icon: "handshake" },
    { title: "Plastic-free", description: "Recyclable, compostable packaging since day one.", icon: "recycle" },
  ],
  leadership: [
    { name: "Claire Moreau", role: "Founder & Creative Director", image: img("photo-1494790108377-be9c29b29330", 600) },
    { name: "Daniel Okafor", role: "Head of Product", image: img("photo-1507003211169-0a1dd7228f2d", 600) },
    { name: "Mei Tanaka", role: "Ceramics Lead", image: img("photo-1438761681033-6461ffad8d80", 600) },
  ],
  founder: { name: "Claire Moreau", role: "Founder", image: img("photo-1494790108377-be9c29b29330", 800), quote: "I wanted to make things that slow you down – the ritual of lighting a candle, the weight of a handmade mug." },
  milestones: [
    { year: "2016", title: "First candle poured", description: "Sold out at the Brooklyn Flea in four hours." },
    { year: "2018", title: "Online store launches" },
    { year: "2021", title: "Ceramics studio opens" },
    { year: "2024", title: "Los Angeles flagship" },
  ],
  achievements: [],
  certifications: [{ name: "Certified B Corporation", year: "2023" }, { name: "Climate Neutral Certified", year: "2024" }],
  awards: [{ name: "Best Home Fragrance", issuer: "Design Living Awards", year: "2025" }],
  stats: [
    { label: "Happy customers", value: 120, suffix: "k+" },
    { label: "Independent makers", value: 42 },
    { label: "Five-star reviews", value: 18, suffix: "k" },
    { label: "Countries shipped", value: 30 },
  ],
};

export const business: SiteConfigInput["business"] = {
  model: "D2C",
  types: ["retailer"],
  categories: ["Home fragrance", "Ceramics", "Linen", "Gifts"],
  targetAudience: ["Design-conscious homeowners", "Gift shoppers", "Interior stylists"],
  usps: [{ title: "Free shipping over $75", icon: "truck" }, { title: "30-day easy returns", icon: "returns" }, { title: "Hand-made by artisans", icon: "heart" }, { title: "Plastic-free packaging", icon: "leaf" }],
  advantages: [],
  serviceAreas: ["United States", "Canada", "United Kingdom", "European Union", "Australia"],
};
