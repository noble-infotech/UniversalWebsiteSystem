import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { AccountDashboard } from "@/components/commerce/AccountViews";
import { requireFeature } from "../_lib/pages";
import { systemMetadata } from "../_lib/simple";

export const generateMetadata = () => systemMetadata("account", "My account", "/account", true);

export default async function AccountPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "accounts"));
  return <Container className="py-12 md:py-16"><AccountDashboard /></Container>;
}
