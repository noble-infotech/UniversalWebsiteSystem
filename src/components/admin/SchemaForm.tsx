"use client";
/**
 * Schema-driven form editor.
 * Renders an editing UI for any value from its JSON Schema (generated from the
 * Zod config schema), so every config module is editable without bespoke forms.
 *  - objects → fieldsets (optional fields can be added/removed)
 *  - enum-keyed records (features, social links) → fixed key lists
 *  - arrays → reorderable, collapsible item lists (add / duplicate / delete)
 *  - strings → text / textarea / colour picker / image URL with preview
 *  - anything the schema can't describe → validated JSON textarea
 */
import { useId, useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2, X } from "lucide-react";
import { fieldHelp } from "./field-help";
import { ImageField } from "./ImageField";
import { ImageListField } from "./ImageListField";

export type JSONSchema = {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: (string | number)[];
  propertyNames?: JSONSchema;
  additionalProperties?: JSONSchema | boolean;
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  description?: string;
  format?: string;
  const?: unknown;
};

type Ctx = { defs: Record<string, JSONSchema> };
type Json = unknown;

/* ------------------------------ helpers ------------------------------ */
function resolve(s: JSONSchema | undefined, ctx: Ctx): JSONSchema {
  if (!s) return {};
  if (s.$ref) {
    const name = s.$ref.split("/").pop()!;
    return resolve(ctx.defs[name], ctx);
  }
  // Optional/nullable unions: use the first non-null branch.
  const alts = s.anyOf ?? s.oneOf;
  if (alts) {
    const nonNull = alts.filter((a) => a.type !== "null");
    if (nonNull.length === 1) return resolve(nonNull[0], ctx);
    if (nonNull.every((a) => a.const !== undefined || a.enum)) return { type: "string", enum: nonNull.flatMap((a) => (a.enum ?? [a.const]) as string[]) };
  }
  return s;
}

const typeOf = (s: JSONSchema) => (Array.isArray(s.type) ? s.type.find((t) => t !== "null") : s.type);

export function makeDefault(s: JSONSchema | undefined, ctx: Ctx): Json {
  const r = resolve(s, ctx);
  if (r.default !== undefined) return structuredClone(r.default);
  if (r.enum?.length) return r.enum[0];
  switch (typeOf(r)) {
    case "string":
      return "";
    case "number":
    case "integer":
      return r.minimum ?? 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      const o: Record<string, Json> = {};
      for (const k of r.required ?? []) o[k] = makeDefault(r.properties?.[k], ctx);
      return o;
    }
  }
  return "";
}

const humanize = (k: string) =>
  k
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bUrl\b/g, "URL")
    .replace(/\bSeo\b/g, "SEO")
    .replace(/\bCta\b/g, "CTA")
    .replace(/\bId\b/g, "ID")
    .replace(/\bSku\b/g, "SKU");

const LONG_TEXT = /^(description|body|about|history|answer|quote|excerpt|text|bio|mission|vision|summary|challenge|solution|message|shortDescription|subtitle)$/;
const IMAGE_KEY = /(image|src|logo|cover|avatar|favicon|poster|ogImage|^primary$|^secondary$)/i;
const isHex = (v: unknown) => typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v);
/** Fields that hold an image get the upload / library picker instead of a plain text box. */
function isImageField(path: string, name: string, v: string) {
  if (isHex(v) || /\.colors(\.|$)|videos|\.video$/.test(path) || name === "video") return false;
  if (/^(image|src|logo|cover|avatar|favicon|poster|ogImage|aboutImage)$/.test(name)) return true;
  if (/^(primary|secondary)$/.test(name)) return /\.logo\.(primary|secondary)$/.test(path);
  if (!name && /\.(gallery|images)$/.test(path)) return true; // lists of image URLs
  return looksLikeImage(name, v);
}
const looksLikeImage = (k: string, v: unknown) => typeof v === "string" && /^(https?:\/\/|\/)/.test(v) && (IMAGE_KEY.test(k) || /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(v) || v.includes("images.unsplash.com"));

function itemLabel(v: Json, index: number): string {
  if (v == null || typeof v !== "object") return String(v ?? `Item ${index + 1}`);
  const o = v as Record<string, unknown>;
  const name = ["title", "name", "label", "question", "author", "code", "value", "year", "slug", "id", "src"].map((k) => o[k]).find((x) => typeof x === "string" && x.trim());
  const type = typeof o.type === "string" && typeof o.id === "string" ? `${o.type}` : undefined;
  if (typeof o.slug === "string" && "sections" in o) return o.slug === "" ? `Homepage` : `${o.title ?? o.slug}  /${o.slug}`;
  return [type, name].filter(Boolean).join(" · ") || `Item ${index + 1}`;
}

/* ------------------------------ components ------------------------------ */
export function SchemaForm({ schema, value, onChange, path = "" }: { schema: JSONSchema; value: Json; onChange: (v: Json) => void; path?: string }) {
  const ctx: Ctx = { defs: schema.$defs ?? {} };
  return <Node name="" path={path} schema={schema} value={value} onChange={onChange} ctx={ctx} depth={0} required />;
}

type NodeProps = { name: string; path: string; schema: JSONSchema; value: Json; onChange: (v: Json) => void; ctx: Ctx; depth: number; required?: boolean; onRemove?: () => void; label?: string };

function Node(props: NodeProps) {
  const s = resolve(props.schema, props.ctx);
  const t = typeOf(s);
  if (s.enum) return <EnumField {...props} options={s.enum} />;
  if (t === "boolean") return <BoolField {...props} />;
  if (t === "number" || t === "integer") return <NumberField {...props} s={s} />;
  if (t === "string") return <StringField {...props} />;
  if (t === "array") return <ArrayField {...props} s={s} />;
  if (t === "object") {
    if (s.properties) return <ObjectField {...props} s={s} />;
    const keys = resolve(s.propertyNames, props.ctx).enum as string[] | undefined;
    if (keys && typeof s.additionalProperties === "object") return <KeyedRecord {...props} keys={keys} valueSchema={s.additionalProperties} />;
  }
  return <JsonField {...props} />;
}

function Help({ path }: { path: string }) {
  const h = fieldHelp(path);
  return h ? <p className="mb-1.5 text-xs leading-snug text-neutral-500">{h}</p> : null;
}

function FieldLabel({ name, label, onRemove, htmlFor, path }: { name: string; label?: string; onRemove?: () => void; htmlFor?: string; path: string }) {
  if (!name && !label) return null;
  return (
    <>
    <div className="mb-1 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-neutral-700">{label ?? humanize(name)}</label>
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-neutral-400 hover:text-red-600" title="Remove this field" aria-label={`Remove ${humanize(name)}`}>
          <X className="size-3.5" />
        </button>
      )}
    </div>
    <Help path={path} />
    </>
  );
}

const inputCls = "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

function StringField({ name, path, value, onChange, onRemove, label }: NodeProps) {
  const id = useId();
  const v = typeof value === "string" ? value : value == null ? "" : String(value);
  const long = !isHex(v) && (LONG_TEXT.test(name) || v.length > 90 || v.includes("\n"));
  if (isImageField(path, name, v))
    return (
      <div>
        <FieldLabel name={name} label={label} onRemove={onRemove} htmlFor={id} path={path} />
        <ImageField id={id} value={v} onChange={(x) => onChange(x)} />
      </div>
    );
  return (
    <div>
      <FieldLabel name={name} label={label} onRemove={onRemove} htmlFor={id} path={path} />
      <div className="flex items-start gap-2">
        {isHex(v) && <input type="color" aria-label={`${humanize(name)} colour`} value={v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v.slice(0, 7)} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white p-0.5" />}
        {long ? (
          <textarea id={id} className={clsx(inputCls, "min-h-24")} rows={Math.min(14, Math.max(3, Math.ceil(v.length / 90) + v.split("\n").length))} value={v} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input id={id} className={inputCls} value={v} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    </div>
  );
}

function NumberField({ name, path, value, onChange, onRemove, label, s }: NodeProps & { s: JSONSchema }) {
  const id = useId();
  const [text, setText] = useState(value == null ? "" : String(value));
  return (
    <div>
      <FieldLabel name={name} label={label} onRemove={onRemove} htmlFor={id} path={path} />
      <input
        id={id}
        type="number"
        step="any"
        min={s.minimum}
        max={s.maximum}
        className={inputCls}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && !isNaN(n)) onChange(n);
        }}
      />
    </div>
  );
}

function BoolField({ name, path, value, onChange, onRemove, label }: NodeProps) {
  const on = value === true;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2">
      <span>
        <span className="block text-[13px] font-semibold text-neutral-700">{label ?? humanize(name)}</span>
        {fieldHelp(path) && name && <span className="block text-xs text-neutral-500">{fieldHelp(path)}</span>}
      </span>
      <span className="flex items-center gap-2">
        <button type="button" role="switch" aria-checked={on} aria-label={label ?? humanize(name)} onClick={() => onChange(!on)} className={clsx("relative h-6 w-11 rounded-full transition", on ? "bg-indigo-600" : "bg-neutral-300")}>
          <span className={clsx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
        </button>
        {onRemove && <button type="button" onClick={onRemove} className="text-neutral-400 hover:text-red-600" aria-label="Remove field"><X className="size-3.5" /></button>}
      </span>
    </div>
  );
}

function EnumField({ name, path, value, onChange, onRemove, label, options, required }: NodeProps & { options: (string | number)[] }) {
  const id = useId();
  return (
    <div>
      <FieldLabel name={name} label={label} onRemove={onRemove} htmlFor={id} path={path} />
      <select id={id} className={inputCls} value={value == null ? "" : String(value)} onChange={(e) => onChange(typeof options[0] === "number" ? Number(e.target.value) : e.target.value)}>
        {!required && value == null && <option value="">—</option>}
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>{String(o)}</option>
        ))}
      </select>
    </div>
  );
}

function ObjectField({ name, path, value, onChange, ctx, depth, s, onRemove, label }: NodeProps & { s: JSONSchema }) {
  const obj = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, Json>) : {};
  const required = new Set(s.required ?? []);
  const keys = Object.keys(s.properties ?? {});
  const present = keys.filter((k) => required.has(k) || obj[k] !== undefined);
  const missing = keys.filter((k) => !present.includes(k));
  const set = (k: string, v: Json) => onChange({ ...obj, [k]: v });
  const del = (k: string) => {
    const { [k]: _gone, ...rest } = obj;
    onChange(rest);
  };
  const simple = (k: string) => {
    const r = resolve(s.properties![k], ctx);
    const t = typeOf(r);
    return !r.properties && t !== "array" && !(t === "object") && !(t === "string" && (LONG_TEXT.test(k) || String(obj[k] ?? "").length > 90));
  };
  const body = (
    <div className="space-y-4">
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        {present.filter(simple).map((k) => (
          <Node key={k} name={k} path={path ? `${path}.${k}` : k} schema={s.properties![k]} value={obj[k]} onChange={(v) => set(k, v)} ctx={ctx} depth={depth + 1} required={required.has(k)} onRemove={required.has(k) ? undefined : () => del(k)} />
        ))}
      </div>
      {present.filter((k) => !simple(k)).map((k) => (
        <Node key={k} name={k} path={path ? `${path}.${k}` : k} schema={s.properties![k]} value={obj[k]} onChange={(v) => set(k, v)} ctx={ctx} depth={depth + 1} required={required.has(k)} onRemove={required.has(k) ? undefined : () => del(k)} />
      ))}
      {missing.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-neutral-500">Add field:</span>
          {missing.map((k) => (
            <button key={k} type="button" onClick={() => set(k, makeDefault(s.properties![k], ctx))} className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-600 hover:border-indigo-500 hover:text-indigo-600">
              <Plus className="size-3" /> {humanize(k)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  if (depth === 0 || !name) return body;
  return (
    <Collapsible title={label ?? humanize(name)} onRemove={onRemove} defaultOpen={depth <= 1} help={fieldHelp(path)}>
      {body}
    </Collapsible>
  );
}

function KeyedRecord({ name, path, value, onChange, ctx, depth, keys, valueSchema, onRemove, label }: NodeProps & { keys: string[]; valueSchema: JSONSchema }) {
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, Json>;
  const vt = typeOf(resolve(valueSchema, ctx));
  const body = (
    <div className="grid gap-3 sm:grid-cols-2">
      {keys.map((k) =>
        vt === "boolean" ? (
          <BoolField key={k} name={k} path={path} schema={valueSchema} value={obj[k] ?? false} onChange={(v) => onChange({ ...obj, [k]: v })} ctx={ctx} depth={depth + 1} />
        ) : (
          <Node key={k} name={k} path={path} schema={valueSchema} value={obj[k] ?? ""} onChange={(v) => {
            const next = { ...obj };
            if (v === "" || v == null) delete next[k];
            else next[k] = v;
            onChange(next);
          }} ctx={ctx} depth={depth + 1} />
        ),
      )}
    </div>
  );
  if (depth === 0 || !name) return body;
  return <Collapsible title={label ?? humanize(name)} onRemove={onRemove} defaultOpen={depth <= 1} help={fieldHelp(path)}>{body}</Collapsible>;
}

function ArrayField({ name, path, value, onChange, ctx, depth, s, onRemove, label }: NodeProps & { s: JSONSchema }) {
  const list = Array.isArray(value) ? value : [];
  const itemSchema = resolve(s.items, ctx);
  const primitive = !["object", "array"].includes(typeOf(itemSchema) ?? "") && !itemSchema.properties;
  const [open, setOpen] = useState<number | null>(null);
  const update = (i: number, v: Json) => onChange(list.map((x, k) => (k === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (open === i) setOpen(j);
  };
  const add = () => {
    onChange([...list, makeDefault(itemSchema, ctx)]);
    setOpen(list.length);
  };
  const iconBtn = "grid size-7 place-items-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30";
  // Lists of images (product images, galleries) get a thumbnail grid with multi-upload.
  const imageList = /(^|\.)(images|gallery)$/.test(path) && (primitive ? typeOf(itemSchema) === "string" : !!itemSchema.properties?.src);
  if (imageList) {
    const extraKeys = primitive ? [] : Object.keys(itemSchema.properties!).filter((k) => !["src", "alt", "width", "height"].includes(k) && typeOf(resolve(itemSchema.properties![k], ctx)) === "string");
    const grid = <ImageListField value={list as never} onChange={onChange as never} objectItems={!primitive} makeItem={() => makeDefault(itemSchema, ctx) as never} extraKeys={extraKeys} />;
    if (depth === 0) return grid;
    return (
      <Collapsible title={label ?? humanize(name)} help={fieldHelp(path)} badge={String(list.length)} onRemove={onRemove} defaultOpen>
        {grid}
      </Collapsible>
    );
  }

  const body = primitive ? (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-start gap-1">
          <div className="flex-1"><Node name="" path={path} schema={itemSchema} value={item} onChange={(v) => update(i, v)} ctx={ctx} depth={depth + 1} required /></div>
          <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ChevronUp className="size-4" /></button>
          <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move down"><ChevronDown className="size-4" /></button>
          <button type="button" className={clsx(iconBtn, "hover:text-red-600")} onClick={() => onChange(list.filter((_, k) => k !== i))} aria-label="Delete"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"><Plus className="size-4" /> Add</button>
    </div>
  ) : (
    <div className="space-y-2">
      {list.length === 0 && <p className="text-sm text-neutral-500">No items yet.</p>}
      {list.map((item, i) => {
        const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const hasEnabled = typeof o.enabled === "boolean" || (itemSchema.properties?.enabled && o.enabled === undefined);
        const enabled = o.enabled !== false;
        return (
          <div key={i} className={clsx("rounded-lg border bg-white", open === i ? "border-indigo-300 shadow-sm" : "border-neutral-200")}>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left text-sm hover:bg-neutral-50" aria-expanded={open === i}>
                <ChevronDown className={clsx("size-4 shrink-0 text-neutral-400 transition", open === i ? "rotate-0" : "-rotate-90")} />
                <span className="w-6 shrink-0 text-xs text-neutral-400">{i + 1}</span>
                <span className={clsx("truncate font-medium", !enabled && "text-neutral-400 line-through")}>{itemLabel(item, i)}</span>
              </button>
              {hasEnabled && (
                <button type="button" role="switch" aria-checked={enabled} title={enabled ? "Enabled – click to disable" : "Disabled – click to enable"} aria-label="Enabled" onClick={() => update(i, { ...o, enabled: !enabled })} className={clsx("relative mr-1 h-5 w-9 shrink-0 rounded-full transition", enabled ? "bg-emerald-500" : "bg-neutral-300")}>
                  <span className={clsx("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", enabled ? "left-[18px]" : "left-0.5")} />
                </button>
              )}
              <button type="button" className={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up"><ChevronUp className="size-4" /></button>
              <button type="button" className={iconBtn} onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Move down" title="Move down"><ChevronDown className="size-4" /></button>
              <button type="button" className={iconBtn} onClick={() => { const copy = structuredClone(item) as Record<string, unknown>; if (typeof copy?.id === "string") copy.id += "-copy"; if (typeof copy?.slug === "string") copy.slug += "-copy"; onChange([...list.slice(0, i + 1), copy, ...list.slice(i + 1)]); }} aria-label="Duplicate" title="Duplicate"><Copy className="size-4" /></button>
              <button type="button" className={clsx(iconBtn, "hover:text-red-600")} onClick={() => { if (confirm(`Delete “${itemLabel(item, i)}”?`)) { onChange(list.filter((_, k) => k !== i)); setOpen(null); } }} aria-label="Delete" title="Delete"><Trash2 className="size-4" /></button>
            </div>
            {open === i && (
              <div className="border-t border-neutral-100 p-4">
                <Node name="" path={path} schema={itemSchema} value={item} onChange={(v) => update(i, v)} ctx={ctx} depth={depth + 1} required />
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:border-indigo-400">
        <Plus className="size-4" /> Add {name ? humanize(name).replace(/s$/, "").toLowerCase() : "item"}
      </button>
    </div>
  );
  if (depth === 0) return body;
  return (
    <Collapsible title={`${label ?? humanize(name)}`} help={fieldHelp(path)} badge={String(list.length)} onRemove={onRemove} defaultOpen={(depth <= 1 && list.length <= 8) || name === "sections"}>
      {body}
    </Collapsible>
  );
}

function JsonField({ name, path, value, onChange, onRemove, label }: NodeProps) {
  const id = useId();
  const [text, setText] = useState(() => JSON.stringify(value ?? {}, null, 2));
  const [err, setErr] = useState("");
  return (
    <div>
      <FieldLabel name={name} label={(label ?? humanize(name || "value")) + " (JSON)"} onRemove={onRemove} htmlFor={id} path={path} />
      <textarea
        id={id}
        className={clsx(inputCls, "min-h-24 font-mono text-xs", err && "border-red-500")}
        rows={Math.min(16, text.split("\n").length + 1)}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setErr("");
          } catch {
            setErr("Invalid JSON");
          }
        }}
      />
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

function Collapsible({ title, children, defaultOpen, badge, onRemove, help }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string; onRemove?: () => void; help?: string }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-50/60">
      <div className="flex items-center">
        <button type="button" onClick={() => setOpen(!open)} className="flex flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-neutral-800" aria-expanded={open}>
          <ChevronDown className={clsx("size-4 text-neutral-400 transition", !open && "-rotate-90")} />
          {title}
          {badge && <span className="rounded-full bg-neutral-200 px-2 text-[11px] font-medium text-neutral-600">{badge}</span>}
        </button>
        {onRemove && <button type="button" onClick={() => confirm(`Remove “${title}” and everything in it?`) && onRemove()} className="mr-3 text-neutral-400 hover:text-red-600" aria-label={`Remove ${title}`} title="Remove"><X className="size-4" /></button>}
      </div>
      {open && (
        <div className="border-t border-neutral-200 p-4">
          {help && <p className="mb-3 text-xs leading-snug text-neutral-500">{help}</p>}
          {children}
        </div>
      )}
    </section>
  );
}
