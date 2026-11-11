import type { Order } from "@/core/commerce/orders";
import type { OrderRepository } from "../types";

/**
 * In-memory order store. NOT DURABLE: data is lost on restart and is not
 * shared between serverless instances. It exists so checkout → confirmation →
 * tracking can be exercised without storage. Used only when neither Firebase nor
 * local files are available (see src/server/store.ts).
 */
const g = globalThis as unknown as { __uwsOrders?: Map<string, Order> };
const store = (g.__uwsOrders ??= new Map<string, Order>());

export const memoryOrderRepository: OrderRepository = {
  durable: false,
  async create(order) {
    store.set(`${order.siteId}:${order.number}`, order);
    return order;
  },
  async find(number, email) {
    for (const o of store.values()) if (o.number === number && o.email.toLowerCase() === email.toLowerCase()) return o;
    return undefined;
  },
};
