import Link from "next/link";
import type { ReactNode, ComponentProps } from "react";
import { clsx } from "clsx";
import { Star, ChevronRight } from "lucide-react";

export function Container({ children, className, narrow }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={clsx("container-brand", narrow && "!max-w-3xl", className)}>{children}</div>;
}

type Variant = "primary" | "accent" | "outline" | "ghost" | "light" | "gradient";
export function buttonClass(variant: Variant = "primary", size: "sm" | "md" | "lg" = "md", className?: string) {
  return clsx("btn", `btn-${variant}`, size !== "md" && `btn-${size}`, className);
}

export function ButtonLink({ href, children, variant = "primary", size = "md", className, external, ...rest }: { href: string; children: ReactNode; variant?: Variant; size?: "sm" | "md" | "lg"; className?: string; external?: boolean } & Omit<ComponentProps<"a">, "href">) {
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal)
    return (
      <a href={href} className={buttonClass(variant, size, className)} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} {...rest}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "primary", className }: { children: ReactNode; tone?: "primary" | "accent" | "muted" | "success" | "danger" | "dark"; className?: string }) {
  const tones = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    muted: "bg-muted text-foreground border border-border",
    success: "bg-success text-white",
    danger: "bg-danger text-white",
    dark: "bg-black/80 text-white",
  };
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", tones[tone], className)}>{children}</span>;
}

export function Rating({ value, count, size = "size-4", className }: { value: number; count?: number; size?: string; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1", className)} aria-label={`Rated ${value} out of 5${count != null ? ` from ${count} reviews` : ""}`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={clsx(size, i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-border")} aria-hidden />
        ))}
      </span>
      {count != null && <span className="text-xs text-muted-foreground">({count})</span>}
    </span>
  );
}

export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={clsx("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 opacity-80">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Tiny, safe markdown-lite renderer for config text: paragraphs, ## headings, - lists, **bold**. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
  return (
    <div className={clsx("prose-brand", className)}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (b.startsWith("### ")) return <h3 key={i}>{b.slice(4)}</h3>;
        if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
        if (lines.every((l) => l.trim().startsWith("- ")))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        return <p key={i}>{inline(b)}</p>;
      })}
    </div>
  );
}
