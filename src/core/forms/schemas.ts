/** Form definitions shared by client (instant validation) and server (authoritative validation). */
import { z } from "zod";

const name = z.string().trim().min(2, "Please enter your name").max(120);
const email = z.email("Enter a valid email address");
const phone = z.string().trim().regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number");
const optionalPhone = z.union([z.literal(""), phone]).optional();
const message = z.string().trim().min(10, "Please write at least 10 characters").max(5000);
/** Honeypot – real users leave this empty. */
const hp = z.string().max(0).optional();

export const FormSchemas = {
  contact: z.object({ name, email, phone: optionalPhone, subject: z.string().trim().max(200).optional(), message, website: hp }),
  enquiry: z.object({ name, email, phone: optionalPhone, company: z.string().trim().max(200).optional(), topic: z.string().optional(), message, website: hp }),
  quote: z.object({
    name,
    email,
    phone,
    company: z.string().trim().max(200).optional(),
    product: z.string().trim().max(300).optional(),
    quantity: z.string().trim().max(50).optional(),
    budget: z.string().trim().max(100).optional(),
    timeline: z.string().trim().max(100).optional(),
    message,
    website: hp,
  }),
  newsletter: z.object({ email, website: hp }),
  careers: z.object({ name, email, phone, position: z.string().trim().min(2, "Select a position"), portfolio: z.union([z.literal(""), z.url("Enter a valid URL")]).optional(), message, website: hp }),
  callback: z.object({ name, phone, preferredTime: z.string().optional(), website: hp }),
} as const;

export type FormType = keyof typeof FormSchemas;
export const formTypes = Object.keys(FormSchemas) as FormType[];

export type FieldDef = { name: string; label: string; type?: "text" | "email" | "tel" | "textarea" | "select" | "url"; options?: string[]; placeholder?: string; autoComplete?: string; full?: boolean; required?: boolean };

/** Default field layouts – sections may override labels/options via settings.fields. */
export const defaultFields: Record<FormType, FieldDef[]> = {
  contact: [
    { name: "name", label: "Full name", autoComplete: "name", required: true },
    { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
    { name: "phone", label: "Phone (optional)", type: "tel", autoComplete: "tel" },
    { name: "subject", label: "Subject" },
    { name: "message", label: "How can we help?", type: "textarea", full: true, required: true },
  ],
  enquiry: [
    { name: "name", label: "Full name", autoComplete: "name", required: true },
    { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
    { name: "company", label: "Company", autoComplete: "organization" },
    { name: "topic", label: "Topic", type: "select", options: ["General", "Sales", "Support", "Partnership"], full: true },
    { name: "message", label: "Message", type: "textarea", full: true, required: true },
  ],
  quote: [
    { name: "name", label: "Full name", autoComplete: "name", required: true },
    { name: "company", label: "Company", autoComplete: "organization" },
    { name: "email", label: "Work email", type: "email", autoComplete: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", required: true },
    { name: "product", label: "Product / service of interest", full: true },
    { name: "quantity", label: "Quantity / scope" },
    { name: "timeline", label: "Timeline", type: "select", options: ["ASAP", "Within 1 month", "1–3 months", "3+ months", "Just exploring"] },
    { name: "message", label: "Project details & requirements", type: "textarea", full: true, required: true },
  ],
  newsletter: [{ name: "email", label: "Email", type: "email", autoComplete: "email", required: true }],
  careers: [
    { name: "name", label: "Full name", autoComplete: "name", required: true },
    { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel", required: true },
    { name: "position", label: "Position", type: "select", options: [], required: true },
    { name: "portfolio", label: "LinkedIn / portfolio URL", type: "url", full: true },
    { name: "message", label: "Why would you be a great fit?", type: "textarea", full: true, required: true },
  ],
  callback: [
    { name: "name", label: "Name", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "preferredTime", label: "Preferred time", type: "select", options: ["Morning", "Afternoon", "Evening"] },
  ],
};
