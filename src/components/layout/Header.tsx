import type { SiteConfig } from "@/core/config/schema";
import { filterNav, isEnabled } from "@/core/config/features";
import { HeaderClient } from "./HeaderClient";

/** Server wrapper: resolves config into plain props for the interactive header. */
export function Header({ site }: { site: SiteConfig }) {
  const nav = site.navigation;
  const icons = nav.icons;
  return (
    <HeaderClient
      brand={{ name: site.company.brandName, logo: site.company.logo.primary, logoLight: site.company.logo.secondary, text: site.company.logo.text, height: site.company.logo.height }}
      menu={filterNav(nav.menu, site)}
      header={site.theme.header}
      announcement={nav.announcement?.enabled ? nav.announcement : undefined}
      topBar={nav.topBar.enabled ? { phone: site.company.phones[0]?.number, email: site.company.emails[0]?.address, social: nav.topBar.showSocial ? site.company.social : {}, hours: site.company.headOffice.hours, showContact: nav.topBar.showContact } : undefined}
      icons={{
        search: icons.search && isEnabled(site, "search"),
        account: icons.account && isEnabled(site, "accounts"),
        wishlist: icons.wishlist && isEnabled(site, "wishlist"),
        cart: icons.cart && isEnabled(site, "shop"),
      }}
      cta={nav.cta}
    />
  );
}
