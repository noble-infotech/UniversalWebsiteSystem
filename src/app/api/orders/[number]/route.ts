import { NextResponse } from "next/server";
import { getSite } from "@/core/config/loader";
import { getServices } from "@/services";

/** Order lookup for tracking. Requires the matching email address. */
export async function GET(req: Request, ctx: { params: Promise<{ number: string }> }) {
  const { number } = await ctx.params;
  const email = new URL(req.url).searchParams.get("email") ?? "";
  if (!email) return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  const site = await getSite();
  const order = await getServices(site).orders.find(number, email);
  if (!order || order.siteId !== site.id) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}
