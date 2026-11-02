import { describe, expect, it } from "vitest";
import { applyCoupon, availableShippingMethods, computeTotals, lineKey, shippingCost, unitPriceFor, type CartLine } from "@/core/commerce/pricing";
import { ProductSchema, type ShippingMethod } from "@/core/config/schema";

const line = (o: Partial<CartLine> = {}): CartLine => ({ key: "a", slug: "a", sku: "A", name: "A", unitPrice: 50, quantity: 2, options: {}, type: "physical", category: "cat", ...o });
const standard: ShippingMethod = { id: "std", label: "Std", rate: 8, freeOver: 75 };

describe("pricing", () => {
  it("adds variant price deltas to the sale price", () => {
    const p = ProductSchema.parse({ slug: "x", sku: "X", name: "X", category: "c", shortDescription: "", description: "", images: [{ src: "/x.png", alt: "x" }], price: 100, salePrice: 80, options: [{ name: "Size", values: [{ value: "S" }, { value: "L", priceDelta: 15 }] }] });
    expect(unitPriceFor(p, { Size: "S" })).toBe(80);
    expect(unitPriceFor(p, { Size: "L" })).toBe(95);
  });

  it("creates stable line keys regardless of option order", () => {
    expect(lineKey("x", { b: "2", a: "1" })).toBe(lineKey("x", { a: "1", b: "2" }));
  });

  it("applies free shipping thresholds after discounts", () => {
    expect(shippingCost(standard, [line()], 100)).toBe(0);
    expect(shippingCost(standard, [line()], 60)).toBe(8);
  });

  it("charges no shipping for digital-only carts and offers digital methods only", () => {
    const digital = [line({ type: "digital" })];
    const methods: ShippingMethod[] = [standard, { id: "email", label: "Email", rate: 0, digitalOnly: true }];
    expect(availableShippingMethods(methods, digital).map((m) => m.id)).toEqual(["email"]);
    expect(shippingCost(standard, digital, 10)).toBe(0);
  });

  it("restricts methods by country", () => {
    const methods: ShippingMethod[] = [{ ...standard, countries: ["US"] }, { id: "intl", label: "Intl", rate: 20, countries: ["GB"] }];
    expect(availableShippingMethods(methods, [line()], "GB").map((m) => m.id)).toEqual(["intl"]);
  });

  it("computes exclusive tax on discounted merchandise", () => {
    const coupon = applyCoupon({ code: "TEN", type: "percent", value: 10 }, [line()]);
    if (!coupon.ok) throw new Error("expected ok");
    const t = computeTotals({ lines: [line()], commerce: { tax: { rate: 0.1, label: "Tax", inclusive: false } }, shippingMethod: standard, coupon });
    expect(t).toMatchObject({ subtotal: 100, discount: 10, shipping: 0, tax: 9, total: 99, itemCount: 2 });
  });

  it("extracts inclusive tax without adding it to the total", () => {
    const t = computeTotals({ lines: [line({ unitPrice: 120, quantity: 1 })], commerce: { tax: { rate: 0.2, label: "VAT", inclusive: true } } });
    expect(t.tax).toBe(20);
    expect(t.total).toBe(120);
  });
});

describe("coupons", () => {
  it("rejects expired coupons", () => {
    expect(applyCoupon({ code: "OLD", type: "percent", value: 10, expires: "2020-01-01" }, [line()]).ok).toBe(false);
  });
  it("enforces minimum subtotal", () => {
    expect(applyCoupon({ code: "MIN", type: "fixed", value: 25, minSubtotal: 150 }, [line()]).ok).toBe(false);
  });
  it("limits category coupons to eligible lines", () => {
    const r = applyCoupon({ code: "CAT", type: "percent", value: 20, categories: ["candles"] }, [line({ category: "candles", unitPrice: 50, quantity: 1 }), line({ key: "b", category: "other" })]);
    expect(r.ok && r.discount).toBe(10);
  });
  it("never discounts more than the subtotal", () => {
    const r = applyCoupon({ code: "BIG", type: "fixed", value: 500 }, [line()]);
    expect(r.ok && r.discount).toBe(100);
  });
  it("supports free-shipping coupons", () => {
    const r = applyCoupon({ code: "SHIP", type: "free_shipping", value: 0 }, [line({ unitPrice: 10, quantity: 1 })]);
    if (!r.ok) throw new Error("expected ok");
    expect(computeTotals({ lines: [line({ unitPrice: 10, quantity: 1 })], commerce: { tax: { rate: 0, label: "", inclusive: false } }, shippingMethod: standard, coupon: r }).shipping).toBe(0);
  });
});
