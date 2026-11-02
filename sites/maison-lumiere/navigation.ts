import type { SiteConfigInput } from "@/core/config/schema";

export const navigation: SiteConfigInput["navigation"] = {
  menu: [
    {
      label: "Shop",
      href: "/shop",
      mega: true,
      children: [
        { label: "Home fragrance", href: "/shop/category/home-fragrance", description: "Candles, diffusers & mists", children: [{ label: "Candles", href: "/shop/category/candles" }, { label: "Diffusers", href: "/shop/category/diffusers" }] },
        { label: "Ceramics", href: "/shop/category/ceramics", description: "Wheel-thrown in Brooklyn" },
        { label: "Linen & textiles", href: "/shop/category/linen", description: "European flax linen" },
        { label: "Accessories", href: "/shop/category/accessories" },
        { label: "Gifts & experiences", href: "/shop/category/gifts" },
        { label: "Sale", href: "/shop?sale=1", description: "Limited-time offers" },
      ],
    },
    { label: "New in", href: "/shop?sort=newest" },
    { label: "Journal", href: "/blog", requires: "blog" },
    { label: "Our story", href: "/about", children: [{ label: "About us", href: "/about" }, { label: "Sustainability", href: "/sustainability" }, { label: "Lookbook", href: "/gallery" }] },
    { label: "Help", href: "/faq", children: [{ label: "FAQ", href: "/faq" }, { label: "Track order", href: "/track-order" }, { label: "Shipping", href: "/shipping-policy" }, { label: "Returns", href: "/returns-policy" }, { label: "Contact", href: "/contact" }] },
  ],
  announcement: { enabled: true, text: "Free US shipping on orders over $75 · Use WELCOME10 for 10% off", link: { label: "Shop now", href: "/shop" }, dismissible: true },
  topBar: { enabled: false, showContact: false, showSocial: false },
  icons: { search: true, account: true, wishlist: true, cart: true },
};
