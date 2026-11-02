import { NextResponse } from "next/server";
import { getSite } from "@/core/config/loader";
import { FormSchemas, type FormType } from "@/core/forms/schemas";
import { getServices } from "@/services";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request, ctx: { params: Promise<{ form: string }> }) {
  const { form } = await ctx.params;
  if (!(form in FormSchemas)) return NextResponse.json({ ok: false, error: "Unknown form" }, { status: 404 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`form:${ip}`, 8, 60_000)) return NextResponse.json({ ok: false, error: "Too many submissions. Please wait a minute." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { page, ...fields } = (body ?? {}) as Record<string, unknown>;
  const parsed = FormSchemas[form as FormType].safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Validation failed", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 422 });
  }
  const { website: _hp, ...data } = parsed.data as Record<string, unknown>;
  const site = await getSite();
  try {
    const { id } = await getServices(site).forms.submit(form as FormType, data, { site, ip, userAgent: req.headers.get("user-agent") ?? undefined, page: typeof page === "string" ? page : undefined });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[forms] delivery failed", e);
    return NextResponse.json({ ok: false, error: "We couldn't send your message right now. Please try again or contact us directly." }, { status: 502 });
  }
}
