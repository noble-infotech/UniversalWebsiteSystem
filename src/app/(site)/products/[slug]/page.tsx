import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { getSite } from "@/core/config/loader";
import { buildMetadata, absoluteUrl } from "@/core/seo/metadata";
import { productLd, breadcrumbLd } from "@/core/seo/jsonld";
import { isEnabled } from "@/core/config/features";
import { averageRating, discountPercent } from "@/core/commerce/pricing";
import { relatedProducts } from "@/core/commerce/catalog";
import { formatDate } from "@/core/commerce/format";
import { Breadcrumbs, Container, JsonLd, Rating, Badge, RichText } from "@/components/ui/primitives";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { PurchasePanel } from "@/components/commerce/PurchasePanel";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductViewTracker } from "@/components/commerce/ProductViewTracker";
import { ShareButtons } from "@/components/engagement/ShareButtons";
import { FaqList } from "@/components/sections/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite();
  const { slug } = await params;
  const p = site.catalog.products.find((x) => x.slug === slug);
  if (!p) return {};
  return buildMetadata(site, { title: p.name, description: p.shortDescription, seo: p.seo, image: p.images[0]?.src, path: `/products/${p.slug}` });
}

export default async function ProductPage({ params }: Props) {
  const site = await getSite();
  const { slug } = await params;
  const p = site.catalog.products.find((x) => x.slug === slug);
  if (!p || !isEnabled(site, "catalog")) notFound();
  const cat = site.catalog.categories.find((c) => c.slug === p.category);
  const rating = averageRating(p);
  const related = relatedProducts(p, site.catalog.products, 4);
  const crumbs = [{ label: "Home", href: "/" }, { label: site.commerce.shopTitle, href: "/shop" }, ...(cat ? [{ label: cat.name, href: `/shop/category/${cat.slug}` }] : []), { label: p.name, href: `/products/${p.slug}` }];
  const freeShip = site.commerce.shipping.methods.find((m) => m.freeOver != null && !m.digitalOnly);
  const shop = isEnabled(site, "shop");
  const productFaqs = site.content.faqs.filter((f) => f.category === "Shipping" || f.category === "Returns" || f.category === "Products").slice(0, 4);
  return (
    <>
      <JsonLd data={productLd(site, p)} />
      <JsonLd data={breadcrumbLd(site, crumbs)} />
      <ProductViewTracker sku={p.sku} name={p.name} />
      <Container className="py-8 md:py-12">
        <Breadcrumbs items={crumbs} className="mb-8 text-muted-foreground" />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={p.images} videos={p.videos} name={p.name} />
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {p.newArrival && <Badge tone="dark">New arrival</Badge>}
              {p.bestSeller && <Badge tone="accent">Best seller</Badge>}
              {discountPercent(p) > 0 && <Badge tone="danger">Sale</Badge>}
              {p.type !== "physical" && <Badge tone="muted">{p.type === "digital" ? "Digital product" : p.type === "service" ? "Service" : "Customisable"}</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {rating > 0 && <a href="#reviews"><Rating value={rating} count={p.reviews.length} /></a>}
              <span>SKU: {p.sku}</span>
            </div>
            <p className="mt-5 text-lg text-muted-foreground">{p.shortDescription}</p>
            <div className="mt-8">
              <PurchasePanel product={p} lowStockThreshold={site.commerce.inventory.lowStockThreshold} allowBackorders={site.commerce.inventory.allowBackorders} trackStock={site.commerce.inventory.trackStock} />
            </div>
            {shop && (
              <ul className="mt-8 grid gap-3 rounded-brand bg-muted p-5 text-sm sm:grid-cols-3">
                <li className="flex items-center gap-2"><Truck className="size-4 text-primary" />{freeShip ? `Free shipping over ${new Intl.NumberFormat(site.commerce.locale, { style: "currency", currency: site.commerce.currency, maximumFractionDigits: 0 }).format(freeShip.freeOver!)}` : "Fast dispatch"}</li>
                <li className="flex items-center gap-2"><RotateCcw className="size-4 text-primary" />Easy returns</li>
                <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" />Secure checkout</li>
              </ul>
            )}
            {site.integrations.socialShare.enabled && <div className="mt-8"><ShareButtons url={absoluteUrl(site, `/products/${p.slug}`)} title={p.name} networks={site.integrations.socialShare.networks} /></div>}
          </div>
        </div>

        <div className="mt-20 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="mb-6 text-2xl">Description</h2>
            <RichText text={p.description} />
            {p.features.length > 0 && (
              <>
                <h3 className="mt-10 mb-5 text-xl">Features & benefits</h3>
                <ul className="grid gap-3 sm:grid-cols-2">{p.features.map((f) => <li key={f} className="flex gap-3 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>)}</ul>
              </>
            )}
          </div>
          {p.specifications.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl">Specifications</h2>
              <dl className="divide-y divide-border overflow-hidden rounded-brand border border-border">
                {p.specifications.map((s) => (
                  <div key={s.label} className="grid grid-cols-2 gap-4 px-5 py-3.5 text-sm odd:bg-muted/50"><dt className="text-muted-foreground">{s.label}</dt><dd className="font-medium">{s.value}</dd></div>
                ))}
              </dl>
              {p.tags.length > 0 && <p className="mt-6 flex flex-wrap gap-2">{p.tags.map((t) => <a key={t} href={`/shop?tag=${encodeURIComponent(t)}`} className="rounded-full bg-muted px-3 py-1 text-xs">#{t}</a>)}</p>}
            </div>
          )}
        </div>

        {site.commerce.reviews && (
          <section id="reviews" className="mt-20 scroll-mt-28">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl">Customer reviews</h2>
                {rating > 0 && <p className="mt-2 flex items-center gap-3"><span className="font-heading text-3xl">{rating}</span><Rating value={rating} count={p.reviews.length} /></p>}
              </div>
            </div>
            {p.reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="grid gap-6 md:grid-cols-2">
                {p.reviews.map((r, i) => (
                  <li key={i} className="rounded-brand border border-border p-6">
                    <div className="flex items-center justify-between"><Rating value={r.rating} /><span className="text-xs text-muted-foreground">{formatDate(r.date, site.commerce.locale)}</span></div>
                    {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
                    <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                    <p className="mt-4 text-sm font-medium">{r.author}{r.verified && <span className="ml-2 text-xs text-success">✓ Verified purchase</span>}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-xs text-muted-foreground">Review submission requires a backend (see docs/INTEGRATIONS.md → Reviews).</p>
          </section>
        )}

        {productFaqs.length > 0 && (
          <section className="mt-20 max-w-3xl">
            <h2 className="mb-6 text-2xl">Questions & answers</h2>
            <FaqList items={productFaqs} />
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-2xl md:text-3xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} product={r} site={site} />)}</div>
          </section>
        )}
      </Container>
    </>
  );
}
