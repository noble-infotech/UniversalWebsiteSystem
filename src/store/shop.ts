"use client";
/**
 * Client-side shopping state (cart, wishlist, coupon, demo accounts, order history).
 * Persisted in localStorage and partitioned by site id so multiple company
 * demos on one domain never share a cart.
 *
 * PRODUCTION NOTE: cart/wishlist persistence is fine client-side, but accounts
 * and orders must come from your backend (see src/services). The demo account
 * store here exists only so the UI flows can be exercised end-to-end.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/core/commerce/pricing";
import type { Coupon } from "@/core/config/schema";
import type { Order } from "@/core/commerce/orders";

export interface DemoAccount {
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  phone?: string;
}

type PerSite<T> = Record<string, T>;

interface ShopState {
  carts: PerSite<CartLine[]>;
  wishlists: PerSite<string[]>;
  coupons: PerSite<Coupon | null>;
  orders: PerSite<Order[]>;
  accounts: PerSite<DemoAccount[]>;
  sessions: PerSite<string | null>;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addLine: (site: string, line: CartLine, max: number) => void;
  setQty: (site: string, key: string, qty: number, max: number) => void;
  removeLine: (site: string, key: string) => void;
  clearCart: (site: string) => void;
  toggleWishlist: (site: string, slug: string) => void;
  setCoupon: (site: string, coupon: Coupon | null) => void;
  addOrder: (site: string, order: Order) => void;
  register: (site: string, acc: DemoAccount) => void;
  setSession: (site: string, email: string | null) => void;
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      carts: {},
      wishlists: {},
      coupons: {},
      orders: {},
      accounts: {},
      sessions: {},
      cartOpen: false,
      setCartOpen: (cartOpen) => set({ cartOpen }),
      addLine: (site, line, max) =>
        set((s) => {
          const cart = [...(s.carts[site] ?? [])];
          const i = cart.findIndex((l) => l.key === line.key);
          const limit = Math.min(max, line.maxQuantity ?? max);
          if (i >= 0) cart[i] = { ...cart[i], quantity: Math.min(limit, cart[i].quantity + line.quantity) };
          else cart.push({ ...line, quantity: Math.min(limit, line.quantity) });
          return { carts: { ...s.carts, [site]: cart } };
        }),
      setQty: (site, key, qty, max) =>
        set((s) => ({
          carts: {
            ...s.carts,
            [site]: (s.carts[site] ?? []).flatMap((l) => (l.key !== key ? [l] : qty <= 0 ? [] : [{ ...l, quantity: Math.min(qty, Math.min(max, l.maxQuantity ?? max)) }])),
          },
        })),
      removeLine: (site, key) => set((s) => ({ carts: { ...s.carts, [site]: (s.carts[site] ?? []).filter((l) => l.key !== key) } })),
      clearCart: (site) => set((s) => ({ carts: { ...s.carts, [site]: [] }, coupons: { ...s.coupons, [site]: null } })),
      toggleWishlist: (site, slug) =>
        set((s) => {
          const w = s.wishlists[site] ?? [];
          return { wishlists: { ...s.wishlists, [site]: w.includes(slug) ? w.filter((x) => x !== slug) : [...w, slug] } };
        }),
      setCoupon: (site, coupon) => set((s) => ({ coupons: { ...s.coupons, [site]: coupon } })),
      addOrder: (site, order) => set((s) => ({ orders: { ...s.orders, [site]: [order, ...(s.orders[site] ?? [])] } })),
      register: (site, acc) => set((s) => ({ accounts: { ...s.accounts, [site]: [...(s.accounts[site] ?? []).filter((a) => a.email !== acc.email), acc] } })),
      setSession: (site, email) => set((s) => ({ sessions: { ...s.sessions, [site]: email } })),
    }),
    {
      name: "uws-shop",
      version: 1,
      partialize: ({ cartOpen: _cartOpen, ...rest }) => rest,
    },
  ),
);

export async function hashPassword(pw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
