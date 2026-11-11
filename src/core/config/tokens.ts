/**
 * NAME PLACEHOLDERS
 * Any text in a site config may contain tokens that are filled in from the company
 * profile, so renaming a company in one place updates every page:
 *
 *   {brand}    company.brandName              {phone}  first phone number
 *   {name}     company.name                   {email}  first email address
 *   {company}  company.legalName or name      {year}   current year
 *   {tagline}  company.tagline                {years}  years since company.established
 *
 * The company profile itself is never rewritten (it is the source of the values).
 * Unknown tokens are left untouched.
 */
import type { SiteConfig } from "./schema";

export function tokenValues(site: Pick<SiteConfig, "company">, now = new Date()): Record<string, string> {
  const c = site.company;
  return {
    brand: c.brandName,
    name: c.name,
    company: c.legalName ?? c.name,
    tagline: c.tagline,
    phone: c.phones[0]?.number ?? "",
    email: c.emails[0]?.address ?? "",
    year: String(now.getFullYear()),
    years: c.established ? String(now.getFullYear() - c.established) : "",
  };
}

const TOKEN = /\{(brand|name|company|tagline|phone|email|year|years)\}/g;

function fill<T>(v: T, values: Record<string, string>): T {
  if (typeof v === "string") return (v.includes("{") ? v.replace(TOKEN, (_, k: string) => values[k]) : v) as T;
  if (Array.isArray(v)) return v.map((x) => fill(x, values)) as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = fill(x, values);
    return out as T;
  }
  return v;
}

/** Returns a copy of the config with placeholders replaced everywhere except the company profile. */
export function applyTokens(site: SiteConfig, now = new Date()): SiteConfig {
  const values = tokenValues(site, now);
  const { company, id, ...rest } = site;
  return { ...fill(rest, values), company, id } as SiteConfig;
}
