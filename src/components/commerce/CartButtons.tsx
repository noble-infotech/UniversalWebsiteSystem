"use client";
import { Heart, Plus, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useCart, useWishlist, useHydrated } from "@/components/SiteProvider";
import { lineKey, type CartLine } from "@/core/commerce/pricing";
import { track } from "@/lib/analytics";

export function WishlistButton({ slug, name, className, withLabel }: { slug: string; name: string; className?: string; withLabel?: boolean }) {
  const w = useWishlist();
  const on = w.has(slug);
  return (
    <button
      type="button"
      onClick={() => {
        if (!on) track("add_to_wishlist", { item_id: slug });
        w.toggle(slug);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={clsx(withLabel ? "btn btn-outline" : "grid size-10 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-sm backdrop-blur transition hover:scale-110", className)}
    >
      <Heart className={clsx("size-[18px]", on && "fill-danger text-danger")} />
      {withLabel && <span>{on ? "Saved" : "Wishlist"}</span>}
    </button>
  );
}

type QuickProduct = Omit<CartLine, "key" | "quantity" | "options"> & { minQty?: number };

export function QuickAddButton({ product }: { product: QuickProduct }) {
  const cart = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-primary btn-sm w-full"
      onClick={() => {
        const { minQty, ...rest } = product;
        cart.add({ ...rest, key: lineKey(product.slug), quantity: minQty ?? 1, options: {} });
        track("add_to_cart", { item_id: product.sku, item_name: product.name, value: product.unitPrice });
        setDone(true);
        setTimeout(() => setDone(false), 1400);
        cart.open();
      }}
    >
      {done ? <Check className="size-4" /> : <Plus className="size-4" />} {done ? "Added" : "Add to cart"}
    </button>
  );
}

export function CartCountBadge() {
  const { count } = useCart();
  const h = useHydrated();
  if (!h || count === 0) return null;
  return <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>;
}

export function WishlistCountBadge() {
  const { items } = useWishlist();
  if (items.length === 0) return null;
  return <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{items.length}</span>;
}

export function CartIconButton() {
  const cart = useCart();
  return (
    <button type="button" onClick={cart.open} className="relative grid size-10 place-items-center rounded-full transition hover:bg-current/10" aria-label={`Open cart (${cart.count} items)`}>
      <ShoppingBag className="size-5" />
      <CartCountBadge />
    </button>
  );
}
