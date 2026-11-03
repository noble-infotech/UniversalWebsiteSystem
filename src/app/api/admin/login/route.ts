import { NextResponse } from "next/server";
import { getSiteId } from "@/core/config/loader";
import { ADMIN_COOKIE, adminPassword, checkPassword, createSessionToken, passwordEnvHint } from "@/server/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`admin-login:${ip}`, 5, 5 * 60_000)) return NextResponse.json({ ok: false, error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  const siteId = await getSiteId();
  if (!adminPassword(siteId)) return NextResponse.json({ ok: false, error: `Admin is not configured. Set ${passwordEnvHint(siteId)} in the hosting environment.` }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !checkPassword(siteId, body.password)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }
  const { token, maxAge } = createSessionToken(siteId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
  return res;
}
