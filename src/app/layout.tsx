import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSite, getSiteId, listSites, switcherEnabled } from "@/core/config/loader";
import { toClientConfig } from "@/core/config/client";
import { themeToCssVars, cssVarsToString, googleFontsHref } from "@/core/theme/tokens";
import { buildMetadata } from "@/core/seo/metadata";
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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return buildMetadata(site);
}

export async function generateViewport(): Promise<Viewport> {
  const site = await getSite();
  return { themeColor: site.theme.colors.primary, width: "device-width", initialScale: 1 };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const siteId = await getSiteId();
  const i = site.integrations;
  const call = i.clickToCall?.enabled ? { number: i.clickToCall.number ?? site.company.phones[0]?.number } : undefined;
  return (
    <html lang={site.commerce.locale.split("-")[0] ?? "en"} className={site.theme.mode === "dark" ? "dark" : undefined} style={{ colorScheme: site.theme.mode }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={googleFontsHref(site.theme)} />
        <style id="brand-tokens" dangerouslySetInnerHTML={{ __html: cssVarsToString(themeToCssVars(site.theme)) }} />
      </head>
      <body data-site={site.id} data-anim={site.theme.animation.enabled ? "on" : "off"} data-anim-style={site.theme.animation.style} className="flex min-h-screen flex-col">
        <JsonLd data={organizationLd(site)} />
        <SiteProvider config={toClientConfig(site)}>
          <Header site={site} />
          <main id="main" className="flex-1">{children}</main>
          <Footer site={site} />
          {isEnabled(site, "shop") && <CartDrawer />}
          <FloatingContact whatsapp={i.whatsapp} call={call?.number ? { number: call.number } : undefined} />
          {i.popup?.enabled && <PopupAnnouncement popup={i.popup} />}
          {switcherEnabled() && <SiteSwitcher sites={listSites()} current={siteId} />}
        </SiteProvider>
        <AnalyticsScripts analytics={i.analytics} />
        <LiveChat chat={i.liveChat} />
      </body>
    </html>
  );
}
