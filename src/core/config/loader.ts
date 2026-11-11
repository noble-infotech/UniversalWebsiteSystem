import "server-only";
import { cookies } from "next/headers";
import { siteRegistry, defaultSiteId } from "@sites/index";
import { SiteConfigSchema, type SiteConfig, type SiteConfigInput } from "./schema";
import { getStore, type Overrides } from "@/server/store";
import { applyTokens } from "./tokens";

export const SITE_COOKIE = "uws-site";

/**
 * Config resolution = file config (sites/<id>) + admin overrides (Firestore / local files).
 * Overrides replace whole top-level modules (company, theme, pages, catalog…),
 * so a module edited in the admin is fully owned by the admin until reset.
 */
// Process-wide caches: Next.js can load this module once per route bundle, and an admin save
// (API route) must invalidate the copy the pages read from, so edits show immediately.
const g = globalThis as unknown as {
  __uwsParsed?: Map<string, { key: string; config: SiteConfig }>;
  __uwsOverrides?: Map<string, { at: number; data: Overrides; updatedAt?: string }>;
};
const parsed = (g.__uwsParsed ??= new Map());
const overridesCache = (g.__uwsOverrides ??= new Map());
const TTL_MS = 10_000; // other server instances pick up admin edits within 10 s

function format(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
}

export function baseConfig(id: string): SiteConfigInput {
  const raw = siteRegistry[id];
  if (!raw) throw new Error(`Unknown site "${id}". Registered sites: ${Object.keys(siteRegistry).join(", ")}`);
  return raw;
}

export function mergeConfig(id: string, overrides: Overrides): SiteConfigInput {
  return { ...baseConfig(id), ...overrides, id };
}

/** File-only config (used by scripts, tests and as a safe fallback). */
export function loadSiteConfig(id: string): SiteConfig {
  const result = SiteConfigSchema.safeParse(baseConfig(id));
  if (!result.success) throw new Error(`Site config "${id}" is invalid:\n${format(result.error.issues)}`);
  return applyTokens(result.data);
}

async function getOverrides(id: string) {
  const hit = overridesCache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit;
  try {
    const { data, updatedAt } = await getStore(id).getOverrides(id);
    const entry = { at: Date.now(), data, updatedAt };
    overridesCache.set(id, entry);
    return entry;
  } catch (e) {
    console.error("[config] could not load overrides – serving file config", e);
    return { at: Date.now(), data: {} as Overrides, updatedAt: undefined };
  }
}

export function invalidateSite(id: string) {
  overridesCache.delete(id);
  parsed.delete(id);
}

/** Config with admin overrides applied. Falls back to file config if overrides are invalid. */
export async function resolveSiteConfig(id: string): Promise<SiteConfig> {
  const o = await getOverrides(id);
  const key = `${o.updatedAt ?? "none"}:${Object.keys(o.data).length}`;
  const hit = parsed.get(id);
  if (hit && hit.key === key) return hit.config;
  const result = SiteConfigSchema.safeParse(mergeConfig(id, o.data));
  let config: SiteConfig;
  if (result.success) config = applyTokens(result.data);
  else {
    console.error(`[config] stored overrides for "${id}" are invalid – serving file config:\n${format(result.error.issues)}`);
    config = loadSiteConfig(id);
  }
  parsed.set(id, { key, config });
  return config;
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

/** The resolved configuration for the current request (file config + admin edits). */
export async function getSite(): Promise<SiteConfig> {
  return resolveSiteConfig(await getSiteId());
}

export function listSites() {
  return Object.keys(siteRegistry).map((id) => {
    const c = siteRegistry[id] as { company: { brandName: string; industry: string } };
    return { id, name: c.company.brandName, industry: c.company.industry };
  });
}
