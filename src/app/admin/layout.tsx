import type { Metadata } from "next";
import { getSite } from "@/core/config/loader";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: { absolute: `Admin · ${site.company.brandName}` }, robots: { index: false, follow: false } };
}

/** Neutral admin look, independent of the company's brand theme. */
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-ui min-h-screen bg-neutral-100 text-neutral-900 antialiased" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', colorScheme: "light" }}>
      {children}
    </div>
  );
}
