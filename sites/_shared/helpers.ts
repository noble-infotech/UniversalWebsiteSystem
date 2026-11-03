/**
 * Authoring helpers for site configs (content-level, not core code).
 */
import type { SectionInput, PageConfig } from "@/core/config/schema";

/** Unsplash CDN image URL. Replace with your own asset paths (/sites/<id>/...) for production. */
export const img = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Section authoring shorthand with defaults applied. */
export const section = (s: SectionInput): SectionInput => s;

type PageInput = Omit<Partial<PageConfig>, "sections"> & { slug: string; title: string; sections?: SectionInput[] };
export const page = (p: PageInput) => p;

/** Generic legal pages. Content must be reviewed by the company's own legal counsel before launch. */
export function legalPages(o: { company: string; email: string; country: string; updated: string; shop: boolean; returnsDays?: number }) {
  const legal = (slug: string, title: string, body: string) =>
    page({ slug, title, header: { show: true, breadcrumbs: true, subtitle: `Last updated ${o.updated}` }, template: "narrow", sections: [section({ id: "body", type: "richText", settings: { body } })], seo: { title, description: `${title} for ${o.company}.` } });
  const pages = [
    legal(
      "privacy-policy",
      "Privacy Policy",
      `${o.company} ("we", "us") respects your privacy. This policy explains what personal data we collect, why we collect it and how you can control it.

## Information we collect
- Contact details you provide through forms (name, email, phone, company)
- Order and delivery information when you purchase from us
- Technical data such as browser type and pages visited, collected through cookies and analytics tools

## How we use it
We use your information to respond to enquiries, fulfil orders, improve our website and – only with your consent – send marketing communications.

## Sharing
We share data only with service providers that help us operate (hosting, payment, delivery, analytics) under appropriate contracts, or where required by law.

## Your rights
You may request access to, correction or deletion of your personal data at any time by emailing **${o.email}**.

## Contact
Questions about this policy can be sent to ${o.email}.`,
    ),
    legal(
      "terms",
      "Terms & Conditions",
      `These terms govern your use of the ${o.company} website${o.shop ? " and any purchases made through it" : ""}.

## Use of the website
You agree to use this website lawfully and not to interfere with its operation or security.

## Intellectual property
All content, trademarks and imagery on this site belong to ${o.company} or its licensors and may not be reused without permission.
${o.shop ? `
## Orders and pricing
All orders are subject to acceptance and availability. Prices are shown in the store currency and may change without notice. We reserve the right to cancel orders resulting from pricing errors.
` : ""}
## Limitation of liability
To the extent permitted by law, ${o.company} is not liable for indirect or consequential losses arising from use of this website.

## Governing law
These terms are governed by the laws of ${o.country}.`,
    ),
  ];
  if (o.shop) {
    pages.push(
      legal(
        "shipping-policy",
        "Shipping Policy",
        `## Processing time
Orders are processed within 1–2 business days. You will receive a confirmation email with tracking details once your order ships.

## Delivery options
Available delivery methods, costs and estimated delivery times are shown at checkout based on your address.

## International orders
Import duties and taxes for international orders are the responsibility of the recipient unless stated otherwise.

## Questions
Contact us at ${o.email} for help with any delivery.`,
      ),
      legal(
        "returns-policy",
        "Return & Refund Policy",
        `## Returns
You may return most unused items in their original condition within **${o.returnsDays ?? 30} days** of delivery.

## Non-returnable items
Personalised or customised items, digital products and gift cards cannot be returned unless faulty.

## Refunds
Once we receive and inspect your return, we will refund the original payment method within 5–10 business days.

## How to start a return
Email ${o.email} with your order number and the items you wish to return.`,
      ),
    );
  }
  return pages;
}
