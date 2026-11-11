import "server-only";
/**
 * FIREBASE FIRESTORE – backend storage (no SQL database)
 * ---------------------------------------------------------------------------
 * Each website uses its own Firebase project (recommended: one per customer).
 * Credentials for site "maison-lumiere", first match wins:
 *
 *   1. FIREBASE_SERVICE_ACCOUNT_MAISON_LUMIERE  – service-account JSON (raw or base64), for
 *                                                 several sites on ONE deployment
 *   2. FIREBASE_SERVICE_ACCOUNT                 – the project's service-account JSON (raw or base64)
 *   3. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *   4. FIRESTORE_EMULATOR_HOST (+ FIREBASE_PROJECT_ID) – local emulator for development/tests
 *
 * ISOLATE_SITE_STORAGE=true: a site never falls back to the shared credentials (2–3).
 * Data lives under the collection  uws_sites/{siteId}/…  (see store.ts / media.ts).
 */
import { cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const envSuffix = (siteId: string) => siteId.toUpperCase().replace(/[^A-Z0-9]/g, "_");
const isolated = () => process.env.ISOLATE_SITE_STORAGE === "true";

type Creds = { projectId: string; clientEmail?: string; privateKey?: string; emulator?: boolean };

function parseServiceAccount(raw: string): Creds | undefined {
  try {
    const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const j = JSON.parse(text) as { project_id?: string; client_email?: string; private_key?: string };
    if (!j.project_id || !j.client_email || !j.private_key) return undefined;
    return { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key };
  } catch {
    return undefined;
  }
}

/** Which Firebase project (and credentials) a site uses, or undefined when none is configured. */
export function firebaseCredsFor(siteId: string): Creds | undefined {
  const specific = process.env[`FIREBASE_SERVICE_ACCOUNT_${envSuffix(siteId)}`];
  if (specific) return parseServiceAccount(specific);
  if (isolated()) return undefined;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
  const { FIREBASE_PROJECT_ID: projectId, FIREBASE_CLIENT_EMAIL: clientEmail, FIREBASE_PRIVATE_KEY: key } = process.env;
  if (projectId && clientEmail && key) return { projectId, clientEmail, privateKey: key.replace(/\\n/g, "\n") };
  if (process.env.FIRESTORE_EMULATOR_HOST) return { projectId: projectId || "demo-uws", emulator: true };
  return undefined;
}

export const hasFirebase = (siteId: string) => Boolean(firebaseCredsFor(siteId));

export function firebaseEnvHint(siteId: string) {
  return `FIREBASE_SERVICE_ACCOUNT (or FIREBASE_SERVICE_ACCOUNT_${envSuffix(siteId)} on a shared deployment)`;
}

/** Non-secret label for the admin UI. */
export function firebaseLabel(siteId: string) {
  const c = firebaseCredsFor(siteId);
  return c ? `${c.emulator ? "emulator " : ""}project ${c.projectId}` : undefined;
}

// Process-wide cache: Next.js may load this module more than once (one copy per route bundle),
// but firebase-admin's app registry is global, so the Firestore client must be shared too.
const g = globalThis as unknown as { __uwsFirestore?: Map<string, Firestore> };
const dbs = (g.__uwsFirestore ??= new Map<string, Firestore>());

/** Firestore client for a site's Firebase project (one app per project, reused across requests). */
export function firestoreFor(siteId: string): Firestore {
  const c = firebaseCredsFor(siteId);
  if (!c) throw new Error(`Firebase is not configured for site "${siteId}". Set ${firebaseEnvHint(siteId)}.`);
  const key = `${c.projectId}|${c.clientEmail ?? "emulator"}`;
  let db = dbs.get(key);
  if (!db) {
    const name = `uws-${key.replace(/[^a-zA-Z0-9-]/g, "-")}`;
    const app = getApps().some((a) => a.name === name)
      ? getApp(name)
      : initializeApp(c.emulator ? { projectId: c.projectId } : { projectId: c.projectId, credential: cert({ projectId: c.projectId, clientEmail: c.clientEmail, privateKey: c.privateKey } as ServiceAccount) }, name);
    db = getFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      /* already configured by another copy of this module */
    }
    dbs.set(key, db);
  }
  return db;
}

/* ---------------- large values are split across documents (1 MiB doc limit) ---------------- */
export const CHUNK_BYTES = 900_000;

export function chunk(buf: Buffer): Buffer[] {
  const out: Buffer[] = [];
  for (let i = 0; i < buf.length; i += CHUNK_BYTES) out.push(buf.subarray(i, i + CHUNK_BYTES));
  return out.length ? out : [Buffer.alloc(0)];
}
