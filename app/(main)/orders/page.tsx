import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { PlusCircleIcon, ClipboardListIcon } from "lucide-react";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isRunner = user.role === "RUNNER";

  const orders = await db.order.findMany({
    where: isRunner ? { runnerId: user.id } : { customerId: user.id },
    include: {
      customer: { select: { name: true, dormitory: true } },
      runner: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRunner ? "My Jobs" : "My Orders"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"} total
          </p>
        </div>
        {!isRunner && (
          <Link href="/orders/new" className="btn-primary">
            <PlusCircleIcon className="h-4 w-4" />
            New Order
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <ClipboardListIcon className="h-14 w-14 text-gray-200" />
          <p className="mt-4 text-base font-medium text-gray-500">
            {isRunner ? "You haven't accepted any jobs yet." : "You have no orders yet."}
          </p>
          <Link href={isRunner ? "/jobs" : "/orders/new"} className="btn-primary mt-6">
            {isRunner ? "Browse Jobs" : "Post an Order"}
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {orders.map((order) => {
            const items = JSON.parse(order.items) as string[];
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-start justify-between gap-4 px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {order.pickupLocation} → {order.deliveryLocation}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {items.slice(0, 3).join(", ")}
                    {items.length > 3 ? ` +${items.length - 3} more` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.price)}</p>
                  {order.weight && <p className="text-xs text-gray-400">{order.weight} kg</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
