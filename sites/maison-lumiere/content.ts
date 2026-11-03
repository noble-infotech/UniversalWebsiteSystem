import type { SiteConfigInput } from "@/core/config/schema";
import { img } from "../_shared/helpers";

export const content: SiteConfigInput["content"] = {
  whyChooseUs: [
    { title: "Free shipping over $75", description: "Carbon-neutral delivery across the US.", icon: "truck" },
    { title: "30-day returns", description: "Changed your mind? Send it back, free.", icon: "returns" },
    { title: "Made by hand", description: "Small batches from 42 independent makers.", icon: "heart" },
    { title: "Secure checkout", description: "Card, PayPal or pay on delivery.", icon: "lock" },
  ],
  testimonials: [
    { quote: "Every order feels like a gift to myself – the packaging alone is a work of art.", author: "Hannah L.", role: "Customer since 2019", rating: 5 },
    { quote: "Their mugs are the first thing guests ask about. Beautifully made.", author: "Noah B.", role: "Verified buyer", rating: 5 },
    { quote: "Fast shipping, gorgeous scents and genuinely kind customer service.", author: "Isla F.", role: "Verified buyer", rating: 5 },
  ],
  faqs: [
    { question: "How long does shipping take?", answer: "US standard shipping takes 3–5 business days; express takes 1–2. International orders arrive in 6–12 business days.", category: "Shipping" },
    { question: "What is your return policy?", answer: "Unused items can be returned within 30 days for a full refund. Personalised items are final sale.", category: "Returns" },
    { question: "Are your candles toxin-free?", answer: "Yes – we use coconut-soy wax, cotton wicks and phthalate-free fragrance oils.", category: "Products" },
    { question: "Do you offer gift wrapping?", answer: "Every order ships in our signature plastic-free gift box. Add a personal note at checkout.", category: "Orders" },
    { question: "Do you offer wholesale?", answer: "Yes – email trade@maisonlumiere.example for our wholesale catalogue.", category: "General" },
  ],
  offers: [
    { title: "The Autumn Edit", description: "20% off all home fragrance this week.", badge: "Limited time", code: "CANDLE20", image: img("photo-1603006905003-be475563bc59", 1400), cta: { label: "Shop fragrance", href: "/shop/category/home-fragrance" }, validUntil: "2026-11-30" },
    { title: "Gifts under $75", description: "Thoughtful finds for everyone on your list.", badge: "Gift guide", image: img("photo-1513885535751-8b9238bd345a", 1000), cta: { label: "Shop gifts", href: "/shop?max=75" } },
    { title: "New: Ceramics drop", description: "Fresh glazes from the studio.", badge: "Just in", image: img("photo-1610701596007-11502861dcfa", 1000), cta: { label: "Discover", href: "/shop/category/ceramics" } },
  ],
  gallery: [
    { src: img("photo-1513506003901-1e6a229e2d15", 900), alt: "Candles on shelf" },
    { src: img("photo-1610701596007-11502861dcfa", 900), alt: "Ceramic collection" },
    { src: img("photo-1522771739844-6a9f6d5f14af", 900), alt: "Linen bedding" },
    { src: img("photo-1567016432779-094069958ea5", 900), alt: "Styled living room" },
    { src: img("photo-1603006905003-be475563bc59", 900), alt: "Lit candle" },
    { src: img("photo-1514228742587-6b1558fcca3d", 900), alt: "Coffee mugs" },
  ],
  posts: [
    { slug: "candle-care-guide", title: "The art of candle care: 5 rituals for a cleaner burn", excerpt: "Trim, tunnel, and timing – how to get every hour from your candle.", body: "A well-cared-for candle burns cleaner and longer.\n\n## 1. The first burn matters\nLet the wax melt to the edges on the first light – usually 2–3 hours.\n\n## 2. Trim your wick\nKeep wicks at ¼ inch to avoid soot.\n\n- Never burn for more than 4 hours\n- Keep away from drafts", cover: img("photo-1603006905003-be475563bc59", 1400), author: "Claire Moreau", date: "2026-10-04", category: "Rituals", tags: ["candles", "care"] },
    { slug: "styling-shelves", title: "How to style an open shelf like a set designer", excerpt: "The rule of three, height and breathing room.", body: "Open shelving is equal parts storage and art.\n\n## Start with anchors\nPlace your largest objects first.\n\n## Layer textures\nMix ceramic, wood, linen and greenery.", cover: img("photo-1513506003901-1e6a229e2d15", 1400), author: "Mei Tanaka", date: "2026-08-21", category: "Styling", tags: ["styling"] },
    { slug: "meet-the-makers", title: "Meet the makers: the potters behind our new glazes", excerpt: "A morning in our Brooklyn ceramics studio.", body: "Every mug starts as a 450 g ball of clay.\n\nOur ceramics lead Mei walks us through a day at the wheel.", cover: img("photo-1610701596007-11502861dcfa", 1400), author: "Editorial", date: "2026-06-10", category: "Makers", tags: ["ceramics", "makers"] },
  ],
  events: [],
  projects: [],
  clients: [],
  partners: [{ name: "Vogue Living" }, { name: "Kinfolk" }, { name: "Dwell" }, { name: "Elle Decor" }, { name: "Monocle" }],
  jobs: [{ title: "Retail Associate – Los Angeles", location: "Los Angeles, CA", type: "Part-time", description: "Help customers discover our collection in our Melrose Place store." }],
  whatWeDo: [],
  process: [],
  infrastructure: [],
};
