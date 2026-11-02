import "server-only";
import type { SiteConfig } from "@/core/config/schema";
import { configCatalog, configInventory } from "./adapters/catalog";
import { memoryOrderRepository } from "./adapters/orders";
import { manualPayments, stripePayments, unconfiguredPayments } from "./adapters/payments";
import { flatRateShipping } from "./adapters/shipping";
import { consoleForms, webhookForms } from "./adapters/forms";

/** Composition root: picks adapters per site based on configuration + environment. */
export function getServices(site: SiteConfig) {
  const p = site.commerce.payment.provider;
  const payments = p === "manual" ? manualPayments : p === "stripe" ? stripePayments(site) : unconfiguredPayments(p);
  const webhook = process.env.FORMS_WEBHOOK_URL || site.integrations.forms.webhookUrl;
  const forms = site.integrations.forms.provider === "webhook" && webhook ? webhookForms(webhook) : consoleForms;
  return {
    catalog: configCatalog(site),
    inventory: configInventory(site),
    orders: memoryOrderRepository,
    payments,
    shipping: flatRateShipping(site),
    forms,
  };
}
export * from "./types";
