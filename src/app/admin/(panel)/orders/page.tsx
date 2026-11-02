import { getSite } from "@/core/config/loader";
import { getStore } from "@/server/store";
import { OrderList } from "@/components/admin/OrderList";

export default async function OrdersPage() {
  const site = await getSite();
  const store = getStore();
  const orders = await store.listOrders(site.id, 500);
  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mb-6 text-sm text-neutral-600">Update an order’s status – customers see it on the order-tracking page.</p>
      {!store.writable && <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">No database connected – orders are not being stored. Connect a database to manage them here.</p>}
      <OrderList initial={orders} currency={site.commerce.currency} locale={site.commerce.locale} />
    </div>
  );
}
