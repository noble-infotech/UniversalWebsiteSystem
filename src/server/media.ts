import "server-only";
import { isEphemeralHost } from "./host";
/**
 * MEDIA STORAGE (admin image uploads) – one store per site, chosen automatically:
 *
 *   1. Firestore     the site's Firebase project (see firebase.ts); images are split into
 *                    ~900 KB pieces to fit Firestore's 1 MiB document limit – works on the free plan
 *   2. Local files   .data/media/<site>/ during local development
 *   3. none          hosted without Firebase → uploads disabled (paste image URLs instead)
 *
 * Images are served by /api/media/<site>/<file> with year-long cache headers, so after the
 * first request they come from Vercel's CDN rather than Firestore.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { chunk, firestoreFor, hasFirebase } from "./firebase";

export type MediaKind = "firestore" | "file" | "none";
export type MediaItem = { id: string; url: string; filename: string; contentType: string; size: number; createdAt: string };

export interface MediaStore {
  kind: MediaKind;
  upload(file: { name: string; bytes: Buffer; contentType: string }): Promise<MediaItem>;
  list(): Promise<MediaItem[]>;
  remove(id: string): Promise<void>;
  /** Bytes of a stored image (served through /api/media). */
  read(id: string): Promise<{ contentType: string; bytes: Buffer } | undefined>;
}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg", "image/x-icon": "ico" };

/** Detect the real image type from the file's bytes (never trust the browser-supplied type). */
export function sniffImageType(b: Buffer): string | undefined {
  if (b.length < 12) return undefined;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (b.subarray(4, 12).toString("ascii").startsWith("ftypavi")) return "image/avif";
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return "image/x-icon";
  const head = b.subarray(0, 1024).toString("utf8").trimStart().toLowerCase();
  if ((head.startsWith("<svg") || head.startsWith("<?xml")) && head.includes("<svg")) return "image/svg+xml";
  return undefined;
}

/** Remove scripts, event handlers and external/javascript references from uploaded SVGs. */
export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script[^>]*\/>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|xlink:href)\s*=\s*("|')\s*(javascript|data:text\/html)[^"']*\2/gi, "")
    .replace(/<!ENTITY[\s\S]*?>/gi, "");
}

function makeId(name: string, contentType: string) {
  const base = path.basename(name).replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image";
  return `${base}-${crypto.randomBytes(5).toString("hex")}.${EXT[contentType] ?? "bin"}`;
}

const SAFE_ID = /^[a-z0-9-]+\.(jpg|png|webp|gif|avif|svg|ico)$/;
export const isSafeMediaId = (id: string) => SAFE_ID.test(id);
const localUrl = (siteId: string, id: string) => `/api/media/${siteId}/${id}`;

/* ------------------------------ Firestore ------------------------------ */
/** uws_sites/{site}/media/{id} { filename, contentType, size, parts, createdAt } + parts/{n} { n, data: bytes } */
function firestoreMedia(siteId: string): MediaStore {
  const db = () => firestoreFor(siteId);
  const col = `uws_sites/${siteId}/media`;
  return {
    kind: "firestore",
    async upload({ name, bytes, contentType }) {
      const id = makeId(name, contentType);
      const pieces = chunk(bytes);
      const createdAt = new Date().toISOString();
      // One write per piece: each request stays well under Firestore's 10 MiB request limit.
      for (const [n, b] of pieces.entries()) await db().set(`${col}/${id}/parts/${String(n).padStart(4, "0")}`, { n, data: b });
      await db().set(`${col}/${id}`, { filename: name.slice(0, 200), contentType, size: bytes.length, parts: pieces.length, createdAt });
      return { id, url: localUrl(siteId, id), filename: name, contentType, size: bytes.length, createdAt };
    },
    async list() {
      const rows = await db().query(col, "createdAt", { limit: 1000 });
      return rows.map((d) => ({ id: d.id, url: localUrl(siteId, d.id), filename: String(d.data.filename), contentType: String(d.data.contentType), size: Number(d.data.size), createdAt: String(d.data.createdAt) }));
    },
    async remove(id) {
      if (!isSafeMediaId(id)) throw new Error("Invalid id");
      const parts = await db().list(`${col}/${id}/parts`);
      await db().commit([...parts.map((p) => ({ op: "delete" as const, path: `${col}/${id}/parts/${p.id}` })), { op: "delete", path: `${col}/${id}` }]);
    },
    async read(id) {
      if (!isSafeMediaId(id)) return undefined;
      const meta = await db().get(`${col}/${id}`);
      if (!meta) return undefined;
      const parts = (await db().list(`${col}/${id}/parts`)).sort((x, y) => Number(x.data.n) - Number(y.data.n));
      return { contentType: String(meta.contentType), bytes: Buffer.concat(parts.map((p) => p.data.data as Uint8Array)) };
    },
  };
}

/* ------------------------- Local files (development) ------------------------- */
function fileMedia(siteId: string): MediaStore {
  const dir = path.join(process.cwd(), ".data", "media", siteId);
  return {
    kind: "file",
    async upload({ name, bytes, contentType }) {
      await fs.mkdir(dir, { recursive: true });
      const id = makeId(name, contentType);
      await fs.writeFile(path.join(dir, id), bytes);
      return { id, url: localUrl(siteId, id), filename: name, contentType, size: bytes.length, createdAt: new Date().toISOString() };
    },
    async list() {
      const files = await fs.readdir(dir).catch(() => [] as string[]);
      const items = await Promise.all(
        files.filter(isSafeMediaId).map(async (id) => {
          const st = await fs.stat(path.join(dir, id));
          const ext = id.split(".").pop()!;
          return { id, url: localUrl(siteId, id), filename: id, contentType: Object.keys(EXT).find((k) => EXT[k] === ext) ?? "image", size: st.size, createdAt: st.mtime.toISOString() };
        }),
      );
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async remove(id) {
      if (!isSafeMediaId(id)) throw new Error("Invalid id");
      await fs.rm(path.join(dir, id), { force: true });
    },
    async read(id) {
      if (!isSafeMediaId(id)) return undefined;
      const bytes = await fs.readFile(path.join(dir, id)).catch(() => undefined);
      if (!bytes) return undefined;
      const ext = id.split(".").pop()!;
      return { contentType: Object.keys(EXT).find((k) => EXT[k] === ext) ?? "application/octet-stream", bytes };
    },
  };
}

const none: MediaStore = {
  kind: "none",
  upload: async () => {
    throw new Error("Image uploads need storage: connect Firebase to this website (see docs/ADMIN.md).");
  },
  list: async () => [],
  remove: async () => {},
  read: async () => undefined,
};

export function getMediaStore(siteId: string): MediaStore {
  if (hasFirebase(siteId)) return firestoreMedia(siteId);
  if (isEphemeralHost()) return none;
  return fileMedia(siteId);
}
