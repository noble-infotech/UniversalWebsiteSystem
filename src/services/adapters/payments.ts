import type { SiteConfig } from "@/core/config/schema";
import { NotConfiguredError, type PaymentProvider } from "../types";

/** Offline methods (COD, bank transfer) or "pay later" – no gateway involved. */
export const manualPayments: PaymentProvider = {
  id: "manual",
  async createPayment(order) {
    return {
      status: "pending",
      reference: order.number,
      instructions: order.paymentMethod === "cod" ? "Pay in cash when your order is delivered." : "We will email you payment instructions shortly.",
    };
  },
};

/**
 * Stripe Checkout (hosted payment page) via the Stripe REST API.
 * Requires STRIPE_SECRET_KEY on the server. Webhook handling (to mark orders
 * paid) must be added with a durable OrderRepository – see docs/INTEGRATIONS.md.
 */
export function stripePayments(site: SiteConfig): PaymentProvider {
  return {
    id: "stripe",
    async createPayment(order, ctx) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new NotConfiguredError("Stripe", "Set STRIPE_SECRET_KEY in the server environment.");
      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("success_url", ctx.returnUrl);
      body.set("cancel_url", ctx.cancelUrl);
      body.set("customer_email", order.email);
      body.set("client_reference_id", order.number);
      const currency = site.commerce.currency.toLowerCase();
      // Single consolidated line keeps tax/discount/shipping exactly as computed server-side.
      body.set("line_items[0][quantity]", "1");
      body.set("line_items[0][price_data][currency]", currency);
      body.set("line_items[0][price_data][unit_amount]", String(Math.round(order.totals.total * 100)));
      body.set("line_items[0][price_data][product_data][name]", `${site.company.brandName} order ${order.number}`);
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error(`Stripe error: ${res.status} ${await res.text()}`);
      const session = (await res.json()) as { id: string; url: string };
      return { status: "redirect", redirectUrl: session.url, reference: session.id };
    },
  };
}

/** Placeholder for gateways that are wired per project (Razorpay, PayPal, custom). */
export function unconfiguredPayments(id: string): PaymentProvider {
  return {
    id,
    async createPayment() {
      throw new NotConfiguredError(`Payment provider "${id}"`, `Implement src/services/adapters/payments.ts → ${id}Payments and register it in src/services/index.ts.`);
    },
  };
}
