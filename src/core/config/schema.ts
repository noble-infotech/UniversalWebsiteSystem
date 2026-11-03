/**
 * MASTER CONFIGURATION SCHEMA
 * ---------------------------------------------------------------------------
 * Every company website is described entirely by data that conforms to this
 * schema. UI components never contain company-specific content; they only
 * read from a validated `SiteConfig`.
 *
 * The schema doubles as:
 *  - runtime validation (scripts/validate-sites.ts, and on load in dev)
 *  - TypeScript types (via z.infer) for authoring site configs
 *  - the contract a future admin dashboard / headless CMS must produce
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export const ImageSchema = z.object({
  src: z.string(),
  alt: z.string().default(""),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type ImageAsset = z.infer<typeof ImageSchema>;

export const LinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  external: z.boolean().optional(),
});
export type Link = z.infer<typeof LinkSchema>;

export const SeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().optional(),
  canonical: z.string().optional(),
});
export type SeoMeta = z.infer<typeof SeoSchema>;

export const AddressSchema = z.object({
  label: z.string().optional(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  hours: z.string().optional(),
  mapUrl: z.string().optional(),
});
export type Address = z.infer<typeof AddressSchema>;

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

const IconItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(), // lucide icon name, see components/ui/Icon.tsx
  image: z.string().optional(),
  href: z.string().optional(),
});
export type IconItem = z.infer<typeof IconItemSchema>;

/* ------------------------------------------------------------------ */
/* A. Company profile                                                  */
/* ------------------------------------------------------------------ */

export const SocialPlatforms = [
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
  "tiktok",
  "pinterest",
  "github",
  "whatsapp",
] as const;
export type SocialPlatform = (typeof SocialPlatforms)[number];

export const CompanySchema = z.object({
  name: z.string(),
  brandName: z.string(),
  legalName: z.string().optional(),
  logo: z.object({
    primary: z.string().optional(), // logo for light backgrounds
    secondary: z.string().optional(), // logo for dark backgrounds / footer
    favicon: z.string().optional(),
    /** Rendered when no image logo is supplied. */
    text: z.string().optional(),
    height: z.number().default(36),
  }),
  tagline: z.string(),
  description: z.string(),
  established: z.number().optional(),
  industry: z.string(),
  category: z.string().optional(),
  registration: z
    .object({
      number: z.string().optional(),
      taxId: z.string().optional(),
      other: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    })
    .optional(),
  headOffice: AddressSchema,
  branches: z.array(AddressSchema).default([]),
  phones: z.array(z.object({ label: z.string(), number: z.string() })).default([]),
  emails: z.array(z.object({ label: z.string(), address: z.string() })).default([]),
  websiteUrl: z.string(),
  social: z.partialRecord(z.enum(SocialPlatforms), z.string()).default({}),
  map: z
    .object({
      embedUrl: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});
export type CompanyProfile = z.infer<typeof CompanySchema>;

/* ------------------------------------------------------------------ */
/* B. Brand identity / theme                                           */
/* ------------------------------------------------------------------ */

const PaletteSchema = z.object({
  primary: z.string(),
  primaryForeground: z.string().default("#ffffff"),
  secondary: z.string(),
  secondaryForeground: z.string().default("#ffffff"),
  accent: z.string(),
  accentForeground: z.string().default("#111111"),
  background: z.string(),
  surface: z.string(),
  muted: z.string(),
  text: z.string(),
  textMuted: z.string(),
  border: z.string(),
  success: z.string().default("#16a34a"),
  danger: z.string().default("#dc2626"),
});
export type Palette = z.infer<typeof PaletteSchema>;

export const ThemeSchema = z.object({
  mode: z.enum(["light", "dark"]).default("light"),
  colors: PaletteSchema,
  fonts: z.object({
    heading: z.string(), // Google Font family name, e.g. "Playfair Display"
    body: z.string(),
    headingWeight: z.number().default(700),
    /** Extra Google Fonts weights to load */
    weights: z.array(z.number()).default([400, 500, 600, 700]),
    headingCase: z.enum(["none", "uppercase"]).default("none"),
    headingTracking: z.string().default("-0.02em"),
  }),
  radius: z.string().default("0.75rem"),
  button: z.object({
    shape: z.enum(["square", "rounded", "pill"]).default("rounded"),
    style: z.enum(["solid", "gradient", "outline"]).default("solid"),
    uppercase: z.boolean().default(false),
  }),
  card: z.object({
    style: z.enum(["elevated", "bordered", "flat", "glass"]).default("bordered"),
    hoverLift: z.boolean().default(true),
  }),
  header: z.object({
    style: z.enum(["classic", "centered", "minimal", "split"]).default("classic"),
    sticky: z.boolean().default(true),
    transparentOnHero: z.boolean().default(false),
    logoPosition: z.enum(["left", "center"]).default("left"),
  }),
  footer: z.object({
    layout: z.enum(["columns", "centered", "minimal", "mega"]).default("columns"),
    variant: z.enum(["dark", "light", "brand"]).default("dark"),
  }),
  animation: z.object({
    enabled: z.boolean().default(true),
    style: z.enum(["fade", "slide-up", "zoom"]).default("slide-up"),
    durationMs: z.number().default(700),
  }),
  images: z.object({
    style: z.enum(["square", "rounded", "soft"]).default("rounded"),
    treatment: z.enum(["natural", "grayscale", "duotone"]).default("natural"),
  }),
  container: z.string().default("80rem"),
  sectionSpacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
});
export type ThemeConfig = z.infer<typeof ThemeSchema>;

/* ------------------------------------------------------------------ */
/* C. Company story                                                    */
/* ------------------------------------------------------------------ */

export const PersonSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string().optional(),
  image: z.string().optional(),
  social: z.partialRecord(z.enum(SocialPlatforms), z.string()).optional(),
});
export type Person = z.infer<typeof PersonSchema>;

export const StatSchema = z.object({
  label: z.string(),
  value: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  icon: z.string().optional(),
});
export type Stat = z.infer<typeof StatSchema>;

export const StorySchema = z.object({
  about: z.string(),
  aboutImage: z.string().optional(),
  history: z.string().optional(),
  vision: z.string(),
  mission: z.string(),
  values: z.array(IconItemSchema).default([]),
  leadership: z.array(PersonSchema).default([]),
  founder: PersonSchema.extend({ quote: z.string().optional() }).optional(),
  milestones: z.array(z.object({ year: z.string(), title: z.string(), description: z.string().optional() })).default([]),
  achievements: z.array(IconItemSchema).default([]),
  certifications: z.array(z.object({ name: z.string(), issuer: z.string().optional(), logo: z.string().optional(), year: z.string().optional() })).default([]),
  awards: z.array(z.object({ name: z.string(), issuer: z.string().optional(), year: z.string().optional() })).default([]),
  stats: z.array(StatSchema).default([]),
});
export type CompanyStory = z.infer<typeof StorySchema>;

/* ------------------------------------------------------------------ */
/* D. Business information                                             */
/* ------------------------------------------------------------------ */

export const BusinessSchema = z.object({
  model: z.enum(["B2B", "B2C", "B2B2C", "D2C", "Marketplace"]),
  types: z.array(z.enum(["manufacturer", "retailer", "wholesaler", "distributor", "service-provider", "exporter"])),
  categories: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
  usps: z.array(IconItemSchema).default([]),
  advantages: z.array(IconItemSchema).default([]),
  serviceAreas: z.array(z.string()).default([]),
});
export type BusinessInfo = z.infer<typeof BusinessSchema>;

/* ------------------------------------------------------------------ */
/* Generic content collections (testimonials, blog, gallery, ...)      */
/* ------------------------------------------------------------------ */

export const TestimonialSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

export const PostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  /** Markdown-lite body: paragraphs separated by blank lines; lines beginning with "## " become headings, "- " list items. */
  body: z.string(),
  cover: z.string().optional(),
  author: z.string().optional(),
  date: z.string(), // ISO date
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  seo: SeoSchema.optional(),
});
export type Post = z.infer<typeof PostSchema>;

export const EventSchema = z.object({
  title: z.string(),
  date: z.string(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  href: z.string().optional(),
  type: z.enum(["event", "announcement"]).default("event"),
});
export type EventItem = z.infer<typeof EventSchema>;

export const OfferSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  badge: z.string().optional(),
  code: z.string().optional(),
  image: z.string().optional(),
  cta: LinkSchema.optional(),
  validUntil: z.string().optional(),
});
export type Offer = z.infer<typeof OfferSchema>;

export const GalleryItemSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  category: z.string().optional(),
});
export type GalleryItem = z.infer<typeof GalleryItemSchema>;

export const ProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  client: z.string().optional(),
  category: z.string().optional(),
  summary: z.string(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.array(z.string()).default([]),
  image: z.string().optional(),
  year: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const LogoItemSchema = z.object({ name: z.string(), logo: z.string().optional(), href: z.string().optional() });
export type LogoItem = z.infer<typeof LogoItemSchema>;

export const JobSchema = z.object({
  title: z.string(),
  department: z.string().optional(),
  location: z.string(),
  type: z.string().default("Full-time"),
  description: z.string(),
  requirements: z.array(z.string()).default([]),
});
export type Job = z.infer<typeof JobSchema>;

export const ContentSchema = z.object({
  whatWeDo: z.array(IconItemSchema).default([]),
  whyChooseUs: z.array(IconItemSchema).default([]),
  process: z.array(IconItemSchema).default([]),
  infrastructure: z.array(IconItemSchema).default([]),
  testimonials: z.array(TestimonialSchema).default([]),
  faqs: z.array(FaqItemSchema).default([]),
  posts: z.array(PostSchema).default([]),
  events: z.array(EventSchema).default([]),
  offers: z.array(OfferSchema).default([]),
  gallery: z.array(GalleryItemSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  clients: z.array(LogoItemSchema).default([]),
  partners: z.array(LogoItemSchema).default([]),
  jobs: z.array(JobSchema).default([]),
});
export type SiteContent = z.infer<typeof ContentSchema>;

/* ------------------------------------------------------------------ */
/* 3. Services                                                         */
/* ------------------------------------------------------------------ */

export const ServiceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  features: z.array(IconItemSchema).default([]),
  process: z.array(IconItemSchema).default([]),
  pricing: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().optional(),
        priceLabel: z.string().optional(), // e.g. "From", "Custom"
        unit: z.string().optional(), // e.g. "/month"
        features: z.array(z.string()).default([]),
        highlighted: z.boolean().optional(),
      }),
    )
    .optional(),
  faqs: z.array(FaqItemSchema).default([]),
  cta: LinkSchema.optional(),
  featured: z.boolean().default(false),
  seo: SeoSchema.optional(),
});
export type Service = z.infer<typeof ServiceSchema>;

export const CategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  parent: z.string().optional(), // parent category slug → subcategory
  seo: SeoSchema.optional(),
});
export type Category = z.infer<typeof CategorySchema>;

/* ------------------------------------------------------------------ */
/* 4. Products                                                         */
/* ------------------------------------------------------------------ */

export const VariantOptionSchema = z.object({
  name: z.string(), // "Size", "Color", "Material"
  values: z.array(
    z.object({
      value: z.string(),
      swatch: z.string().optional(), // hex colour for colour swatches
      priceDelta: z.number().default(0),
    }),
  ),
});

export const ReviewSchema = z.object({
  author: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string(),
  date: z.string(),
  verified: z.boolean().default(false),
});
export type Review = z.infer<typeof ReviewSchema>;

export const ProductSchema = z.object({
  slug: z.string(),
  sku: z.string(),
  name: z.string(),
  type: z.enum(["physical", "digital", "service", "customizable"]).default("physical"),
  category: z.string(), // category slug
  subcategory: z.string().optional(),
  shortDescription: z.string(),
  description: z.string(),
  images: z.array(ImageSchema).min(1),
  videos: z.array(z.object({ src: z.string(), title: z.string().optional() })).default([]),
  price: z.number(), // regular price
  salePrice: z.number().optional(),
  /** "quote" products show an enquiry CTA instead of add-to-cart (common for B2B / manufacturing). */
  purchaseMode: z.enum(["cart", "quote", "both"]).default("cart"),
  priceLabel: z.string().optional(),
  options: z.array(VariantOptionSchema).default([]),
  stock: z.number().optional(), // undefined = not tracked
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock", "preorder", "made_to_order"]).optional(),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  reviews: z.array(ReviewSchema).default([]),
  related: z.array(z.string()).default([]), // product slugs
  customization: z
    .array(z.object({ id: z.string(), label: z.string(), type: z.enum(["text", "textarea", "select"]), options: z.array(z.string()).optional(), required: z.boolean().default(false), maxLength: z.number().optional() }))
    .default([]),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  weightKg: z.number().optional(),
  minOrderQty: z.number().default(1),
  seo: SeoSchema.optional(),
});
export type Product = z.infer<typeof ProductSchema>;

/* ------------------------------------------------------------------ */
/* 5. Commerce settings                                                */
/* ------------------------------------------------------------------ */

export const CouponSchema = z.object({
  code: z.string(),
  type: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().default(0),
  minSubtotal: z.number().optional(),
  expires: z.string().optional(),
  description: z.string().optional(),
  categories: z.array(z.string()).optional(),
});
export type Coupon = z.infer<typeof CouponSchema>;

export const ShippingMethodSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  rate: z.number(), // flat rate
  perKg: z.number().optional(),
  freeOver: z.number().optional(),
  estimate: z.string().optional(),
  countries: z.array(z.string()).optional(), // restrict to ISO country codes; undefined = all
  digitalOnly: z.boolean().optional(),
});
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;

export const CommerceSchema = z.object({
  enabled: z.boolean(),
  currency: z.string().default("USD"),
  locale: z.string().default("en-US"),
  tax: z.object({
    rate: z.number().default(0), // 0.18 = 18 %
    label: z.string().default("Tax"),
    inclusive: z.boolean().default(false), // prices already include tax
  }),
  shipping: z.object({
    methods: z.array(ShippingMethodSchema).default([]),
    countries: z.array(z.object({ code: z.string(), name: z.string() })).default([]),
    provider: z.enum(["flat-rate", "shiprocket", "easypost", "shippo", "custom"]).default("flat-rate"),
  }),
  coupons: z.array(CouponSchema).default([]),
  payment: z.object({
    provider: z.enum(["manual", "stripe", "razorpay", "paypal", "custom"]).default("manual"),
    methods: z.array(z.enum(["card", "upi", "netbanking", "wallet", "cod", "bank_transfer", "paypal"])).default(["card"]),
    /** Public key only. Secret keys belong in environment variables on the server. */
    publicKey: z.string().optional(),
  }),
  inventory: z.object({
    provider: z.enum(["config", "custom-api", "erp"]).default("config"),
    trackStock: z.boolean().default(true),
    lowStockThreshold: z.number().default(5),
    allowBackorders: z.boolean().default(false),
  }),
  guestCheckout: z.boolean().default(true),
  accounts: z.boolean().default(true),
  wishlist: z.boolean().default(true),
  reviews: z.boolean().default(true),
  orderPrefix: z.string().default("ORD"),
  maxQuantityPerItem: z.number().default(99),
  shopTitle: z.string().default("Shop"),
  shopDescription: z.string().optional(),
  productsPerPage: z.number().default(12),
});
export type CommerceConfig = z.infer<typeof CommerceSchema>;

/* ------------------------------------------------------------------ */
/* 2. Sections                                                         */
/* ------------------------------------------------------------------ */

export const SectionTypes = [
  "hero",
  "about",
  "visionMission",
  "story",
  "whatWeDo",
  "productsServices",
  "productCategories",
  "whyChooseUs",
  "achievements",
  "stats",
  "team",
  "infrastructure",
  "process",
  "gallery",
  "projects",
  "clients",
  "testimonials",
  "reviews",
  "faq",
  "blog",
  "events",
  "offers",
  "partners",
  "newsletter",
  "contact",
  "shop",
  // utility sections for building any page
  "richText",
  "ctaBanner",
  "careers",
  "quoteForm",
  "serviceList",
  "pricing",
] as const;
export type SectionType = (typeof SectionTypes)[number];

export const SectionSchema = z.object({
  /** Unique id, also used as the HTML anchor (#id). */
  id: z.string(),
  type: z.enum(SectionTypes),
  enabled: z.boolean().default(true),
  /** Show/hide per breakpoint without removing the section. */
  visibility: z.object({ mobile: z.boolean().default(true), desktop: z.boolean().default(true) }).default({ mobile: true, desktop: true }),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  /** Layout variant; each section documents the variants it supports. */
  layout: z.string().optional(),
  align: z.enum(["left", "center"]).optional(),
  background: z
    .object({
      variant: z.enum(["default", "surface", "muted", "primary", "secondary", "dark", "image", "gradient"]).default("default"),
      image: z.string().optional(),
      overlay: z.number().min(0).max(1).optional(),
    })
    .optional(),
  media: z.object({ image: z.string().optional(), video: z.string().optional(), alt: z.string().optional(), poster: z.string().optional() }).optional(),
  cta: LinkSchema.optional(),
  secondaryCta: LinkSchema.optional(),
  /** Max number of items to display. */
  limit: z.number().optional(),
  columns: z.number().min(1).max(6).optional(),
  /** Data source selector — e.g. "featured" | "newArrival" | "bestSeller" | "services" | "category:<slug>" */
  source: z.string().optional(),
  /** Inline items override the default collection for this section. */
  items: z.array(z.record(z.string(), z.any())).optional(),
  /** Free-form, section-specific settings. */
  settings: z.record(z.string(), z.any()).optional(),
});
export type SectionConfig = z.infer<typeof SectionSchema>;
export type SectionInput = z.input<typeof SectionSchema>;

/* ------------------------------------------------------------------ */
/* 6. Pages                                                            */
/* ------------------------------------------------------------------ */

export const PageSchema = z.object({
  /** URL slug. "" (empty) is the homepage. Nested slugs allowed: "legal/privacy". */
  slug: z.string(),
  title: z.string(),
  enabled: z.boolean().default(true),
  /** hidden pages are reachable by URL but excluded from sitemap/nav */
  visibility: z.enum(["public", "hidden"]).default("public"),
  template: z.enum(["default", "narrow", "full"]).default("default"),
  /** Page hero banner (not used on homepage – use a hero section instead) */
  header: z
    .object({
      show: z.boolean().default(true),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      image: z.string().optional(),
      breadcrumbs: z.boolean().default(true),
    })
    .default({ show: true, breadcrumbs: true }),
  sections: z.array(SectionSchema).default([]),
  seo: SeoSchema.optional(),
});
export type PageConfig = z.infer<typeof PageSchema>;

/* ------------------------------------------------------------------ */
/* 7–8. Navigation & footer                                            */
/* ------------------------------------------------------------------ */

export type NavItem = {
  label: string;
  href?: string;
  description?: string;
  children?: NavItem[];
  /** Render children as a wide mega-menu panel */
  mega?: boolean;
  /** Only show when a feature flag is on, e.g. "shop" */
  requires?: FeatureKey;
};
export const NavItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    href: z.string().optional(),
    description: z.string().optional(),
    children: z.array(NavItemSchema).optional(),
    mega: z.boolean().optional(),
    requires: z.enum(FeatureKeys).optional(),
  }),
);

export const NavigationSchema = z.object({
  menu: z.array(NavItemSchema),
  announcement: z
    .object({ enabled: z.boolean(), text: z.string(), link: LinkSchema.optional(), dismissible: z.boolean().default(true) })
    .optional(),
  topBar: z.object({ enabled: z.boolean(), showContact: z.boolean().default(true), showSocial: z.boolean().default(true) }).default({ enabled: false, showContact: true, showSocial: true }),
  icons: z
    .object({ search: z.boolean().default(true), account: z.boolean().default(true), wishlist: z.boolean().default(true), cart: z.boolean().default(true) })
    .default({ search: true, account: true, wishlist: true, cart: true }),
  cta: LinkSchema.optional(),
});
export type NavigationConfig = z.infer<typeof NavigationSchema>;

export const FooterColumnSchema = z.object({
  title: z.string(),
  type: z.enum(["links", "productCategories", "services", "contact", "newsletter", "social", "text", "about"]),
  links: z.array(LinkSchema).optional(),
  text: z.string().optional(),
  limit: z.number().optional(),
});

export const FooterSchema = z.object({
  description: z.string().optional(),
  showLogo: z.boolean().default(true),
  columns: z.array(FooterColumnSchema),
  paymentIcons: z.array(z.enum(["visa", "mastercard", "amex", "paypal", "upi", "applepay", "gpay", "cod", "bank"])).default([]),
  legalLinks: z.array(LinkSchema).default([]),
  copyright: z.string().optional(), // supports {year} and {company}
  newsletter: z.object({ enabled: z.boolean(), title: z.string().optional(), text: z.string().optional() }).default({ enabled: false }),
});
export type FooterConfig = z.infer<typeof FooterSchema>;

/* ------------------------------------------------------------------ */
/* 9. Integrations & engagement                                        */
/* ------------------------------------------------------------------ */

export const IntegrationsSchema = z.object({
  analytics: z
    .object({
      googleAnalyticsId: z.string().optional(),
      googleTagManagerId: z.string().optional(),
      metaPixelId: z.string().optional(),
      /** Events forwarded to every enabled tracker */
      conversionEvents: z.boolean().default(true),
    })
    .default({ conversionEvents: true }),
  whatsapp: z.object({ enabled: z.boolean(), number: z.string(), message: z.string().optional(), position: z.enum(["left", "right"]).default("right") }).optional(),
  clickToCall: z.object({ enabled: z.boolean(), number: z.string().optional() }).optional(),
  liveChat: z.object({ provider: z.enum(["none", "tawk", "crisp", "intercom", "custom"]).default("none"), id: z.string().optional(), scriptUrl: z.string().optional() }).optional(),
  forms: z
    .object({
      /** "console" logs submissions server-side (development); "webhook" POSTs JSON to webhookUrl (Zapier, Make, n8n, Slack, CRM). */
      provider: z.enum(["console", "webhook"]).default("console"),
      /** Prefer the FORMS_WEBHOOK_URL env var over committing a URL here. */
      webhookUrl: z.string().optional(),
      notifyEmail: z.string().optional(),
    })
    .default({ provider: "console" }),
  popup: z
    .object({
      enabled: z.boolean(),
      id: z.string().default("popup"),
      title: z.string(),
      body: z.string().optional(),
      image: z.string().optional(),
      cta: LinkSchema.optional(),
      delaySeconds: z.number().default(6),
      /** once = once per browser, session = once per tab session, always */
      frequency: z.enum(["once", "session", "always"]).default("once"),
      showNewsletter: z.boolean().default(false),
    })
    .optional(),
  socialShare: z.object({ enabled: z.boolean(), networks: z.array(z.enum(["facebook", "x", "linkedin", "whatsapp", "email", "copy"])) }).default({ enabled: true, networks: ["facebook", "x", "linkedin", "whatsapp", "copy"] }),
});
export type IntegrationsConfig = z.infer<typeof IntegrationsSchema>;

/* ------------------------------------------------------------------ */
/* 11. SEO                                                             */
/* ------------------------------------------------------------------ */

export const SiteSeoSchema = z.object({
  defaultTitle: z.string(),
  titleTemplate: z.string().default("%s | {brand}"),
  description: z.string(),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional(),
  twitterHandle: z.string().optional(),
  locale: z.string().default("en_US"),
  schemaType: z.enum(["Organization", "Corporation", "LocalBusiness", "Store", "ProfessionalService", "Manufacturer"]).default("Organization"),
  robots: z.object({ index: z.boolean().default(true), disallow: z.array(z.string()).default([]) }).default({ index: true, disallow: [] }),
  /** SEO overrides for built-in system routes (shop, services, blog, cart…) */
  routes: z.record(z.string(), SeoSchema).default({}),
  verification: z.object({ google: z.string().optional(), bing: z.string().optional() }).optional(),
});
export type SiteSeoConfig = z.infer<typeof SiteSeoSchema>;

/* ------------------------------------------------------------------ */
/* Feature flags                                                       */
/* ------------------------------------------------------------------ */

export const FeatureKeys = ["shop", "catalog", "services", "blog", "portfolio", "gallery", "careers", "quote", "search", "newsletter", "accounts", "wishlist"] as const;
export type FeatureKey = (typeof FeatureKeys)[number];
export const FeaturesSchema = z.partialRecord(z.enum(FeatureKeys), z.boolean());

/* ------------------------------------------------------------------ */
/* MASTER CONFIG                                                       */
/* ------------------------------------------------------------------ */

export const SiteConfigSchema = z.object({
  id: z.string(),
  company: CompanySchema,
  theme: ThemeSchema,
  story: StorySchema,
  business: BusinessSchema,
  features: FeaturesSchema,
  navigation: NavigationSchema,
  footer: FooterSchema,
  pages: z.array(PageSchema),
  services: z.object({ categories: z.array(CategorySchema).default([]), items: z.array(ServiceSchema).default([]) }),
  catalog: z.object({ categories: z.array(CategorySchema).default([]), products: z.array(ProductSchema).default([]) }),
  commerce: CommerceSchema,
  content: ContentSchema,
  integrations: IntegrationsSchema,
  seo: SiteSeoSchema,
});

/** Fully-resolved config (defaults applied) used by the app. */
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
/** Authoring type for site configs – optional fields with defaults may be omitted. */
export type SiteConfigInput = z.input<typeof SiteConfigSchema>;
