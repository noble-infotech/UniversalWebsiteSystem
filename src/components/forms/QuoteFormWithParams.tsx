"use client";
import { useSearchParams } from "next/navigation";
import { SmartForm } from "./SmartForm";
import { defaultFields } from "@/core/forms/schemas";

export function QuoteFormWithParams({ products, services }: { products: { slug: string; name: string }[]; services: { slug: string; name: string }[] }) {
  const sp = useSearchParams();
  const slug = sp.get("product") ?? sp.get("service");
  const match = [...products, ...services].find((x) => x.slug === slug);
  const options = [...products.map((p) => p.name), ...services.map((s) => s.name)];
  const fields = defaultFields.quote.map((f) => (f.name === "product" && options.length ? { ...f, type: "select" as const, options: [...options, "Other / multiple"] } : f));
  return (
    <SmartForm type="quote" fields={fields} initial={match ? { product: match.name } : {}} submitLabel="Request quotation" successTitle="Quotation request received" successText="Our team will prepare a tailored proposal and contact you within one business day." />
  );
}
