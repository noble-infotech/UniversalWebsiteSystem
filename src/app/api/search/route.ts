import { NextResponse } from "next/server";
import { getSite } from "@/core/config/loader";
import { siteSearch } from "@/core/search";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const site = await getSite();
  return NextResponse.json({ results: siteSearch(site, q, 8) });
}
