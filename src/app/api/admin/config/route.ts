import { NextResponse } from "next/server";
import { getStore } from "@/server/store";
import { requireAdmin } from "@/server/admin-guard";
import { isAdminModule } from "@/server/admin-modules";
import { invalidateSite, mergeConfig, resolveSiteConfig } from "@/core/config/loader";
import { validateSite } from "@/core/config/validate";

/** Save one module. The whole merged config is validated (schema + cross-references) before anything is stored. */
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const store = getStore(auth.siteId);
  if (!store.writable) return NextResponse.json({ ok: false, error: "Saving is disabled: no database is connected. Add DATABASE_URL (see docs/ADMIN.md)." }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { module?: string; value?: unknown } | null;
  if (!body?.module || !isAdminModule(body.module) || body.value === undefined) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const current = (await store.getOverrides(auth.siteId)).data;
  const next = { ...current, [body.module]: body.value };
  const { issues } = validateSite(mergeConfig(auth.siteId, next));
  const errors = issues.filter((i) => i.level === "error");
  if (errors.length) return NextResponse.json({ ok: false, error: "Please fix the highlighted problems.", issues: errors }, { status: 422 });

  await store.saveOverrides(auth.siteId, next, "admin");
  invalidateSite(auth.siteId);
  return NextResponse.json({ ok: true, warnings: issues.filter((i) => i.level === "warning") });
}

/** Reset a module back to the file defaults. */
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const store = getStore(auth.siteId);
  if (!store.writable) return NextResponse.json({ ok: false, error: "No database connected." }, { status: 503 });
  const mod = new URL(req.url).searchParams.get("module") ?? "";
  if (!isAdminModule(mod)) return NextResponse.json({ ok: false, error: "Invalid module" }, { status: 400 });
  const { [mod]: _removed, ...rest } = (await store.getOverrides(auth.siteId)).data as Record<string, unknown>;
  await store.saveOverrides(auth.siteId, rest, "admin");
  invalidateSite(auth.siteId);
  return NextResponse.json({ ok: true });
}

/** Export the full effective config as JSON (to back up, or to commit into sites/<id>). */
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const config = await resolveSiteConfig(auth.siteId);
  return new NextResponse(JSON.stringify(config, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="${auth.siteId}-config.json"` },
  });
}
