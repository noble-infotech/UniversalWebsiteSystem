/** Catalogue query helpers (filtering, sorting, search) – pure functions over config data. */
import type { Category, Product } from "../config/schema";
import { averageRating, effectivePrice, stockState } from "./pricing";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "name";
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "New arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name A–Z" },
];

export interface ProductQuery {
  q?: string;
  category?: string; // matches category OR subcategory, including children of a parent category
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  type?: Product["type"];
  options?: Record<string, string[]>; // e.g. { Color: ["Black"] }
  minRating?: number;
  sort?: SortKey;
}

export function categoryWithChildren(categories: Category[], slug: string): string[] {
  const out = [slug];
  for (const c of categories) if (c.parent === slug) out.push(...categoryWithChildren(categories, c.slug));
  return out;
}

export function searchScore(p: Product, q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const t of terms) {
    if (p.name.toLowerCase().includes(t)) score += 5;
    if (p.sku.toLowerCase().includes(t)) score += 4;
    if (p.tags.some((x) => x.toLowerCase().includes(t))) score += 3;
    if (p.category.toLowerCase().includes(t)) score += 2;
    if (p.shortDescription.toLowerCase().includes(t)) score += 1;
    if (p.description.toLowerCase().includes(t)) score += 0.5;
  }
  return score;
}

export function queryProducts(products: Product[], categories: Category[], query: ProductQuery): Product[] {
  let list = [...products];
  if (query.category) {
    const slugs = categoryWithChildren(categories, query.category);
    list = list.filter((p) => slugs.includes(p.category) || (p.subcategory && slugs.includes(p.subcategory)));
  }
  if (query.q) list = list.filter((p) => searchScore(p, query.q!) > 0);
  if (query.tags?.length) list = list.filter((p) => query.tags!.some((t) => p.tags.includes(t)));
  if (query.minPrice != null) list = list.filter((p) => effectivePrice(p) >= query.minPrice!);
  if (query.maxPrice != null) list = list.filter((p) => effectivePrice(p) <= query.maxPrice!);
  if (query.inStock) list = list.filter((p) => stockState(p) !== "out_of_stock");
  if (query.onSale) list = list.filter((p) => p.salePrice != null && p.salePrice < p.price);
  if (query.type) list = list.filter((p) => p.type === query.type);
  if (query.minRating) list = list.filter((p) => averageRating(p) >= query.minRating!);
  if (query.options) {
    for (const [name, values] of Object.entries(query.options)) {
      if (!values.length) continue;
      list = list.filter((p) => p.options.some((o) => o.name === name && o.values.some((v) => values.includes(v.value))));
    }
  }
  const sort = query.sort ?? (query.q ? undefined : "featured");
  if (!sort && query.q) list.sort((a, b) => searchScore(b, query.q!) - searchScore(a, query.q!));
  else if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller));
  else if (sort === "newest") list.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
  else if (sort === "price-asc") list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  else if (sort === "price-desc") list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  else if (sort === "rating") list.sort((a, b) => averageRating(b) - averageRating(a));
  else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/** Facets derived from the catalogue so filters adapt to every company automatically. */
export function buildFacets(products: Product[]) {
  const options = new Map<string, Map<string, string | undefined>>();
  const tags = new Map<string, number>();
  let min = Infinity;
  let max = 0;
  const types = new Set<Product["type"]>();
  for (const p of products) {
    const price = effectivePrice(p);
    min = Math.min(min, price);
    max = Math.max(max, price);
    types.add(p.type);
    p.tags.forEach((t) => tags.set(t, (tags.get(t) ?? 0) + 1));
    for (const o of p.options) {
      if (!options.has(o.name)) options.set(o.name, new Map());
      o.values.forEach((v) => options.get(o.name)!.set(v.value, v.swatch));
    }
  }
  return {
    price: { min: isFinite(min) ? Math.floor(min) : 0, max: Math.ceil(max) },
    options: [...options.entries()].map(([name, values]) => ({ name, values: [...values.entries()].map(([value, swatch]) => ({ value, swatch })) })),
    tags: [...tags.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t),
    types: [...types],
  };
}

export function selectProducts(products: Product[], source?: string, limit?: number) {
  let list = products;
  if (source === "featured") list = products.filter((p) => p.featured);
  else if (source === "newArrival") list = products.filter((p) => p.newArrival);
  else if (source === "bestSeller") list = products.filter((p) => p.bestSeller);
  else if (source === "onSale") list = products.filter((p) => p.salePrice != null);
  else if (source?.startsWith("category:")) {
    const c = source.slice(9);
    list = products.filter((p) => p.category === c || p.subcategory === c);
  }
  if (list.length === 0) list = products;
  return limit ? list.slice(0, limit) : list;
}

export function relatedProducts(product: Product, all: Product[], limit = 4) {
  const explicit = product.related.map((s) => all.find((p) => p.slug === s)).filter(Boolean) as Product[];
  const sameCat = all.filter((p) => p.slug !== product.slug && p.category === product.category && !explicit.includes(p));
  return [...explicit, ...sameCat].slice(0, limit);
}
