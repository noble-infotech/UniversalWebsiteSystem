import { NextResponse } from "next/server";
import { getSite } from "@/core/config/loader";
import { CheckoutSchema, type Order } from "@/core/commerce/orders";
import { applyCoupon, availableShippingMethods, computeTotals, lineKey, needsShipping, stockState, unitPriceFor, type CartLine } from "@/core/commerce/pricing";
import { isEnabled } from "@/core/config/features";
import { getServices, NotConfiguredError } from "@/services";
import { manualPayments } from "@/services/adapters/payments";
import { absoluteUrl } from "@/core/seo/metadata";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Places an order. Prices, stock, coupon and shipping are re-computed here from
 * the catalogue – client-supplied prices are never trusted.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`order:${ip}`, 10, 60_000)) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  const site = await getSite();
  if (!isEnabled(site, "shop")) return NextResponse.json({ ok: false, error: "Online ordering is disabled for this site." }, { status: 403 });

  const parsed = CheckoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check your details.", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 422 });
  const input = parsed.data;
  const svc = getServices(site);
  const c = site.commerce;

  // 1. Re-price every line from the catalogue.
  const lines: CartLine[] = [];
  for (const l of input.lines) {
    const p = await svc.catalog.getProduct(l.slug);
    if (!p) return NextResponse.json({ ok: false, error: `A product in your cart is no longer available (${l.slug}).` }, { status: 409 });
    if (p.purchaseMode === "quote") return NextResponse.json({ ok: false, error: `${p.name} is available on quotation only.` }, { status: 409 });
    for (const o of p.options) if (!o.values.some((v) => v.value === l.options[o.name])) return NextResponse.json({ ok: false, error: `Please choose a valid ${o.name} for ${p.name}.` }, { status: 422 });
    if (stockState(p) === "out_of_stock" && !c.inventory.allowBackorders) return NextResponse.json({ ok: false, error: `${p.name} is out of stock.` }, { status: 409 });
    const available = await svc.inventory.available(p);
    if (available != null && !c.inventory.allowBackorders && l.quantity > available) return NextResponse.json({ ok: false, error: `Only ${available} × ${p.name} available.` }, { status: 409 });
    const qty = Math.min(Math.max(l.quantity, p.minOrderQty), c.maxQuantityPerItem);
    lines.push({ key: lineKey(p.slug, l.options, l.customization), slug: p.slug, sku: p.sku, name: p.name, image: p.images[0]?.src, unitPrice: unitPriceFor(p, l.options), quantity: qty, options: l.options, customization: l.customization, type: p.type, category: p.category, weightKg: p.weightKg });
  }

  // 2. Shipping.
  const physical = needsShipping(lines);
  if (physical && !input.shipping) return NextResponse.json({ ok: false, error: "A shipping address is required." }, { status: 422 });
  const methods = availableShippingMethods(c.shipping.methods, lines, input.shipping?.country);
  const method = methods.find((m) => m.id === input.shippingMethodId) ?? methods[0];
  if (physical && !method) return NextResponse.json({ ok: false, error: "We can't ship to that destination." }, { status: 422 });

  // 3. Coupon & totals.
  let coupon;
  if (input.couponCode) {
    const res = applyCoupon(c.coupons.find((x) => x.code.toUpperCase() === input.couponCode!.toUpperCase()), lines);
    if (!res.ok) return NextResponse.json({ ok: false, error: res.reason }, { status: 422 });
    coupon = res;
  }
  if (!c.payment.methods.includes(input.paymentMethod as never)) return NextResponse.json({ ok: false, error: "Unsupported payment method." }, { status: 422 });
  const totals = computeTotals({ lines, commerce: c, shippingMethod: physical ? method : undefined, coupon });

  const number = `${c.orderPrefix}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
  const order: Order = {
    number,
    siteId: site.id,
    createdAt: new Date().toISOString(),
    status: "placed",
    email: input.email,
    phone: input.phone,
    shipping: input.shipping,
    shippingMethod: physical && method ? { id: method.id, label: method.label, estimate: method.estimate } : undefined,
    paymentMethod: input.paymentMethod,
    couponCode: coupon?.coupon.code,
    lines,
    totals,
    currency: c.currency,
    mode: svc.orders.durable ? "live" : "demo",
  };

  // 4. Payment.
  const offline = ["cod", "bank_transfer"].includes(input.paymentMethod);
  const provider = offline ? manualPayments : svc.payments;
  try {
    const pay = await provider.createPayment(order, {
      returnUrl: absoluteUrl(site, `/checkout/success?order=${number}`),
      cancelUrl: absoluteUrl(site, "/checkout"),
    });
    order.payment = { provider: provider.id, status: pay.status, redirectUrl: pay.redirectUrl, reference: pay.reference };
    if (pay.status === "redirect") order.status = "pending_payment";
  } catch (e) {
    if (e instanceof NotConfiguredError) {
      // Integration not wired yet: accept the order as "pay later" and say so honestly.
      console.warn("[orders]", e.message);
      order.payment = { provider: provider.id, status: "pending" };
    } else {
      console.error("[orders] payment error", e);
      return NextResponse.json({ ok: false, error: "Payment could not be started. Please try another method." }, { status: 502 });
    }
  }

  await svc.inventory.reserve(lines);
  await svc.orders.create(order);
  return NextResponse.json({ ok: true, order });
}
