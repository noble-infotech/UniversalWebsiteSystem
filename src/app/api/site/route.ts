import { NextResponse } from "next/server";
import { SITE_COOKIE, switcherEnabled } from "@/core/config/loader";
import { siteRegistry } from "@sites/index";

/** Demo-only: /api/site?id=<siteId> switches the active company via cookie. Disable with ENABLE_SITE_SWITCHER=false. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!switcherEnabled()) return NextResponse.json({ error: "Site switcher disabled" }, { status: 404 });
  const id = url.searchParams.get("id") ?? "";
  const res = NextResponse.redirect(new URL(url.searchParams.get("to") ?? "/", url.origin));
  if (siteRegistry[id]) res.cookies.set(SITE_COOKIE, id, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
