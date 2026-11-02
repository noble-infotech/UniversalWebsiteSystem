"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Lock, AlertTriangle } from "lucide-react";
import { useAccount, useCart, useMoney, useSiteConfig } from "@/components/SiteProvider";
import { useShop } from "@/store/shop";
import { availableShippingMethods, computeTotals, needsShipping } from "@/core/commerce/pricing";
import { CheckoutSchema, type Order } from "@/core/commerce/orders";
import { LineItem, CouponForm, TotalsTable, EmptyCart } from "./CartContents";
import { track } from "@/lib/analytics";

const paymentLabels: Record<string, string> = {
  card: "Credit / debit card",
  upi: "UPI",
  netbanking: "Net banking",
  wallet: "Wallet",
  cod: "Cash on delivery",
  bank_transfer: "Bank transfer",
  paypal: "PayPal",
};

type Errors = Record<string, string>;

export function CheckoutForm() {
  const cfg = useSiteConfig();
  const cart = useCart();
  const money = useMoney();
  const router = useRouter();
  const { user, hydrated } = useAccount();
  const physical = needsShipping(cart.lines);
  const countries = cfg.commerce.shipping.countries;
  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: countries[0]?.code ?? "",
    notes: "",
  });
  const [prefilled, setPrefilled] = useState(false);
  if (hydrated && user && !prefilled) {
    setPrefilled(true);
    setForm((f) => ({ ...f, email: user.email, phone: user.phone ?? f.phone, firstName: user.name.split(" ")[0] ?? "", lastName: user.name.split(" ").slice(1).join(" ") }));
  }
  const methods = useMemo(() => availableShippingMethods(cfg.commerce.shipping.methods, cart.lines, form.country), [cfg.commerce.shipping.methods, cart.lines, form.country]);
  const [methodId, setMethodId] = useState<string>("");
  const method = methods.find((m) => m.id === methodId) ?? methods[0];
  const [payment, setPayment] = useState(cfg.commerce.payment.methods[0] ?? "card");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const totals = computeTotals({ lines: cart.lines, commerce: cfg.commerce, shippingMethod: method, coupon: cart.couponResult?.ok ? cart.couponResult : undefined });

  if (!hydrated) return <div className="h-96 animate-pulse rounded-brand bg-muted" />;
  if (cart.lines.length === 0) return <EmptyCart />;
  if (!cfg.commerce.guestCheckout && !user)
    return (
      <div className="mx-auto max-w-md rounded-brand border border-border p-8 text-center">
        <Lock className="mx-auto size-8 text-primary" />
        <h2 className="mt-4 text-2xl">Sign in to check out</h2>
        <p className="mt-2 text-muted-foreground">An account is required to place orders.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/account/login?next=/checkout" className="btn btn-primary">Sign in</Link>
          <Link href="/account/register?next=/checkout" className="btn btn-outline">Create account</Link>
        </div>
      </div>
    );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const payload = {
      email: form.email,
      phone: form.phone,
      shipping: physical ? { firstName: form.firstName, lastName: form.lastName, line1: form.line1, line2: form.line2 || undefined, city: form.city, region: form.region || undefined, postalCode: form.postalCode, country: form.country } : undefined,
      shippingMethodId: method?.id,
      paymentMethod: payment,
      couponCode: cart.coupon?.code,
      notes: form.notes || undefined,
      lines: cart.lines.map((l) => ({ slug: l.slug, quantity: l.quantity, options: l.options, customization: l.customization })),
    };
    const parsed = CheckoutSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const i of parsed.error.issues) errs[i.path[i.path.length - 1] as string] ??= i.message;
      setErrors(errs);
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    if (physical && !method) return setServerError("No shipping method is available for the selected country.");
    setErrors({});
    setSubmitting(true);
    track("begin_checkout", { value: totals.total, currency: cfg.commerce.currency });
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ site: cfg.id, ...parsed.data }) });
      const data = (await res.json()) as { ok: boolean; order?: Order; error?: string; issues?: { path: string; message: string }[] };
      if (!res.ok || !data.ok || !data.order) throw new Error(data.error ?? "Order could not be placed");
      useShop.getState().addOrder(cfg.id, { ...data.order });
      track("purchase", { transaction_id: data.order.number, value: data.order.totals.total, currency: data.order.currency, tax: data.order.totals.tax, shipping: data.order.totals.shipping });
      if (data.order.payment?.status === "redirect" && data.order.payment.redirectUrl) {
        window.location.href = data.order.payment.redirectUrl;
        return;
      }
      cart.clear();
      router.push(`/checkout/success?order=${encodeURIComponent(data.order.number)}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const field = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label htmlFor={`co-${k}`} className="label">{label}</label>
      <input id={`co-${k}`} className="input" value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `co-${k}-err` : undefined} {...props} />
      {errors[k] && <p id={`co-${k}-err`} className="mt-1 text-xs text-danger">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-10">
        <fieldset className="space-y-4">
          <legend className="mb-4 flex w-full items-center justify-between text-xl font-heading">
            <span>1. Contact</span>
            {!user && cfg.features.accounts && <Link href="/account/login?next=/checkout" className="text-sm font-normal text-primary" style={{ fontFamily: "var(--font-body-family)" }}>Have an account? Sign in</Link>}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("email", "Email", { type: "email", autoComplete: "email" })}
            {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
          </div>
        </fieldset>

        {physical && (
          <fieldset className="space-y-4">
            <legend className="mb-4 text-xl font-heading">2. Shipping address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("firstName", "First name", { autoComplete: "given-name" })}
              {field("lastName", "Last name", { autoComplete: "family-name" })}
              {field("line1", "Street address", { autoComplete: "address-line1", className: "sm:col-span-2" })}
              {field("line2", "Apartment, suite (optional)", { autoComplete: "address-line2", className: "sm:col-span-2" })}
              {field("city", "City", { autoComplete: "address-level2" })}
              {field("region", "State / region", { autoComplete: "address-level1" })}
              {field("postalCode", "Postal code", { autoComplete: "postal-code" })}
              <div>
                <label htmlFor="co-country" className="label">Country</label>
                {countries.length ? (
                  <select id="co-country" className="input" value={form.country} onChange={set("country")} autoComplete="country">
                    {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                ) : (
                  <input id="co-country" className="input" value={form.country} onChange={set("country")} aria-invalid={!!errors.country} />
                )}
              </div>
            </div>
          </fieldset>
        )}

        {physical && (
          <fieldset>
            <legend className="mb-4 text-xl font-heading">3. Delivery method</legend>
            {methods.length === 0 && <p className="text-sm text-danger">We don’t ship to this country yet.</p>}
            <div className="space-y-3">
              {methods.map((m) => {
                const cost = computeTotals({ lines: cart.lines, commerce: cfg.commerce, shippingMethod: m, coupon: cart.couponResult?.ok ? cart.couponResult : undefined }).shipping;
                return (
                  <label key={m.id} className={clsx("flex cursor-pointer items-center gap-4 rounded-brand border p-4 transition", method?.id === m.id ? "border-primary bg-primary/5" : "border-border")}>
                    <input type="radio" name="shipping" value={m.id} checked={method?.id === m.id} onChange={() => setMethodId(m.id)} className="accent-[var(--c-primary)]" />
                    <span className="flex-1">
                      <span className="block font-semibold">{m.label}</span>
                      <span className="text-sm text-muted-foreground">{[m.estimate, m.description].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="font-semibold">{cost === 0 ? "Free" : money(cost)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-4 text-xl font-heading">{physical ? "4" : "2"}. Payment</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {cfg.commerce.payment.methods.map((m) => (
              <label key={m} className={clsx("flex cursor-pointer items-center gap-3 rounded-brand border p-4", payment === m ? "border-primary bg-primary/5" : "border-border")}>
                <input type="radio" name="payment" value={m} checked={payment === m} onChange={() => setPayment(m)} className="accent-[var(--c-primary)]" />
                <span className="font-medium">{paymentLabels[m] ?? m}</span>
              </label>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-brand bg-muted p-4 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            {cfg.commerce.payment.provider === "manual"
              ? "No card details are collected on this site. You will receive payment instructions after placing the order."
              : `Payments are processed securely by ${cfg.commerce.payment.provider}. Card details never touch this server.`}
          </p>
          <div className="mt-4">
            <label htmlFor="co-notes" className="label">Order notes (optional)</label>
            <textarea id="co-notes" className="input" rows={3} value={form.notes} onChange={set("notes")} />
          </div>
        </fieldset>
      </div>

      <aside className="h-fit space-y-5 rounded-brand border border-border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="text-xl">Order summary</h2>
        <ul className="max-h-80 divide-y divide-border overflow-y-auto">{cart.lines.map((l) => <LineItem key={l.key} line={l} compact />)}</ul>
        <CouponForm />
        <TotalsTable totals={totals} shippingLabel={physical ? method?.label : undefined} />
        {serverError && (
          <p className="flex gap-2 rounded-brand bg-danger/10 p-3 text-sm text-danger" role="alert"><AlertTriangle className="size-4 shrink-0" /> {serverError}</p>
        )}
        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={submitting}>
          <Lock className="size-4" /> {submitting ? "Placing order…" : `Place order · ${money(totals.total)}`}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By placing your order you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy-policy" className="underline">privacy policy</Link>.
        </p>
      </aside>
    </form>
  );
}
