import type { SiteConfigInput } from "@/core/config/schema";

/** Industrial: deep navy + safety orange, condensed uppercase headings, sharp corners. */
export const theme: SiteConfigInput["theme"] = {
  mode: "light",
  colors: {
    primary: "#0d2a4a",
    primaryForeground: "#ffffff",
    secondary: "#0a1b2e",
    secondaryForeground: "#ffffff",
    accent: "#f26b1d",
    accentForeground: "#ffffff",
    background: "#ffffff",
    surface: "#ffffff",
    muted: "#f2f4f7",
    text: "#0b1421",
    textMuted: "#536173",
    border: "#dde3ea",
  },
  fonts: { heading: "Archivo", body: "Inter", headingWeight: 800, weights: [400, 500, 600, 700, 800], headingCase: "uppercase", headingTracking: "-0.01em" },
  radius: "0.25rem",
  button: { shape: "square", style: "solid", uppercase: true },
  card: { style: "bordered", hoverLift: true },
  header: { style: "classic", sticky: true, transparentOnHero: false, logoPosition: "left" },
  footer: { layout: "mega", variant: "dark" },
  animation: { enabled: true, style: "slide-up", durationMs: 650 },
  images: { style: "square", treatment: "natural" },
  container: "84rem",
  sectionSpacing: "normal",
};
