import "server-only";
import { cookies } from "next/headers";
import { siteRegistry, defaultSiteId } from "@sites/index";
import { SiteConfigSchema, type SiteConfig } from "./schema";

export const SITE_COOKIE = "uws-site";

const parsed = new Map<string, SiteConfig>();

/** Validate + apply defaults. Throws a readable error for a broken config. */
export function loadSiteConfig(id: string): SiteConfig {
  const hit = parsed.get(id);
  if (hit) return hit;
  const raw = siteRegistry[id];
  if (!raw) throw new Error(`Unknown site "${id}". Registered sites: ${Object.keys(siteRegistry).join(", ")}`);
  const result = SiteConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Site config "${id}" is invalid:\n${issues}`);
  }
  parsed.set(id, result.data);
  return result.data;
}

export function switcherEnabled() {
  return process.env.ENABLE_SITE_SWITCHER !== "false";
}

/** Resolve which company this request is for: cookie (demo switcher) → SITE_ID env → registry default. */
export async function getSiteId(): Promise<string> {
  if (switcherEnabled()) {
    const jar = await cookies();
    const fromCookie = jar.get(SITE_COOKIE)?.value;
    if (fromCookie && siteRegistry[fromCookie]) return fromCookie;
  }
  const fromEnv = process.env.SITE_ID;
  if (fromEnv && siteRegistry[fromEnv]) return fromEnv;
  return defaultSiteId;
}

/**
 * The resolved configuration for the current request.
 * (Not wrapped in React.cache: that is unsafe in route handlers. Parsed configs are memoised per site id above.)
 */
export async function getSite(): Promise<SiteConfig> {
  return loadSiteConfig(await getSiteId());
}

export function listSites() {
  return Object.keys(siteRegistry).map((id) => {
    const c = siteRegistry[id] as { company: { brandName: string; industry: string } };
    return { id, name: c.company.brandName, industry: c.company.industry };
  });
}
