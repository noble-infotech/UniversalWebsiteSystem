import { redirect } from "next/navigation";
import { getSite } from "@/core/config/loader";
import { getAdminSession } from "@/server/auth";
import { getStore } from "@/server/store";
import { ADMIN_MODULES } from "@/server/admin-modules";
import { AdminNav } from "@/components/admin/AdminNav";

/** Every admin page below this layout requires a valid session for the current site. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const site = await getSite();
  const store = getStore();
  return (
    <div className="lg:pl-64">
      <AdminNav
        brand={site.company.brandName}
        siteId={site.id}
        storeKind={store.kind}
        modules={ADMIN_MODULES.map((m) => ({ key: m.key, label: m.label, group: m.group }))}
        showOrders={Boolean(site.features.shop) && site.commerce.enabled}
      />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
