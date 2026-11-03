import "server-only";
import type { SiteConfig } from "@/core/config/schema";
import { configCatalog, configInventory } from "./adapters/catalog";
import { memoryOrderRepository } from "./adapters/orders";
import { manualPayments, stripePayments, unconfiguredPayments } from "./adapters/payments";
import { flatRateShipping } from "./adapters/shipping";
import { consoleForms, webhookForms } from "./adapters/forms";
import { storeForms, storeOrderRepository } from "./adapters/store-backed";
import { getStore } from "@/server/store";

/** Composition root: picks adapters per site based on configuration + environment. */
export function getServices(site: SiteConfig) {
  const p = site.commerce.payment.provider;
  const payments = p === "manual" ? manualPayments : p === "stripe" ? stripePayments(site) : unconfiguredPayments(p);
  const webhook = process.env.FORMS_WEBHOOK_URL || site.integrations.forms.webhookUrl;
  const delivery = site.integrations.forms.provider === "webhook" && webhook ? webhookForms(webhook) : consoleForms;
  const store = getStore(site.id);
  const persistent = store.writable;
  return {
    catalog: configCatalog(site),
    inventory: configInventory(site),
    // Database (or local files in dev) when available; otherwise the non-durable demo repository.
    orders: persistent ? storeOrderRepository(site.id) : memoryOrderRepository,
    payments,
    shipping: flatRateShipping(site),
    forms: persistent ? storeForms(delivery) : delivery,
  };
}
export * from "./types";
