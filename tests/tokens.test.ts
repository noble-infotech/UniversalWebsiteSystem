import { describe, expect, it } from "vitest";
import { siteRegistry } from "@sites/index";
import { validateSite } from "@/core/config/validate";
import { applyTokens } from "@/core/config/tokens";

const base = () => validateSite(siteRegistry["apex-forge"]).config!;

describe("name placeholders", () => {
  it("fills {brand}/{name}/{company}/{year}/{years} everywhere except the company profile", () => {
    const site = base();
    site.content.faqs[0].answer = "Call {brand} on {phone} – {years} years, © {year} {company}";
    const out = applyTokens(site, new Date("2030-06-01"));
    expect(out.content.faqs[0].answer).toBe(`Call Apex Forge on ${site.company.phones[0].number} – 36 years, © 2030 Apex Forge Industries Pvt. Ltd.`);
    expect(out.seo.defaultTitle).toBe("Apex Forge Industries – Precision Forging & CNC Machining");
  });

  it("renaming the company updates text that uses placeholders", () => {
    const site = base();
    site.company.brandName = "Titan Metals";
    site.company.name = "Titan Metals Ltd";
    const out = applyTokens(site);
    expect(out.seo.titleTemplate).toBe("%s | Titan Metals");
    expect(JSON.stringify(out.pages)).not.toContain("{brand}");
    expect(JSON.stringify(out.pages)).toContain("Titan Metals");
  });

  it("leaves unknown tokens and the company profile untouched", () => {
    const site = base();
    site.company.tagline = "We are {brand}";
    site.content.faqs[0].answer = "Use {coupon}";
    const out = applyTokens(site);
    expect(out.company.tagline).toBe("We are {brand}");
    expect(out.content.faqs[0].answer).toBe("Use {coupon}");
  });
});

describe("validator rejects blank names and bad slugs", () => {
  it("flags an empty category name and an invalid product slug", () => {
    const raw = structuredClone(siteRegistry["maison-lumiere"]);
    raw.catalog!.categories!.push({ slug: "new-cat", name: "" });
    raw.catalog!.products![0].slug = "Bad Slug!";
    const msgs = validateSite(raw).issues.filter((i) => i.level === "error").map((i) => i.message).join("\n");
    expect(msgs).toContain("Category name is required");
    expect(msgs).toContain('URL slug "Bad Slug!"');
  });
});
