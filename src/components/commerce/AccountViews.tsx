"use client";
/**
 * DEMO AUTHENTICATION – accounts live in this browser's localStorage (password
 * stored as a SHA-256 hash). This lets the UI flows be exercised but is NOT
 * secure authentication. Replace with Auth.js / Clerk / your API via the
 * AuthService boundary described in docs/INTEGRATIONS.md.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { LogOut, Package, Heart, User, AlertTriangle } from "lucide-react";
import { useAccount, useMoney, useSiteConfig, useWishlist } from "@/components/SiteProvider";
import { useShop, hashPassword } from "@/store/shop";
import { formatDate } from "@/core/commerce/format";
import { track } from "@/lib/analytics";

const LoginSchema = z.object({ email: z.email("Enter a valid email"), password: z.string().min(8, "Password must be at least 8 characters") });
const RegisterSchema = LoginSchema.extend({ name: z.string().trim().min(2, "Enter your name") });

function DemoAuthNotice() {
  return (
    <p className="mt-6 flex gap-2 rounded-brand bg-muted p-3 text-xs text-muted-foreground">
      <AlertTriangle className="size-4 shrink-0" /> Demo accounts are stored only in this browser. Connect a real authentication provider before going live.
    </p>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const cfg = useSiteConfig();
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/account";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = (mode === "register" ? RegisterSchema : LoginSchema).safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    const s = useShop.getState();
    const email = form.email.trim().toLowerCase();
    const hash = await hashPassword(form.password);
    const existing = (s.accounts[cfg.id] ?? []).find((a) => a.email === email);
    if (mode === "register") {
      if (existing) return setError("An account with this email already exists. Please sign in.");
      s.register(cfg.id, { email, name: form.name.trim(), passwordHash: hash, createdAt: new Date().toISOString() });
      track("sign_up", { method: "email" });
    } else if (!existing || existing.passwordHash !== hash) {
      return setError("Incorrect email or password.");
    }
    s.setSession(cfg.id, email);
    router.push(next);
  };
  const f = (k: keyof typeof form, label: string, type = "text", auto?: string) => (
    <div>
      <label htmlFor={`a-${k}`} className="label">{label}</label>
      <input id={`a-${k}`} type={type} autoComplete={auto} className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]} />
      {errors[k] && <p className="mt-1 text-xs text-danger">{errors[k]}</p>}
    </div>
  );
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-center text-3xl md:text-4xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-3 text-center text-muted-foreground">{mode === "login" ? `Sign in to your ${cfg.brandName} account` : "Track orders, save favourites and check out faster."}</p>
      <form onSubmit={submit} noValidate className="mt-10 space-y-4">
        {mode === "register" && f("name", "Full name", "text", "name")}
        {f("email", "Email", "email", "email")}
        {f("password", "Password", "password", mode === "login" ? "current-password" : "new-password")}
        {error && <p className="rounded-brand bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>}
        <button className="btn btn-primary w-full">{mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? <>New here? <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="font-semibold text-primary">Create an account</Link></> : <>Already have an account? <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="font-semibold text-primary">Sign in</Link></>}
      </p>
      <DemoAuthNotice />
    </div>
  );
}

export function AccountDashboard() {
  const cfg = useSiteConfig();
  const { user, orders, hydrated } = useAccount();
  const wishlist = useWishlist();
  const money = useMoney();
  const router = useRouter();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-brand bg-muted" />;
  if (!user)
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <User className="mx-auto size-12 text-muted-foreground" strokeWidth={1.25} />
        <h1 className="mt-4 text-3xl">My account</h1>
        <p className="mt-2 text-muted-foreground">Sign in to view your orders and saved items.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/account/login" className="btn btn-primary">Sign in</Link>
          <Link href="/account/register" className="btn btn-outline">Create account</Link>
        </div>
      </div>
    );
  const mine = orders.filter((o) => o.email.toLowerCase() === user.email);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-3xl md:text-5xl">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => { useShop.getState().setSession(cfg.id, null); router.push("/"); }}><LogOut className="size-4" />Sign out</button>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-brand border border-border p-6"><Package className="size-6 text-primary" /><p className="mt-3 font-heading text-3xl">{mine.length}</p><p className="text-sm text-muted-foreground">Orders</p></div>
        <Link href="/wishlist" className="rounded-brand border border-border p-6 hover:border-primary"><Heart className="size-6 text-primary" /><p className="mt-3 font-heading text-3xl">{wishlist.items.length}</p><p className="text-sm text-muted-foreground">Wishlist items</p></Link>
        <Link href="/track-order" className="rounded-brand border border-border p-6 hover:border-primary"><Package className="size-6 text-primary" /><p className="mt-3 font-semibold">Track an order</p><p className="text-sm text-muted-foreground">Check delivery status</p></Link>
      </div>
      <h2 className="mt-14 mb-6 text-2xl">Order history</h2>
      {mine.length === 0 ? (
        <p className="text-muted-foreground">No orders yet. <Link href="/shop" className="text-primary underline">Start shopping</Link></p>
      ) : (
        <div className="overflow-x-auto rounded-brand border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Order</th><th className="p-4">Date</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4" /></tr></thead>
            <tbody className="divide-y divide-border">
              {mine.map((o) => (
                <tr key={o.number}>
                  <td className="p-4 font-semibold">{o.number}</td>
                  <td className="p-4">{formatDate(o.createdAt, cfg.commerce.locale)}</td>
                  <td className="p-4">{o.totals.itemCount}</td>
                  <td className="p-4">{money(o.totals.total)}</td>
                  <td className="p-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{o.status.replace("_", " ")}</span></td>
                  <td className="p-4"><Link href={`/track-order?order=${o.number}`} className="text-primary underline">Track</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DemoAuthNotice />
    </div>
  );
}
