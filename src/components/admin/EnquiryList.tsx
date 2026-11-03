"use client";
import { useState } from "react";
import { clsx } from "clsx";
import { Download, Mail } from "lucide-react";
import type { Enquiry } from "@/server/store";

const FORMS = ["all", "contact", "enquiry", "quote", "careers", "newsletter", "callback"];

export function EnquiryList({ initial }: { initial: Enquiry[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const shown = items.filter((e) => (filter === "all" || e.form === filter) && (showArchived || e.status !== "archived"));
  const setStatus = async (id: string, status: Enquiry["status"]) => {
    setItems((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
    await fetch(`/api/admin/enquiries/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
  };
  const csv = () => {
    const keys = Array.from(new Set(shown.flatMap((e) => Object.keys(e.data))));
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["id", "form", "status", "date", "page", ...keys].join(","), ...shown.map((e) => [e.id, e.form, e.status, e.createdAt, e.page, ...keys.map((k) => e.data[k])].map(esc).join(","))];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    a.download = "enquiries.csv";
    a.click();
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FORMS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={clsx("rounded-full border px-3 py-1 text-sm capitalize", filter === f ? "border-indigo-600 bg-indigo-600 text-white" : "border-neutral-300 bg-white")}>{f}</button>
        ))}
        <label className="ml-2 flex items-center gap-1.5 text-sm"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived</label>
        <span className="flex-1" />
        <button onClick={csv} disabled={!shown.length} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"><Download className="size-4" /> Export CSV</button>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">No enquiries.</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((e) => (
            <li key={e.id} className={clsx("rounded-xl border bg-white shadow-sm", e.status === "new" ? "border-indigo-200" : "border-neutral-200")}>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => { setOpen(open === e.id ? null : e.id); if (e.status === "new") setStatus(e.id, "read"); }}>
                {e.status === "new" && <span className="size-2 shrink-0 rounded-full bg-indigo-600" aria-label="New" />}
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase">{e.form}</span>
                <span className="flex-1 truncate text-sm font-medium">{String(e.data.name ?? e.data.email ?? e.id)}</span>
                <span className="hidden truncate text-sm text-neutral-500 sm:block">{String(e.data.message ?? e.data.product ?? "").slice(0, 60)}</span>
                <span className="shrink-0 text-xs text-neutral-500">{new Date(e.createdAt).toLocaleString()}</span>
              </button>
              {open === e.id && (
                <div className="border-t border-neutral-100 px-4 py-4 text-sm">
                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[160px_1fr]">
                    {Object.entries(e.data).map(([k, v]) => (
                      <div key={k} className="contents"><dt className="font-medium text-neutral-500">{k}</dt><dd className="whitespace-pre-wrap">{String(v)}</dd></div>
                    ))}
                    <dt className="font-medium text-neutral-500">Page</dt><dd>{e.page ?? "–"}</dd>
                    <dt className="font-medium text-neutral-500">Reference</dt><dd>{e.id}</dd>
                  </dl>
                  <div className="mt-4 flex gap-2">
                    {typeof e.data.email === "string" && <a href={`mailto:${e.data.email}`} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-white"><Mail className="size-4" /> Reply</a>}
                    {e.status !== "archived" ? <button onClick={() => setStatus(e.id, "archived")} className="rounded-md border border-neutral-300 px-3 py-1.5">Archive</button> : <button onClick={() => setStatus(e.id, "read")} className="rounded-md border border-neutral-300 px-3 py-1.5">Unarchive</button>}
                    <button onClick={() => setStatus(e.id, "new")} className="rounded-md border border-neutral-300 px-3 py-1.5">Mark unread</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
