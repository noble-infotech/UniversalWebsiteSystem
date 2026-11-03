import "server-only";
import type { FormHandler, OrderRepository } from "../types";
import { getStore } from "@/server/store";

/** Durable orders in Postgres (or local JSON files in development). */
export function storeOrderRepository(siteId: string): OrderRepository {
  const store = getStore(siteId);
  return {
    durable: true,
    async create(order) {
      await store.saveOrder(order);
      return order;
    },
    find: (number, email) => store.findOrder(siteId, number, email),
  };
}

/** Saves every submission to the admin inbox, then forwards it to the next handler (console / webhook). */
export function storeForms(next: FormHandler): FormHandler {
  return {
    id: `store+${next.id}`,
    async submit(form, data, meta) {
      const { id } = await next.submit(form, data, meta);
      await getStore(meta.site.id)
        .addEnquiry({ id, siteId: meta.site.id, form, data, page: meta.page, status: "new", createdAt: new Date().toISOString() })
        .catch((e) => console.error("[forms] could not store enquiry", e));
      return { id };
    },
  };
}
