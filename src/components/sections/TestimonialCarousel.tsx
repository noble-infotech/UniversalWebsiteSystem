"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { Testimonial } from "@/core/config/schema";

export function TestimonialCarousel({ items, cardStyle }: { items: Testimonial[]; cardStyle: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [paused, items.length]);
  const t = items[i];
  return (
    <div className="mx-auto max-w-4xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-roledescription="carousel">
      <figure className={clsx("card", `card-${cardStyle}`, "relative p-8 md:p-14")} aria-live="polite">
        <Quote className="absolute top-8 right-8 size-16 text-primary/10" />
        {t.rating && (
          <div className="flex gap-1" aria-label={`${t.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={clsx("size-5", k < t.rating! ? "fill-amber-400 text-amber-400" : "text-border")} />)}
          </div>
        )}
        <blockquote className="font-heading mt-6 text-xl leading-snug md:text-3xl">“{t.quote}”</blockquote>
        <figcaption className="mt-8 flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{t.author[0]}</span>
          <span>
            <span className="block font-semibold">{t.author}</span>
            <span className="text-sm text-muted-foreground">{[t.role, t.company].filter(Boolean).join(", ")}</span>
          </span>
        </figcaption>
      </figure>
      {items.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setI((i - 1 + items.length) % items.length)} className="grid size-11 place-items-center rounded-full border border-border hover:bg-muted" aria-label="Previous testimonial"><ChevronLeft className="size-5" /></button>
          <div className="flex gap-2">
            {items.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Show testimonial ${k + 1}`} aria-current={k === i} className={clsx("h-2 rounded-full transition-all", k === i ? "w-8 bg-primary" : "w-2 bg-border")} />
            ))}
          </div>
          <button onClick={() => setI((i + 1) % items.length)} className="grid size-11 place-items-center rounded-full border border-border hover:bg-muted" aria-label="Next testimonial"><ChevronRight className="size-5" /></button>
        </div>
      )}
    </div>
  );
}
