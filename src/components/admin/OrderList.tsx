"use client";
import { Fragment, useState } from "react";
import { clsx } from "clsx";
import type { Order, OrderStatus } from "@/core/commerce/orders";
import { formatMoney } from "@/core/commerce/format";

const STATUSES: OrderStatus[] = ["pending_payment", "placed", "processing", "shipped", "delivered", "cancelled"];
const tone: Record<OrderStatus, string> = { pending_payment: "bg-amber-100 text-amber-800", placed: "bg-blue-100 text-blue-800", processing: "bg-indigo-100 text-indigo-800", shipped: "bg-violet-100 text-violet-800", delivered: "bg-emerald-100 text-emerald-800", cancelled: "bg-neutral-200 text-neutral-700" };

export function OrderList({ initial, currency, locale }: { initial: Order[]; currency: string; locale: string }) {
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const money = (n: number) => formatMoney(n, currency, locale);
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const update = async (number: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${number}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) setOrders((list) => list.map((o) => (o.number === number ? { ...o, status } : o)));
    else alert("Could not update the order");
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={clsx("rounded-full border px-3 py-1 text-sm", filter === s ? "border-indigo-600 bg-indigo-600 text-white" : "border-neutral-300 bg-white")}>{s.replace("_", " ")}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">No orders.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500"><tr><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th></tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {shown.map((o) => (
                <Fragment key={o.number}>
                  <tr className="cursor-pointer hover:bg-neutral-50" onClick={() => setOpen(open === o.number ? null : o.number)}>
                    <td className="p-3 font-semibold">{o.number}</td>
                    <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{o.shipping ? `${o.shipping.firstName} ${o.shipping.lastName}` : o.email}</td>
                    <td className="p-3">{o.totals.itemCount}</td>
                    <td className="p-3">{money(o.totals.total)}</td>
                    <td className="p-3">{o.paymentMethod.replace("_", " ")} · {o.payment?.status ?? "–"}</td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select value={o.status} onChange={(e) => update(o.number, e.target.value as OrderStatus)} className={clsx("rounded-full border-0 px-2 py-1 text-xs font-semibold", tone[o.status])} aria-label={`Status of ${o.number}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                    </td>
                  </tr>
                  {open === o.number && (
                    <tr className="bg-neutral-50">
                      <td colSpan={7} className="p-4">
                        <div className="grid gap-6 md:grid-cols-3">
                          <div><p className="mb-1 font-semibold">Contact</p><p>{o.email}<br />{o.phone}</p></div>
                          {o.shipping && <div><p className="mb-1 font-semibold">Ship to</p><p>{o.shipping.line1}{o.shipping.line2 ? `, ${o.shipping.line2}` : ""}<br />{o.shipping.city} {o.shipping.postalCode}, {o.shipping.country}<br />{o.shippingMethod?.label}</p></div>}
                          <div><p className="mb-1 font-semibold">Totals</p><p>Subtotal {money(o.totals.subtotal)}<br />Discount −{money(o.totals.discount)}{o.couponCode ? ` (${o.couponCode})` : ""}<br />Shipping {money(o.totals.shipping)} · Tax {money(o.totals.tax)}</p></div>
                        </div>
                        <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
                          {o.lines.map((l) => <li key={l.key} className="flex justify-between p-2"><span>{l.name} <span className="text-neutral-500">{[...Object.values(l.options), ...Object.values(l.customization ?? {})].join(" · ")}</span> × {l.quantity}</span><span>{money(l.unitPrice * l.quantity)}</span></li>)}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
