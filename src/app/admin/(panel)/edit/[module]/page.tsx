import { notFound } from "next/navigation";
import { z } from "zod";
import { SiteConfigSchema } from "@/core/config/schema";
import { baseConfig, getSiteId } from "@/core/config/loader";
import { getStore } from "@/server/store";
import { ADMIN_MODULES, isAdminModule } from "@/server/admin-modules";
import { ModuleEditor } from "@/components/admin/ModuleEditor";
import type { JSONSchema } from "@/components/admin/SchemaForm";

export default async function EditModule({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!isAdminModule(module)) notFound();
  const meta = ADMIN_MODULES.find((m) => m.key === module)!;
  const siteId = await getSiteId();
  const store = getStore();
  const overrides = (await store.getOverrides(siteId)).data as Record<string, unknown>;
  const overridden = overrides[module] !== undefined;
  const value = overridden ? overrides[module] : (baseConfig(siteId) as Record<string, unknown>)[module];
  // Round-trip through JSON so only plain data crosses the server → client boundary.
  const schema = JSON.parse(JSON.stringify(z.toJSONSchema(SiteConfigSchema.shape[module], { io: "input", unrepresentable: "any" }))) as JSONSchema;
  return <ModuleEditor key={module} module={module} label={meta.label} help={meta.help} schema={schema} initial={value ?? {}} overridden={overridden} writable={store.writable} storeKind={store.kind} />;
}
