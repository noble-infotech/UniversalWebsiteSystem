import Link from "next/link";
import { getSite } from "@/core/config/loader";
import { siteSearch } from "@/core/search";
import { Container } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { systemMetadata } from "../_lib/simple";

export const generateMetadata = () => systemMetadata("search", "Search", "/search", true);

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const site = await getSite();
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const results = q.length >= 2 ? siteSearch(site, q) : [];
  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-3xl md:text-5xl">Search</h1>
      <form action="/search" className="mt-8 flex max-w-2xl gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" defaultValue={q} className="input" placeholder="What are you looking for?" />
        <button className="btn btn-primary">Search</button>
      </form>
      {q && <p className="mt-8 text-sm text-muted-foreground">{results.length} results for “{q}”</p>}
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {results.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="flex gap-4 rounded-brand border border-border p-4 transition hover:border-primary">
              <span className="relative size-20 shrink-0 overflow-hidden rounded-brand bg-muted">{r.image && <SmartImage src={r.image} alt="" fill brand={false} className="object-cover" sizes="80px" />}</span>
              <span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{r.type}</span>
                <span className="block font-semibold">{r.title}</span>
                {r.excerpt && <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
