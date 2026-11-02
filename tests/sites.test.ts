import { describe, expect, it } from "vitest";
import { siteRegistry } from "@sites/index";
import { validateSite } from "@/core/config/validate";
import { isEnabled } from "@/core/config/features";
import { queryProducts, buildFacets } from "@/core/commerce/catalog";
import { themeToCssVars } from "@/core/theme/tokens";

describe.each(Object.keys(siteRegistry))("site config: %s", (id) => {
  const { config, issues } = validateSite(siteRegistry[id]);
  it("passes schema + cross-reference validation", () => {
    expect(issues.filter((i) => i.level === "error")).toEqual([]);
    expect(config).toBeDefined();
  });
  it("produces a complete set of design tokens", () => {
    const vars = themeToCssVars(config!.theme);
    expect(vars["--c-primary"]).toMatch(/^#/);
    expect(vars["--font-heading-family"]).toContain(config!.theme.fonts.heading);
  });
});

describe("multi-company behaviour", () => {
  const sites = Object.fromEntries(Object.keys(siteRegistry).map((id) => [id, validateSite(siteRegistry[id]).config!]));
  it("covers manufacturing, retail and service business types", () => {
    const types = Object.values(sites).flatMap((s) => s.business.types);
    expect(types).toEqual(expect.arrayContaining(["manufacturer", "retailer", "service-provider"]));
  });
  it("lets a service company disable shopping entirely", () => {
    const ns = sites["northstar-advisory"];
    expect(isEnabled(ns, "shop")).toBe(false);
    expect(isEnabled(ns, "catalog")).toBe(false);
    expect(isEnabled(ns, "wishlist")).toBe(false);
  });
  it("supports a quote-only B2B catalogue without a cart", () => {
    const af = sites["apex-forge"];
    expect(isEnabled(af, "shop")).toBe(false);
    expect(isEnabled(af, "catalog")).toBe(true);
  });
  it("produces visually different themes", () => {
    const primaries = new Set(Object.values(sites).map((s) => s.theme.colors.primary));
    const fonts = new Set(Object.values(sites).map((s) => s.theme.fonts.heading));
    expect(primaries.size).toBe(3);
    expect(fonts.size).toBe(3);
  });
  it("uses different homepage section arrangements", () => {
    const orders = Object.values(sites).map((s) => s.pages.find((p) => p.slug === "")!.sections.map((x) => x.type).join(","));
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe("catalog queries", () => {
  const ml = validateSite(siteRegistry["maison-lumiere"]).config!;
  it("filters by parent category including subcategories", () => {
    const r = queryProducts(ml.catalog.products, ml.catalog.categories, { category: "home-fragrance" });
    expect(r.length).toBeGreaterThan(2);
    expect(r.every((p) => p.category === "home-fragrance")).toBe(true);
  });
  it("searches by name and tag", () => {
    expect(queryProducts(ml.catalog.products, ml.catalog.categories, { q: "mug" })[0].slug).toBe("stoneware-mug-set");
  });
  it("filters by variant option and price", () => {
    const r = queryProducts(ml.catalog.products, ml.catalog.categories, { options: { Color: ["Olive"] }, maxPrice: 120 });
    expect(r.map((p) => p.slug)).toEqual(["stonewashed-linen-throw"]);
  });
  it("derives facets from data", () => {
    const f = buildFacets(ml.catalog.products);
    expect(f.options.map((o) => o.name)).toEqual(expect.arrayContaining(["Size", "Color"]));
  });
});

describe("validator catches broken configs", () => {
  it("flags unknown categories and dead nav links", () => {
    const raw = structuredClone(siteRegistry["maison-lumiere"]) as typeof siteRegistry[string];
    raw.catalog!.products![0].category = "missing";
    raw.navigation.menu.push({ label: "Broken", href: "/does-not-exist" });
    const msgs = validateSite(raw).issues.map((i) => i.message).join("\n");
    expect(msgs).toContain('Unknown category "missing"');
    expect(msgs).toContain('"/does-not-exist"');
  });
});
