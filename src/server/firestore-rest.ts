/**
 * Minimal Cloud Firestore client over the REST API (fetch + Web Crypto only).
 *
 * Why not firebase-admin? Its Firestore SDK talks gRPC over HTTP/2, which
 * Cloudflare Workers can't run. This client works on Cloudflare, Vercel,
 * Node and the Firestore emulator alike, and is far smaller.
 *
 * Supports exactly what this app needs: get, batch commit (set / merge / delete),
 * ordered + limited queries, and listing a (sub)collection.
 */

export type Creds = { projectId: string; clientEmail?: string; privateKey?: string; emulator?: boolean };
type Value = Record<string, unknown>;
type Fields = Record<string, Value>;
export type Write =
  | { op: "set"; path: string; data: Record<string, unknown>; merge?: boolean }
  | { op: "delete"; path: string };

const SCOPE = "https://www.googleapis.com/auth/datastore";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

/* --------------------------- value encoding --------------------------- */
const b64 = (u8: Uint8Array) => {
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(s);
};
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export function encodeValue(v: unknown): Value | undefined {
  if (v === undefined) return undefined;
  if (v === null) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (v instanceof Uint8Array) return { bytesValue: b64(v) }; // Buffer is a Uint8Array
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue).filter((x): x is Value => !!x) } };
  if (typeof v === "object") return { mapValue: { fields: encodeFields(v as Record<string, unknown>) } };
  throw new Error(`Unsupported Firestore value: ${typeof v}`);
}

export function encodeFields(o: Record<string, unknown>): Fields {
  const f: Fields = {};
  for (const [k, v] of Object.entries(o)) {
    const e = encodeValue(v);
    if (e) f[k] = e;
  }
  return f;
}

export function decodeValue(v: Value): unknown {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("bytesValue" in v) return unb64(v.bytesValue as string);
  if ("arrayValue" in v) return ((v.arrayValue as { values?: Value[] }).values ?? []).map(decodeValue);
  if ("mapValue" in v) return decodeFields((v.mapValue as { fields?: Fields }).fields ?? {});
  if ("referenceValue" in v) return v.referenceValue;
  if ("geoPointValue" in v) return v.geoPointValue;
  return undefined;
}

export function decodeFields(f: Fields): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) o[k] = decodeValue(v);
  return o;
}

/* ------------------------------- auth ------------------------------- */
const tokenCache = ((globalThis as unknown as { __uwsFsTokens?: Map<string, { token: string; exp: number }> }).__uwsFsTokens ??= new Map());

const b64url = (data: Uint8Array | string) => b64(typeof data === "string" ? new TextEncoder().encode(data) : data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function signJwt(clientEmail: string, privateKeyPem: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const der = unb64(privateKeyPem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`)));
  return `${header}.${claims}.${b64url(sig)}`;
}

async function accessToken(c: Creds): Promise<string> {
  if (c.emulator) return "owner"; // the emulator accepts this as an admin token
  const cached = tokenCache.get(c.clientEmail!);
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: await signJwt(c.clientEmail!, c.privateKey!) }),
  });
  if (!res.ok) throw new Error(`Firebase sign-in failed (${res.status}): ${(await res.text()).slice(0, 200)} – check FIREBASE_SERVICE_ACCOUNT`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache.set(c.clientEmail!, { token: j.access_token, exp: Date.now() + j.expires_in * 1000 });
  return j.access_token;
}

/* ------------------------------- client ------------------------------- */
export class FirestoreRest {
  private readonly root: string; // projects/{p}/databases/(default)/documents
  private readonly base: string; // https://host/v1

  constructor(private readonly creds: Creds) {
    this.root = `projects/${creds.projectId}/databases/(default)/documents`;
    const host = creds.emulator ? process.env.FIRESTORE_EMULATOR_HOST : undefined;
    this.base = host ? `http://${host}/v1` : "https://firestore.googleapis.com/v1";
  }

  private name(path: string) {
    return `${this.root}/${path.split("/").map(encodeURIComponent).join("/")}`;
  }

  private async call<T>(method: string, url: string, body?: unknown): Promise<T | undefined> {
    const res = await fetch(url, {
      method,
      headers: { authorization: `Bearer ${await accessToken(this.creds)}`, ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`Firestore ${method} failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return (await res.json()) as T;
  }

  /** Read one document; undefined when it doesn't exist. */
  async get(path: string): Promise<Record<string, unknown> | undefined> {
    const d = await this.call<{ fields?: Fields }>("GET", `${this.base}/${this.name(path)}`);
    return d ? decodeFields(d.fields ?? {}) : undefined;
  }

  /** Atomic batch of writes (max 500 per call; split automatically, each chunk atomic). */
  async commit(writes: Write[]) {
    for (let i = 0; i < writes.length; i += 450) {
      const body = {
        writes: writes.slice(i, i + 450).map((w) =>
          w.op === "delete"
            ? { delete: this.name(w.path) }
            : { update: { name: this.name(w.path), fields: encodeFields(w.data) }, ...(w.merge ? { updateMask: { fieldPaths: Object.keys(w.data).map((k) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : `\`${k}\``)) } } : {}) },
        ),
      };
      await this.call("POST", `${this.base}/${this.root}:commit`, body);
    }
  }

  set(path: string, data: Record<string, unknown>, merge = false) {
    return this.commit([{ op: "set", path, data, merge }]);
  }

  /** Documents of a collection ordered by one field, newest first by default. */
  async query(collectionPath: string, orderBy: string, opts: { direction?: "ASCENDING" | "DESCENDING"; limit?: number } = {}) {
    const i = collectionPath.lastIndexOf("/");
    const parent = i < 0 ? this.root : this.name(collectionPath.slice(0, i));
    const collectionId = collectionPath.slice(i + 1);
    const rows = await this.call<{ document?: { name: string; fields?: Fields } }[]>("POST", `${this.base}/${parent}:runQuery`, {
      structuredQuery: { from: [{ collectionId }], orderBy: [{ field: { fieldPath: orderBy }, direction: opts.direction ?? "DESCENDING" }], ...(opts.limit ? { limit: opts.limit } : {}) },
    });
    return (rows ?? []).filter((r) => r.document).map((r) => ({ id: decodeURIComponent(r.document!.name.split("/").pop()!), data: decodeFields(r.document!.fields ?? {}) }));
  }

  /** All documents directly in a collection (any order). */
  async list(collectionPath: string) {
    const out: { id: string; data: Record<string, unknown> }[] = [];
    let pageToken = "";
    do {
      const r = await this.call<{ documents?: { name: string; fields?: Fields }[]; nextPageToken?: string }>(
        "GET",
        `${this.base}/${this.name(collectionPath)}?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
      );
      for (const d of r?.documents ?? []) out.push({ id: decodeURIComponent(d.name.split("/").pop()!), data: decodeFields(d.fields ?? {}) });
      pageToken = r?.nextPageToken ?? "";
    } while (pageToken);
    return out;
  }
}
