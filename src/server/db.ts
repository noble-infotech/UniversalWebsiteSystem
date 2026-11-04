import "server-only";
import postgres from "postgres";

/**
 * ONE DATABASE PER SITE
 * ---------------------------------------------------------------------------
 * Each website uses its own Postgres database (Neon, Supabase, Vercel Postgres,
 * RDS, self-hosted…). Resolution order for site "maison-lumiere":
 *
 *   1. DATABASE_URL_MAISON_LUMIERE   – site-specific (use when several sites share one deployment)
 *   2. POSTGRES_URL_MAISON_LUMIERE
 *   3. DATABASE_URL / POSTGRES_URL   – the project's own database (normal case: one Vercel project per site;
 *                                      Vercel/Neon set this automatically)
 *
 * Set ISOLATE_SITE_DATABASES=true to forbid step 3 for shared deployments: a site
 * without its own URL then gets no database (read-only admin) instead of sharing one.
 * Each database gets its own tables, created automatically on first use.
 */
type Pool = { sql: postgres.Sql; schema?: Promise<void> };
const g = globalThis as unknown as { __uwsPools?: Map<string, Pool> };
const pools = (g.__uwsPools ??= new Map<string, Pool>());

const envSuffix = (siteId: string) => siteId.toUpperCase().replace(/[^A-Z0-9]/g, "_");

export function databaseUrlFor(siteId: string): string | undefined {
  const s = envSuffix(siteId);
  const specific = process.env[`DATABASE_URL_${s}`] || process.env[`POSTGRES_URL_${s}`];
  if (specific) return specific;
  if (process.env.ISOLATE_SITE_DATABASES === "true") return undefined;
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function databaseEnvHint(siteId: string) {
  return `DATABASE_URL (or DATABASE_URL_${envSuffix(siteId)} on a shared deployment)`;
}

/** Short, non-secret description of where a site's data lives (shown in the admin). */
export function databaseLabel(siteId: string): string | undefined {
  const url = databaseUrlFor(siteId);
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return `${u.hostname}/${u.pathname.replace(/^\//, "")}`;
  } catch {
    return "configured";
  }
}

function pool(url: string): Pool {
  let p = pools.get(url);
  if (!p) {
    p = { sql: postgres(url, { max: 3, idle_timeout: 20, prepare: false, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require" }) };
    pools.set(url, p);
  }
  return p;
}

export function sqlFor(siteId: string): postgres.Sql {
  const url = databaseUrlFor(siteId);
  if (!url) throw new Error(`No database configured for site "${siteId}". Set ${databaseEnvHint(siteId)}.`);
  return pool(url).sql;
}

/** Create tables in this site's database if they don't exist yet (once per database per process). */
export function ensureSchema(siteId: string): Promise<void> {
  const url = databaseUrlFor(siteId)!;
  const p = pool(url);
  p.schema ??= (async () => {
    const db = p.sql;
    await db`CREATE TABLE IF NOT EXISTS uws_site_overrides (
      site_id text PRIMARY KEY,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT now(),
      updated_by text
    )`;
    await db`CREATE TABLE IF NOT EXISTS uws_enquiries (
      id text PRIMARY KEY,
      site_id text NOT NULL,
      form text NOT NULL,
      data jsonb NOT NULL,
      page text,
      status text NOT NULL DEFAULT 'new',
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await db`CREATE INDEX IF NOT EXISTS uws_enquiries_site ON uws_enquiries (site_id, created_at DESC)`;
    await db`CREATE TABLE IF NOT EXISTS uws_orders (
      number text PRIMARY KEY,
      site_id text NOT NULL,
      email text NOT NULL,
      status text NOT NULL,
      total numeric NOT NULL,
      data jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await db`CREATE INDEX IF NOT EXISTS uws_orders_site ON uws_orders (site_id, created_at DESC)`;
    await db`CREATE TABLE IF NOT EXISTS uws_media (
      id text PRIMARY KEY,
      site_id text NOT NULL,
      filename text NOT NULL,
      content_type text NOT NULL,
      size integer NOT NULL,
      data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await db`CREATE INDEX IF NOT EXISTS uws_media_site ON uws_media (site_id, created_at DESC)`;
  })().catch((e) => {
    p.schema = undefined;
    throw e;
  });
  return p.schema;
}
