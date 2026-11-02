"use client";
import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryItem } from "@/core/config/schema";
import { SmartImage } from "@/components/ui/SmartImage";

export function GalleryGrid({ items, layout, filter }: { items: GalleryItem[]; layout: string; filter: boolean }) {
  const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const shown = cat ? items.filter((i) => i.category === cat) : items;
  const go = useCallback((d: number) => setOpen((o) => (o == null ? o : (o + d + shown.length) % shown.length)), [shown.length]);
  useEffect(() => {
    if (open == null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, go]);
  return (
    <>
      {filter && cats.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist">
          {[null, ...cats].map((c) => (
            <button key={c ?? "all"} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={clsx("rounded-full border px-4 py-2 text-sm font-medium transition", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>
              {c ?? "All"}
            </button>
          ))}
        </div>
      )}
      <ul className={clsx(layout === "masonry" ? "columns-2 gap-4 md:columns-3" : "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4")}>
        {shown.map((g, i) => (
          <li key={g.src + i} className={clsx(layout === "masonry" && "mb-4 break-inside-avoid")}>
            <button onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden img-brand" aria-label={`Open image: ${g.alt}`}>
              <div className={clsx("relative", layout === "masonry" ? (i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]") : "aspect-square")}>
                <SmartImage src={g.src} alt={g.alt} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width:768px) 33vw, 50vw" />
              </div>
              {g.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">{g.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      {open != null && shown[open] && (
        <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-4" onClick={() => setOpen(null)}>
          <button className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close" autoFocus><X /></button>
          <div className="relative h-[78vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <SmartImage src={shown[open].src} alt={shown[open].alt} fill brand={false} className="object-contain" sizes="100vw" />
          </div>
          {shown[open].caption && <p className="mt-4 text-center text-white/80">{shown[open].caption}</p>}
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 grid size-12 place-items-center rounded-full bg-white/10 text-white" aria-label="Previous"><ChevronLeft /></button>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white" aria-label="Next"><ChevronRight /></button>
        </div>
      )}
    </>
  );
}
