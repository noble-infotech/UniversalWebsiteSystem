import { z } from "zod";
import type { CartLine, Totals } from "./pricing";

export const AddressInputSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  line1: z.string().trim().min(3, "Street address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  region: z.string().trim().optional(),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required"),
});
export type AddressInput = z.infer<typeof AddressInputSchema>;

export const CheckoutSchema = z.object({
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  shipping: AddressInputSchema.optional(),
  shippingMethodId: z.string().optional(),
  paymentMethod: z.string().min(1, "Choose a payment method"),
  couponCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
  lines: z
    .array(
      z.object({
        slug: z.string(),
        quantity: z.number().int().positive(),
        options: z.record(z.string(), z.string()).default({}),
        customization: z.record(z.string(), z.string()).optional(),
      }),
    )
    .min(1, "Your cart is empty"),
});
export type CheckoutInput = z.infer<typeof CheckoutSchema>;

export type OrderStatus = "pending_payment" | "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  number: string;
  siteId: string;
  createdAt: string;
  status: OrderStatus;
  email: string;
  phone: string;
  shipping?: AddressInput;
  shippingMethod?: { id: string; label: string; estimate?: string };
  paymentMethod: string;
  couponCode?: string;
  lines: CartLine[];
  totals: Totals;
  currency: string;
  /** "demo" orders are not persisted on a server – see docs/INTEGRATIONS.md */
  mode: "demo" | "live";
  payment?: { provider: string; status: "not_required" | "pending" | "redirect" | "paid"; redirectUrl?: string; reference?: string };
}

export const ORDER_STAGES: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Order placed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];
