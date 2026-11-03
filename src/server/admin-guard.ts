import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "./auth";

/** Wrap admin API handlers: 401 unless a valid session exists for the current site. Same-origin only. */
export async function requireAdmin(req: Request): Promise<{ siteId: string } | NextResponse> {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return NextResponse.json({ ok: false, error: "Bad origin" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  return session;
}
