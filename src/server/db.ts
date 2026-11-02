import "server-only";
import postgres from "postgres";

/**
 * Postgres connection (Neon, Supabase, Vercel Postgres, RDS, self-hosted…).
 * Reads DATABASE_URL, or POSTGRES_URL as set by the Vercel/Neon integration.
 * Tables are created automatically on first use.
 */
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const g = globalThis as unknown as { __uwsSql?: postgres.Sql; __uwsSchema?: Promise<void> };

export const hasDatabase = Boolean(url);

export function sql(): postgres.Sql {
  if (!url) throw new Error("DATABASE_URL is not set");
  g.__uwsSql ??= postgres(url, { max: 3, idle_timeout: 20, prepare: false, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require" });
  return g.__uwsSql;
}

export function ensureSchema(): Promise<void> {
  g.__uwsSchema ??= (async () => {
    const db = sql();
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
  })().catch((e) => {
    g.__uwsSchema = undefined;
    throw e;
  });
  return g.__uwsSchema;
}
