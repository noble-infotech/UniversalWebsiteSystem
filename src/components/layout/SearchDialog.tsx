"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import type { SearchResult } from "@/core/search";
import { SmartImage } from "@/components/ui/SmartImage";
import { track } from "@/lib/analytics";

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  useEffect(() => {
    if (q.trim().length < 2) return setResults([]);
    const ctl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => setResults(d.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    track("search", { search_term: q });
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto mt-[8vh] w-[min(42rem,92vw)] overflow-hidden rounded-brand bg-background text-foreground shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-border px-5">
          <Search className="size-5 text-muted-foreground" />
          <label htmlFor="site-search" className="sr-only">Search the site</label>
          <input id="site-search" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, services, articles…" className="h-16 flex-1 bg-transparent text-lg outline-none" autoComplete="off" />
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-muted" aria-label="Close search"><X className="size-5" /></button>
        </form>
        <div className="max-h-[60vh] overflow-y-auto p-2" aria-live="polite">
          {loading && results.length === 0 && <p className="p-4 text-sm text-muted-foreground">Searching…</p>}
          {!loading && q.length >= 2 && results.length === 0 && <p className="p-4 text-sm text-muted-foreground">No results for “{q}”.</p>}
          {results.map((r) => (
            <Link key={r.href} href={r.href} onClick={onClose} className="flex items-center gap-4 rounded-brand p-3 hover:bg-muted">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-brand bg-muted">{r.image && <SmartImage src={r.image} alt="" fill brand={false} className="object-cover" sizes="48px" />}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{r.title}</span>
                {r.excerpt && <span className="block truncate text-sm text-muted-foreground">{r.excerpt}</span>}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.type}</span>
            </Link>
          ))}
          {results.length > 0 && (
            <button onClick={submit} className="flex w-full items-center justify-center gap-2 p-3 text-sm font-semibold text-primary">See all results <ArrowRight className="size-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
}
