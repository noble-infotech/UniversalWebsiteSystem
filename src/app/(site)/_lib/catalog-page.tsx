import { clsx } from "clsx";
import Link from "next/link";
import type { SiteConfig, Category } from "@/core/config/schema";
import { buildFacets, queryProducts, type ProductQuery, type SortKey, SORT_OPTIONS } from "@/core/commerce/catalog";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ShopFilters } from "@/components/commerce/ShopFilters";
import { Container } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/PageHeader";

export type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : v.split(","));

export function parseQuery(sp: SearchParams): ProductQuery & { page: number } {
  const options: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(sp)) if (k.startsWith("opt_")) options[k.slice(4)] = many(v);
  const num = (k: string) => (one(sp[k]) != null && !isNaN(Number(one(sp[k]))) ? Number(one(sp[k])) : undefined);
  return {
    q: one(sp.q)?.trim() || undefined,
    sort: (one(sp.sort) as SortKey) || undefined,
    minPrice: num("min"),
    maxPrice: num("max"),
    inStock: one(sp.instock) === "1",
    onSale: one(sp.sale) === "1",
    tags: many(sp.tag),
    minRating: num("rating"),
    type: (one(sp.type) as ProductQuery["type"]) || undefined,
    options,
    page: Math.max(1, num("page") ?? 1),
  };
}

/** Product listing page shared by /shop and /shop/category/[slug]. */
export function CatalogListing({ site, sp, category, basePath }: { site: SiteConfig; sp: SearchParams; category?: Category; basePath: string }) {
  const query = parseQuery(sp);
  const scope = category ? queryProducts(site.catalog.products, site.catalog.categories, { category: category.slug }) : site.catalog.products;
  const results = queryProducts(site.catalog.products, site.catalog.categories, { ...query, category: category?.slug });
  const facets = buildFacets(scope);
  const perPage = site.commerce.productsPerPage;
  const pages = Math.max(1, Math.ceil(results.length / perPage));
  const page = Math.min(query.page, pages);
  const shown = results.slice((page - 1) * perPage, page * perPage);
  const topCats = site.catalog.categories.filter((c) => !c.parent);
  const subCats = category ? site.catalog.categories.filter((c) => c.parent === category.slug) : [];
  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v != null && k !== "page") p.set(k, Array.isArray(v) ? v.join(",") : v);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <>
      <PageHeader
        site={site}
        compact
        title={category?.name ?? site.commerce.shopTitle}
        subtitle={category?.description ?? site.commerce.shopDescription}
        crumbs={category ? [{ label: site.commerce.shopTitle, href: "/shop" }, ...(category.parent ? [{ label: site.catalog.categories.find((c) => c.slug === category.parent)?.name ?? category.parent, href: `/shop/category/${category.parent}` }] : []), { label: category.name, href: basePath }] : [{ label: site.commerce.shopTitle, href: "/shop" }]}
      />
      <Container className="py-10 md:py-14">
        <nav aria-label="Categories" className="-mx-1 mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link href="/shop" className={clsx("shrink-0 rounded-full border px-4 py-2 text-sm font-medium", !category ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>All</Link>
          {(subCats.length ? subCats : topCats).map((c) => (
            <Link key={c.slug} href={`/shop/category/${c.slug}`} className={clsx("shrink-0 rounded-full border px-4 py-2 text-sm font-medium", category?.slug === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>{c.name}</Link>
          ))}
        </nav>
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <ShopFilters facets={facets} sortOptions={SORT_OPTIONS} total={results.length} currency={site.commerce.currency} locale={site.commerce.locale} />
          <div>
            {query.q && <p className="mb-6 text-sm text-muted-foreground">Results for “<strong className="text-foreground">{query.q}</strong>”</p>}
            {shown.length === 0 ? (
              <div className="rounded-brand border border-dashed border-border py-20 text-center">
                <p className="text-lg font-semibold">No products match your filters</p>
                <Link href={basePath} className="btn btn-outline mt-6">Clear all filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">{shown.map((p) => <ProductCard key={p.slug} product={p} site={site} />)}</div>
            )}
            {pages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Link key={n} href={pageHref(n)} aria-current={n === page ? "page" : undefined} className={clsx("grid size-11 place-items-center rounded-full border text-sm font-semibold", n === page ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground")}>{n}</Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
