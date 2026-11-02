"use client";
import { useState } from "react";
import { clsx } from "clsx";
import { Layers, X } from "lucide-react";

/** DEMO ONLY – lets reviewers flip between company configurations. Disabled via ENABLE_SITE_SWITCHER=false. */
export function SiteSwitcher({ sites, current }: { sites: { id: string; name: string; industry: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 left-5 z-[75] text-sm">
      {open ? (
        <div className="w-72 rounded-xl border border-black/10 bg-white p-3 text-neutral-900 shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Demo: switch company</p>
            <button onClick={() => setOpen(false)} aria-label="Close"><X className="size-4" /></button>
          </div>
          {sites.map((s) => (
            <a key={s.id} href={`/api/site?id=${s.id}`} className={clsx("block rounded-lg px-3 py-2.5 hover:bg-neutral-100", s.id === current && "bg-neutral-100")}>
              <span className="block font-semibold">{s.name} {s.id === current && "✓"}</span>
              <span className="text-xs text-neutral-500">{s.industry}</span>
            </a>
          ))}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 font-semibold text-white shadow-xl" aria-label="Switch demo company">
          <Layers className="size-4" /> Switch demo
        </button>
      )}
    </div>
  );
}
