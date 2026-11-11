import { siteRegistry } from "@sites/index";
import { getMediaStore, isSafeMediaId } from "@/server/media";

/**
 * Public image delivery for uploads stored in Firestore or local files.
 * File ids are random and never change, so responses are cached for a year.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ site: string; id: string }> }) {
  const { site, id } = await ctx.params;
  if (!siteRegistry[site] || !isSafeMediaId(id)) return new Response("Not found", { status: 404 });
  const file = await getMediaStore(site).read(id).catch(() => undefined);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "content-type": file.contentType,
      "content-length": String(file.bytes.length),
      // s-maxage lets Vercel's CDN cache each image after the first request (fewer Firestore reads).
      "cache-control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "x-content-type-options": "nosniff",
      // Uploaded SVGs can't run scripts even if opened directly.
      "content-security-policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
