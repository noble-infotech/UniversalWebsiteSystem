import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getSiteId } from "@/core/config/loader";

/**
 * ADMIN AUTHENTICATION
 * - One admin password per site: ADMIN_PASSWORD_<SITE_ID> (e.g. ADMIN_PASSWORD_MAISON_LUMIERE),
 *   falling back to ADMIN_PASSWORD. In local development only, "admin" is used if neither is set.
 * - Session = HMAC-signed cookie bound to the site id, 8-hour expiry, httpOnly + sameSite=strict.
 * - Signing key: ADMIN_SECRET (recommended), else derived from the password.
 */
export const ADMIN_COOKIE = "uws-admin";
const SESSION_HOURS = 8;

const envKey = (siteId: string) => `ADMIN_PASSWORD_${siteId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;

export function adminPassword(siteId: string): string | undefined {
  const pw = process.env[envKey(siteId)] || process.env.ADMIN_PASSWORD;
  if (pw) return pw;
  return process.env.NODE_ENV !== "production" ? "admin" : undefined;
}
export function passwordEnvHint(siteId: string) {
  return `${envKey(siteId)} or ADMIN_PASSWORD`;
}
export function usingDevPassword(siteId: string) {
  return !process.env[envKey(siteId)] && !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
}

function secret(siteId: string) {
  return process.env.ADMIN_SECRET || `uws:${adminPassword(siteId) ?? ""}:${siteId}`;
}
function sign(payload: string, siteId: string) {
  return crypto.createHmac("sha256", secret(siteId)).update(payload).digest("base64url");
}
function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(siteId: string, attempt: string) {
  const pw = adminPassword(siteId);
  if (!pw) return false;
  const h = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
  return safeEqual(h(attempt), h(pw));
}

export function createSessionToken(siteId: string) {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `${siteId}.${exp}`;
  return { token: `${payload}.${sign(payload, siteId)}`, maxAge: SESSION_HOURS * 3600 };
}

function verify(token: string | undefined, siteId: string) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [sid, exp, sig] = parts;
  if (sid !== siteId || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(`${sid}.${exp}`, siteId));
}

/** Returns the admin session for the current site, or null. */
export async function getAdminSession(): Promise<{ siteId: string } | null> {
  const siteId = await getSiteId();
  const jar = await cookies();
  return verify(jar.get(ADMIN_COOKIE)?.value, siteId) ? { siteId } : null;
}
