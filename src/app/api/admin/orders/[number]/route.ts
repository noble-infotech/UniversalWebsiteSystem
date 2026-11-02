import { NextResponse } from "next/server";
import { getStore } from "@/server/store";
import { requireAdmin } from "@/server/admin-guard";
import type { OrderStatus } from "@/core/commerce/orders";

const STATUSES: OrderStatus[] = ["pending_payment", "placed", "processing", "shipped", "delivered", "cancelled"];

export async function POST(req: Request, ctx: { params: Promise<{ number: string }> }) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { number } = await ctx.params;
  const { status } = (await req.json().catch(() => ({}))) as { status?: OrderStatus };
  if (!status || !STATUSES.includes(status)) return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  const order = await getStore().setOrderStatus(auth.siteId, number, status);
  if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
