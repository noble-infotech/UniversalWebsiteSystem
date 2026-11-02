/**
 * Brand-storytelling sections: hero, about, vision/mission, story, what we do,
 * why choose us, achievements, stats, team, infrastructure, process.
 */
import { clsx } from "clsx";
import { ArrowRight, Check, Play, Quote } from "lucide-react";
import type { IconItem, Person, Stat } from "@/core/config/schema";
import { ButtonLink } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Counter } from "@/components/ui/Counter";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { Section, SectionHeader, SectionFooterCta, gridCols, itemsFor, cardClass } from "./Section";
import type { SectionProps } from "./types";

/* ------------------------------- HERO ---------------------------------- */
/** layouts: split | centered | video | minimal */
export function HeroSection({ section, site }: SectionProps) {
  const layout = section.layout ?? "split";
  const s = section.settings ?? {};
  const highlights = (s.highlights as { value: string; label: string }[] | undefined) ?? [];
  const badges = (s.badges as string[] | undefined) ?? [];
  const title = section.title ?? site.company.tagline;
  const subtitle = section.subtitle ?? site.company.description;

  const ctas = (light = false) => (
    <div className={clsx("mt-10 flex flex-wrap gap-3", layout !== "split" && "justify-center")}>
      {section.cta && (
        <ButtonLink href={section.cta.href} size="lg" variant={site.theme.button.style === "gradient" ? "gradient" : light ? "accent" : "primary"}>
          {section.cta.label} <ArrowRight className="size-4" />
        </ButtonLink>
      )}
      {section.secondaryCta && (
        <ButtonLink href={section.secondaryCta.href} size="lg" variant={light ? "light" : "outline"}>
          {section.secondaryCta.label}
        </ButtonLink>
      )}
    </div>
  );
  const highlightRow = (dark = false) =>
    highlights.length > 0 && (
      <dl className={clsx("mt-12 grid grid-cols-3 gap-6 border-t pt-8", dark ? "border-white/20" : "border-border", layout !== "split" && "mx-auto max-w-2xl")}>
        {highlights.map((h) => (
          <div key={h.label}>
            <dt className={clsx("text-xs uppercase tracking-wider", dark ? "text-white/70" : "text-muted-foreground")}>{h.label}</dt>
            <dd className="font-heading mt-1 text-2xl normal-case md:text-3xl">{h.value}</dd>
          </div>
        ))}
      </dl>
    );

  if (layout === "centered" || layout === "video") {
    return (
      <Section section={{ ...section, background: { variant: "image", image: section.media?.image ?? section.background?.image, overlay: section.background?.overlay ?? 0.55 } }} padded={false} className="text-white">
        {layout === "video" && section.media?.video && (
          <video className="absolute inset-0 -z-20 h-full w-full object-cover" src={section.media.video} poster={section.media.poster} autoPlay muted loop playsInline aria-hidden />
        )}
        <div className="flex min-h-[78vh] items-center py-32 md:min-h-[88vh]">
          <Reveal className="mx-auto max-w-4xl text-center">
            {badges.length > 0 && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {badges.map((b) => (
                  <span key={b} className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">{b}</span>
                ))}
              </div>
            )}
            {section.eyebrow && <p className="eyebrow mb-5">{section.eyebrow}</p>}
            <h1 className="text-4xl sm:text-5xl md:text-7xl">{title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 md:text-xl">{subtitle}</p>
            {ctas(true)}
            {highlightRow(true)}
          </Reveal>
        </div>
      </Section>
    );
  }

  if (layout === "minimal") {
    return (
      <Section section={{ ...section, background: section.background ?? { variant: "gradient" } }} className="!pt-28 md:!pt-36">
        <Reveal className="mx-auto max-w-5xl text-center">
          {section.eyebrow && <p className="eyebrow mb-6">{section.eyebrow}</p>}
          <h1 className="text-5xl sm:text-6xl md:text-8xl">{title}</h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">{subtitle}</p>
          {ctas()}
          {highlightRow()}
        </Reveal>
        {section.media?.image && (
          <Reveal delay={150} className="relative mx-auto mt-16 aspect-[21/9] max-w-6xl overflow-hidden img-brand">
            <SmartImage src={section.media.image} alt={section.media.alt ?? ""} fill priority className="object-cover" sizes="100vw" />
          </Reveal>
        )}
      </Section>
    );
  }

  // split (default)
  return (
    <Section section={{ ...section, background: section.background ?? { variant: "gradient" } }} className="!pt-16 md:!pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal>
          {badges.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {b}
                </span>
              ))}
            </div>
          )}
          {section.eyebrow && <p className="eyebrow mb-5">{section.eyebrow}</p>}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem]">{title}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{subtitle}</p>
          {ctas()}
          {highlightRow()}
        </Reveal>
        <Reveal delay={120} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden img-brand sm:aspect-[5/4] lg:aspect-[4/5]">
            {section.media?.video ? (
              <video className="h-full w-full object-cover" src={section.media.video} poster={section.media.poster} autoPlay muted loop playsInline aria-label={section.media.alt} />
            ) : (
              <SmartImage src={section.media?.image} alt={section.media?.alt ?? site.company.brandName} fill priority className="object-cover" sizes="(min-width:1024px) 50vw, 100vw" />
            )}
          </div>
          {typeof s.floatingCard === "object" && s.floatingCard && (
            <div className="card card-elevated absolute -bottom-6 left-4 max-w-[16rem] p-5 sm:-left-6">
              <p className="font-heading text-3xl text-primary">{(s.floatingCard as { value: string }).value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{(s.floatingCard as { label: string }).label}</p>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------- ABOUT --------------------------------- */
/** layouts: image-left | image-right | centered */
export function AboutSection({ section, site }: SectionProps) {
  const layout = section.layout ?? "image-left";
  const image = section.media?.image ?? site.story.aboutImage;
  const points = (section.settings?.points as string[] | undefined) ?? site.business.usps.slice(0, 4).map((u) => u.title);
  const stats = site.story.stats.slice(0, 2);
  const body = section.description ?? site.story.about;

  if (layout === "centered") {
    return (
      <Section section={section}>
        <Reveal className="mx-auto max-w-3xl text-center">
          {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
          <h2 id={`${section.id}-title`} className="text-3xl md:text-5xl">{section.title ?? `About ${site.company.brandName}`}</h2>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground md:text-xl">{body}</p>
          <SectionFooterCta section={section} />
        </Reveal>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <div className={clsx("grid items-center gap-12 lg:grid-cols-2 lg:gap-20", layout === "image-right" && "lg:[&>*:first-child]:order-2")}>
        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden img-brand">
            <SmartImage src={image} alt={section.media?.alt ?? `About ${site.company.brandName}`} fill className="object-cover" />
          </div>
          {site.company.established && (
            <div className="absolute -bottom-6 right-6 rounded-brand bg-primary px-6 py-5 text-primary-foreground shadow-xl">
              <p className="font-heading text-4xl">{new Date().getFullYear() - site.company.established}+</p>
              <p className="text-xs uppercase tracking-wider opacity-80">Years of excellence</p>
            </div>
          )}
        </Reveal>
        <Reveal delay={100}>
          {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
          <h2 id={`${section.id}-title`} className="text-3xl md:text-[2.75rem] md:leading-tight">{section.title ?? `About ${site.company.brandName}`}</h2>
          {section.subtitle && <p className="mt-5 text-lg font-medium">{section.subtitle}</p>}
          <p className="mt-5 leading-relaxed text-muted-foreground">{body}</p>
          {points.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>
                  <span className="text-sm font-medium">{p}</span>
                </li>
              ))}
            </ul>
          )}
          {stats.length > 0 && (
            <dl className="mt-10 flex gap-10 border-t border-border pt-8">
              {stats.map((st) => (
                <div key={st.label}>
                  <dd className="font-heading text-3xl text-primary"><Counter value={st.value} prefix={st.prefix} suffix={st.suffix} locale={site.commerce.locale} /></dd>
                  <dt className="mt-1 text-sm text-muted-foreground">{st.label}</dt>
                </div>
              ))}
            </dl>
          )}
          {section.cta && (
            <div className="mt-10">
              <ButtonLink href={section.cta.href}>{section.cta.label} <ArrowRight className="size-4" /></ButtonLink>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}

/* --------------------------- VISION & MISSION -------------------------- */
/** layouts: cards | split */
export function VisionMissionSection({ section, site }: SectionProps) {
  const cards = [
    { title: "Our Vision", text: site.story.vision, icon: "compass" },
    { title: "Our Mission", text: site.story.mission, icon: "target" },
  ];
  const values = itemsFor(section, site.story.values);
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Vision, mission & values" />
      <div className={clsx("grid gap-6", section.layout === "split" ? "lg:grid-cols-2" : "md:grid-cols-2")}>
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 100} className={clsx(cardClass(site.theme.card.style, false), "relative overflow-hidden p-8 md:p-12")}>
            <Icon name={c.icon} className="size-10 text-primary" />
            <h3 className="mt-6 text-2xl md:text-3xl">{c.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{c.text}</p>
            <span className="font-heading pointer-events-none absolute -right-4 -bottom-10 text-[10rem] leading-none opacity-[0.04]">{i + 1}</span>
          </Reveal>
        ))}
      </div>
      {values.length > 0 && (
        <div className={clsx("mt-12", gridCols(section.columns ?? Math.min(values.length, 4)))}>
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 60} className="border-t-2 border-primary pt-6">
              <Icon name={v.icon} className="size-6 text-primary" />
              <h4 className="mt-4 text-lg">{v.title}</h4>
              {v.description && <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>}
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ------------------------------- STORY --------------------------------- */
/** layouts: timeline | narrative */
export function StorySection({ section, site }: SectionProps) {
  const milestones = itemsFor(section, site.story.milestones);
  const founder = site.story.founder;
  if (section.layout === "narrative" || milestones.length === 0) {
    return (
      <Section section={section}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            {section.eyebrow && <p className="eyebrow mb-4">{section.eyebrow}</p>}
            <h2 id={`${section.id}-title`} className="text-3xl md:text-5xl">{section.title ?? "Our story"}</h2>
            {founder?.quote && (
              <figure className="mt-10 border-l-2 border-primary pl-6">
                <Quote className="size-8 text-primary" />
                <blockquote className="font-heading mt-3 text-xl italic leading-snug">“{founder.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">— {founder.name}, {founder.role}</figcaption>
              </figure>
            )}
          </Reveal>
          <Reveal delay={100}>
            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">{section.description ?? site.story.history ?? site.story.about}</p>
          </Reveal>
        </div>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Our journey" />
      {site.story.history && !section.description && <p className="mx-auto -mt-6 mb-14 max-w-3xl text-center text-muted-foreground">{site.story.history}</p>}
      <ol className="relative mx-auto max-w-4xl">
        <span className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2" aria-hidden />
        {milestones.map((m, i) => (
          <Reveal as="li" key={m.year + m.title} delay={i * 60} className={clsx("relative mb-10 pl-12 md:w-1/2 md:pl-0", i % 2 ? "md:ml-auto md:pl-12" : "md:pr-12 md:text-right")}>
            <span className={clsx("absolute top-1.5 left-2.5 size-3.5 rounded-full border-4 border-background bg-primary ring-1 ring-primary md:left-auto", i % 2 ? "md:-left-[7px]" : "md:-right-[7px]")} aria-hidden />
            <p className="font-heading text-2xl text-primary">{m.year}</p>
            <h3 className="mt-1 text-lg">{m.title}</h3>
            {m.description && <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>}
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------- ICON GRID helper -------------------------- */
function IconGrid({ items, site, columns, layout }: { items: IconItem[]; site: SectionProps["site"]; columns?: number; layout?: string }) {
  if (layout === "list") {
    return (
      <div className={clsx("grid gap-x-10 gap-y-8 md:grid-cols-2", columns === 3 && "lg:grid-cols-3", columns === 4 && "lg:grid-cols-4")}>
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 50} className="flex gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-brand bg-primary/10 text-primary"><Icon name={it.icon} /></span>
            <div>
              <h3 className="text-lg">{it.title}</h3>
              {it.description && <p className="mt-1.5 text-muted-foreground">{it.description}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    );
  }
  if (layout === "image-cards") {
    return (
      <div className={gridCols(columns ?? 3)}>
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 60} className={clsx(cardClass(site.theme.card.style), "group overflow-hidden")}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage src={it.image} alt={it.title} fill brand={false} className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <h3 className="text-xl">{it.title}</h3>
              {it.description && <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>}
              {it.href && <a href={it.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Learn more <ArrowRight className="size-4" /></a>}
            </div>
          </Reveal>
        ))}
      </div>
    );
  }
  return (
    <div className={gridCols(columns ?? (items.length % 4 === 0 ? 4 : 3))}>
      {items.map((it, i) => (
        <Reveal key={it.title} delay={i * 60} className={clsx(cardClass(site.theme.card.style, site.theme.card.hoverLift), "group p-7")}>
          <span className="grid size-14 place-items-center rounded-brand bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon name={it.icon} className="size-7" /></span>
          <h3 className="mt-6 text-xl">{it.title}</h3>
          {it.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.description}</p>}
          {it.href && <a href={it.href} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Learn more <ArrowRight className="size-4" /></a>}
        </Reveal>
      ))}
    </div>
  );
}

/** layouts: grid | list | image-cards */
export function WhatWeDoSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.whatWeDo);
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="What we do" />
      <IconGrid items={items} site={site} columns={section.columns} layout={section.layout} />
      <SectionFooterCta section={section} />
    </Section>
  );
}

/** layouts: grid | list | split (image + list) */
export function WhyChooseUsSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.whyChooseUs.length ? site.content.whyChooseUs : site.business.advantages);
  if (section.layout === "split") {
    return (
      <Section section={section}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeader section={{ ...section, align: "left" }} fallbackTitle="Why choose us" className="!mb-10" action={false} />
            <ul className="space-y-6">
              {items.map((it) => (
                <li key={it.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon name={it.icon ?? "check"} className="size-5" /></span>
                  <div>
                    <h3 className="text-lg">{it.title}</h3>
                    {it.description && <p className="mt-1 text-muted-foreground">{it.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
            {section.cta && <div className="mt-10"><ButtonLink href={section.cta.href}>{section.cta.label} <ArrowRight className="size-4" /></ButtonLink></div>}
          </Reveal>
          <Reveal delay={100} className="relative aspect-[4/5] overflow-hidden img-brand">
            <SmartImage src={section.media?.image} alt={section.media?.alt ?? ""} fill className="object-cover" />
          </Reveal>
        </div>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Why choose us" />
      <IconGrid items={items} site={site} columns={section.columns} layout={section.layout} />
      <SectionFooterCta section={section} />
    </Section>
  );
}

/** Achievements + awards. layouts: grid | list */
export function AchievementsSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.story.achievements);
  const awards = site.story.awards;
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Our achievements" />
      {items.length > 0 && <IconGrid items={items} site={site} columns={section.columns} layout={section.layout} />}
      {awards.length > 0 && section.settings?.showAwards !== false && (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((a) => (
            <Reveal as="li" key={a.name} className="flex items-center gap-4 rounded-brand border border-border p-5">
              <Icon name="trophy" className="size-8 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-muted-foreground">{[a.issuer, a.year].filter(Boolean).join(" · ")}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}

/** layouts: band | cards | split */
export function StatsSection({ section, site }: SectionProps) {
  const stats = itemsFor<Stat>(section, site.story.stats);
  const layout = section.layout ?? "band";
  return (
    <Section section={{ ...section, background: section.background ?? { variant: layout === "band" ? "primary" : "default" } }} className={layout === "band" ? "!py-16 md:!py-20" : undefined}>
      {layout !== "band" && <SectionHeader section={section} />}
      {layout === "band" && section.title && <h2 id={`${section.id}-title`} className="sr-only">{section.title}</h2>}
      <dl className={clsx("grid gap-8", stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-3")}>
        {stats.map((st, i) => (
          <Reveal key={st.label} delay={i * 80} className={clsx(layout === "cards" ? clsx(cardClass(site.theme.card.style, false), "p-8") : "text-center md:border-l md:border-current/15 md:first:border-l-0")}>
            {layout === "cards" && st.icon && <Icon name={st.icon} className="mb-4 size-8 text-primary" />}
            <dd className="font-heading text-4xl md:text-6xl"><Counter value={st.value} prefix={st.prefix} suffix={st.suffix} locale={site.commerce.locale} /></dd>
            <dt className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{st.label}</dt>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}

/** layouts: grid | cards | founder (founder spotlight + team) */
export function TeamSection({ section, site }: SectionProps) {
  const team = itemsFor<Person>(section, site.story.leadership);
  const founder = site.story.founder;
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Leadership team" />
      {section.layout === "founder" && founder && (
        <Reveal className={clsx(cardClass(site.theme.card.style, false), "mb-12 grid overflow-hidden md:grid-cols-[2fr_3fr]")}>
          <div className="relative aspect-square md:aspect-auto"><SmartImage src={founder.image} alt={founder.name} fill brand={false} className="object-cover" /></div>
          <div className="p-8 md:p-12">
            <p className="eyebrow">Founder</p>
            <h3 className="mt-3 text-3xl">{founder.name}</h3>
            <p className="text-muted-foreground">{founder.role}</p>
            {founder.quote && <blockquote className="font-heading mt-6 text-xl italic">“{founder.quote}”</blockquote>}
            {founder.bio && <p className="mt-6 text-muted-foreground">{founder.bio}</p>}
          </div>
        </Reveal>
      )}
      <div className={gridCols(section.columns ?? 4)}>
        {team.map((p, i) => (
          <Reveal key={p.name} delay={i * 60} className="group">
            <div className="relative aspect-[4/5] overflow-hidden img-brand">
              <SmartImage src={p.image} alt={p.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width:1024px) 25vw, 50vw" />
              {p.social && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <SocialIcons social={p.social} />
                </div>
              )}
            </div>
            <h3 className="mt-5 text-lg">{p.name}</h3>
            <p className="text-sm text-primary">{p.role}</p>
            {p.bio && section.layout === "cards" && <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/** Manufacturing / infrastructure. layouts: image-cards | grid | split */
export function InfrastructureSection({ section, site }: SectionProps) {
  const items = itemsFor(section, site.content.infrastructure);
  if (section.layout === "split") {
    return (
      <Section section={section}>
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal className="relative min-h-80 overflow-hidden img-brand">
            <SmartImage src={section.media?.image} alt={section.media?.alt ?? "Facility"} fill className="object-cover" />
            {section.media?.video && (
              <a href={section.media.video} target="_blank" rel="noopener" className="absolute inset-0 grid place-items-center" aria-label="Play facility video">
                <span className="grid size-20 place-items-center rounded-full bg-white/90 text-black shadow-xl"><Play className="size-8 fill-current" /></span>
              </a>
            )}
          </Reveal>
          <div>
            <SectionHeader section={{ ...section, align: "left" }} fallbackTitle="Infrastructure" className="!mb-10" action={false} />
            <IconGrid items={items} site={site} layout="list" />
          </div>
        </div>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="Manufacturing & infrastructure" />
      <IconGrid items={items} site={site} columns={section.columns} layout={section.layout ?? "image-cards"} />
      <SectionFooterCta section={section} />
    </Section>
  );
}

/** How it works. layouts: steps | vertical */
export function ProcessSection({ section, site }: SectionProps) {
  const steps = itemsFor(section, site.content.process);
  if (section.layout === "vertical") {
    return (
      <Section section={section}>
        <SectionHeader section={section} fallbackTitle="How it works" />
        <ol className="mx-auto max-w-3xl space-y-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 60} className={clsx(cardClass(site.theme.card.style, false), "flex gap-6 p-6")}>
              <span className="font-heading text-4xl text-primary/30">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-xl">{s.title}</h3>
                {s.description && <p className="mt-2 text-muted-foreground">{s.description}</p>}
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>
    );
  }
  return (
    <Section section={section}>
      <SectionHeader section={section} fallbackTitle="How it works" />
      <ol className={clsx("relative grid gap-10", steps.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
        <span className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-border lg:block" aria-hidden />
        {steps.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 80} className="relative text-center">
            <span className="relative mx-auto grid size-14 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-8 ring-[var(--c-bg)]">{i + 1}</span>
            <h3 className="mt-6 text-xl">{s.title}</h3>
            {s.description && <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">{s.description}</p>}
          </Reveal>
        ))}
      </ol>
      <SectionFooterCta section={section} />
    </Section>
  );
}
