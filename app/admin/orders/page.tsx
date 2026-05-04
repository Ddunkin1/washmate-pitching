import { db } from "@/lib/db";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      runner: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">All Orders</h1>
        <p className="mt-1 text-sm text-gray-500">{orders.length} total orders on the platform</p>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:grid">
          <span className="col-span-4">Route</span>
          <span className="col-span-2">Customer</span>
          <span className="col-span-2">Runner</span>
          <span className="col-span-2">Date</span>
          <span className="col-span-1 text-right">Price</span>
          <span className="col-span-1 text-right">Status</span>
        </div>
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-2 px-6 py-4 hover:bg-gray-50 transition-colors lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
              <p className="col-span-4 text-sm font-medium text-gray-900">
                {order.pickupLocation} → {order.deliveryLocation}
              </p>
              <p className="col-span-2 text-sm text-gray-600">{order.customer.name}</p>
              <p className="col-span-2 text-sm text-gray-500">{order.runner?.name ?? "—"}</p>
              <p className="col-span-2 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              <p className="col-span-1 text-right text-sm font-bold text-gray-900">{formatPrice(order.price)}</p>
              <div className="col-span-1 flex lg:justify-end">
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-xs`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
