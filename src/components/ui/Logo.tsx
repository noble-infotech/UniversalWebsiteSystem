import Link from "next/link";
import type { CompanyProfile } from "@/core/config/schema";
import { clsx } from "clsx";

/** Image logo when configured, otherwise an elegant text wordmark. */
export function Logo({ company, variant = "primary", className }: { company: CompanyProfile; variant?: "primary" | "secondary"; className?: string }) {
  const src = variant === "secondary" ? company.logo.secondary ?? company.logo.primary : company.logo.primary;
  return (
    <Link href="/" className={clsx("inline-flex items-center gap-2 shrink-0", className)} aria-label={`${company.brandName} – home`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG logos, fixed height
        <img src={src} alt={company.brandName} style={{ height: company.logo.height }} className="w-auto" />
      ) : (
        <span className="font-heading text-xl font-bold">{company.logo.text ?? company.brandName}</span>
      )}
    </Link>
  );
}
