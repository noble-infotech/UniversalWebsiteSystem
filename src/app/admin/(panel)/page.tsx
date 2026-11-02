import Link from "next/link";
import { AlertTriangle, ArrowRight, Box, FileText, Inbox, Layers, ShoppingBag, Wrench } from "lucide-react";
import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { getStore } from "@/server/store";
import { ADMIN_MODULES } from "@/server/admin-modules";
import { formatMoney, formatDate } from "@/core/commerce/format";

export default async function AdminDashboard() {
  const site = await getSite();
  const store = getStore();
  const [enquiries, orders, overrides] = await Promise.all([store.listEnquiries(site.id, 200), store.listOrders(site.id, 200), store.getOverrides(site.id)]);
  const newEnquiries = enquiries.filter((e) => e.status === "new").length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totals.total, 0);
  const shop = isEnabled(site, "shop");
  const cards = [
    { label: "New enquiries", value: newEnquiries, icon: Inbox, href: "/admin/enquiries" },
    ...(shop ? [{ label: "Orders", value: orders.length, icon: ShoppingBag, href: "/admin/orders" }] : []),
    { label: "Pages", value: site.pages.length, icon: FileText, href: "/admin/edit/pages" },
    ...(site.catalog.products.length ? [{ label: "Products", value: site.catalog.products.length, icon: Box, href: "/admin/edit/catalog" }] : []),
    ...(site.services.items.length ? [{ label: "Services", value: site.services.items.length, icon: Wrench, href: "/admin/edit/services" }] : []),
  ];
  const edited = Object.keys(overrides.data);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-600">{site.company.name} · {site.company.industry}</p>
      </div>
      {!store.writable && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="size-5 shrink-0" />
          <div><strong>Connect a database to save changes, enquiries and orders.</strong> In Vercel: Storage → Create Database → Neon (Postgres) → connect it to this project, then redeploy. You can browse everything now, but saving is disabled.</div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:border-indigo-300">
            <c.icon className="size-5 text-indigo-600" />
            <p className="mt-3 text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-neutral-600">{c.label}</p>
          </Link>
        ))}
      </div>
      {shop && orders.length > 0 && <p className="text-sm text-neutral-600">Order revenue (excl. cancelled): <strong>{formatMoney(revenue, site.commerce.currency, site.commerce.locale)}</strong></p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Latest enquiries</h2><Link href="/admin/enquiries" className="text-sm text-indigo-600">View all</Link></div>
          {enquiries.length === 0 ? <p className="text-sm text-neutral-500">No enquiries yet.</p> : (
            <ul className="divide-y divide-neutral-100">
              {enquiries.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="truncate"><span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] uppercase">{e.form}</span>{String(e.data.name ?? e.data.email ?? "")}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{formatDate(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Edit your website</h2>
          <ul className="grid gap-1 sm:grid-cols-2">
            {ADMIN_MODULES.map((m) => (
              <li key={m.key}>
                <Link href={`/admin/edit/${m.key}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-neutral-50">
                  <span className="flex items-center gap-2"><Layers className="size-3.5 text-neutral-400" />{m.label}</span>
                  {edited.includes(m.key) ? <span className="rounded bg-indigo-50 px-1.5 text-[10px] font-semibold text-indigo-700">EDITED</span> : <ArrowRight className="size-3.5 text-neutral-300" />}
                </Link>
              </li>
            ))}
          </ul>
          {overrides.updatedAt && <p className="mt-3 text-xs text-neutral-500">Last saved {new Date(overrides.updatedAt).toLocaleString()}</p>}
        </section>
      </div>
    </div>
  );
}
