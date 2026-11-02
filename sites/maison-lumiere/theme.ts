import type { SiteConfigInput } from "@/core/config/schema";

/** Editorial luxury: warm linen background, serif display type, terracotta accent, pill buttons. */
export const theme: SiteConfigInput["theme"] = {
  mode: "light",
  colors: {
    primary: "#1c1917",
    primaryForeground: "#faf7f2",
    secondary: "#3b2f2a",
    secondaryForeground: "#faf7f2",
    accent: "#c2683a",
    accentForeground: "#ffffff",
    background: "#faf7f2",
    surface: "#ffffff",
    muted: "#f1ebe2",
    text: "#1c1917",
    textMuted: "#6b625b",
    border: "#e6ddd1",
  },
  fonts: { heading: "Cormorant Garamond", body: "DM Sans", headingWeight: 500, weights: [400, 500, 600, 700], headingCase: "none", headingTracking: "-0.01em" },
  radius: "0.5rem",
  button: { shape: "pill", style: "solid", uppercase: false },
  card: { style: "flat", hoverLift: false },
  header: { style: "centered", sticky: true, transparentOnHero: true, logoPosition: "center" },
  footer: { layout: "columns", variant: "brand" },
  animation: { enabled: true, style: "fade", durationMs: 900 },
  images: { style: "soft", treatment: "natural" },
  container: "88rem",
  sectionSpacing: "relaxed",
};
