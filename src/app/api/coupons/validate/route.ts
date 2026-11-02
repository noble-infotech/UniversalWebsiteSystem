import { NextResponse } from "next/server";
import { z } from "zod";
import { getSite } from "@/core/config/loader";
import { applyCoupon, type CartLine } from "@/core/commerce/pricing";

const Body = z.object({ code: z.string().trim().min(1).max(40), lines: z.array(z.any()).default([]) });

/** Coupon codes stay on the server; only a matched coupon definition is returned. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "Enter a coupon code." }, { status: 400 });
  const site = await getSite();
  const coupon = site.commerce.coupons.find((c) => c.code.toUpperCase() === parsed.data.code.toUpperCase());
  const result = applyCoupon(coupon, parsed.data.lines as CartLine[]);
  if (!result.ok) return NextResponse.json(result);
  return NextResponse.json({ ok: true, coupon: result.coupon });
}
