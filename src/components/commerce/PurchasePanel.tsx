"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Minus, Plus, ShoppingBag, Zap, MessageSquareQuote } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/core/config/schema";
import { lineKey, unitPriceFor, stockState, discountPercent } from "@/core/commerce/pricing";
import { useCart, useMoney, useSiteConfig } from "@/components/SiteProvider";
import { WishlistButton } from "./CartButtons";
import { track } from "@/lib/analytics";

/** Variant selection, customization, quantity, add-to-cart / buy-now / request-quote. */
export function PurchasePanel({ product: p, lowStockThreshold, allowBackorders, trackStock }: { product: Product; lowStockThreshold: number; allowBackorders: boolean; trackStock: boolean }) {
  const cfg = useSiteConfig();
  const money = useMoney();
  const cart = useCart();
  const router = useRouter();
  const [options, setOptions] = useState<Record<string, string>>(() => Object.fromEntries(p.options.map((o) => [o.name, o.values[0]?.value ?? ""])));
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(p.minOrderQty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const price = useMemo(() => unitPriceFor(p, options), [p, options]);
  const compareAt = discountPercent(p) > 0 ? price + (p.price - (p.salePrice ?? p.price)) : undefined;
  const stock = stockState(p, lowStockThreshold);
  const maxQty = Math.min(cfg.commerce.maxQuantityPerItem, trackStock && p.stock != null && !allowBackorders ? p.stock : Infinity);
  const shopOn = cfg.features.shop;
  const canBuy = shopOn && p.purchaseMode !== "quote" && (stock !== "out_of_stock" || allowBackorders);
  const canQuote = p.purchaseMode !== "cart" || !shopOn;

  const validate = () => {
    const e: Record<string, string> = {};
    for (const c of p.customization) {
      const v = custom[c.id]?.trim() ?? "";
      if (c.required && !v) e[c.id] = `${c.label} is required`;
      if (c.maxLength && v.length > c.maxLength) e[c.id] = `Max ${c.maxLength} characters`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addToCart = (goCheckout = false) => {
    if (!validate()) return;
    const customization = Object.fromEntries(Object.entries(custom).filter(([, v]) => v.trim()));
    cart.add({
      key: lineKey(p.slug, options, customization),
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      image: p.images[0]?.src,
      unitPrice: price,
      compareAtPrice: compareAt,
      quantity: qty,
      options,
      customization,
      type: p.type,
      category: p.category,
      weightKg: p.weightKg,
      maxQuantity: Number.isFinite(maxQty) ? maxQty : undefined,
    });
    track("add_to_cart", { item_id: p.sku, item_name: p.name, value: price * qty, currency: cfg.commerce.currency, quantity: qty });
    if (goCheckout) router.push("/checkout");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      cart.open();
    }
  };

  const stockLabel = { in_stock: "In stock", low_stock: `Only ${p.stock ?? "a few"} left`, out_of_stock: "Out of stock", preorder: "Available for pre-order", made_to_order: "Made to order" }[stock];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-baseline gap-3">
        {p.purchaseMode === "quote" ? (
          <span className="font-heading text-3xl text-primary">{p.priceLabel ?? "Price on request"}</span>
        ) : (
          <>
            {p.priceLabel && <span className="text-sm text-muted-foreground">{p.priceLabel}</span>}
            <span className="font-heading text-3xl">{money(price)}</span>
            {compareAt && <s className="text-lg text-muted-foreground">{money(compareAt)}</s>}
            {compareAt && <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">Save {discountPercent(p)}%</span>}
          </>
        )}
      </div>
      <p className="-mt-4 text-xs text-muted-foreground">{cfg.commerce.tax.inclusive ? `Price includes ${cfg.commerce.tax.label}.` : `${cfg.commerce.tax.label} calculated at checkout.`}</p>

      {p.options.map((o) => (
        <fieldset key={o.name}>
          <legend className="label">
            {o.name}: <span className="font-normal text-muted-foreground">{options[o.name]}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) => {
              const selected = options[o.name] === v.value;
              return v.swatch ? (
                <button key={v.value} type="button" onClick={() => setOptions({ ...options, [o.name]: v.value })} aria-pressed={selected} aria-label={v.value} title={v.value} className={clsx("size-10 rounded-full border-2 ring-offset-2 ring-offset-[var(--c-bg)] transition", selected ? "ring-2 ring-primary" : "border-border")} style={{ background: v.swatch }} />
              ) : (
                <button key={v.value} type="button" onClick={() => setOptions({ ...options, [o.name]: v.value })} aria-pressed={selected} className={clsx("min-w-12 rounded-brand border px-4 py-2.5 text-sm font-medium transition", selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>
                  {v.value}
                  {v.priceDelta ? <span className="ml-1 opacity-70">{v.priceDelta > 0 ? "+" : ""}{money(v.priceDelta)}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {p.customization.length > 0 && (
        <div className="space-y-4 rounded-brand border border-dashed border-border p-5">
          <p className="text-sm font-semibold">Personalise this product</p>
          {p.customization.map((c) => (
            <div key={c.id}>
              <label htmlFor={`cus-${c.id}`} className="label">{c.label}{c.required && " *"}</label>
              {c.type === "select" ? (
                <select id={`cus-${c.id}`} className="input" value={custom[c.id] ?? ""} onChange={(e) => setCustom({ ...custom, [c.id]: e.target.value })} aria-invalid={!!errors[c.id]}>
                  <option value="">Select…</option>
                  {c.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : c.type === "textarea" ? (
                <textarea id={`cus-${c.id}`} className="input" rows={3} maxLength={c.maxLength} value={custom[c.id] ?? ""} onChange={(e) => setCustom({ ...custom, [c.id]: e.target.value })} aria-invalid={!!errors[c.id]} />
              ) : (
                <input id={`cus-${c.id}`} className="input" maxLength={c.maxLength} value={custom[c.id] ?? ""} onChange={(e) => setCustom({ ...custom, [c.id]: e.target.value })} aria-invalid={!!errors[c.id]} />
              )}
              {errors[c.id] && <p className="mt-1 text-xs text-danger">{errors[c.id]}</p>}
            </div>
          ))}
        </div>
      )}

      <p className={clsx("flex items-center gap-2 text-sm font-medium", stock === "out_of_stock" ? "text-danger" : stock === "low_stock" ? "text-amber-600" : "text-success")}>
        <span className="size-2 rounded-full bg-current" /> {stockLabel}
        {p.minOrderQty > 1 && <span className="text-muted-foreground">· Minimum order {p.minOrderQty}</span>}
      </p>

      {canBuy && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center rounded-btn border border-border">
            <button type="button" className="grid size-12 place-items-center disabled:opacity-40" onClick={() => setQty((q) => Math.max(p.minOrderQty, q - 1))} disabled={qty <= p.minOrderQty} aria-label="Decrease quantity"><Minus className="size-4" /></button>
            <input aria-label="Quantity" inputMode="numeric" className="w-12 bg-transparent text-center font-semibold outline-none" value={qty} onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) setQty(Math.max(p.minOrderQty, Math.min(maxQty, n))); }} />
            <button type="button" className="grid size-12 place-items-center disabled:opacity-40" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity"><Plus className="size-4" /></button>
          </div>
          <button type="button" className="btn btn-primary flex-1" onClick={() => addToCart(false)}>
            <ShoppingBag className="size-4" /> {added ? "Added to cart" : "Add to cart"}
          </button>
          <button type="button" className="btn btn-outline w-full sm:w-auto" onClick={() => addToCart(true)}>
            <Zap className="size-4" /> Buy now
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {canQuote && (
          <Link href={`/request-quote?product=${encodeURIComponent(p.slug)}`} className={clsx("btn", canBuy ? "btn-outline" : "btn-primary", "flex-1")}>
            <MessageSquareQuote className="size-4" /> Request a quotation
          </Link>
        )}
        {cfg.features.wishlist && <WishlistButton slug={p.slug} name={p.name} withLabel />}
      </div>
    </div>
  );
}
