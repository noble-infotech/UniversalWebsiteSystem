"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, X, ShoppingBag, Tag, Truck } from "lucide-react";
import { clsx } from "clsx";
import { useCart, useMoney, useSiteConfig } from "@/components/SiteProvider";
import { useShop } from "@/store/shop";
import { SmartImage } from "@/components/ui/SmartImage";
import type { CartLine, Totals } from "@/core/commerce/pricing";

export function LineItem({ line, compact }: { line: CartLine; compact?: boolean }) {
  const cart = useCart();
  const money = useMoney();
  const opts = Object.entries(line.options).concat(Object.entries(line.customization ?? {}));
  return (
    <li className="flex gap-4 py-5">
      <Link href={`/products/${line.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-brand bg-muted sm:size-24">
        <SmartImage src={line.image} alt={line.name} fill brand={false} className="object-cover" sizes="96px" />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div>
            <Link href={`/products/${line.slug}`} className="font-semibold leading-snug hover:text-primary">{line.name}</Link>
            {opts.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{opts.map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
            <p className="mt-1 text-xs text-muted-foreground">SKU {line.sku}</p>
          </div>
          <p className="text-right font-semibold">{money(line.unitPrice * line.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-btn border border-border">
            <button type="button" className="grid size-8 place-items-center" onClick={() => cart.setQty(line.key, line.quantity - 1)} aria-label={`Decrease quantity of ${line.name}`}><Minus className="size-3.5" /></button>
            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{line.quantity}</span>
            <button type="button" className="grid size-8 place-items-center disabled:opacity-40" disabled={line.maxQuantity != null && line.quantity >= line.maxQuantity} onClick={() => cart.setQty(line.key, line.quantity + 1)} aria-label={`Increase quantity of ${line.name}`}><Plus className="size-3.5" /></button>
          </div>
          {!compact && <span className="text-xs text-muted-foreground">{money(line.unitPrice)} each</span>}
          <button type="button" onClick={() => cart.remove(line.key)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-danger" aria-label={`Remove ${line.name}`}><Trash2 className="size-4" /> {!compact && "Remove"}</button>
        </div>
      </div>
    </li>
  );
}

export function CouponForm() {
  const cart = useCart();
  const cfg = useSiteConfig();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const apply = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ site: cfg.id, code, lines: cart.lines }) });
      const data = await res.json();
      if (data.ok) {
        cart.setCoupon(data.coupon);
        setMsg({ ok: true, text: data.coupon.description ?? "Coupon applied." });
        setCode("");
      } else setMsg({ ok: false, text: data.reason ?? "Invalid coupon" });
    } catch {
      setMsg({ ok: false, text: "Could not validate coupon. Please try again." });
    } finally {
      setBusy(false);
    }
  };
  if (cart.coupon)
    return (
      <div className="flex items-center justify-between rounded-brand border border-dashed border-success bg-success/5 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-success"><Tag className="size-4" /> {cart.coupon.code}</span>
        {cart.couponResult && !cart.couponResult.ok && <span className="text-xs text-danger">{cart.couponResult.reason}</span>}
        <button type="button" onClick={() => cart.setCoupon(null)} className="text-xs underline">Remove</button>
      </div>
    );
  return (
    <div>
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <input id="coupon" className="input !py-2.5 uppercase" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())} />
        <button type="button" className="btn btn-outline btn-sm" onClick={apply} disabled={busy}>{busy ? "…" : "Apply"}</button>
      </div>
      {msg && <p className={clsx("mt-2 text-xs", msg.ok ? "text-success" : "text-danger")} role="status">{msg.text}</p>}
    </div>
  );
}

export function TotalsTable({ totals, shippingLabel, pendingShipping }: { totals: Totals; shippingLabel?: string; pendingShipping?: boolean }) {
  const money = useMoney();
  const cfg = useSiteConfig();
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal ({totals.itemCount} items)</dt><dd>{money(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div>}
      <div className="flex justify-between"><dt className="text-muted-foreground">Shipping{shippingLabel ? ` · ${shippingLabel}` : ""}</dt><dd>{pendingShipping ? "Calculated at checkout" : totals.shipping === 0 ? "Free" : money(totals.shipping)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">{cfg.commerce.tax.label}{totals.taxInclusive ? " (included)" : ""}</dt><dd>{money(totals.tax)}</dd></div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
    </dl>
  );
}

function FreeShippingProgress() {
  const cfg = useSiteConfig();
  const cart = useCart();
  const money = useMoney();
  const threshold = cfg.commerce.shipping.methods.find((m) => m.freeOver != null && !m.digitalOnly)?.freeOver;
  if (!threshold) return null;
  const remaining = threshold - (cart.totals.subtotal - cart.totals.discount);
  const pct = Math.min(100, ((threshold - Math.max(0, remaining)) / threshold) * 100);
  return (
    <div className="rounded-brand bg-muted p-3 text-xs">
      <p className="flex items-center gap-2"><Truck className="size-4 text-primary" />{remaining > 0 ? <>Add <strong>{money(remaining)}</strong> more for free shipping</> : <strong>You’ve unlocked free shipping!</strong>}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <ShoppingBag className="size-12 text-muted-foreground" strokeWidth={1.25} />
      <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
      <p className="mt-1 text-sm text-muted-foreground">Discover something you’ll love.</p>
      <Link href="/shop" onClick={onNavigate} className="btn btn-primary mt-6">Continue shopping</Link>
    </div>
  );
}

/** Slide-over mini cart. */
export function CartDrawer() {
  const open = useShop((s) => s.cartOpen);
  const setOpen = useShop((s) => s.setCartOpen);
  const cart = useCart();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);
  return (
    <div className={clsx("fixed inset-0 z-[90] transition", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div className={clsx("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
      <aside role="dialog" aria-modal="true" aria-label="Shopping cart" className={clsx("absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-background text-foreground shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-xl">Your cart ({cart.count})</h2>
          <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label="Close cart"><X className="size-5" /></button>
        </header>
        {cart.lines.length === 0 ? (
          <EmptyCart onNavigate={() => setOpen(false)} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="pt-4"><FreeShippingProgress /></div>
              <ul className="divide-y divide-border">{cart.lines.map((l) => <LineItem key={l.key} line={l} compact />)}</ul>
            </div>
            <footer className="space-y-4 border-t border-border bg-surface px-6 py-5">
              <TotalsTable totals={cart.totals} pendingShipping />
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={() => setOpen(false)} className="btn btn-outline">View cart</Link>
                <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary">Checkout</Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

/** Full cart page body. */
export function CartView() {
  const cart = useCart();
  if (cart.lines.length === 0) return <EmptyCart />;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <FreeShippingProgress />
        <ul className="divide-y divide-border border-b border-border">{cart.lines.map((l) => <LineItem key={l.key} line={l} />)}</ul>
        <div className="mt-6 flex justify-between">
          <Link href="/shop" className="text-sm font-semibold text-primary">← Continue shopping</Link>
          <button type="button" onClick={cart.clear} className="text-sm text-muted-foreground hover:text-danger">Clear cart</button>
        </div>
      </div>
      <aside className="h-fit space-y-5 rounded-brand border border-border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="text-xl">Order summary</h2>
        <CouponForm />
        <TotalsTable totals={cart.totals} pendingShipping />
        <Link href="/checkout" className="btn btn-primary w-full">Proceed to checkout</Link>
      </aside>
    </div>
  );
}
