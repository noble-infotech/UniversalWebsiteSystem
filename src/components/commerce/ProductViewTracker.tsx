"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
export function ProductViewTracker({ sku, name }: { sku: string; name: string }) {
  useEffect(() => track("view_item", { item_id: sku, item_name: name }), [sku, name]);
  return null;
}
