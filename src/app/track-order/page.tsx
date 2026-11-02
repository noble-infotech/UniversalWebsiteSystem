import { Suspense } from "react";
import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { OrderTracker } from "@/components/commerce/OrderViews";
import { requireFeature } from "../_lib/pages";
import { systemMetadata } from "../_lib/simple";

export const generateMetadata = () => systemMetadata("track-order", "Track your order", "/track-order");

export default async function TrackOrderPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "shop"));
  return (
    <Container className="py-12 md:py-20" narrow>
      <h1 className="text-3xl md:text-5xl">Track your order</h1>
      <p className="mt-3 mb-10 text-muted-foreground">Enter your order number and the email address used at checkout.</p>
      <Suspense><OrderTracker /></Suspense>
    </Container>
  );
}
