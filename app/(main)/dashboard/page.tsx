import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { BriefcaseIcon, ClipboardListIcon, WalletIcon, TrendingUpIcon, CalendarIcon } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isRunner = user.role === "RUNNER";

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, availableJobs, totalEarnedAgg, weeklyEarnedAgg, monthlyEarnedAgg] = await Promise.all([
    db.order.findMany({
      where: isRunner ? { runnerId: user.id } : { customerId: user.id },
      include: {
        customer: { select: { name: true, dormitory: true } },
        runner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    isRunner
      ? db.order.count({ where: { status: "PENDING", runnerId: null } })
      : Promise.resolve(0),
    isRunner
      ? db.order.aggregate({ where: { runnerId: user.id, status: "DELIVERED" }, _sum: { price: true } })
      : Promise.resolve(null),
    isRunner
      ? db.order.aggregate({ where: { runnerId: user.id, status: "DELIVERED", updatedAt: { gte: startOfWeek } }, _sum: { price: true } })
      : Promise.resolve(null),
    isRunner
      ? db.order.aggregate({ where: { runnerId: user.id, status: "DELIVERED", updatedAt: { gte: startOfMonth } }, _sum: { price: true } })
      : Promise.resolve(null),
  ]);

  const totalEarned = totalEarnedAgg?._sum.price ?? 0;
  const weeklyEarned = weeklyEarnedAgg?._sum.price ?? 0;
  const monthlyEarned = monthlyEarnedAgg?._sum.price ?? 0;

  const activeCount = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isRunner
            ? "Here's what's happening with your runner jobs."
            : "Here's the status of your laundry orders."}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {isRunner ? (
          <>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{availableJobs}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <WalletIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(totalEarned)}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <ClipboardListIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <ClipboardListIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
                  <ClipboardListIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <WalletIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.price, 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isRunner && (
        <div className="card mb-8 p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
            <h2 className="font-semibold text-gray-900">Earnings Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">This Week</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{formatPrice(weeklyEarned)}</p>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="h-4 w-4 text-green-500" />
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">This Month</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatPrice(monthlyEarned)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-sm font-medium text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardListIcon className="h-12 w-12 text-gray-200" />
            <p className="mt-3 text-sm font-medium text-gray-500">No orders yet</p>
            {!isRunner && (
              <Link href="/orders/new" className="btn-primary mt-4 text-sm">
                Post your first order
              </Link>
            )}
            {isRunner && (
              <Link href="/jobs" className="btn-primary mt-4 text-sm">
                Browse available jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.pickupLocation} → {order.deliveryLocation}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatPrice(order.price)}
                  </span>
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
