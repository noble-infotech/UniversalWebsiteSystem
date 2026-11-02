import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { CartView } from "@/components/commerce/CartContents";
import { requireFeature } from "../_lib/pages";
import { systemMetadata } from "../_lib/simple";

export const generateMetadata = () => systemMetadata("cart", "Shopping cart", "/cart", true);

export default async function CartPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "shop"));
  return (
    <Container className="py-12 md:py-16">
      <h1 className="mb-10 text-3xl md:text-5xl">Shopping cart</h1>
      <CartView />
    </Container>
  );
}
