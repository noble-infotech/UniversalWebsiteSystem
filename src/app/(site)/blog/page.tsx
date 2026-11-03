import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { getSite } from "@/core/config/loader";
import { buildMetadata, routeSeo } from "@/core/seo/metadata";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/sections/content";
import { requireFeature, findPage } from "../_lib/pages";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const page = findPage(site, "blog");
  return buildMetadata(site, { title: page?.title ?? "Blog", seo: page?.seo ?? routeSeo(site, "blog"), path: "/blog" });
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const site = await getSite();
  requireFeature(isEnabled(site, "blog"));
  const { category, page: pg } = await searchParams;
  const page = findPage(site, "blog");
  const all = [...site.content.posts].sort((a, b) => b.date.localeCompare(a.date));
  const cats = Array.from(new Set(all.map((p) => p.category).filter(Boolean))) as string[];
  const list = category ? all.filter((p) => p.category === category) : all;
  const per = 9;
  const pages = Math.max(1, Math.ceil(list.length / per));
  const current = Math.min(Math.max(1, Number(pg) || 1), pages);
  const shown = list.slice((current - 1) * per, current * per);
  return (
    <>
      <PageHeader site={site} title={page?.header.title ?? page?.title ?? "Insights & news"} subtitle={page?.header.subtitle} image={page?.header.image} crumbs={[{ label: "Blog", href: "/blog" }]} />
      <Container className="py-14 md:py-20">
        {cats.length > 1 && (
          <nav aria-label="Blog categories" className="mb-12 flex flex-wrap gap-2">
            <Link href="/blog" className={clsx("rounded-full border px-4 py-2 text-sm", !category ? "border-primary bg-primary text-primary-foreground" : "border-border")}>All</Link>
            {cats.map((c) => <Link key={c} href={`/blog?category=${encodeURIComponent(c)}`} className={clsx("rounded-full border px-4 py-2 text-sm", category === c ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{c}</Link>)}
          </nav>
        )}
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <PostCard key={p.slug} post={p} site={site} />)}</div>
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-14 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <Link key={n} href={`/blog?${category ? `category=${encodeURIComponent(category)}&` : ""}page=${n}`} aria-current={n === current ? "page" : undefined} className={clsx("grid size-11 place-items-center rounded-full border", n === current ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{n}</Link>)}
          </nav>
        )}
      </Container>
    </>
  );
}
