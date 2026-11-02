import { redirect } from "next/navigation";
import { getSite } from "@/core/config/loader";
import { adminPassword, getAdminSession, passwordEnvHint, usingDevPassword } from "@/server/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLogin() {
  const site = await getSite();
  if (await getAdminSession()) redirect("/admin");
  const configured = Boolean(adminPassword(site.id));
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Website admin</p>
        <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: "inherit", textTransform: "none", letterSpacing: 0 }}>{site.company.brandName}</h1>
        {configured ? (
          <LoginForm />
        ) : (
          <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Admin login is not set up. In your hosting provider (e.g. Vercel → Settings → Environment Variables) add <code className="font-semibold">{passwordEnvHint(site.id)}</code>, then redeploy.</p>
        )}
        {usingDevPassword(site.id) && <p className="mt-4 text-xs text-neutral-500">Local development: the password is <code>admin</code>.</p>}
      </div>
    </div>
  );
}
