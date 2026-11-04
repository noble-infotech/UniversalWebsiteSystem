"use client";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { listMedia, uploadImage, type MediaItem } from "./media-client";

/** Modal grid of this site's uploaded images. */
export function MediaPicker({ onClose, onSelect }: { onClose: () => void; onSelect: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    listMedia().then((r) => setItems(r.items)).catch((e) => setError(e.message));
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Media library">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 className="font-semibold">Choose an image</h2>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
              {busy ? "Uploading…" : "Upload new"}
              <input type="file" accept="image/*,.svg,.ico" className="hidden" disabled={busy} onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                try { const item = await uploadImage(f); onSelect(item.url); } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); } finally { setBusy(false); }
              }} />
            </label>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded hover:bg-neutral-100"><X className="size-4" /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {!items && !error && <Loader2 className="mx-auto size-6 animate-spin text-indigo-600" />}
          {items && items.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">No images uploaded yet.</p>}
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {items?.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => onSelect(m.url)} className="group block w-full overflow-hidden rounded-lg border border-neutral-200 hover:border-indigo-500 focus:border-indigo-500" title={m.filename}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.filename} loading="lazy" className="aspect-square w-full bg-neutral-100 object-cover" />
                  <span className="block truncate px-2 py-1 text-left text-[11px] text-neutral-600">{m.filename}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
