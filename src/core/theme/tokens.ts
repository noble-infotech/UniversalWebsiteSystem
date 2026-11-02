/**
 * Converts a ThemeConfig into CSS custom properties (design tokens).
 * Tailwind utilities (bg-primary, text-muted-foreground, rounded-brand …) are
 * mapped onto these variables in globals.css, so every company gets its own
 * look from data alone.
 */
import type { ThemeConfig } from "../config/schema";

const spacing = { compact: "4rem", normal: "6rem", relaxed: "8rem" } as const;
const btnRadius = { square: "0px", rounded: "var(--radius)", pill: "999px" } as const;
const imgRadius = { square: "0px", rounded: "var(--radius)", soft: "calc(var(--radius) * 2)" } as const;

export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  const c = theme.colors;
  return {
    "--c-primary": c.primary,
    "--c-primary-fg": c.primaryForeground,
    "--c-secondary": c.secondary,
    "--c-secondary-fg": c.secondaryForeground,
    "--c-accent": c.accent,
    "--c-accent-fg": c.accentForeground,
    "--c-bg": c.background,
    "--c-surface": c.surface,
    "--c-muted": c.muted,
    "--c-text": c.text,
    "--c-text-muted": c.textMuted,
    "--c-border": c.border,
    "--c-success": c.success,
    "--c-danger": c.danger,
    "--font-heading-family": `"${theme.fonts.heading}", ui-serif, Georgia, system-ui, sans-serif`,
    "--font-body-family": `"${theme.fonts.body}", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`,
    "--heading-weight": String(theme.fonts.headingWeight),
    "--heading-transform": theme.fonts.headingCase,
    "--heading-tracking": theme.fonts.headingTracking,
    "--radius": theme.radius,
    "--radius-btn": btnRadius[theme.button.shape],
    "--radius-img": imgRadius[theme.images.style],
    "--btn-transform": theme.button.uppercase ? "uppercase" : "none",
    "--btn-tracking": theme.button.uppercase ? "0.08em" : "0",
    "--container": theme.container,
    "--section-y": spacing[theme.sectionSpacing],
    "--anim-duration": `${theme.animation.durationMs}ms`,
    "--img-filter": theme.images.treatment === "grayscale" ? "grayscale(1)" : theme.images.treatment === "duotone" ? "grayscale(1) contrast(1.05)" : "none",
  };
}

export function cssVarsToString(vars: Record<string, string>) {
  return `:root{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}}`;
}

export function googleFontsHref(theme: ThemeConfig) {
  const families = Array.from(new Set([theme.fonts.heading, theme.fonts.body]));
  const weights = Array.from(new Set([...theme.fonts.weights, theme.fonts.headingWeight])).sort((a, b) => a - b).join(";");
  const q = families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@${weights}`).join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
