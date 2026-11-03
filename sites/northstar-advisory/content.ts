import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const content: SiteConfigInput["content"] = {
  whatWeDo: [],
  whyChooseUs: [],
  process: [
    { title: "Discover", description: "Interviews, data audit and value-at-stake sizing." },
    { title: "Design", description: "Target state, roadmap and business case." },
    { title: "Deliver", description: "Squads ship in six-week increments." },
    { title: "Scale", description: "Enablement and handover to your teams." },
  ],
  infrastructure: [],
  testimonials: [
    { quote: "{brand} didn’t just tell us what to do – they sat with our teams and built it. Our forecasting accuracy improved 31% in two quarters.", author: "Rachel Adeyemi", role: "COO", company: "Meridian Retail Group", rating: 5 },
    { quote: "The most senior, hands-on consulting team we’ve worked with. They tied their fees to our outcomes and over-delivered.", author: "Jonas Lindqvist", role: "CFO", company: "Nordvik Insurance", rating: 5 },
    { quote: "From strategy to a live GenAI assistant used by 3,000 agents in under six months.", author: "Priya Natarajan", role: "Chief Digital Officer", company: "Helios Health", rating: 5 },
  ],
  faqs: [
    { question: "What size of companies do you work with?", answer: "Mostly mid-market and enterprise organisations with revenue from £50m to £10bn, plus PE portfolio companies.", category: "General" },
    { question: "How do you price engagements?", answer: "Fixed-fee sprints for diagnostics, and a blend of fixed and outcome-based fees for delivery.", category: "Commercial" },
    { question: "Can you work alongside our existing vendors?", answer: "Absolutely. We are technology-agnostic and frequently orchestrate multi-vendor programmes.", category: "General" },
    { question: "Where are your teams based?", answer: "London, Singapore and New York, with nearshore engineering hubs in Lisbon and Kraków.", category: "General" },
  ],
  posts: [
    { slug: "genai-roi", title: "Where GenAI actually pays back: lessons from 40 deployments", excerpt: "Three patterns separate the 20% of GenAI projects that create value from the rest.", body: "Most GenAI pilots never reach production. Across 40 deployments we found three patterns.\n\n## 1. Start with a workflow, not a model\nValue comes from redesigning work.\n\n## 2. Evaluate relentlessly\nAutomated evaluation sets are non-negotiable.\n\n## 3. Measure business KPIs\n- Handle time\n- Conversion\n- Cost to serve", cover: img("photo-1555066931-4365d14bab8c", 1400), author: "Arjun Mehta", date: "2026-10-12", category: "AI", tags: ["ai", "genai"] },
    { slug: "data-products", title: "Data products: the operating model behind trustworthy metrics", excerpt: "Why owning data like a product beats centralised data teams.", body: "Data products give each domain clear ownership of the data it produces.\n\n## What changes\n- Ownership moves to domains\n- Platform teams provide paved roads", cover: img("photo-1551288049-bebda4e38f71", 1400), author: "Lena Fischer", date: "2026-08-03", category: "Data", tags: ["data"] },
    { slug: "board-strategy", title: "The one-page strategy every board should demand", excerpt: "Clarity beats completeness. Our template for strategic focus.", body: "Great strategies fit on one page.\n\n## The five questions\n- Where will we play?\n- How will we win?\n- What capabilities do we need?\n- What will we stop doing?\n- How will we measure progress?", cover: img("photo-1552664730-d307ca884978", 1400), author: "Eleanor Hughes", date: "2026-06-18", category: "Strategy", tags: ["strategy"] },
  ],
  events: [{ title: "Webinar: Scaling GenAI safely", date: "2026-11-20", location: "Online", description: "Live session with our Data & AI partners.", type: "event", href: "/contact" }],
  offers: [],
  gallery: [],
  projects: [
    { slug: "meridian-forecasting", title: "AI demand forecasting for 1,200 stores", client: "Meridian Retail Group", category: "Data & AI", year: "2025", summary: "Cut stock-outs 28% and waste 19% with ML-driven forecasting.", challenge: "Spreadsheet-based forecasting couldn’t cope with promotions and weather volatility.", solution: "A gradient-boosting forecasting engine on a new lakehouse platform, embedded in planners’ daily workflow.", results: ["31% better forecast accuracy", "£42m annual working-capital release", "Live in 5 months"], image: img("photo-1460925895917-afdab827c52f", 1400) },
    { slug: "nordvik-claims", title: "GenAI claims assistant", client: "Nordvik Insurance", category: "AI", year: "2025", summary: "Reduced claims handling time by 37% with a governed GenAI copilot.", results: ["37% lower handle time", "NPS +14 points"], image: img("photo-1551434678-e076c223a692", 1400) },
    { slug: "helios-digital-front-door", title: "Digital front door for 2M patients", client: "Helios Health", category: "Digital Product", year: "2024", summary: "Designed and built a patient app that shifted 45% of bookings online.", results: ["45% digital booking share", "4.8★ app rating"], image: img("photo-1519389950473-47ba0277781c", 1400) },
    { slug: "pe-value-creation", title: "Value-creation plan for PE portfolio", client: "Private equity fund", category: "Strategy", year: "2024", summary: "100-day plan delivering 3.1 points of EBITDA margin.", results: ["+3.1 pts EBITDA margin", "Exit multiple uplift"], image: img("photo-1454165804606-c3d57bc86b40", 1400) },
  ],
  clients: [{ name: "Meridian" }, { name: "Nordvik" }, { name: "Helios Health" }, { name: "Atlas Bank" }, { name: "Vanta Energy" }, { name: "Corvid" }, { name: "Kinetic" }],
  partners: [{ name: "AWS" }, { name: "Microsoft" }, { name: "Databricks" }, { name: "Snowflake" }],
  jobs: [
    { title: "Senior Data Scientist", department: "Data & AI", location: "London / Hybrid", description: "Lead the design and delivery of ML solutions for enterprise clients.", requirements: ["5+ years applied ML", "Python, SQL, cloud ML platforms", "Client-facing experience"] },
    { title: "Engagement Manager", department: "Strategy", location: "Singapore", description: "Run multi-workstream engagements and develop client relationships.", requirements: ["Top-tier consulting background", "Strong analytical and leadership skills"] },
  ],
};
