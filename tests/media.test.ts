import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  vi.resetModules();
});
const media = () => import("@/server/media");

describe("media uploads", () => {
  it("detects real image types from bytes, not file names", async () => {
    const { sniffImageType } = await media();
    expect(sniffImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("image/jpeg");
    expect(sniffImageType(Buffer.from("89504e470d0a1a0a0000000d49484452", "hex"))).toBe("image/png");
    expect(sniffImageType(Buffer.from("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(sniffImageType(Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe("image/svg+xml");
    expect(sniffImageType(Buffer.from("just some text pretending to be a png"))).toBeUndefined();
    expect(sniffImageType(Buffer.from("<html><script>alert(1)</script></html>"))).toBeUndefined();
  });

  it("strips scripts and event handlers from SVGs", async () => {
    const { sanitizeSvg } = await media();
    const out = sanitizeSvg('<svg onload="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)"><rect onclick=\'x()\'/></a><foreignObject><div/></foreignObject></svg>');
    expect(out).not.toMatch(/script|onload|onclick|javascript:|foreignObject/i);
    expect(out).toContain("<rect");
  });

  it("only accepts safe generated file ids", async () => {
    const { isSafeMediaId } = await media();
    expect(isSafeMediaId("hero-photo-1a2b3c4d5e.webp")).toBe(true);
    expect(isSafeMediaId("../../etc/passwd")).toBe(false);
    expect(isSafeMediaId("photo.html")).toBe(false);
  });

});
