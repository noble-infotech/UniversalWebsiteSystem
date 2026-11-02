import { NextResponse } from "next/server";
import { getStore } from "@/server/store";
import { requireAdmin } from "@/server/admin-guard";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await ctx.params;
  const { status } = (await req.json().catch(() => ({}))) as { status?: string };
  if (!["new", "read", "archived"].includes(status ?? "")) return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  await getStore().setEnquiryStatus(auth.siteId, id, status as "new");
  return NextResponse.json({ ok: true });
}
