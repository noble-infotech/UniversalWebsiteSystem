import type { FooterConfig } from "@/core/config/schema";
const labels: Record<FooterConfig["paymentIcons"][number], string> = {
  visa: "VISA", mastercard: "Mastercard", amex: "AMEX", paypal: "PayPal", upi: "UPI", applepay: "Apple Pay", gpay: "G Pay", cod: "Cash on Delivery", bank: "Bank Transfer",
};
export function PaymentIcons({ icons }: { icons: FooterConfig["paymentIcons"] }) {
  if (!icons.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
      {icons.map((i) => (
        <li key={i} className="rounded-md border border-current/20 bg-white/5 px-2.5 py-1 text-[11px] font-bold tracking-wide">
          {labels[i]}
        </li>
      ))}
    </ul>
  );
}
