# Section reference

Every section accepts the common fields:

| Field | Purpose |
|---|---|
| `id`, `type` | Anchor id and section type |
| `enabled` | Turn the section on or off |
| `visibility` | `{ mobile, desktop }` per-device show/hide |
| `eyebrow`, `title`, `subtitle`, `description`, `align` | Heading copy and alignment |
| `layout` | Variant (listed per section below) |
| `background` | `variant`: default · surface · muted · primary · secondary · dark · image · gradient; plus `image` and `overlay` |
| `media` | `image`, `video`, `poster`, `alt` |
| `cta`, `secondaryCta` | Call-to-action links |
| `limit`, `columns` | Item count and grid columns |
| `source` | Data source selector |
| `items` | Inline override of the default collection |
| `settings` | Section-specific options; `hideHeader: true` hides the heading block |

| # | `type` | Layouts | Data / notes |
|---|---|---|---|
| 1 | `hero` | `split` · `centered` · `video` · `minimal` | `settings.badges[]`, `settings.highlights[{value,label}]`, `settings.floatingCard` |
| 2 | `about` | `image-left` · `image-right` · `centered` | `story.about`, `settings.points[]` |
| 3 | `visionMission` | `cards` · `split` | `story.vision/mission/values` |
| 4 | `story` | `timeline` · `narrative` | `story.milestones`, `story.history`, founder quote |
| 5 | `whatWeDo` | `grid` · `list` · `image-cards` | `content.whatWeDo` |
| 6 | `productsServices` | `grid` · `carousel` · `image` (services) | `source`: `services` · `featured` · `newArrival` · `bestSeller` · `onSale` · `category:<slug>` |
| 7 | `productCategories` | `tiles` · `grid` · `list` | `source: "services"` for service categories |
| 8 | `whyChooseUs` | `grid` · `list` · `split` | `content.whyChooseUs` or `business.advantages` |
| 9 | `achievements` | `grid` · `list` | `story.achievements` + `story.awards` |
| 10 | `stats` | `band` · `cards` | `story.stats` (animated counters) |
| 11 | `team` | `grid` · `cards` · `founder` | `story.leadership`, `story.founder` |
| 12 | `infrastructure` | `image-cards` · `grid` · `split` | `content.infrastructure`; `media.video` adds a play button |
| 13 | `process` | `steps` · `vertical` | `content.process` |
| 14 | `gallery` | `masonry` · `grid` | `content.gallery`; category filter tabs and lightbox (`settings.filter`) |
| 15 | `projects` | `grid` · `featured` | `content.projects` → `/portfolio/<slug>` |
| 16 | `clients` | `marquee` · `grid` | `content.clients` (logo image or wordmark) |
| 17 | `testimonials` | `carousel` · `grid` · `spotlight` | `content.testimonials` |
| 18 | `reviews` | – | aggregated product reviews + average rating |
| 19 | `faq` | `centered` · `split` | `content.faqs`; `source: "<category>"`; emits FAQPage JSON-LD |
| 20 | `blog` | `grid` · `featured` | `content.posts` |
| 21 | `events` | – | `content.events` (events and announcements) |
| 22 | `offers` | `cards` · `banner` | `content.offers` (badge, code, validity, CTA) |
| 23 | `partners` | – | `story.certifications` + `content.partners` (`settings.showCertifications`) |
| 24 | `newsletter` | `card` · `split` · `centered` | posts to `/api/forms/newsletter` |
| 25 | `contact` | `split` · `stacked` · `info-only` | offices, phones, emails, social, map; `settings.form`: contact or enquiry |
| 26 | `shop` | `tabs` · `grid` | tabs for featured / new / best sellers / on sale (only when the shop is enabled) |
| – | `richText` | `narrow` · `wide` · `two-column` | `settings.body` (rich text), `settings.updated` |
| – | `ctaBanner` | `card` · `band` | CTA buttons; phone fallback |
| – | `careers` | – | `content.jobs` + application form |
| – | `quoteForm` | – | quotation form; prefilled from `?product=` / `?service=` |
| – | `serviceList` | `grouped` · `grid` · `image` | all services, grouped by category |
| – | `pricing` | – | `items` or `source: "service:<slug>"` |

Sections tied to a feature (shop, blog, careers, quote, newsletter, services, catalogue) are skipped automatically when that feature is disabled.

## Adding a new section type (core developers)

1. Add the name to `SectionTypes` in `src/core/config/schema.ts`.
2. Create the component in `src/components/sections/`, typed `(props: SectionProps)`. Use `<Section>` and `<SectionHeader>` to get backgrounds, visibility and headings for free.
3. Register it in `src/components/sections/registry.tsx`.
