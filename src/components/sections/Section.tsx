import type { ReactNode } from "react";
import { clsx } from "clsx";
import type { SectionConfig } from "@/core/config/schema";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { ArrowRight } from "lucide-react";

/** Shared wrapper: background, visibility per breakpoint, anchor id, spacing. */
export function Section({ section, children, className, container = true, padded = true }: { section: SectionConfig; children: ReactNode; className?: string; container?: boolean; padded?: boolean }) {
  const bg = section.background?.variant ?? "default";
  const vis = section.visibility ?? { mobile: true, desktop: true };
  return (
    <section
      id={section.id}
      aria-labelledby={section.title ? `${section.id}-title` : undefined}
      data-section={section.type}
      className={clsx("relative isolate scroll-mt-24", padded && "section-y", bg !== "default" && `bg-variant-${bg}`, !vis.mobile && "hide-mobile", !vis.desktop && "hide-desktop", className)}
    >
      {bg === "image" && section.background?.image && (
        <>
          <SmartImage src={section.background.image} alt="" fill className="-z-20 object-cover" brand={false} sizes="100vw" />
          <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: section.background.overlay ?? 0.55 }} />
        </>
      )}
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}

/** Eyebrow / title / subtitle / description / CTA block used by most sections. */
export function SectionHeader({ section, align, className, fallbackTitle, action = true }: { section: SectionConfig; align?: "left" | "center"; className?: string; fallbackTitle?: string; action?: boolean }) {
  if (section.settings?.hideHeader) return null;
  const a = section.align ?? align ?? "center";
  const title = section.title ?? fallbackTitle;
  if (!title && !section.eyebrow && !section.subtitle) return null;
  const centered = a === "center";
  return (
    <Reveal className={clsx("mb-12 md:mb-16", centered ? "mx-auto max-w-3xl text-center" : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className={clsx(!centered && "max-w-2xl")}>
        {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
        {title && (
          <h2 id={`${section.id}-title`} className="text-3xl md:text-[2.75rem] md:leading-[1.08]">
            {title}
          </h2>
        )}
        {section.subtitle && <p className="mt-5 text-lg text-muted-foreground">{section.subtitle}</p>}
        {section.description && <p className="mt-4 text-muted-foreground">{section.description}</p>}
      </div>
      {action && !centered && section.cta && (
        <ButtonLink href={section.cta.href} variant="outline" className="shrink-0">
          {section.cta.label} <ArrowRight className="size-4" />
        </ButtonLink>
      )}
    </Reveal>
  );
}

export function SectionFooterCta({ section, center = true }: { section: SectionConfig; center?: boolean }) {
  if (!section.cta && !section.secondaryCta) return null;
  if ((section.align ?? "center") === "left" && !section.secondaryCta) return null;
  return (
    <div className={clsx("mt-12 flex flex-wrap gap-3", center && "justify-center")}>
      {section.cta && (
        <ButtonLink href={section.cta.href}>
          {section.cta.label} <ArrowRight className="size-4" />
        </ButtonLink>
      )}
      {section.secondaryCta && (
        <ButtonLink href={section.secondaryCta.href} variant="outline">
          {section.secondaryCta.label}
        </ButtonLink>
      )}
    </div>
  );
}

export function gridCols(n = 3) {
  return clsx("grid gap-6", { 1: "grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-3 lg:grid-cols-5", 6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" }[n]);
}

/** Pick inline items (section.items) or fall back to a content collection, then apply limit. */
export function itemsFor<T>(section: SectionConfig, fallback: T[]): T[] {
  const list = (section.items as T[] | undefined)?.length ? (section.items as T[]) : fallback;
  return section.limit ? list.slice(0, section.limit) : list;
}

export function cardClass(style: string, hover = true) {
  return clsx("card", `card-${style}`, hover && "card-hover");
}
