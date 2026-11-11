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
import { FirestoreRest, type Creds } from "./firestore-rest";

const envSuffix = (siteId: string) => siteId.toUpperCase().replace(/[^A-Z0-9]/g, "_");
const isolated = () => process.env.ISOLATE_SITE_STORAGE === "true";

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

// One client per Firebase project, shared process-wide (Next.js may load this module once per
// route bundle). Uses Firestore's REST API, so it also runs on Cloudflare Workers.
const g = globalThis as unknown as { __uwsFirestore?: Map<string, FirestoreRest> };
const dbs = (g.__uwsFirestore ??= new Map<string, FirestoreRest>());

/** Firestore client for a site's Firebase project. */
export function firestoreFor(siteId: string): FirestoreRest {
  const c = firebaseCredsFor(siteId);
  if (!c) throw new Error(`Firebase is not configured for site "${siteId}". Set ${firebaseEnvHint(siteId)}.`);
  const key = `${c.projectId}|${c.clientEmail ?? "emulator"}`;
  let db = dbs.get(key);
  if (!db) {
    db = new FirestoreRest(c);
    dbs.set(key, db);
  }
  return db;
}

/* ---------------- large values are split across documents (1 MiB doc limit) ---------------- */
export const CHUNK_BYTES = 900_000;

export function chunk(buf: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = [];
  for (let i = 0; i < buf.length; i += CHUNK_BYTES) out.push(buf.subarray(i, i + CHUNK_BYTES));
  return out.length ? out : [new Uint8Array(0)];
}
