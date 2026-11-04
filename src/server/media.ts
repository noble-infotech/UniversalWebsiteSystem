import "server-only";
/**
 * MEDIA STORAGE (admin image uploads) – one store per site, chosen automatically:
 *
 *   1. Vercel Blob   BLOB_READ_WRITE_TOKEN_<SITE_ID> or BLOB_READ_WRITE_TOKEN   → global CDN (recommended)
 *   2. Postgres      the site's own database (see db.ts)                          → no extra setup
 *   3. Local files   .data/media/<site>/ during local development
 *   4. none          hosted without Blob or database → uploads disabled (paste URLs instead)
 *
 * Postgres/local images are served by /api/media/<site>/<file> with long-lived cache headers.
 * With ISOLATE_SITE_DATABASES=true the shared BLOB_READ_WRITE_TOKEN is not used either.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { put, list, del } from "@vercel/blob";
import { databaseUrlFor, ensureSchema, sqlFor } from "./db";

export type MediaKind = "blob" | "postgres" | "file" | "none";
export type MediaItem = { id: string; url: string; filename: string; contentType: string; size: number; createdAt: string };

export interface MediaStore {
  kind: MediaKind;
  upload(file: { name: string; bytes: Buffer; contentType: string }): Promise<MediaItem>;
  list(): Promise<MediaItem[]>;
  remove(id: string): Promise<void>;
  /** Only for postgres/file stores (blob files are served by the Blob CDN). */
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

/* ------------------------------ Vercel Blob ------------------------------ */
const envSuffix = (siteId: string) => siteId.toUpperCase().replace(/[^A-Z0-9]/g, "_");
export function blobTokenFor(siteId: string) {
  const specific = process.env[`BLOB_READ_WRITE_TOKEN_${envSuffix(siteId)}`];
  if (specific) return specific;
  if (process.env.ISOLATE_SITE_DATABASES === "true") return undefined;
  return process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

function blobStore(siteId: string, token: string): MediaStore {
  const prefix = `sites/${siteId}/`;
  return {
    kind: "blob",
    async upload({ name, bytes, contentType }) {
      const id = makeId(name, contentType);
      const r = await put(prefix + id, bytes, { access: "public", token, contentType, addRandomSuffix: false, cacheControlMaxAge: 31536000 });
      return { id, url: r.url, filename: name, contentType, size: bytes.length, createdAt: new Date().toISOString() };
    },
    async list() {
      const out: MediaItem[] = [];
      let cursor: string | undefined;
      do {
        const r = await list({ prefix, token, cursor, limit: 1000 });
        for (const b of r.blobs) {
          const id = b.pathname.slice(prefix.length);
          const ext = id.split(".").pop() ?? "";
          out.push({ id, url: b.url, filename: id, contentType: Object.keys(EXT).find((k) => EXT[k] === ext) ?? "image", size: b.size, createdAt: new Date(b.uploadedAt).toISOString() });
        }
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async remove(id) {
      if (!isSafeMediaId(id)) throw new Error("Invalid id");
      await del(prefix + id, { token });
    },
    read: async () => undefined,
  };
}

/* ------------------------------ Postgres ------------------------------ */
function pgMedia(siteId: string): MediaStore {
  const sql = () => sqlFor(siteId);
  return {
    kind: "postgres",
    async upload({ name, bytes, contentType }) {
      await ensureSchema(siteId);
      const id = makeId(name, contentType);
      await sql()`INSERT INTO uws_media (id, site_id, filename, content_type, size, data) VALUES (${id}, ${siteId}, ${name.slice(0, 200)}, ${contentType}, ${bytes.length}, ${bytes})`;
      return { id, url: localUrl(siteId, id), filename: name, contentType, size: bytes.length, createdAt: new Date().toISOString() };
    },
    async list() {
      await ensureSchema(siteId);
      const rows = await sql()`SELECT id, filename, content_type, size, created_at FROM uws_media WHERE site_id = ${siteId} ORDER BY created_at DESC LIMIT 1000`;
      return rows.map((r) => ({ id: r.id, url: localUrl(siteId, r.id), filename: r.filename, contentType: r.content_type, size: r.size, createdAt: new Date(r.created_at).toISOString() }));
    },
    async remove(id) {
      await ensureSchema(siteId);
      await sql()`DELETE FROM uws_media WHERE site_id = ${siteId} AND id = ${id}`;
    },
    async read(id) {
      await ensureSchema(siteId);
      const rows = await sql()`SELECT content_type, data FROM uws_media WHERE site_id = ${siteId} AND id = ${id}`;
      return rows.length ? { contentType: rows[0].content_type, bytes: Buffer.from(rows[0].data) } : undefined;
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
    throw new Error("Image uploads need storage: connect Vercel Blob (recommended) or a database to this project.");
  },
  list: async () => [],
  remove: async () => {},
  read: async () => undefined,
};

export function getMediaStore(siteId: string): MediaStore {
  const token = blobTokenFor(siteId);
  if (token) return blobStore(siteId, token);
  if (databaseUrlFor(siteId)) return pgMedia(siteId);
  if (process.env.VERCEL || process.env.UWS_READONLY === "true") return none;
  return fileMedia(siteId);
}
