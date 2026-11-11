/**
 * True on hosts whose filesystem is read-only or wiped between requests
 * (Cloudflare Workers, Vercel, …). There the app never "saves" to local files –
 * without Firebase it runs read-only and says so, instead of losing data silently.
 */
export function isEphemeralHost(): boolean {
  if (process.env.UWS_READONLY === "true" || process.env.VERCEL) return true;
  // Cloudflare Workers identify themselves via navigator.userAgent.
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}
