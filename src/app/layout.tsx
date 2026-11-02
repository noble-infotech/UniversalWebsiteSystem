import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSite } from "@/core/config/loader";
import { themeToCssVars, cssVarsToString, googleFontsHref } from "@/core/theme/tokens";
import { buildMetadata } from "@/core/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return buildMetadata(site);
}

export async function generateViewport(): Promise<Viewport> {
  const site = await getSite();
  return { themeColor: site.theme.colors.primary, width: "device-width", initialScale: 1 };
}

/** Root: document shell + per-company design tokens. Public chrome lives in (site)/layout, admin in admin/layout. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang={site.commerce.locale.split("-")[0] ?? "en"} className={site.theme.mode === "dark" ? "dark" : undefined} style={{ colorScheme: site.theme.mode }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={googleFontsHref(site.theme)} />
        <style id="brand-tokens" dangerouslySetInnerHTML={{ __html: cssVarsToString(themeToCssVars(site.theme)) }} />
      </head>
      <body data-site={site.id} data-anim={site.theme.animation.enabled ? "on" : "off"} data-anim-style={site.theme.animation.style} className="flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}
