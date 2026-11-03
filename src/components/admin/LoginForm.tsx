"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
        const data = await res.json().catch(() => ({}));
        setBusy(false);
        if (res.ok) router.replace("/admin");
        else setError(data.error ?? "Sign-in failed");
      }}
    >
      <div>
        <label htmlFor="pw" className="mb-1 block text-sm font-medium">Password</label>
        <input id="pw" type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button disabled={busy || !password} className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
        <LogIn className="size-4" /> {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
