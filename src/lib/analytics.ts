"use client";
/** Conversion tracking: forwards events to GA4 (gtag), GTM (dataLayer) and Meta Pixel when configured. */
type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };

const fbMap: Record<string, string> = {
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  generate_lead: "Lead",
  sign_up: "CompleteRegistration",
  add_to_wishlist: "AddToWishlist",
  search: "Search",
  view_item: "ViewContent",
};

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as W;
  w.gtag?.("event", event, params);
  w.dataLayer?.push({ event, ...params });
  if (w.fbq && fbMap[event]) w.fbq("track", fbMap[event], params);
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
}
