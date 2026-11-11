"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AlertTriangle, CheckCircle2, Code2, ExternalLink, RotateCcw, Save, Undo2 } from "lucide-react";
import { SchemaForm, type JSONSchema } from "./SchemaForm";
import { TOKEN_HELP, fieldHelp } from "./field-help";

type Issue = { path: string; message: string; level?: string };

export function ModuleEditor({ module, label, help, schema, initial, overridden, writable, storeKind }: { module: string; label: string; help: string; schema: JSONSchema; initial: unknown; overridden: boolean; writable: boolean; storeKind: string }) {
  const router = useRouter();
  const [value, setValue] = useState<unknown>(initial);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(initial));
  const [raw, setRaw] = useState(false);
  const [rawText, setRawText] = useState("");
  const [rawErr, setRawErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const dirty = useMemo(() => JSON.stringify(value) !== saved, [value, saved]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    setIssues([]);
    try {
      const res = await fetch("/api/admin/config", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ module, value }) });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setIssues(data.issues ?? []);
        setMsg({ ok: false, text: data.error ?? "Could not save" });
        if (res.status === 401) router.push("/admin/login");
      } else {
        setSaved(JSON.stringify(value));
        setIssues(data.warnings ?? []);
        setMsg({ ok: true, text: "Saved. The live website is updated." });
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: "Network error – changes not saved." });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!confirm(`Reset “${label}” to the original configuration file? Your admin edits for this section will be removed.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/config?module=${module}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Reset to file defaults." });
      router.refresh();
      setTimeout(() => location.reload(), 300);
    } else setMsg({ ok: false, text: "Reset failed." });
  };

  return (
    <div className="pb-28">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{label}</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600">{help}</p>
          {fieldHelp(module) && <p className="mt-1 max-w-2xl text-sm text-neutral-600">{fieldHelp(module)}</p>}
          {["company", "pages", "story", "content", "seo", "footer", "navigation", "services", "catalog"].includes(module) && <p className="mt-2 max-w-2xl rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-900">{TOKEN_HELP}</p>}
          <p className="mt-2 text-xs text-neutral-500">{overridden ? "Edited in admin (saved in Firestore)." : "Showing values from the configuration files – saving stores your edited copy."}</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50"><ExternalLink className="size-4" /> View site</a>
          <button type="button" onClick={() => { if (!raw) { setRawText(JSON.stringify(value, null, 2)); setRawErr(""); } setRaw(!raw); }} className={clsx("inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium", raw ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-neutral-300 bg-white hover:bg-neutral-50")}>
            <Code2 className="size-4" /> {raw ? "Back to form" : "Edit as JSON"}
          </button>
        </div>
      </div>

      {!writable && (
        <div className="mb-6 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="size-5 shrink-0" />
          <div><strong>Read-only:</strong> no storage is connected ({storeKind}), so changes can’t be saved. Connect Firebase: add the <code>FIREBASE_SERVICE_ACCOUNT</code> environment variable in Vercel (see docs/ADMIN.md), then redeploy.</div>
        </div>
      )}

      {issues.length > 0 && (
        <div className={clsx("mb-6 rounded-lg border p-4 text-sm", msg?.ok ? "border-amber-300 bg-amber-50" : "border-red-300 bg-red-50")} role="alert">
          <p className="mb-2 font-semibold">{msg?.ok ? "Saved with warnings:" : "Please fix:"}</p>
          <ul className="list-disc space-y-1 pl-5">
            {issues.slice(0, 30).map((i, k) => <li key={k}><code className="text-xs">{i.path}</code> – {i.message}</li>)}
          </ul>
        </div>
      )}

      {raw ? (
        <div>
          <textarea
            aria-label="JSON editor"
            className={clsx("h-[65vh] w-full rounded-lg border bg-neutral-950 p-4 font-mono text-xs text-neutral-100", rawErr ? "border-red-500" : "border-neutral-300")}
            value={rawText}
            spellCheck={false}
            onChange={(e) => {
              setRawText(e.target.value);
              try {
                setValue(JSON.parse(e.target.value));
                setRawErr("");
                setFormKey((k) => k + 1);
              } catch (err) {
                setRawErr(err instanceof Error ? err.message : "Invalid JSON");
              }
            }}
          />
          {rawErr && <p className="mt-2 text-sm text-red-600">{rawErr}</p>}
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <SchemaForm key={formKey} path={module} schema={schema} value={value} onChange={setValue} />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3">
          {msg && (
            <span className={clsx("flex items-center gap-1.5 text-sm", msg.ok ? "text-emerald-700" : "text-red-600")} role="status">
              {msg.ok ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />} {msg.text}
            </span>
          )}
          {!msg && dirty && <span className="text-sm text-neutral-500">Unsaved changes</span>}
          <span className="flex-1" />
          {overridden && writable && (
            <button type="button" onClick={reset} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"><RotateCcw className="size-4" /> Reset to file defaults</button>
          )}
          <button type="button" disabled={!dirty || busy} onClick={() => { setValue(JSON.parse(saved)); setFormKey((k) => k + 1); setIssues([]); setMsg(null); }} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-40"><Undo2 className="size-4" /> Discard</button>
          <button type="button" disabled={!dirty || busy || !writable || !!rawErr} onClick={save} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"><Save className="size-4" /> {busy ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}
