"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Trash2, Upload } from "lucide-react";
import { ImageField } from "./ImageField";
import { uploadImage } from "./media-client";

type Item = string | ({ src?: string; alt?: string; caption?: string } & Record<string, unknown>);

/**
 * Thumbnail grid for lists of images (product images, galleries):
 * multi-upload, inline alt text / caption, reorder and remove.
 */
export function ImageListField({ value, onChange, objectItems, makeItem, extraKeys }: { value: Item[]; onChange: (v: Item[]) => void; objectItems: boolean; makeItem: () => Item; extraKeys: string[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const list = value;
  const src = (it: Item) => (typeof it === "string" ? it : it.src ?? "");
  const set = (i: number, patch: Partial<Exclude<Item, string>> | string) =>
    onChange(list.map((x, k) => (k !== i ? x : typeof patch === "string" ? (objectItems ? { ...(x as object), src: patch } : patch) : { ...(x as object), ...patch })));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const altFromName = (n: string) => n.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+\w{10}$/, "").trim();

  const uploadMany = async (files: FileList | null) => {
    if (!files?.length) return;
    setErrors([]);
    const added: Item[] = [];
    setBusy(files.length);
    for (const f of Array.from(files)) {
      try {
        const m = await uploadImage(f);
        if (objectItems) {
          const base = makeItem() as Record<string, unknown>;
          added.push({ ...base, src: m.url, alt: altFromName(f.name) });
        } else added.push(m.url);
      } catch (e) {
        setErrors((xs) => [...xs, `${f.name}: ${e instanceof Error ? e.message : "failed"}`]);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (added.length) onChange([...list, ...added]);
    if (input.current) input.current.value = "";
  };

  return (
    <div className="space-y-3">
      {list.length === 0 && <p className="text-sm text-neutral-500">No images yet.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((it, i) => (
          <li key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
            <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
              <span>{i === 0 && objectItems ? "Main image" : `Image ${i + 1}`}</span>
              <span className="flex items-center gap-0.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-6 place-items-center rounded hover:bg-neutral-100 disabled:opacity-30" aria-label="Move left"><ChevronLeft className="size-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="grid size-6 place-items-center rounded hover:bg-neutral-100 disabled:opacity-30" aria-label="Move right"><ChevronRight className="size-4" /></button>
                <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="grid size-6 place-items-center rounded hover:bg-neutral-100 hover:text-red-600" aria-label="Remove image"><Trash2 className="size-3.5" /></button>
              </span>
            </div>
            <ImageField id={`img-${i}`} value={src(it)} onChange={(v) => set(i, v)} />
            {typeof it !== "string" && (
              <div className="mt-2 space-y-1.5">
                <input aria-label="Alt text" placeholder="Alt text – describe the image (for accessibility & SEO)" value={it.alt ?? ""} onChange={(e) => set(i, { alt: e.target.value })} className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-indigo-500" />
                {extraKeys.map((k) => (
                  <input key={k} aria-label={k} placeholder={k[0].toUpperCase() + k.slice(1)} value={String(it[k] ?? "")} onChange={(e) => set(i, { [k]: e.target.value })} className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs outline-none focus:border-indigo-500" />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={busy > 0} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {busy > 0 ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {busy > 0 ? `Uploading ${busy}…` : "Upload images"}
        </button>
        <button type="button" onClick={() => onChange([...list, makeItem()])} className="rounded-md border border-dashed border-neutral-300 px-3 py-1.5 text-sm text-indigo-600 hover:border-indigo-400">+ Add empty slot</button>
        <input ref={input} type="file" multiple accept="image/*,.svg" className="hidden" onChange={(e) => uploadMany(e.target.files)} />
      </div>
      {errors.length > 0 && <ul className="text-xs text-red-600" role="alert">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
    </div>
  );
}
