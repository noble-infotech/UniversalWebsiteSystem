import Link from "next/link";
import { clsx } from "clsx";
import type { Product, SiteConfig } from "@/core/config/schema";
import { averageRating, discountPercent, effectivePrice, stockState } from "@/core/commerce/pricing";
import { formatMoney } from "@/core/commerce/format";
import { Badge, Rating } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { WishlistButton, QuickAddButton } from "./CartButtons";
import { isEnabled } from "@/core/config/features";

export function ProductCard({ product: p, site, layout = "default" }: { product: Product; site: SiteConfig; layout?: "default" | "minimal" }) {
  const money = (n: number) => formatMoney(n, site.commerce.currency, site.commerce.locale);
  const off = discountPercent(p);
  const stock = stockState(p, site.commerce.inventory.lowStockThreshold);
  const rating = averageRating(p);
  const shop = isEnabled(site, "shop");
  const second = p.images[1];
  return (
    <article className={clsx("group relative flex flex-col", layout === "default" && "card card-" + site.theme.card.style + " overflow-hidden")}>
      <div className={clsx("relative aspect-[4/5] overflow-hidden bg-muted", layout === "minimal" && "img-brand")}>
        <Link href={`/products/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          <SmartImage src={p.images[0].src} alt={p.images[0].alt || p.name} fill brand={false} className={clsx("object-cover transition duration-700", second ? "group-hover:opacity-0" : "group-hover:scale-105")} sizes="(min-width:1024px) 25vw, 50vw" />
          {second && <SmartImage src={second.src} alt="" fill brand={false} className="object-cover opacity-0 transition duration-700 group-hover:opacity-100" sizes="(min-width:1024px) 25vw, 50vw" />}
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {off > 0 && <Badge tone="danger">-{off}%</Badge>}
          {p.newArrival && <Badge tone="dark">New</Badge>}
          {p.bestSeller && <Badge tone="accent">Best seller</Badge>}
          {stock === "out_of_stock" && <Badge tone="muted">Sold out</Badge>}
        </div>
        {isEnabled(site, "wishlist") && (
          <div className="absolute top-3 right-3">
            <WishlistButton slug={p.slug} name={p.name} />
          </div>
        )}
        {shop && p.purchaseMode !== "quote" && p.options.length === 0 && p.customization.length === 0 && stock !== "out_of_stock" && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <QuickAddButton product={{ slug: p.slug, sku: p.sku, name: p.name, image: p.images[0].src, unitPrice: effectivePrice(p), compareAtPrice: p.salePrice != null ? p.price : undefined, type: p.type, category: p.category, weightKg: p.weightKg, maxQuantity: p.stock && site.commerce.inventory.trackStock ? p.stock : undefined, minQty: p.minOrderQty }} />
          </div>
        )}
      </div>
      <div className={clsx("flex flex-1 flex-col", layout === "default" ? "p-5" : "pt-4")}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{site.catalog.categories.find((c) => c.slug === p.category)?.name ?? p.category}</p>
        <h3 className="mt-1.5 text-base font-semibold leading-snug" style={{ fontFamily: "var(--font-body-family)", textTransform: "none", letterSpacing: 0 }}>
          <Link href={`/products/${p.slug}`} className="hover:text-primary">{p.name}</Link>
        </h3>
        {rating > 0 && <Rating value={rating} count={p.reviews.length} size="size-3.5" className="mt-2" />}
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {p.purchaseMode === "quote" ? (
            <span className="text-sm font-semibold text-primary">{p.priceLabel ?? "Price on request"}</span>
          ) : (
            <>
              {p.priceLabel && <span className="text-xs text-muted-foreground">{p.priceLabel}</span>}
              <span className="font-semibold">{money(effectivePrice(p))}</span>
              {off > 0 && <s className="text-sm text-muted-foreground">{money(p.price)}</s>}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
