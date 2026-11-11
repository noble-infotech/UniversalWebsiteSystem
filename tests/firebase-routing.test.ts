import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const ENV = { ...process.env };
afterEach(() => {
  process.env = { ...ENV };
  vi.resetModules();
});
const load = () => import("@/server/firebase");
const sa = (project: string) => JSON.stringify({ project_id: project, client_email: `svc@${project}.iam.gserviceaccount.com`, private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n" });
const clean = () => {
  for (const k of Object.keys(process.env)) if (k.startsWith("FIREBASE_") || k === "FIRESTORE_EMULATOR_HOST" || k === "ISOLATE_SITE_STORAGE") delete process.env[k];
};

describe("one Firebase project per site", () => {
  it("prefers the site-specific service account over the project one", async () => {
    clean();
    process.env.FIREBASE_SERVICE_ACCOUNT = sa("shared-proj");
    process.env.FIREBASE_SERVICE_ACCOUNT_MAISON_LUMIERE = Buffer.from(sa("maison-proj")).toString("base64");
    const { firebaseCredsFor } = await load();
    expect(firebaseCredsFor("maison-lumiere")?.projectId).toBe("maison-proj");
    expect(firebaseCredsFor("apex-forge")?.projectId).toBe("shared-proj");
  });

  it("accepts the three separate variables with an escaped private key", async () => {
    clean();
    process.env.FIREBASE_PROJECT_ID = "p1";
    process.env.FIREBASE_CLIENT_EMAIL = "svc@p1.iam.gserviceaccount.com";
    process.env.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n";
    const c = (await load()).firebaseCredsFor("apex-forge");
    expect(c?.projectId).toBe("p1");
    expect(c?.privateKey).toContain("\nabc\n");
  });

  it("never shares credentials when isolation is on", async () => {
    clean();
    process.env.FIREBASE_SERVICE_ACCOUNT = sa("shared-proj");
    process.env.ISOLATE_SITE_STORAGE = "true";
    expect((await load()).firebaseCredsFor("apex-forge")).toBeUndefined();
  });

  it("rejects malformed service-account values", async () => {
    clean();
    process.env.FIREBASE_SERVICE_ACCOUNT = "not json";
    expect((await load()).firebaseCredsFor("apex-forge")).toBeUndefined();
  });

  it("chooses Firestore, then local files, then read-only", async () => {
    clean();
    process.env.FIREBASE_SERVICE_ACCOUNT_APEX_FORGE = sa("apex");
    delete process.env.VERCEL;
    const { getStore } = await import("@/server/store");
    const { getMediaStore } = await import("@/server/media");
    expect(getStore("apex-forge").kind).toBe("firestore");
    expect(getMediaStore("apex-forge").kind).toBe("firestore");
    expect(getStore("maison-lumiere").kind).toBe("file");
    process.env.VERCEL = "1";
    expect(getStore("maison-lumiere").kind).toBe("readonly");
    expect(getMediaStore("maison-lumiere").kind).toBe("none");
  });
});
