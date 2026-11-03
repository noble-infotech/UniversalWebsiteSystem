import "server-only";
/**
 * CONTENT STORE – persistence for admin edits, enquiries and orders.
 *
 *   Postgres  (DATABASE_URL / POSTGRES_URL set)  → production, works on Vercel
 *   Local JSON files in ./.data                  → local development, zero setup
 *   Read-only                                    → hosted without a database (admin can view, not save)
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { SiteConfigInput } from "@/core/config/schema";
import type { Order, OrderStatus } from "@/core/commerce/orders";
import { databaseLabel, databaseUrlFor, ensureSchema, sqlFor } from "./db";

export type Overrides = Partial<Omit<SiteConfigInput, "id">>;
export type Enquiry = { id: string; siteId: string; form: string; data: Record<string, unknown>; page?: string; status: "new" | "read" | "archived"; createdAt: string };
export type StoreKind = "postgres" | "file" | "readonly";

/**
 * A store is always bound to ONE site: it reads and writes only that site's database
 * (or that site's local files). Site ids are still stored in every row as a second guard.
 */
export interface ContentStore {
  kind: StoreKind;
  writable: boolean;
  /** Non-secret description of where the data lives, for the admin UI. */
  location?: string;
  getOverrides(siteId: string): Promise<{ data: Overrides; updatedAt?: string; updatedBy?: string }>;
  saveOverrides(siteId: string, data: Overrides, by: string): Promise<void>;
  addEnquiry(e: Enquiry): Promise<void>;
  listEnquiries(siteId: string, limit?: number): Promise<Enquiry[]>;
  setEnquiryStatus(siteId: string, id: string, status: Enquiry["status"]): Promise<void>;
  saveOrder(o: Order): Promise<void>;
  findOrder(siteId: string, number: string, email: string): Promise<Order | undefined>;
  listOrders(siteId: string, limit?: number): Promise<Order[]>;
  setOrderStatus(siteId: string, number: string, status: OrderStatus): Promise<Order | undefined>;
}

/* ------------------------------ Postgres ------------------------------ */
function pgStore(boundSite: string): ContentStore {
  const sql = () => sqlFor(boundSite);
  const ready = () => ensureSchema(boundSite);
  const guard = (siteId: string) => {
    if (siteId !== boundSite) throw new Error(`Store for "${boundSite}" cannot access "${siteId}"`);
  };
  return {
  kind: "postgres" as const,
  writable: true,
  location: databaseLabel(boundSite),
  async getOverrides(siteId) {
    guard(siteId);
    await ready();
    const rows = await sql()`SELECT data, updated_at, updated_by FROM uws_site_overrides WHERE site_id = ${siteId}`;
    if (!rows.length) return { data: {} };
    return { data: rows[0].data as Overrides, updatedAt: new Date(rows[0].updated_at).toISOString(), updatedBy: rows[0].updated_by ?? undefined };
  },
  async saveOverrides(siteId, data, by) {
    guard(siteId);
    await ready();
    await sql()`INSERT INTO uws_site_overrides (site_id, data, updated_at, updated_by)
      VALUES (${siteId}, ${sql().json(data as never)}, now(), ${by})
      ON CONFLICT (site_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now(), updated_by = EXCLUDED.updated_by`;
  },
  async addEnquiry(e) {
    guard(e.siteId);
    await ready();
    await sql()`INSERT INTO uws_enquiries (id, site_id, form, data, page, status, created_at) VALUES (${e.id}, ${e.siteId}, ${e.form}, ${sql().json(e.data as never)}, ${e.page ?? null}, ${e.status}, ${e.createdAt})`;
  },
  async listEnquiries(siteId, limit = 200) {
    guard(siteId);
    await ready();
    const rows = await sql()`SELECT * FROM uws_enquiries WHERE site_id = ${siteId} ORDER BY created_at DESC LIMIT ${limit}`;
    return rows.map((r) => ({ id: r.id, siteId: r.site_id, form: r.form, data: r.data, page: r.page ?? undefined, status: r.status, createdAt: new Date(r.created_at).toISOString() }));
  },
  async setEnquiryStatus(siteId, id, status) {
    guard(siteId);
    await ready();
    await sql()`UPDATE uws_enquiries SET status = ${status} WHERE site_id = ${siteId} AND id = ${id}`;
  },
  async saveOrder(o) {
    guard(o.siteId);
    await ready();
    await sql()`INSERT INTO uws_orders (number, site_id, email, status, total, data, created_at)
      VALUES (${o.number}, ${o.siteId}, ${o.email.toLowerCase()}, ${o.status}, ${o.totals.total}, ${sql().json(o as never)}, ${o.createdAt})
      ON CONFLICT (number) DO UPDATE SET status = EXCLUDED.status, data = EXCLUDED.data`;
  },
  async findOrder(siteId, number, email) {
    guard(siteId);
    await ready();
    const rows = await sql()`SELECT data FROM uws_orders WHERE site_id = ${siteId} AND number = ${number} AND email = ${email.toLowerCase()}`;
    return rows[0]?.data as Order | undefined;
  },
  async listOrders(siteId, limit = 200) {
    guard(siteId);
    await ready();
    const rows = await sql()`SELECT data FROM uws_orders WHERE site_id = ${siteId} ORDER BY created_at DESC LIMIT ${limit}`;
    return rows.map((r) => r.data as Order);
  },
  async setOrderStatus(siteId, number, status) {
    guard(siteId);
    await ready();
    const rows = await sql()`SELECT data FROM uws_orders WHERE site_id = ${siteId} AND number = ${number}`;
    if (!rows.length) return undefined;
    const order = { ...(rows[0].data as Order), status };
    await sql()`UPDATE uws_orders SET status = ${status}, data = ${sql().json(order as never)} WHERE site_id = ${siteId} AND number = ${number}`;
    return order;
  },
  };
}

/* ------------------------- Local JSON files (dev) ------------------------- */
const dir = path.join(process.cwd(), ".data");
async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}
async function writeJson(file: string, data: unknown) {
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `${file}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, path.join(dir, file));
}
const file: ContentStore = {
  kind: "file",
  writable: true,
  async getOverrides(siteId) {
    return readJson(`overrides-${siteId}.json`, { data: {} as Overrides });
  },
  async saveOverrides(siteId, data, by) {
    await writeJson(`overrides-${siteId}.json`, { data, updatedAt: new Date().toISOString(), updatedBy: by });
  },
  async addEnquiry(e) {
    const list = await readJson<Enquiry[]>(`enquiries-${e.siteId}.json`, []);
    await writeJson(`enquiries-${e.siteId}.json`, [e, ...list].slice(0, 2000));
  },
  async listEnquiries(siteId, limit = 200) {
    return (await readJson<Enquiry[]>(`enquiries-${siteId}.json`, [])).slice(0, limit);
  },
  async setEnquiryStatus(siteId, id, status) {
    const list = await readJson<Enquiry[]>(`enquiries-${siteId}.json`, []);
    await writeJson(`enquiries-${siteId}.json`, list.map((e) => (e.id === id ? { ...e, status } : e)));
  },
  async saveOrder(o) {
    const list = await readJson<Order[]>(`orders-${o.siteId}.json`, []);
    await writeJson(`orders-${o.siteId}.json`, [o, ...list.filter((x) => x.number !== o.number)].slice(0, 5000));
  },
  async findOrder(siteId, number, email) {
    return (await readJson<Order[]>(`orders-${siteId}.json`, [])).find((o) => o.number === number && o.email.toLowerCase() === email.toLowerCase());
  },
  async listOrders(siteId, limit = 200) {
    return (await readJson<Order[]>(`orders-${siteId}.json`, [])).slice(0, limit);
  },
  async setOrderStatus(siteId, number, status) {
    const list = await readJson<Order[]>(`orders-${siteId}.json`, []);
    let updated: Order | undefined;
    await writeJson(`orders-${siteId}.json`, list.map((o) => (o.number === number ? (updated = { ...o, status }) : o)));
    return updated;
  },
};

/* ------------------------------ Read-only ------------------------------ */
const readonly: ContentStore = {
  ...file,
  kind: "readonly",
  writable: false,
  getOverrides: async () => ({ data: {} }),
  saveOverrides: async () => {
    throw new Error("No database configured. Add DATABASE_URL to enable saving.");
  },
  addEnquiry: async () => {},
  listEnquiries: async () => [],
  setEnquiryStatus: async () => {},
  saveOrder: async () => {},
  findOrder: async () => undefined,
  listOrders: async () => [],
  setOrderStatus: async () => undefined,
};

/** The store for one site: its own database if configured, else local files (dev) or read-only. */
export function getStore(siteId: string): ContentStore {
  if (databaseUrlFor(siteId)) return pgStore(siteId);
  // Serverless hosts (Vercel) have a read-only/ephemeral filesystem – never pretend to persist there.
  if (process.env.VERCEL || process.env.UWS_READONLY === "true") return readonly;
  return file;
}
