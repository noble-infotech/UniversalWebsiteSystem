import type { SiteConfig, Product } from "@/core/config/schema";
import type { CatalogService, InventoryService } from "../types";

/** Reads catalogue straight from the site configuration. Replace with a CMS/DB-backed implementation. */
export function configCatalog(site: SiteConfig): CatalogService {
  return {
    listProducts: async () => site.catalog.products,
    getProduct: async (slug) => site.catalog.products.find((p) => p.slug === slug),
    listCategories: async () => site.catalog.categories,
    listServices: async () => site.services.items,
    getService: async (slug) => site.services.items.find((s) => s.slug === slug),
  };
}

export function configInventory(site: SiteConfig): InventoryService {
  return {
    available: async (p: Product) => (site.commerce.inventory.trackStock ? p.stock : undefined),
    reserve: async () => {
      /* Hook point: decrement stock in your ERP / database inside the order transaction. */
    },
  };
}
