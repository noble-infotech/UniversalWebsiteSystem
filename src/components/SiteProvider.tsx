"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ClientConfig } from "@/core/config/client";
import { useShop } from "@/store/shop";
import { computeTotals, type Totals } from "@/core/commerce/pricing";
import { formatMoney } from "@/core/commerce/format";
import { applyCoupon } from "@/core/commerce/pricing";

const Ctx = createContext<ClientConfig | null>(null);

export function SiteProvider({ config, children }: { config: ClientConfig; children: ReactNode }) {
  return <Ctx.Provider value={config}>{children}</Ctx.Provider>;
}

export function useSiteConfig() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSiteConfig must be used inside <SiteProvider>");
  return c;
}

/** True after first client render – avoids hydration mismatches for persisted state. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useMoney() {
  const { commerce } = useSiteConfig();
  return (n: number) => formatMoney(n, commerce.currency, commerce.locale);
}

export function useCart() {
  const cfg = useSiteConfig();
  const hydrated = useHydrated();
  const lines = useShop((s) => s.carts[cfg.id]) ?? EMPTY;
  const coupon = useShop((s) => s.coupons[cfg.id]) ?? null;
  const shop = useShop.getState;
  const max = cfg.commerce.maxQuantityPerItem;
  const visible = hydrated ? lines : EMPTY;
  const couponResult = useMemo(() => (coupon ? applyCoupon(coupon, visible) : null), [coupon, visible]);
  const totals: Totals = useMemo(
    () => computeTotals({ lines: visible, commerce: cfg.commerce, coupon: couponResult?.ok ? couponResult : undefined }),
    [visible, cfg.commerce, couponResult],
  );
  return {
    lines: visible,
    count: totals.itemCount,
    totals,
    coupon,
    couponResult,
    add: (l: Parameters<ReturnType<typeof shop>["addLine"]>[1]) => shop().addLine(cfg.id, l, max),
    setQty: (key: string, q: number) => shop().setQty(cfg.id, key, q, max),
    remove: (key: string) => shop().removeLine(cfg.id, key),
    clear: () => shop().clearCart(cfg.id),
    setCoupon: (c: Parameters<ReturnType<typeof shop>["setCoupon"]>[1]) => shop().setCoupon(cfg.id, c),
    open: () => shop().setCartOpen(true),
  };
}
const EMPTY: never[] = [];

export function useWishlist() {
  const cfg = useSiteConfig();
  const hydrated = useHydrated();
  const list = useShop((s) => s.wishlists[cfg.id]) ?? EMPTY;
  const items: string[] = hydrated ? list : EMPTY;
  return { items, has: (slug: string) => items.includes(slug), toggle: (slug: string) => useShop.getState().toggleWishlist(cfg.id, slug) };
}

export function useAccount() {
  const cfg = useSiteConfig();
  const hydrated = useHydrated();
  const email = useShop((s) => s.sessions[cfg.id]) ?? null;
  const accounts = useShop((s) => s.accounts[cfg.id]) ?? EMPTY;
  const orders = useShop((s) => s.orders[cfg.id]) ?? EMPTY;
  const user = hydrated && email ? (accounts as { email: string; name: string; phone?: string }[]).find((a) => a.email === email) ?? null : null;
  return { hydrated, user, orders: hydrated ? (orders as import("@/core/commerce/orders").Order[]) : [], siteId: cfg.id };
}
