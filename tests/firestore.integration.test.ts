/**
 * Runs against the Firestore emulator:
 *   npx firebase emulators:start --only firestore --project demo-uws   (port 8085, see firebase.json)
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 npm test
 * Skipped automatically when no emulator is configured.
 */
import { describe, expect, it, vi } from "vitest";
import type { Order } from "@/core/commerce/orders";

vi.mock("server-only", () => ({}));
const emulator = !!process.env.FIRESTORE_EMULATOR_HOST;
// A dedicated site id so tests never touch real site data.
const site = "it-test-site";

describe.skipIf(!emulator)("Firestore store (emulator)", () => {
  it("saves, reads, replaces and resets admin edits, including large modules", async () => {
    const { getStore } = await import("@/server/store");
    const store = getStore(site);
    expect(store.kind).toBe("firestore");
    await store.saveOverrides(site, {}, "test");
    const big = { products: Array.from({ length: 2500 }, (_, i) => ({ slug: `p-${i}`, description: "x".repeat(800) })) }; // ~2 MB → several parts
    await store.saveOverrides(site, { company: { brandName: "Test Co" } as never, catalog: big as never }, "test");
    let o = await store.getOverrides(site);
    expect((o.data.company as { brandName: string }).brandName).toBe("Test Co");
    expect((o.data.catalog as typeof big).products).toHaveLength(2500);
    await store.saveOverrides(site, { company: { brandName: "Renamed" } as never }, "test"); // catalog reset
    o = await store.getOverrides(site);
    expect(Object.keys(o.data)).toEqual(["company"]);
    expect(o.updatedAt).toBeTruthy();
  });

  it("stores enquiries and orders, newest first, with status updates", async () => {
    const { getStore } = await import("@/server/store");
    const store = getStore(site);
    for (const n of [1, 2]) await store.addEnquiry({ id: `SUB-T${n}`, siteId: site, form: "contact", data: { name: `N${n}`, nested: { a: [1, 2] } }, status: "new", createdAt: `2026-11-1${n}T10:00:00.000Z` });
    const list = await store.listEnquiries(site);
    expect(list.slice(0, 2).map((e) => e.id)).toEqual(["SUB-T2", "SUB-T1"]);
    await store.setEnquiryStatus(site, "SUB-T1", "archived");
    expect((await store.listEnquiries(site)).find((e) => e.id === "SUB-T1")?.status).toBe("archived");

    const order = { number: "AFI-TEST1", siteId: site, createdAt: new Date().toISOString(), status: "placed", email: "Jane@Example.com", phone: "123", paymentMethod: "cod", lines: [], totals: { subtotal: 1, discount: 0, shipping: 0, tax: 0, total: 1, taxInclusive: false, itemCount: 1 }, currency: "USD", mode: "live", couponCode: undefined } as Order;
    await store.saveOrder(order);
    expect((await store.findOrder(site, "AFI-TEST1", "jane@example.com"))?.number).toBe("AFI-TEST1");
    expect(await store.findOrder(site, "AFI-TEST1", "someone@else.com")).toBeUndefined();
    expect((await store.setOrderStatus(site, "AFI-TEST1", "shipped"))?.status).toBe("shipped");
    expect((await store.listOrders(site))[0].status).toBe("shipped");
    await expect(store.findOrder("other-site", "AFI-TEST1", "jane@example.com")).rejects.toThrow(/cannot access/);
  });

  it("stores images larger than one Firestore document and serves them back intact", async () => {
    const { getMediaStore } = await import("@/server/media");
    const media = getMediaStore(site);
    const bytes = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), Buffer.alloc(2_500_000, 7)]); // 2.5 MB → 3 parts
    const item = await media.upload({ name: "Big Photo.png", bytes, contentType: "image/png" });
    expect(item.url).toBe(`/api/media/${site}/${item.id}`);
    const back = await media.read(item.id);
    expect(back?.bytes.equals(bytes)).toBe(true);
    expect((await media.list()).some((m) => m.id === item.id)).toBe(true);
    await media.remove(item.id);
    expect(await media.read(item.id)).toBeUndefined();
  });
});
