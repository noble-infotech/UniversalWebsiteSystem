import type { SiteConfigInput } from "@/core/config/schema";

/** Tech consultancy: dark mode, electric violet + lime, geometric type, glass cards, gradient CTAs. */
export const theme: SiteConfigInput["theme"] = {
  mode: "dark",
  colors: {
    primary: "#8b6cff",
    primaryForeground: "#ffffff",
    secondary: "#1a1f3d",
    secondaryForeground: "#f4f5fb",
    accent: "#c6f432",
    accentForeground: "#0b1020",
    background: "#0b1020",
    surface: "#121836",
    muted: "#10152e",
    text: "#f4f5fb",
    textMuted: "#a2a8c3",
    border: "#252c52",
  },
  fonts: { heading: "Space Grotesk", body: "Inter", headingWeight: 600, weights: [400, 500, 600, 700], headingCase: "none", headingTracking: "-0.03em" },
  radius: "1rem",
  button: { shape: "pill", style: "gradient", uppercase: false },
  card: { style: "glass", hoverLift: true },
  header: { style: "minimal", sticky: true, transparentOnHero: false, logoPosition: "left" },
  footer: { layout: "centered", variant: "dark" },
  animation: { enabled: true, style: "zoom", durationMs: 800 },
  images: { style: "soft", treatment: "grayscale" },
  container: "78rem",
  sectionSpacing: "relaxed",
};
