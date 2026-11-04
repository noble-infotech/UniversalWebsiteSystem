"use client";
import { useRef, useState } from "react";
import { clsx } from "clsx";
import { ImagePlus, Images, Loader2, Upload, X } from "lucide-react";
import { MediaPicker } from "./MediaPicker";
import { uploadImage } from "./media-client";

/** Image input: upload (button or drag & drop), pick from the media library, or paste a URL. */
export function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [picker, setPicker] = useState(false);
  const [broken, setBroken] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const item = await uploadImage(file);
      setBroken(false);
      onChange(item.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div
      className={clsx("rounded-lg border border-dashed p-2 transition", drag ? "border-indigo-500 bg-indigo-50" : "border-neutral-300 bg-neutral-50/50")}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files?.[0]); }}
    >
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => input.current?.click()} className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border border-neutral-200 bg-white" aria-label="Upload image" title="Upload image">
          {busy ? (
            <Loader2 className="size-5 animate-spin text-indigo-600" />
          ) : value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
          ) : (
            <ImagePlus className="size-6 text-neutral-400" />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"><Upload className="size-3.5" /> {value ? "Replace" : "Upload"}</button>
            <button type="button" disabled={busy} onClick={() => setPicker(true)} className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium hover:bg-neutral-50"><Images className="size-3.5" /> Library</button>
            {value && <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-red-600"><X className="size-3.5" /> Clear</button>}
          </div>
          <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or drop an image here / paste an image URL" className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 outline-none focus:border-indigo-500" />
          {broken && value && !busy && <p className="text-xs text-amber-700">Preview unavailable – check the URL.</p>}
          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/*,.svg,.ico" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={(url) => { onChange(url); setPicker(false); }} />}
    </div>
  );
}
