import "server-only";
import { isEphemeralHost } from "./host";
/**
 * CONTENT STORE – persistence for admin edits, enquiries and orders (no SQL database).
 *
 *   Firebase Firestore (see firebase.ts)  → production, works on Vercel
 *   Local JSON files in ./.data           → local development, zero setup
 *   Read-only                             → hosted without Firebase (admin can view, not save)
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { SiteConfigInput } from "@/core/config/schema";
import type { Order, OrderStatus } from "@/core/commerce/orders";
import { chunk, firebaseLabel, firestoreFor, hasFirebase } from "./firebase";
import type { Write } from "./firestore-rest";

export type Overrides = Partial<Omit<SiteConfigInput, "id">>;
export type Enquiry = { id: string; siteId: string; form: string; data: Record<string, unknown>; page?: string; status: "new" | "read" | "archived"; createdAt: string };
export type StoreKind = "firestore" | "file" | "readonly";

/**
 * A store is always bound to ONE site: it reads and writes only that site's Firebase project
 * (or that site's local files), under uws_sites/{siteId}. Records also carry the site id.
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

/* ------------------------------ Firestore ------------------------------ */
const ORDER_NO = /^[A-Za-z0-9-]{3,40}$/;
const DOC_ID = /^[A-Za-z0-9_-]{1,100}$/;

/**
 * Layout (per site, in that site's Firebase project):
 *   uws_sites/{site}                         { updatedAt, updatedBy }
 *   uws_sites/{site}/modules/{module}        { parts, updatedAt }  + parts/{n} { text }   (admin edits, JSON)
 *   uws_sites/{site}/enquiries/{id}          enquiry fields (readable in the Firebase console)
 *   uws_sites/{site}/orders/{number}         order fields + emailLower
 * Module JSON is split into parts so even large catalogues fit Firestore's 1 MiB document limit.
 */
function firestoreStore(boundSite: string): ContentStore {
  const db = () => firestoreFor(boundSite);
  const root = `uws_sites/${boundSite}`;
  const guard = (siteId: string) => {
    if (siteId !== boundSite) throw new Error(`Store for "${boundSite}" cannot access "${siteId}"`);
  };
  const strip = <T,>(o: Record<string, unknown>) => {
    const { emailLower: _e, ...rest } = o;
    return rest as T;
  };
  return {
    kind: "firestore",
    writable: true,
    location: firebaseLabel(boundSite),
    async getOverrides(siteId) {
      guard(siteId);
      const [meta, mods] = await Promise.all([db().get(root), db().list(`${root}/modules`)]);
      const data: Record<string, unknown> = {};
      await Promise.all(
        mods.map(async (m) => {
          const parts = (await db().list(`${root}/modules/${m.id}/parts`)).sort((x, y) => Number(x.data.n) - Number(y.data.n));
          data[m.id] = JSON.parse(parts.map((p) => String(p.data.text ?? "")).join(""));
        }),
      );
      return { data: data as Overrides, updatedAt: (meta?.updatedAt as string) ?? undefined, updatedBy: (meta?.updatedBy as string) ?? undefined };
    },
    async saveOverrides(siteId, data, by) {
      guard(siteId);
      const now = new Date().toISOString();
      const writes: Write[] = [];
      const keep = new Set(Object.keys(data).filter((k) => DOC_ID.test(k)));
      // remove modules that were reset, and stale parts of modules that shrank
      for (const m of await db().list(`${root}/modules`)) {
        const newParts = keep.has(m.id) ? chunk(new TextEncoder().encode(JSON.stringify((data as Record<string, unknown>)[m.id]))).length : 0;
        for (const p of await db().list(`${root}/modules/${m.id}/parts`)) if (Number(p.data.n) >= newParts) writes.push({ op: "delete", path: `${root}/modules/${m.id}/parts/${p.id}` });
        if (!keep.has(m.id)) writes.push({ op: "delete", path: `${root}/modules/${m.id}` });
      }
      for (const mod of keep) {
        const pieces = chunk(new TextEncoder().encode(JSON.stringify((data as Record<string, unknown>)[mod])));
        pieces.forEach((b, n) => writes.push({ op: "set", path: `${root}/modules/${mod}/parts/${String(n).padStart(4, "0")}`, data: { n, text: new TextDecoder().decode(b) } }));
        writes.push({ op: "set", path: `${root}/modules/${mod}`, data: { parts: pieces.length, updatedAt: now } });
      }
      writes.push({ op: "set", path: root, data: { updatedAt: now, updatedBy: by }, merge: true });
      await db().commit(writes);
    },
    async addEnquiry(e) {
      guard(e.siteId);
      if (!DOC_ID.test(e.id)) throw new Error("Invalid enquiry id");
      await db().set(`${root}/enquiries/${e.id}`, e);
    },
    async listEnquiries(siteId, limit = 200) {
      guard(siteId);
      return (await db().query(`${root}/enquiries`, "createdAt", { limit })).map((d) => d.data as Enquiry);
    },
    async setEnquiryStatus(siteId, id, status) {
      guard(siteId);
      if (!DOC_ID.test(id)) return;
      if (await db().get(`${root}/enquiries/${id}`)) await db().set(`${root}/enquiries/${id}`, { status }, true);
    },
    async saveOrder(o) {
      guard(o.siteId);
      if (!ORDER_NO.test(o.number)) throw new Error("Invalid order number");
      await db().set(`${root}/orders/${o.number}`, { ...o, emailLower: o.email.toLowerCase() });
    },
    async findOrder(siteId, number, email) {
      guard(siteId);
      if (!ORDER_NO.test(number)) return undefined;
      const d = await db().get(`${root}/orders/${number}`);
      const o = d ? strip<Order>(d) : undefined;
      return o && o.siteId === siteId && o.email.toLowerCase() === email.toLowerCase() ? o : undefined;
    },
    async listOrders(siteId, limit = 200) {
      guard(siteId);
      return (await db().query(`${root}/orders`, "createdAt", { limit })).map((d) => strip<Order>(d.data));
    },
    async setOrderStatus(siteId, number, status) {
      guard(siteId);
      if (!ORDER_NO.test(number)) return undefined;
      const d = await db().get(`${root}/orders/${number}`);
      if (!d) return undefined;
      await db().set(`${root}/orders/${number}`, { status }, true);
      return { ...strip<Order>(d), status };
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
    throw new Error("No storage configured. Connect Firebase (see docs/ADMIN.md) to enable saving.");
  },
  addEnquiry: async () => {},
  listEnquiries: async () => [],
  setEnquiryStatus: async () => {},
  saveOrder: async () => {},
  findOrder: async () => undefined,
  listOrders: async () => [],
  setOrderStatus: async () => undefined,
};

/** The store for one site: its own Firebase project if configured, else local files (dev) or read-only. */
export function getStore(siteId: string): ContentStore {
  if (hasFirebase(siteId)) return firestoreStore(siteId);
  // Serverless hosts (Vercel) have a read-only/ephemeral filesystem – never pretend to persist there.
  if (isEphemeralHost()) return readonly;
  return file;
}
