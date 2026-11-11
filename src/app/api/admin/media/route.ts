import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin-guard";
import { getMediaStore, isSafeMediaId, MAX_UPLOAD_BYTES, sanitizeSvg, sniffImageType } from "@/server/media";
import { rateLimit } from "@/lib/rate-limit";

/** List this site's uploaded images. */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const store = getMediaStore(auth.siteId);
  try {
    return NextResponse.json({ ok: true, kind: store.kind, items: await store.list() });
  } catch (e) {
    console.error("[media] list failed", e);
    return NextResponse.json({ ok: false, kind: store.kind, error: "Could not load the media library." }, { status: 502 });
  }
}

/** Upload one image (multipart/form-data, field "file"). */
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  if (!rateLimit(`media:${auth.siteId}`, 60, 60_000)) return NextResponse.json({ ok: false, error: "Too many uploads – wait a minute." }, { status: 429 });
  const store = getMediaStore(auth.siteId);
  if (store.kind === "none") return NextResponse.json({ ok: false, error: "Uploads are not set up: connect Firebase to this website (see docs/ADMIN.md), then redeploy." }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ ok: false, error: `Image is too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).` }, { status: 413 });

  let bytes: Buffer = Buffer.from(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return NextResponse.json({ ok: false, error: "Unsupported file. Upload a JPG, PNG, WebP, GIF, AVIF, SVG or ICO image." }, { status: 415 });
  if (type === "image/svg+xml") bytes = Buffer.from(sanitizeSvg(bytes.toString("utf8")), "utf8");

  try {
    const item = await store.upload({ name: file.name || "image", bytes, contentType: type });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error("[media] upload failed", e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Upload failed." }, { status: 502 });
  }
}

/** Delete an image: /api/admin/media?id=<file id> */
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!isSafeMediaId(id)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  await getMediaStore(auth.siteId).remove(id);
  return NextResponse.json({ ok: true });
}
