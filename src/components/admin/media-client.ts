"use client";
/** Browser-side helpers for admin image uploads. */
export type MediaItem = { id: string; url: string; filename: string; contentType: string; size: number; createdAt: string };

const MAX_EDGE = 2400; // px – plenty for full-width hero images
const TARGET_BYTES = 1.5 * 1024 * 1024;

/** Downscale/compress large photos before upload (keeps SVG, GIF and small images untouched). */
export async function prepareImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

export async function uploadImage(file: File): Promise<MediaItem> {
  const prepared = await prepareImage(file);
  const body = new FormData();
  body.append("file", prepared);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error ?? `Upload failed (${res.status})`);
  return data.item as MediaItem;
}

export async function listMedia(): Promise<{ kind: string; items: MediaItem[] }> {
  const res = await fetch("/api/admin/media", { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not load images");
  return { kind: data.kind, items: data.items };
}

export async function deleteMedia(id: string) {
  const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export const formatBytes = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
