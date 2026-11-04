"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Check, Copy, Loader2, Trash2, Upload } from "lucide-react";
import { deleteMedia, formatBytes, listMedia, uploadImage, type MediaItem } from "./media-client";

export function MediaLibrary({ kind }: { kind: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState("");
  const disabled = kind === "none";

  useEffect(() => {
    if (disabled) return setLoading(false);
    listMedia().then((r) => setItems(r.items)).catch((e) => setErrors([e.message])).finally(() => setLoading(false));
  }, [disabled]);

  const uploadAll = async (files: FileList | File[] | null) => {
    if (!files || disabled) return;
    const list = Array.from(files);
    setErrors([]);
    setUploading((n) => n + list.length);
    for (const f of list) {
      try {
        const item = await uploadImage(f);
        setItems((xs) => [item, ...xs]);
      } catch (e) {
        setErrors((xs) => [...xs, `${f.name}: ${e instanceof Error ? e.message : "failed"}`]);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); uploadAll(e.dataTransfer.files); }}
        className={clsx("flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition", disabled ? "cursor-not-allowed opacity-50" : drag ? "border-indigo-500 bg-indigo-50" : "border-neutral-300 bg-white hover:border-indigo-400")}
      >
        {uploading > 0 ? <Loader2 className="size-8 animate-spin text-indigo-600" /> : <Upload className="size-8 text-indigo-600" />}
        <p className="mt-3 font-semibold">{uploading > 0 ? `Uploading ${uploading}…` : "Drop images here or click to upload"}</p>
        <p className="mt-1 text-sm text-neutral-500">JPG, PNG, WebP, GIF, AVIF, SVG or ICO. Large photos are resized automatically.</p>
        <input type="file" multiple accept="image/*,.svg,.ico" className="hidden" disabled={disabled} onChange={(e) => { uploadAll(e.target.files); e.target.value = ""; }} />
      </label>
      {errors.length > 0 && <ul className="mt-4 space-y-1 text-sm text-red-600" role="alert">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
      {loading ? (
        <Loader2 className="mx-auto mt-10 size-6 animate-spin text-indigo-600" />
      ) : items.length === 0 ? (
        !disabled && <p className="mt-10 text-center text-sm text-neutral-500">No images yet.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.filename} loading="lazy" className="aspect-[4/3] w-full bg-neutral-100 object-cover" />
              <div className="p-3">
                <p className="truncate text-sm font-medium" title={m.filename}>{m.filename}</p>
                <p className="text-xs text-neutral-500">{formatBytes(m.size)} · {new Date(m.createdAt).toLocaleDateString()}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={async () => { await navigator.clipboard.writeText(m.url); setCopied(m.id); setTimeout(() => setCopied(""), 1500); }} className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50">
                    {copied === m.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />} {copied === m.id ? "Copied" : "Copy URL"}
                  </button>
                  <button type="button" onClick={async () => {
                    if (!confirm(`Delete ${m.filename}? Pages still using it will show a placeholder.`)) return;
                    try { await deleteMedia(m.id); setItems((xs) => xs.filter((x) => x.id !== m.id)); } catch { setErrors(["Delete failed"]); }
                  }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-red-600"><Trash2 className="size-3.5" /> Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
