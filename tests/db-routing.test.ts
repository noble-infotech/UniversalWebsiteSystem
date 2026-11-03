import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  vi.resetModules();
});
const load = async () => (await import("@/server/db")).databaseUrlFor;

describe("one database per site", () => {
  it("prefers the site-specific URL over the project URL", async () => {
    process.env.DATABASE_URL = "postgres://shared/db";
    process.env.DATABASE_URL_MAISON_LUMIERE = "postgres://maison/db";
    const url = await load();
    expect(url("maison-lumiere")).toBe("postgres://maison/db");
    expect(url("apex-forge")).toBe("postgres://shared/db");
  });

  it("supports POSTGRES_URL_<SITE> as set by some providers", async () => {
    process.env.POSTGRES_URL_APEX_FORGE = "postgres://apex/db";
    expect((await load())("apex-forge")).toBe("postgres://apex/db");
  });

  it("never falls back to a shared database when isolation is enforced", async () => {
    process.env.DATABASE_URL = "postgres://shared/db";
    process.env.ISOLATE_SITE_DATABASES = "true";
    process.env.DATABASE_URL_APEX_FORGE = "postgres://apex/db";
    const url = await load();
    expect(url("apex-forge")).toBe("postgres://apex/db");
    expect(url("northstar-advisory")).toBeUndefined();
  });
});
