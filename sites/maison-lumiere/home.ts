import { img, section } from "../_shared/helpers";

/** Retail homepage – conversion-focused, product-led. */
export const homeSections = [
  section({
    id: "hero",
    type: "hero",
    layout: "centered",
    eyebrow: "The Autumn Collection",
    title: "Slow living, beautifully made",
    subtitle: "Hand-poured candles, studio ceramics and natural linens from independent makers.",
    media: { image: img("photo-1513506003901-1e6a229e2d15", 2200), alt: "Candles and ceramics on a wooden shelf" },
    background: { variant: "image", overlay: 0.42 },
    cta: { label: "Shop the collection", href: "/shop" },
    secondaryCta: { label: "Our story", href: "/about" },
  }),
  section({ id: "usp", type: "whyChooseUs", layout: "list", columns: 4, background: { variant: "muted" }, settings: { hideHeader: true } }),
  section({ id: "categories", type: "productCategories", layout: "tiles", eyebrow: "Shop by category", title: "Curated for every corner of home", limit: 5 }),
  section({ id: "shop", type: "shop", layout: "tabs", eyebrow: "The shop", title: "Most-loved pieces", limit: 8 }),
  section({ id: "offer", type: "offers", layout: "banner", limit: 1 }),
  section({ id: "new", type: "productsServices", source: "newArrival", layout: "carousel", eyebrow: "Just landed", title: "New arrivals", limit: 6, cta: { label: "Shop new", href: "/shop?sort=newest" }, align: "left" }),
  section({ id: "story", type: "story", layout: "narrative", eyebrow: "Our story", title: "Made slowly, by hand, since 2016", background: { variant: "muted" } }),
  section({ id: "reviews", type: "reviews", eyebrow: "Reviews", title: "Loved by 120,000+ homes", limit: 6 }),
  section({ id: "offers", type: "offers", layout: "cards", eyebrow: "Edits", title: "Gift guides & promotions" }),
  section({ id: "press", type: "partners", eyebrow: "As seen in", settings: { showCertifications: false }, background: { variant: "muted" } }),
  section({ id: "insta", type: "gallery", layout: "grid", eyebrow: "@maisonlumiere", title: "Life at home with Lumière", settings: { filter: false } }),
  section({ id: "journal", type: "blog", layout: "featured", eyebrow: "The Journal", title: "Rituals, styling & makers", limit: 3, cta: { label: "Read the journal", href: "/blog" } }),
  section({ id: "newsletter", type: "newsletter", layout: "card", title: "10% off your first order", subtitle: "Join the Lumière list for early access to new collections and member-only offers." }),
];
