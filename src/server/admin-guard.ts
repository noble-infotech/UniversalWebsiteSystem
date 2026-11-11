import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "./auth";

/** Wrap admin API handlers: 401 unless a valid session exists for the current site. Same-origin only. */
export async function requireAdmin(req: Request): Promise<{ siteId: string } | NextResponse> {
  const origin = req.headers.get("origin");
  if (origin) {
    // Accept the host the browser addressed (Host / X-Forwarded-Host) as well as the URL the
    // runtime reports – adapters and proxies (e.g. Cloudflare/OpenNext) can rewrite the latter.
    const allowed = new Set([new URL(req.url).host, req.headers.get("x-forwarded-host"), req.headers.get("host")].filter(Boolean));
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {}
    if (!allowed.has(originHost)) return NextResponse.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  return session;
}
