"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Phone } from "lucide-react";
import { clsx } from "clsx";
import type { IntegrationsConfig } from "@/core/config/schema";
import { SocialGlyph } from "@/components/ui/SocialIcons";
import { SmartImage } from "@/components/ui/SmartImage";
import { NewsletterForm } from "@/components/forms/SmartForm";
import { track } from "@/lib/analytics";

/** Floating WhatsApp + click-to-call buttons. */
export function FloatingContact({ whatsapp, call }: { whatsapp?: IntegrationsConfig["whatsapp"]; call?: { number: string } }) {
  const right = (whatsapp?.position ?? "right") === "right";
  if (!whatsapp?.enabled && !call) return null;
  return (
    <div className={clsx("fixed bottom-5 z-[70] flex flex-col gap-3", right ? "right-5" : "left-5")}>
      {call && (
        <a href={`tel:${call.number.replace(/\s/g, "")}`} onClick={() => track("generate_lead", { method: "call" })} className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-110 md:hidden" aria-label={`Call ${call.number}`}>
          <Phone className="size-6" />
        </a>
      )}
      {whatsapp?.enabled && (
        <a
          href={`https://wa.me/${whatsapp.number.replace(/\D/g, "")}${whatsapp.message ? `?text=${encodeURIComponent(whatsapp.message)}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("generate_lead", { method: "whatsapp" })}
          className="grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <SocialGlyph platform="whatsapp" className="size-7" />
        </a>
      )}
    </div>
  );
}

/** Configurable popup announcement (delay + frequency capping). */
export function PopupAnnouncement({ popup }: { popup: NonNullable<IntegrationsConfig["popup"]> }) {
  const [open, setOpen] = useState(false);
  const key = `uws-popup-${popup.id}`;
  useEffect(() => {
    if (!popup.enabled) return;
    try {
      if (popup.frequency === "once" && localStorage.getItem(key)) return;
      if (popup.frequency === "session" && sessionStorage.getItem(key)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), popup.delaySeconds * 1000);
    return () => clearTimeout(t);
  }, [popup, key]);
  const close = () => {
    setOpen(false);
    try {
      if (popup.frequency === "once") localStorage.setItem(key, "1");
      if (popup.frequency === "session") sessionStorage.setItem(key, "1");
    } catch {}
  };
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={close}>
      <div role="dialog" aria-modal="true" aria-labelledby="popup-title" className="relative grid w-full max-w-3xl overflow-hidden rounded-[calc(var(--radius)*1.5)] bg-background text-foreground shadow-2xl md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-background/80 hover:bg-muted" aria-label="Close" autoFocus><X className="size-5" /></button>
        {popup.image && <div className="relative hidden min-h-80 md:block"><SmartImage src={popup.image} alt="" fill brand={false} className="object-cover" /></div>}
        <div className={clsx("p-8 md:p-10", !popup.image && "md:col-span-2 text-center")}>
          <h2 id="popup-title" className="text-3xl">{popup.title}</h2>
          {popup.body && <p className="mt-4 text-muted-foreground">{popup.body}</p>}
          {popup.showNewsletter && <div className="mt-6"><NewsletterForm /></div>}
          {popup.cta && <Link href={popup.cta.href} onClick={close} className="btn btn-primary mt-6">{popup.cta.label}</Link>}
          <button onClick={close} className="mt-4 block text-xs text-muted-foreground underline max-md:mx-auto">No thanks</button>
        </div>
      </div>
    </div>
  );
}
