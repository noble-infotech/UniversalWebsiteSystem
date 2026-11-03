import { describe, expect, it } from "vitest";
import { z } from "zod";
import { SiteConfigSchema } from "@/core/config/schema";
import { siteRegistry } from "@sites/index";
import { validateSite } from "@/core/config/validate";
import { ADMIN_MODULES } from "@/server/admin-modules";
import { makeDefault, type JSONSchema } from "@/components/admin/SchemaForm";

describe("admin editor", () => {
  it("exposes every editable top-level module of the config", () => {
    const keys = Object.keys(SiteConfigSchema.shape).filter((k) => k !== "id");
    expect(ADMIN_MODULES.map((m) => m.key).sort()).toEqual(keys.sort());
  });

  it.each(ADMIN_MODULES.map((m) => m.key))("generates a plain JSON schema for %s", (key) => {
    const schema = JSON.parse(JSON.stringify(z.toJSONSchema(SiteConfigSchema.shape[key], { io: "input", unrepresentable: "any" }))) as JSONSchema;
    expect(schema.type ?? schema.$ref ?? schema.anyOf).toBeDefined();
  });

  it("creates valid blank items for new list entries", () => {
    const schema = JSON.parse(JSON.stringify(z.toJSONSchema(SiteConfigSchema.shape.catalog, { io: "input" }))) as JSONSchema;
    const product = makeDefault(schema.properties!.products.items, { defs: schema.$defs ?? {} }) as Record<string, unknown>;
    expect(product).toMatchObject({ slug: "", sku: "", name: "", price: 0 });
    expect(Array.isArray(product.images)).toBe(true);
  });

  it("module overrides merge over file config and are validated", () => {
    const base = siteRegistry["northstar-advisory"];
    const merged = { ...base, company: { ...base.company, brandName: "Renamed" } };
    expect(validateSite(merged).config?.company.brandName).toBe("Renamed");
    const broken = { ...base, navigation: { ...base.navigation, menu: [{ label: "X", href: "/missing-page" }] } };
    expect(validateSite(broken).issues.some((i) => i.level === "error")).toBe(true);
  });
});
