"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { SlidersHorizontal, X } from "lucide-react";
import type { buildFacets, SortKey } from "@/core/commerce/catalog";

type Facets = ReturnType<typeof buildFacets>;

/** URL-driven filters → server re-renders results (shareable, SEO-friendly, back-button safe). */
export function ShopFilters({ facets, sortOptions, total, currency, locale }: { facets: Facets; sortOptions: { value: SortKey; label: string }[]; total: number; currency: string; locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");

  const update = (mut: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mut(p);
    p.delete("page");
    start(() => router.push(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
  };
  const toggleList = (key: string, value: string) =>
    update((p) => {
      const cur = (p.get(key) ?? "").split(",").filter(Boolean);
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });
  const isOn = (key: string, value: string) => (sp.get(key) ?? "").split(",").includes(value);
  const flag = (key: string) =>
    update((p) => {
      if (p.get(key) === "1") p.delete(key);
      else p.set(key, "1");
    });
  const active = [...sp.keys()].filter((k) => !["sort", "page", "q"].includes(k)).length;
  const sym = new Intl.NumberFormat(locale, { style: "currency", currency }).formatToParts(0).find((x) => x.type === "currency")?.value;

  const body = (
    <div className={clsx("space-y-8", pending && "opacity-60")}>
      <div>
        <h3 className="label">Price {sym && `(${sym})`}</h3>
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); update((p) => { if (min) p.set("min", min); else p.delete("min"); if (max) p.set("max", max); else p.delete("max"); }); }}>
          <input aria-label="Minimum price" className="input !px-3 !py-2" inputMode="numeric" placeholder={String(facets.price.min)} value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d.]/g, ""))} />
          <span>–</span>
          <input aria-label="Maximum price" className="input !px-3 !py-2" inputMode="numeric" placeholder={String(facets.price.max)} value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d.]/g, ""))} />
          <button className="btn btn-outline btn-sm">Go</button>
        </form>
      </div>
      <div className="space-y-3">
        <h3 className="label">Availability</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sp.get("instock") === "1"} onChange={() => flag("instock")} className="size-4 accent-[var(--c-primary)]" /> In stock only</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sp.get("sale") === "1"} onChange={() => flag("sale")} className="size-4 accent-[var(--c-primary)]" /> On sale</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sp.get("rating") === "4"} onChange={() => update((p) => (p.get("rating") ? p.delete("rating") : p.set("rating", "4")))} className="size-4 accent-[var(--c-primary)]" /> 4★ & up</label>
      </div>
      {facets.options.map((o) => (
        <div key={o.name}>
          <h3 className="label">{o.name}</h3>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) =>
              v.swatch ? (
                <button key={v.value} type="button" title={v.value} aria-label={v.value} aria-pressed={isOn(`opt_${o.name}`, v.value)} onClick={() => toggleList(`opt_${o.name}`, v.value)} className={clsx("size-8 rounded-full border-2 ring-offset-2 ring-offset-[var(--c-bg)]", isOn(`opt_${o.name}`, v.value) ? "ring-2 ring-primary" : "border-border")} style={{ background: v.swatch }} />
              ) : (
                <button key={v.value} type="button" aria-pressed={isOn(`opt_${o.name}`, v.value)} onClick={() => toggleList(`opt_${o.name}`, v.value)} className={clsx("rounded-brand border px-3 py-1.5 text-xs font-medium", isOn(`opt_${o.name}`, v.value) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{v.value}</button>
              ),
            )}
          </div>
        </div>
      ))}
      {facets.tags.length > 0 && (
        <div>
          <h3 className="label">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {facets.tags.slice(0, 14).map((t) => (
              <button key={t} type="button" aria-pressed={isOn("tag", t)} onClick={() => toggleList("tag", t)} className={clsx("rounded-full border px-3 py-1 text-xs", isOn("tag", t) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>#{t}</button>
            ))}
          </div>
        </div>
      )}
      {active > 0 && <button type="button" onClick={() => { setMin(""); setMax(""); start(() => router.push(pathname, { scroll: false })); }} className="text-sm font-semibold text-danger">Clear all filters ({active})</button>}
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-4 lg:col-span-2 lg:-mb-4 lg:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} className="btn btn-outline btn-sm"><SlidersHorizontal className="size-4" /> Filters {active > 0 && `(${active})`}</button>
        <SortSelect sp={sp} options={sortOptions} onChange={(v) => update((p) => (v ? p.set("sort", v) : p.delete("sort")))} />
      </div>
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28 space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">{total} products</p>
          </div>
          <SortSelect sp={sp} options={sortOptions} onChange={(v) => update((p) => (v ? p.set("sort", v) : p.delete("sort")))} />
          {body}
        </div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[95] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-6 text-foreground">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-xl">Filters</h2><button onClick={() => setMobileOpen(false)} aria-label="Close filters"><X /></button></div>
            {body}
            <button onClick={() => setMobileOpen(false)} className="btn btn-primary mt-8 w-full">Show {total} products</button>
          </div>
        </div>
      )}
    </>
  );
}

function SortSelect({ sp, options, onChange }: { sp: URLSearchParams | ReturnType<typeof useSearchParams>; options: { value: SortKey; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="sort" className="sr-only">Sort by</label>
      <select id="sort" className="input !py-2 text-sm" value={sp.get("sort") ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Sort: Featured</option>
        {options.filter((o) => o.value !== "featured").map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
