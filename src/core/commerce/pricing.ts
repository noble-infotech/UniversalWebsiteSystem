/**
 * Pure commerce maths shared by the browser (instant UI) and the server
 * (authoritative re-pricing in /api/orders). No framework imports.
 */
import type { CommerceConfig, Coupon, Product, ShippingMethod } from "../config/schema";

export type SelectedOptions = Record<string, string>;

export interface CartLine {
  /** product slug + serialised options → unique per configuration */
  key: string;
  slug: string;
  sku: string;
  name: string;
  image?: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  options: SelectedOptions;
  customization?: Record<string, string>;
  type: Product["type"];
  category: string;
  weightKg?: number;
  maxQuantity?: number;
}

export function lineKey(slug: string, options: SelectedOptions = {}, customization: Record<string, string> = {}) {
  const opt = Object.keys(options).sort().map((k) => `${k}=${options[k]}`).join("&");
  const cus = Object.keys(customization).sort().map((k) => `${k}=${customization[k]}`).join("&");
  return [slug, opt, cus].filter(Boolean).join("|");
}

export function effectivePrice(product: Pick<Product, "price" | "salePrice">) {
  return product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price;
}

export function discountPercent(product: Pick<Product, "price" | "salePrice">) {
  if (product.salePrice == null || product.salePrice >= product.price) return 0;
  return Math.round(((product.price - product.salePrice) / product.price) * 100);
}

/** Unit price including option price deltas. */
export function unitPriceFor(product: Product, options: SelectedOptions = {}) {
  let price = effectivePrice(product);
  for (const opt of product.options) {
    const chosen = opt.values.find((v) => v.value === options[opt.name]);
    if (chosen) price += chosen.priceDelta;
  }
  return round(price);
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}

export type CouponResult = { ok: true; coupon: Coupon; discount: number; freeShipping: boolean } | { ok: false; reason: string };

export function applyCoupon(coupon: Coupon | undefined, lines: CartLine[], now = new Date()): CouponResult {
  if (!coupon) return { ok: false, reason: "This coupon code is not valid." };
  if (coupon.expires && new Date(coupon.expires) < now) return { ok: false, reason: "This coupon has expired." };
  const eligible = coupon.categories?.length ? lines.filter((l) => coupon.categories!.includes(l.category)) : lines;
  const eligibleSubtotal = subtotal(eligible);
  if (coupon.minSubtotal && subtotal(lines) < coupon.minSubtotal)
    return { ok: false, reason: `Add items worth ${coupon.minSubtotal} or more to use this coupon.` };
  if (eligible.length === 0) return { ok: false, reason: "No items in your cart are eligible for this coupon." };
  let discount = 0;
  if (coupon.type === "percent") discount = (eligibleSubtotal * coupon.value) / 100;
  if (coupon.type === "fixed") discount = Math.min(coupon.value, eligibleSubtotal);
  return { ok: true, coupon, discount: round(discount), freeShipping: coupon.type === "free_shipping" };
}

export function subtotal(lines: CartLine[]) {
  return round(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
}

export function needsShipping(lines: CartLine[]) {
  return lines.some((l) => l.type === "physical" || l.type === "customizable");
}

export function availableShippingMethods(methods: ShippingMethod[], lines: CartLine[], country?: string) {
  const physical = needsShipping(lines);
  return methods.filter((m) => {
    if (!physical) return !!m.digitalOnly;
    if (m.digitalOnly) return false;
    if (country && m.countries && !m.countries.includes(country)) return false;
    return true;
  });
}

export function shippingCost(method: ShippingMethod | undefined, lines: CartLine[], merchandiseTotal: number) {
  if (!method || !needsShipping(lines)) return 0;
  if (method.freeOver != null && merchandiseTotal >= method.freeOver) return 0;
  const weight = lines.reduce((s, l) => s + (l.weightKg ?? 0) * l.quantity, 0);
  return round(method.rate + (method.perKg ? method.perKg * weight : 0));
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  taxInclusive: boolean;
  itemCount: number;
}

export function computeTotals(opts: {
  lines: CartLine[];
  commerce: Pick<CommerceConfig, "tax">;
  shippingMethod?: ShippingMethod;
  coupon?: Extract<CouponResult, { ok: true }>;
}): Totals {
  const { lines, commerce, shippingMethod, coupon } = opts;
  const sub = subtotal(lines);
  const discount = coupon?.discount ?? 0;
  const merch = Math.max(0, sub - discount);
  const shipping = coupon?.freeShipping ? 0 : shippingCost(shippingMethod, lines, merch);
  const rate = commerce.tax.rate;
  let tax: number;
  let total: number;
  if (commerce.tax.inclusive) {
    // Prices already include tax: report the embedded tax portion.
    tax = round(merch - merch / (1 + rate));
    total = round(merch + shipping);
  } else {
    tax = round(merch * rate);
    total = round(merch + tax + shipping);
  }
  return { subtotal: sub, discount, shipping, tax, total, taxInclusive: commerce.tax.inclusive, itemCount: lines.reduce((s, l) => s + l.quantity, 0) };
}

export function stockState(product: Pick<Product, "stock" | "stockStatus">, lowThreshold = 5) {
  if (product.stockStatus) return product.stockStatus;
  if (product.stock == null) return "in_stock" as const;
  if (product.stock <= 0) return "out_of_stock" as const;
  if (product.stock <= lowThreshold) return "low_stock" as const;
  return "in_stock" as const;
}

export function canPurchase(product: Product, allowBackorders = false) {
  if (product.purchaseMode === "quote") return false;
  const s = stockState(product);
  return s !== "out_of_stock" || allowBackorders;
}

export function averageRating(product: Pick<Product, "reviews">) {
  if (!product.reviews.length) return 0;
  return Math.round((product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length) * 10) / 10;
}
