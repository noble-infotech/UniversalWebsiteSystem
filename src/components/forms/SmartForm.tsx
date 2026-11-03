"use client";
/**
 * Generic, accessible, validated form bound to a FormType (contact, quote,
 * newsletter, careers…). Validation runs client-side with the same Zod schema
 * the API uses, then posts to /api/forms/<type>.
 */
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { FormSchemas, defaultFields, type FieldDef, type FormType } from "@/core/forms/schemas";
import { track } from "@/lib/analytics";

export function SmartForm({ type, fields, submitLabel = "Send message", successTitle = "Thank you!", successText = "We’ve received your message and will get back to you shortly.", initial = {}, className, compact }: { type: FormType; fields?: FieldDef[]; submitLabel?: string; successTitle?: string; successText?: string; initial?: Record<string, string>; className?: string; compact?: boolean }) {
  const defs = fields ?? defaultFields[type];
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...Object.fromEntries(defs.map((f) => [f.name, ""])), ...initial }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [ref, setRef] = useState("");
  const pathname = usePathname();
  const initialKey = JSON.stringify(initial);
  useEffect(() => {
    setValues((v) => ({ ...v, ...JSON.parse(initialKey) }));
  }, [initialKey]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
    const parsed = FormSchemas[type].safeParse(clean);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setState("sending");
    try {
      const res = await fetch(`/api/forms/${type}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...clean, page: pathname }) });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.issues) setErrors(Object.fromEntries(data.issues.map((i: { path: string; message: string }) => [i.path, i.message])));
        throw new Error(data.error ?? "Submission failed");
      }
      setRef(data.id);
      setState("done");
      track(type === "newsletter" ? "sign_up" : "generate_lead", { form: type });
    } catch (err) {
      setServerMsg(err instanceof Error ? err.message : "Submission failed");
      setState("error");
    }
  };

  if (state === "done")
    return (
      <div className={clsx("rounded-brand border border-success/30 bg-success/5 p-8 text-center", className)} role="status">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <p className="mt-4 text-xl font-semibold">{successTitle}</p>
        <p className="mt-2 text-muted-foreground">{successText}</p>
        {ref && <p className="mt-3 text-xs text-muted-foreground">Reference: {ref}</p>}
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className={clsx("grid gap-4", !compact && "sm:grid-cols-2", className)}>
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>Website<input tabIndex={-1} autoComplete="off" value={values.website ?? ""} onChange={(e) => setValues({ ...values, website: e.target.value })} /></label>
      </div>
      {defs.map((f) => {
        const id = `f-${type}-${f.name}`;
        const common = { id, name: f.name, value: values[f.name] ?? "", "aria-invalid": !!errors[f.name], "aria-describedby": errors[f.name] ? `${id}-err` : undefined, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues({ ...values, [f.name]: e.target.value }) };
        return (
          <div key={f.name} className={clsx((f.full || f.type === "textarea") && "sm:col-span-2")}>
            <label htmlFor={id} className="label">{f.label}{f.required && <span className="text-danger"> *</span>}</label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={5} className="input" placeholder={f.placeholder} />
            ) : f.type === "select" ? (
              <select {...common} className="input">
                <option value="">Select…</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input {...common} type={f.type ?? "text"} className="input" placeholder={f.placeholder} autoComplete={f.autoComplete} />
            )}
            {errors[f.name] && <p id={`${id}-err`} className="mt-1 text-xs text-danger">{errors[f.name]}</p>}
          </div>
        );
      })}
      {state === "error" && (
        <p className="flex items-center gap-2 rounded-brand bg-danger/10 p-3 text-sm text-danger sm:col-span-2" role="alert"><AlertTriangle className="size-4" /> {serverMsg}</p>
      )}
      <div className={clsx(!compact && "sm:col-span-2")}>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={state === "sending"}>
          <Send className="size-4" /> {state === "sending" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Single-line newsletter signup. */
export function NewsletterForm({ dark, buttonLabel = "Subscribe" }: { dark?: boolean; buttonLabel?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = FormSchemas.newsletter.safeParse({ email: email.trim() });
    if (!p.success) {
      setState("error");
      setMsg(p.error.issues[0].message);
      return;
    }
    setState("sending");
    const res = await fetch("/api/forms/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email.trim() }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.ok) {
      setState("done");
      track("sign_up", { form: "newsletter" });
    } else {
      setState("error");
      setMsg(data?.error ?? "Could not subscribe. Try again.");
    }
  };
  if (state === "done") return <p className="flex items-center gap-2 font-medium" role="status"><CheckCircle2 className="size-5 text-success" /> You’re subscribed. Welcome aboard!</p>;
  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input id="nl-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={state === "error"} className={clsx("input flex-1", dark && "!border-white/20 !bg-white/10 !text-white placeholder:text-white/50")} />
        <button className={clsx("btn", dark ? "btn-accent" : "btn-primary")} disabled={state === "sending"}>{state === "sending" ? "…" : buttonLabel}</button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-danger" role="alert">{msg}</p>}
    </form>
  );
}
