import { getSite, getSiteId, listSites, switcherEnabled } from "@/core/config/loader";
import { toClientConfig } from "@/core/config/client";
import { organizationLd } from "@/core/seo/jsonld";
import { isEnabled } from "@/core/config/features";
import { SiteProvider } from "@/components/SiteProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/commerce/CartContents";
import { FloatingContact, PopupAnnouncement } from "@/components/engagement/Widgets";
import { AnalyticsScripts, LiveChat } from "@/components/engagement/Integrations";
import { SiteSwitcher } from "@/components/engagement/SiteSwitcher";
import { JsonLd } from "@/components/ui/primitives";

/** Public website chrome: header, footer, cart, engagement widgets, analytics. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const siteId = await getSiteId();
  const i = site.integrations;
  const callNumber = i.clickToCall?.enabled ? i.clickToCall.number ?? site.company.phones[0]?.number : undefined;
  return (
    <>
      <JsonLd data={organizationLd(site)} />
      <SiteProvider config={toClientConfig(site)}>
        <Header site={site} />
        <main id="main" className="flex-1">{children}</main>
        <Footer site={site} />
        {isEnabled(site, "shop") && <CartDrawer />}
        <FloatingContact whatsapp={i.whatsapp} call={callNumber ? { number: callNumber } : undefined} />
        {i.popup?.enabled && <PopupAnnouncement popup={i.popup} />}
        {switcherEnabled() && <SiteSwitcher sites={listSites()} current={siteId} />}
      </SiteProvider>
      <AnalyticsScripts analytics={i.analytics} />
      <LiveChat chat={i.liveChat} />
    </>
  );
}
