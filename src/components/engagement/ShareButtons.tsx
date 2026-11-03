"use client";
import { useState } from "react";
import { Link2, Mail, Check } from "lucide-react";
import { SocialGlyph } from "@/components/ui/SocialIcons";
import type { IntegrationsConfig } from "@/core/config/schema";

export function ShareButtons({ url, title, networks }: { url: string; title: string; networks: IntegrationsConfig["socialShare"]["networks"] }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links: Record<string, string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    email: `mailto:?subject=${t}&body=${u}`,
  };
  const cls = "grid size-10 place-items-center rounded-full border border-border transition hover:bg-muted";
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted-foreground">Share</span>
      {networks.map((n) =>
        n === "copy" ? (
          <button key={n} type="button" className={cls} aria-label="Copy link" onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}>
            {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}
          </button>
        ) : (
          <a key={n} href={links[n]} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`Share on ${n}`}>
            {n === "email" ? <Mail className="size-4" /> : <SocialGlyph platform={n} className="size-4" />}
          </a>
        ),
      )}
    </div>
  );
}
