import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { DemoNotice } from "@/components/commerce/DemoNotice";
import { getStore } from "@/server/store";
import { requireFeature } from "../_lib/pages";
import { systemMetadata } from "../_lib/simple";

export const generateMetadata = () => systemMetadata("checkout", "Checkout", "/checkout", true);

export default async function CheckoutPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "shop"));
  return (
    <Container className="py-12 md:py-16">
      <h1 className="mb-4 text-3xl md:text-5xl">Checkout</h1>
      <DemoNotice provider={site.commerce.payment.provider} durable={getStore(site.id).writable && (site.commerce.payment.provider === "manual" || Boolean(process.env.STRIPE_SECRET_KEY))} />
      <div className="mt-10"><CheckoutForm /></div>
    </Container>
  );
}
