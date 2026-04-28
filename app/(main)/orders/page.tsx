import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { PlusCircleIcon, ClipboardListIcon } from "lucide-react";
import { OrderTabs } from "@/components/shared/order-tabs";

const ACTIVE_STATUSES = ["PENDING", "ACCEPTED", "PICKED_UP", "WASHING", "READY"];

function getStatusFilter(status: string | undefined) {
  if (status === "active") return { status: { in: ACTIVE_STATUSES } };
  if (status === "delivered") return { status: "DELIVERED" };
  if (status === "cancelled") return { status: "CANCELLED" };
  return {};
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isRunner = user.role === "RUNNER";
  const baseWhere = isRunner ? { runnerId: user.id } : { customerId: user.id };

  const [allOrders, orders] = await Promise.all([
    db.order.findMany({ where: baseWhere, select: { status: true } }),
    db.order.findMany({
      where: { ...baseWhere, ...getStatusFilter(searchParams.status) },
      include: {
        customer: { select: { name: true, dormitory: true } },
        runner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const counts = {
    all: allOrders.length,
    active: allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    delivered: allOrders.filter((o) => o.status === "DELIVERED").length,
    cancelled: allOrders.filter((o) => o.status === "CANCELLED").length,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRunner ? "My Jobs" : "My Orders"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
            {searchParams.status && searchParams.status !== "all" ? ` · ${searchParams.status}` : " total"}
          </p>
        </div>
        {!isRunner && (
          <Link href="/orders/new" className="btn-primary">
            <PlusCircleIcon className="h-4 w-4" />
            New Order
          </Link>
        )}
      </div>

      <div className="mb-6">
        <Suspense>
          <OrderTabs counts={counts} />
        </Suspense>
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <ClipboardListIcon className="h-14 w-14 text-gray-200" />
          <p className="mt-4 text-base font-medium text-gray-500">
            No {searchParams.status && searchParams.status !== "all" ? searchParams.status : ""} orders found.
          </p>
          {!searchParams.status && (
            <Link href={isRunner ? "/jobs" : "/orders/new"} className="btn-primary mt-6">
              {isRunner ? "Browse Jobs" : "Post an Order"}
            </Link>
          )}
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
