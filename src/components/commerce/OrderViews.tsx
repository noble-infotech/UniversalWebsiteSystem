"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { CheckCircle2, Package, Search } from "lucide-react";
import { useAccount, useMoney, useSiteConfig } from "@/components/SiteProvider";
import { ORDER_STAGES, type Order } from "@/core/commerce/orders";
import { formatDate } from "@/core/commerce/format";
import { TotalsTable } from "./CartContents";
import { SmartImage } from "@/components/ui/SmartImage";

export function OrderSummary({ order }: { order: Order }) {
  const money = useMoney();
  return (
    <div className="rounded-brand border border-border">
      <ul className="divide-y divide-border px-5">
        {order.lines.map((l) => (
          <li key={l.key} className="flex items-center gap-4 py-4">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-brand bg-muted"><SmartImage src={l.image} alt={l.name} fill brand={false} className="object-cover" sizes="56px" /></span>
            <span className="flex-1 text-sm"><span className="block font-semibold">{l.name}</span><span className="text-muted-foreground">{Object.values(l.options).join(" · ")} × {l.quantity}</span></span>
            <span className="text-sm font-semibold">{money(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border bg-surface p-5"><TotalsTable totals={order.totals} shippingLabel={order.shippingMethod?.label} /></div>
    </div>
  );
}

/** Simulated fulfilment timeline for demo orders, derived from order age. Real status comes from the OrderRepository. */
export function OrderTimeline({ order }: { order: Order }) {
  const ageH = (Date.now() - new Date(order.createdAt).getTime()) / 36e5;
  const reached = order.mode === "live" ? ORDER_STAGES.findIndex((s) => s.status === order.status) : ageH > 96 ? 3 : ageH > 48 ? 2 : ageH > 2 ? 1 : 0;
  return (
    <ol className="grid grid-cols-4 gap-2">
      {ORDER_STAGES.map((s, i) => (
        <li key={s.status} className="text-center">
          <span className={clsx("mx-auto grid size-9 place-items-center rounded-full text-xs font-bold", i <= reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i <= reached ? "✓" : i + 1}</span>
          <span className={clsx("mt-2 block text-xs", i <= reached ? "font-semibold" : "text-muted-foreground")}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderConfirmation() {
  const sp = useSearchParams();
  const number = sp.get("order");
  const { orders, hydrated } = useAccount();
  const cfg = useSiteConfig();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-brand bg-muted" />;
  const order = orders.find((o) => o.number === number);
  if (!order)
    return (
      <div className="text-center">
        <h1 className="text-3xl">Order not found</h1>
        <p className="mt-3 text-muted-foreground">We couldn’t find this order in this browser. Use order tracking to look it up.</p>
        <Link href="/track-order" className="btn btn-primary mt-6">Track an order</Link>
      </div>
    );
  return (
    <div>
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-16 text-success" strokeWidth={1.5} />
        <h1 className="mt-6 text-3xl md:text-5xl">Thank you for your order!</h1>
        <p className="mt-4 text-muted-foreground">Order <strong className="text-foreground">{order.number}</strong> was placed on {formatDate(order.createdAt, cfg.commerce.locale)}. A confirmation will be sent to {order.email}.</p>
        {order.payment?.status === "pending" && <p className="mt-3 text-sm text-muted-foreground">{order.paymentMethod === "cod" ? "You’ll pay on delivery." : "Payment instructions will follow by email."}</p>}
      </div>
      <div className="mt-10 rounded-brand border border-border p-6"><OrderTimeline order={order} /></div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {order.shipping && (
          <div className="rounded-brand border border-border p-5 text-sm">
            <p className="mb-2 font-semibold">Shipping to</p>
            <address className="not-italic text-muted-foreground">{order.shipping.firstName} {order.shipping.lastName}<br />{order.shipping.line1}{order.shipping.line2 && `, ${order.shipping.line2}`}<br />{order.shipping.city} {order.shipping.postalCode}, {order.shipping.country}</address>
            {order.shippingMethod && <p className="mt-2">{order.shippingMethod.label} {order.shippingMethod.estimate && `· ${order.shippingMethod.estimate}`}</p>}
          </div>
        )}
        <div className="rounded-brand border border-border p-5 text-sm">
          <p className="mb-2 font-semibold">Payment</p>
          <p className="text-muted-foreground">{order.paymentMethod.replace("_", " ")} · {order.payment?.status ?? "pending"}</p>
        </div>
      </div>
      <div className="mt-8"><OrderSummary order={order} /></div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
        <Link href={`/track-order?order=${order.number}`} className="btn btn-outline">Track this order</Link>
      </div>
    </div>
  );
}

export function OrderTracker() {
  const sp = useSearchParams();
  const { orders, hydrated } = useAccount();
  const [number, setNumber] = useState(sp.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!email.trim()) return setError("Enter the email address used for the order.");
    const local = orders.find((o) => o.number.toUpperCase() === number.trim().toUpperCase() && o.email.toLowerCase() === email.trim().toLowerCase());
    setBusy(true);
    try {
      // The server is the source of truth (status is updated from the admin); fall back to this browser's copy.
      const res = await fetch(`/api/orders/${encodeURIComponent(number.trim())}?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.ok) setResult(data.order);
      else if (local) setResult(local);
      else setError("We couldn’t find an order with those details.");
    } catch {
      if (local) setResult(local);
      else setError("Lookup failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <form onSubmit={lookup} className="grid gap-4 rounded-brand border border-border p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label htmlFor="t-num" className="label">Order number</label><input id="t-num" className="input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ORD-123456" required /></div>
        <div><label htmlFor="t-email" className="label">Email</label><input id="t-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div>
        <button className="btn btn-primary" disabled={busy}><Search className="size-4" /> Track</button>
      </form>
      {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-lg font-semibold"><Package className="size-5 text-primary" />Order {result.number}</p>
            <p className="text-sm text-muted-foreground">Placed {formatDate(result.createdAt)}</p>
          </div>
          <div className="rounded-brand border border-border p-6"><OrderTimeline order={result} /></div>
          {result.mode === "demo" && <p className="text-xs text-muted-foreground">Demo mode: tracking stages are simulated from the order date. Connect a shipping provider for live tracking.</p>}
          <OrderSummary order={result} />
        </div>
      )}
      {hydrated && orders.length > 0 && !result && (
        <div className="mt-10">
          <p className="mb-3 text-sm font-semibold">Recent orders from this browser</p>
          <ul className="space-y-2">{orders.slice(0, 5).map((o) => <li key={o.number}><button className="text-sm text-primary underline" onClick={() => { setNumber(o.number); setEmail(o.email); }}>{o.number}</button> <span className="text-xs text-muted-foreground">· {formatDate(o.createdAt)}</span></li>)}</ul>
        </div>
      )}
    </div>
  );
}
