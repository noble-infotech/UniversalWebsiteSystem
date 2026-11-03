import type { FeatureKey, NavItem, SiteConfig } from "./schema";

/** Feature checks that also respect related settings (e.g. shop requires commerce.enabled). */
export function isEnabled(site: Pick<SiteConfig, "features" | "commerce">, key: FeatureKey): boolean {
  const flag = site.features[key] ?? false;
  if (key === "shop") return flag && site.commerce.enabled;
  // Product catalogue browsing (no cart) – always on when the shop is on.
  if (key === "catalog") return flag || (!!site.features.shop && site.commerce.enabled);
  if (key === "wishlist") return flag && site.commerce.enabled && site.commerce.wishlist;
  if (key === "accounts") return flag && site.commerce.enabled && site.commerce.accounts;
  return flag;
}

/** Remove menu entries whose feature is disabled (recursively). */
export function filterNav(items: NavItem[], site: Pick<SiteConfig, "features" | "commerce">): NavItem[] {
  return items
    .filter((i) => !i.requires || isEnabled(site, i.requires))
    .map((i) => (i.children ? { ...i, children: filterNav(i.children, site) } : i));
}
