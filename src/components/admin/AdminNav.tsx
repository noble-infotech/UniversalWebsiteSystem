"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { Database, ExternalLink, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu, ShoppingBag, X, Download } from "lucide-react";

export function AdminNav({ brand, siteId, storeKind, storeLocation, modules, showOrders }: { brand: string; siteId: string; storeKind: string; storeLocation?: string; modules: { key: string; label: string; group: string }[]; showOrders: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const groups = Array.from(new Set(modules.map((m) => m.group)));
  const item = (href: string, label: string, icon?: React.ReactNode) => (
    <Link key={href} href={href} onClick={() => setOpen(false)} className={clsx("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm", path === href ? "bg-indigo-50 font-semibold text-indigo-700" : "text-neutral-700 hover:bg-neutral-100")}>
      {icon}
      {label}
    </Link>
  );
  const nav = (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Admin</p>
        <p className="truncate font-bold">{brand}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500" title={storeLocation}><Database className="size-3 shrink-0" /> <span className="truncate">{siteId} · {storeKind === "firestore" ? `Firestore${storeLocation ? ` (${storeLocation})` : ""}` : storeKind === "file" ? "local files" : "no storage connected"}</span></p>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin">
        <div className="space-y-0.5">
          {item("/admin", "Dashboard", <LayoutDashboard className="size-4" />)}
          {item("/admin/enquiries", "Enquiries", <Inbox className="size-4" />)}
          {showOrders && item("/admin/orders", "Orders", <ShoppingBag className="size-4" />)}
          {item("/admin/media", "Media library", <ImageIcon className="size-4" />)}
        </div>
        {groups.map((g) => (
          <div key={g}>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{g}</p>
            <div className="space-y-0.5">{modules.filter((m) => m.group === g).map((m) => item(`/admin/edit/${m.key}`, m.label))}</div>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-neutral-200 p-3">
        <a href="/" target="_blank" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"><ExternalLink className="size-4" /> View website</a>
        <a href="/api/admin/config" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"><Download className="size-4" /> Export config (JSON)</a>
        <button type="button" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); }} className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"><LogOut className="size-4" /> Sign out</button>
      </div>
    </div>
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-neutral-200 bg-white lg:block">{nav}</aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-bold">{brand} · Admin</span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu"><Menu className="size-6" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4" aria-label="Close"><X className="size-5" /></button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
