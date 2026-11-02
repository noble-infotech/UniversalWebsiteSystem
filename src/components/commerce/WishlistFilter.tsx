"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import { useWishlist, useHydrated } from "@/components/SiteProvider";

export function WishlistFilter({ items }: { items: { slug: string; node: ReactNode }[] }) {
  const w = useWishlist();
  const h = useHydrated();
  if (!h) return <div className="h-64 animate-pulse rounded-brand bg-muted" />;
  const shown = items.filter((i) => w.has(i.slug));
  if (!shown.length)
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <Heart className="size-12 text-muted-foreground" strokeWidth={1.25} />
        <p className="mt-4 text-lg font-semibold">Your wishlist is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it for later.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Browse products</Link>
      </div>
    );
  return <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{shown.map((i) => <div key={i.slug}>{i.node}</div>)}</div>;
}
