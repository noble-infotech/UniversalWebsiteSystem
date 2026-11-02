"use client";
import { useState, type MouseEvent } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { ImageAsset } from "@/core/config/schema";
import { SmartImage } from "@/components/ui/SmartImage";

/** Product gallery with thumbnails, hover zoom (desktop), swipe-free arrows and fullscreen lightbox. */
export function ProductGallery({ images, videos = [], name }: { images: ImageAsset[]; videos?: { src: string; title?: string }[]; name: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const img = images[i];
  const go = (d: number) => setI((v) => (v + d + images.length) % images.length);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-3 overflow-x-auto scrollbar-none md:w-20 md:flex-col" role="tablist" aria-label="Product images">
        {images.map((im, idx) => (
          <button key={im.src + idx} role="tab" aria-selected={idx === i} aria-label={`Image ${idx + 1}`} onClick={() => setI(idx)} className={clsx("relative aspect-square w-20 shrink-0 overflow-hidden rounded-brand border-2 transition", idx === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}>
            <SmartImage src={im.src} alt="" fill brand={false} className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
      <div className="relative flex-1">
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-brand bg-muted"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(true)}
        >
          <SmartImage
            src={img.src}
            alt={img.alt || name}
            fill
            priority
            brand={false}
            className="object-cover transition-transform duration-200"
            style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            sizes="(min-width:1024px) 50vw, 100vw"
          />
        </div>
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow" aria-label="Previous image"><ChevronLeft className="size-5" /></button>
            <button onClick={() => go(1)} className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow" aria-label="Next image"><ChevronRight className="size-5" /></button>
          </>
        )}
        <button onClick={() => setLightbox(true)} className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-white/90 text-black shadow" aria-label="View fullscreen"><Expand className="size-4" /></button>
        {videos.length > 0 && (
          <div className="mt-4 grid gap-3">
            {videos.map((v) => (
              <video key={v.src} src={v.src} controls preload="metadata" className="w-full rounded-brand" aria-label={v.title ?? `${name} video`} />
            ))}
          </div>
        )}
      </div>
      {lightbox && (
        <div role="dialog" aria-modal="true" aria-label={`${name} images`} className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4" onClick={() => setLightbox(false)} onKeyDown={(e) => { if (e.key === "Escape") setLightbox(false); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }} tabIndex={-1}>
          <button className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close" autoFocus><X /></button>
          <div className="relative h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <SmartImage src={img.src} alt={img.alt || name} fill brand={false} className="object-contain" sizes="100vw" />
          </div>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-4 grid size-12 place-items-center rounded-full bg-white/10 text-white" aria-label="Previous image"><ChevronLeft /></button>
              <button onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white" aria-label="Next image"><ChevronRight /></button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
