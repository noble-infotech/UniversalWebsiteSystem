"use client";
import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

/** Tabs whose panels are server-rendered and passed in as children. */
export function ShopTabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" className="mb-10 flex justify-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((t, k) => (
          <button key={t.label} role="tab" aria-selected={i === k} onClick={() => setI(k)} className={clsx("rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition", i === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, k) => (
        <div key={t.label} role="tabpanel" hidden={i !== k}>{t.content}</div>
      ))}
    </div>
  );
}
