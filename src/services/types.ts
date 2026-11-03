/**
 * BACKEND BOUNDARY
 * ---------------------------------------------------------------------------
 * The UI and API routes depend only on these interfaces. Each has a working
 * default adapter that needs no infrastructure, plus clearly-marked extension
 * points for production providers. Swap adapters in services/index.ts.
 *
 *  Interface          Default adapter (works today)        Production replacement
 *  ─────────────────  ───────────────────────────────────  ─────────────────────────────
 *  CatalogService     ConfigCatalog (reads site config)     Headless CMS / PIM / DB
 *  OrderRepository    MemoryOrderRepository (NOT durable)   Postgres / Shopify / Medusa
 *  PaymentProvider    Manual (COD / bank transfer)          Stripe (adapter included), Razorpay, PayPal
 *  ShippingProvider   FlatRate (config rules)               Shiprocket, EasyPost, Shippo
 *  InventoryService   ConfigInventory (config stock)        ERP / WMS API
 *  FormHandler        Console / Webhook                     CRM, email service (Resend, SES)
 *  AuthService        (browser demo accounts)               Auth.js, Clerk, Cognito, custom
 */
import type { Category, Product, Service, ShippingMethod, SiteConfig } from "@/core/config/schema";
import type { Order } from "@/core/commerce/orders";
import type { CartLine } from "@/core/commerce/pricing";
import type { FormType } from "@/core/forms/schemas";

export interface CatalogService {
  listProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  listCategories(): Promise<Category[]>;
  listServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | undefined>;
}

export interface InventoryService {
  /** Returns available quantity, or undefined when stock is not tracked. */
  available(product: Product): Promise<number | undefined>;
  /** Reserve stock for an order. Default adapter is a no-op. */
  reserve(lines: CartLine[]): Promise<void>;
}

export interface OrderRepository {
  readonly durable: boolean;
  create(order: Order): Promise<Order>;
  find(number: string, email: string): Promise<Order | undefined>;
}

export interface PaymentIntentResult {
  status: "not_required" | "pending" | "redirect" | "paid";
  redirectUrl?: string;
  reference?: string;
  instructions?: string;
}
export interface PaymentProvider {
  readonly id: string;
  createPayment(order: Order, ctx: { returnUrl: string; cancelUrl: string }): Promise<PaymentIntentResult>;
}

export interface ShippingQuote {
  method: ShippingMethod;
  amount: number;
}
export interface ShippingProvider {
  readonly id: string;
  quote(lines: CartLine[], country: string | undefined, merchandiseTotal: number): Promise<ShippingQuote[]>;
}

export interface FormHandler {
  readonly id: string;
  submit(form: FormType, data: Record<string, unknown>, meta: { site: SiteConfig; ip?: string; userAgent?: string; page?: string }): Promise<{ id: string }>;
}

export class NotConfiguredError extends Error {
  constructor(what: string, how: string) {
    super(`${what} is not configured. ${how}`);
    this.name = "NotConfiguredError";
  }
}
