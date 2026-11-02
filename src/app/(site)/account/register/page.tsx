import { Suspense } from "react";
import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { AuthForm } from "@/components/commerce/AccountViews";
import { requireFeature } from "../../_lib/pages";
import { systemMetadata } from "../../_lib/simple";

export const generateMetadata = () => systemMetadata("register", "Create account", "/account/register", true);

export default async function RegisterPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "accounts"));
  return <Container className="py-16 md:py-24" narrow><Suspense><AuthForm mode="register" /></Suspense></Container>;
}
