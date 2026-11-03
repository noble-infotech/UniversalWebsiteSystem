import { Suspense } from "react";
import { getSite } from "@/core/config/loader";
import { Container } from "@/components/ui/primitives";
import { OrderConfirmation } from "@/components/commerce/OrderViews";
import { systemMetadata } from "../../_lib/simple";

export const generateMetadata = () => systemMetadata("order-confirmation", "Order confirmed", "/checkout/success", true);

export default async function SuccessPage() {
  await getSite();
  return (
    <Container className="py-16 md:py-24" narrow>
      <Suspense><OrderConfirmation /></Suspense>
    </Container>
  );
}
