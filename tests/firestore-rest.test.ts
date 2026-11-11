import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { decodeFields, encodeFields, signJwt } from "@/server/firestore-rest";

describe("Firestore REST value encoding", () => {
  it("round-trips the value types the app stores", () => {
    const doc = {
      s: "héllo", i: 42, f: 1.5, neg: -3, t: true, n: null,
      bytes: new Uint8Array([0, 1, 2, 250, 255]),
      list: [1, "two", { three: 3 }],
      nested: { a: { b: ["x", "y"] }, empty: {} },
      skip: undefined,
    };
    const out = decodeFields(encodeFields(doc));
    expect(out).toEqual({ ...doc, skip: undefined, bytes: new Uint8Array([0, 1, 2, 250, 255]) });
    expect("skip" in out).toBe(false);
  });

  it("encodes integers and doubles the way Firestore expects", () => {
    const f = encodeFields({ i: 7, d: 0.25, big: 1e15 });
    expect(f.i).toEqual({ integerValue: "7" });
    expect(f.d).toEqual({ doubleValue: 0.25 });
    expect(f.big).toEqual({ integerValue: "1000000000000000" });
  });

  it("handles large binary values (image pieces)", () => {
    const big = crypto.randomBytes(900_000);
    const back = decodeFields(encodeFields({ data: big })).data as Uint8Array;
    expect(Buffer.from(back).equals(big)).toBe(true);
  });
});

describe("Google service-account sign-in", () => {
  it("produces an RS256 JWT that verifies with the matching public key", async () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    const jwt = await signJwt("svc@demo.iam.gserviceaccount.com", pem);
    const [h, c, sig] = jwt.split(".");
    expect(JSON.parse(Buffer.from(h, "base64url").toString())).toEqual({ alg: "RS256", typ: "JWT" });
    const claims = JSON.parse(Buffer.from(c, "base64url").toString());
    expect(claims).toMatchObject({ iss: "svc@demo.iam.gserviceaccount.com", scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token" });
    expect(claims.exp - claims.iat).toBe(3600);
    expect(crypto.verify("RSA-SHA256", Buffer.from(`${h}.${c}`), publicKey, Buffer.from(sig, "base64url"))).toBe(true);
  });
});
