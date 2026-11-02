import { getSite } from "@/core/config/loader";
import { isEnabled } from "@/core/config/features";
import { Container } from "@/components/ui/primitives";
import { ProductCard } from "@/components/commerce/ProductCard";
import { WishlistFilter } from "@/components/commerce/WishlistFilter";
import { requireFeature } from "../_lib/pages";
import { systemMetadata } from "../_lib/simple";

export const generateMetadata = () => systemMetadata("wishlist", "Wishlist", "/wishlist", true);

/** All product cards are server-rendered; the client filter shows only wishlisted ones. */
export default async function WishlistPage() {
  const site = await getSite();
  requireFeature(isEnabled(site, "wishlist"));
  return (
    <Container className="py-12 md:py-16">
      <h1 className="mb-10 text-3xl md:text-5xl">Your wishlist</h1>
      <WishlistFilter items={site.catalog.products.map((p) => ({ slug: p.slug, node: <ProductCard product={p} site={site} /> }))} />
    </Container>
  );
}
