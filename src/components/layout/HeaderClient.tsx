"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { clsx } from "clsx";
import { ChevronDown, Heart, Menu, Search, User, X, Phone, Mail, Clock } from "lucide-react";
import type { NavItem, ThemeConfig, NavigationConfig, SocialPlatform } from "@/core/config/schema";
import { CartIconButton, WishlistCountBadge } from "@/components/commerce/CartButtons";
import { SocialGlyph } from "@/components/ui/SocialIcons";
import { SearchDialog } from "./SearchDialog";

type Props = {
  brand: { name: string; logo?: string; logoLight?: string; text?: string; height: number };
  menu: NavItem[];
  header: ThemeConfig["header"];
  announcement?: NonNullable<NavigationConfig["announcement"]>;
  topBar?: { phone?: string; email?: string; social: Partial<Record<SocialPlatform, string>>; hours?: string; showContact: boolean };
  icons: { search: boolean; account: boolean; wishlist: boolean; cart: boolean };
  cta?: { label: string; href: string };
};

function BrandMark({ brand, light }: { brand: Props["brand"]; light: boolean }) {
  const src = light ? brand.logoLight ?? brand.logo : brand.logo;
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${brand.name} – home`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={brand.name} style={{ "--logo-h": `${brand.height}px` } as React.CSSProperties} className="h-[calc(var(--logo-h)*0.8)] w-auto max-w-[52vw] sm:h-[var(--logo-h)] sm:max-w-none" />
      ) : (
        <span className="font-heading text-xl font-bold md:text-2xl">{brand.text ?? brand.name}</span>
      )}
    </Link>
  );
}

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function DesktopItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const active = isActive(pathname, item.href) || item.children?.some((c) => isActive(pathname, c.href));
  if (!item.children?.length)
    return (
      <Link href={item.href ?? "#"} className={clsx("relative px-3 py-2 text-[15px] font-medium transition hover:opacity-100", active ? "opacity-100" : "opacity-80")} aria-current={active ? "page" : undefined}>
        {item.label}
        {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-primary" />}
      </Link>
    );
  return (
    <div
      className="relative"
      onMouseEnter={() => { clearTimeout(timer.current); setOpen(true); }}
      onMouseLeave={() => { timer.current = setTimeout(() => setOpen(false), 120); }}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} className={clsx("flex items-center gap-1 px-3 py-2 text-[15px] font-medium transition hover:opacity-100", active ? "opacity-100" : "opacity-80")}>
        {item.label}
        <ChevronDown className={clsx("size-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className={clsx("absolute top-full pt-3 text-foreground", item.mega ? "left-1/2 -translate-x-1/2" : "left-0")}>
          <div className={clsx("rounded-brand border border-border bg-background p-3 shadow-2xl", item.mega ? "grid w-[min(56rem,90vw)] grid-cols-3 gap-2 p-5" : "w-72")}>
            {item.href && !item.mega && (
              <Link href={item.href} className="mb-1 block rounded-brand px-3 py-2 text-sm font-semibold text-primary hover:bg-muted" onClick={() => setOpen(false)}>View all {item.label.toLowerCase()}</Link>
            )}
            {item.children.map((c) => (
              <div key={c.label} className={clsx(item.mega && "p-1")}>
                <Link href={c.href ?? "#"} onClick={() => setOpen(false)} className="block rounded-brand px-3 py-2.5 hover:bg-muted">
                  <span className="block text-sm font-semibold">{c.label}</span>
                  {c.description && <span className="mt-0.5 block text-xs text-muted-foreground">{c.description}</span>}
                </Link>
                {c.children?.length ? (
                  <ul className="mb-2 ml-3 border-l border-border pl-3">
                    {c.children.map((g) => (
                      <li key={g.label}><Link href={g.href ?? "#"} onClick={() => setOpen(false)} className="block rounded px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground">{g.label}</Link></li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileItem({ item, depth = 0, onNavigate }: { item: NavItem; depth?: number; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  if (!item.children?.length)
    return (
      <Link href={item.href ?? "#"} onClick={onNavigate} className={clsx("block py-3", depth === 0 ? "text-lg font-semibold" : "text-base text-muted-foreground")} style={{ paddingLeft: depth * 16 }}>
        {item.label}
      </Link>
    );
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={clsx("flex w-full items-center justify-between py-3", depth === 0 ? "text-lg font-semibold" : "text-base")}>
        {item.label}
        <ChevronDown className={clsx("size-5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mb-2 border-l border-border pl-2">
          {item.href && <Link href={item.href} onClick={onNavigate} className="block py-2.5 pl-4 text-sm font-semibold text-primary">View all</Link>}
          {item.children.map((c) => <MobileItem key={c.label} item={c} depth={1} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  );
}

export function HeaderClient({ brand, menu, header, announcement, topBar, icons, cta }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    try { if (announcement && sessionStorage.getItem("uws-ann-hidden") === announcement.text) setHideAnnouncement(true); } catch {}
  }, [announcement]);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const overlay = header.transparentOnHero && pathname === "/";
  const transparent = overlay && !scrolled && !mobile;
  const centered = header.style === "centered" || header.logoPosition === "center";
  const iconBtn = "relative grid size-10 place-items-center rounded-full transition hover:bg-current/10";

  const actions = (
    <div className="flex items-center gap-0.5">
      {icons.search && <button type="button" className={iconBtn} onClick={() => setSearch(true)} aria-label="Search"><Search className="size-5" /></button>}
      {icons.account && <Link href="/account" className={clsx(iconBtn, "max-sm:hidden")} aria-label="Account"><User className="size-5" /></Link>}
      {icons.wishlist && <Link href="/wishlist" className={clsx(iconBtn, "max-sm:hidden")} aria-label="Wishlist"><Heart className="size-5" /><WishlistCountBadge /></Link>}
      {icons.cart && <CartIconButton />}
      {cta && <Link href={cta.href} className={clsx("btn btn-sm ml-2 max-lg:hidden", transparent ? "btn-light" : "btn-primary")}>{cta.label}</Link>}
      <button type="button" className={clsx(iconBtn, "lg:hidden")} onClick={() => setMobile(true)} aria-label="Open menu" aria-expanded={mobile}><Menu className="size-6" /></button>
    </div>
  );

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <div className={clsx(overlay ? "fixed inset-x-0 top-0 z-50" : "contents")}>
      {announcement && !hideAnnouncement && (
        <div className="relative bg-secondary px-10 py-2.5 text-center text-sm text-secondary-foreground">
          {announcement.text}
          {announcement.link && <Link href={announcement.link.href} className="ml-2 font-semibold underline underline-offset-2">{announcement.link.label}</Link>}
          {announcement.dismissible && (
            <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 opacity-70 hover:opacity-100" aria-label="Dismiss announcement" onClick={() => { setHideAnnouncement(true); try { sessionStorage.setItem("uws-ann-hidden", announcement.text); } catch {} }}><X className="size-4" /></button>
          )}
        </div>
      )}
      {topBar && (
        <div className="hidden border-b border-border bg-surface text-xs text-muted-foreground md:block">
          <div className="container-brand flex h-10 items-center justify-between">
            <div className="flex items-center gap-6">
              {topBar.showContact && topBar.phone && <a href={`tel:${topBar.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-foreground"><Phone className="size-3.5" />{topBar.phone}</a>}
              {topBar.showContact && topBar.email && <a href={`mailto:${topBar.email}`} className="flex items-center gap-1.5 hover:text-foreground"><Mail className="size-3.5" />{topBar.email}</a>}
              {topBar.hours && <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{topBar.hours}</span>}
            </div>
            <div className="flex items-center gap-3">
              {(Object.entries(topBar.social) as [SocialPlatform, string][]).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer" aria-label={k} className="hover:text-foreground"><SocialGlyph platform={k} className="size-3.5" /></a>
              ))}
            </div>
          </div>
        </div>
      )}
      <header
        className={clsx(
          "z-50 w-full transition-all duration-300",
          !overlay && (header.sticky ? "sticky top-0" : "relative"),
          transparent ? "border-b border-white/15 bg-transparent text-white" : "border-b border-border bg-background/90 text-foreground backdrop-blur-xl",
          scrolled && !transparent && "shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]",
        )}
      >
        <div className={clsx("container-brand flex items-center gap-6 transition-all", scrolled ? "h-16" : "h-20")}>
          {centered ? (
            <>
              <nav aria-label="Main" className="hidden flex-1 items-center lg:flex">{menu.slice(0, Math.ceil(menu.length / 2)).map((i) => <DesktopItem key={i.label} item={i} pathname={pathname} />)}</nav>
              <div className="flex flex-1 lg:flex-none lg:justify-center"><BrandMark brand={brand} light={transparent} /></div>
              <div className="flex flex-1 items-center justify-end">
                <nav aria-label="Main (continued)" className="mr-2 hidden items-center lg:flex">{menu.slice(Math.ceil(menu.length / 2)).map((i) => <DesktopItem key={i.label} item={i} pathname={pathname} />)}</nav>
                {actions}
              </div>
            </>
          ) : (
            <>
              <BrandMark brand={brand} light={transparent} />
              <nav aria-label="Main" className={clsx("hidden flex-1 items-center lg:flex", header.style === "split" ? "justify-end" : header.style === "minimal" ? "justify-center" : "justify-center")}>
                {menu.map((i) => <DesktopItem key={i.label} item={i} pathname={pathname} />)}
              </nav>
              <div className="ml-auto lg:ml-0">{actions}</div>
            </>
          )}
        </div>
      </header>
      </div>

      {/* Mobile navigation */}
      <div className={clsx("fixed inset-0 z-[80] lg:hidden", mobile ? "visible" : "invisible")} aria-hidden={!mobile}>
        <div className={clsx("absolute inset-0 bg-black/50 transition-opacity", mobile ? "opacity-100" : "opacity-0")} onClick={() => setMobile(false)} />
        <aside role="dialog" aria-modal="true" aria-label="Menu" className={clsx("absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-background text-foreground shadow-2xl transition-transform duration-300", mobile ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex h-20 items-center justify-between border-b border-border px-6">
            <BrandMark brand={brand} light={false} />
            <button type="button" onClick={() => setMobile(false)} className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label="Close menu"><X className="size-6" /></button>
          </div>
          <nav aria-label="Mobile" className="flex-1 divide-y divide-border overflow-y-auto px-6">
            {menu.map((i) => <MobileItem key={i.label} item={i} onNavigate={() => setMobile(false)} />)}
          </nav>
          <div className="space-y-3 border-t border-border p-6">
            {cta && <Link href={cta.href} className="btn btn-primary w-full">{cta.label}</Link>}
            <div className="flex gap-3 text-sm">
              {icons.account && <Link href="/account" className="btn btn-outline btn-sm flex-1"><User className="size-4" />Account</Link>}
              {icons.wishlist && <Link href="/wishlist" className="btn btn-outline btn-sm flex-1"><Heart className="size-4" />Wishlist</Link>}
            </div>
            {topBar?.phone && <a href={`tel:${topBar.phone.replace(/\s/g, "")}`} className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Phone className="size-4" />{topBar.phone}</a>}
          </div>
        </aside>
      </div>
      {search && <SearchDialog onClose={() => setSearch(false)} />}
    </>
  );
}
