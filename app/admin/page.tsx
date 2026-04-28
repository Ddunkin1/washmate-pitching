import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import {
  ClipboardListIcon,
  WalletIcon,
  UsersIcon,
  BriefcaseIcon,
  TrendingUpIcon,
  ShirtIcon,
  FlagIcon,
} from "lucide-react";
import { FlagActions } from "./flag-actions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [
    totalOrders,
    totalRevenue,
    totalCustomers,
    totalRunners,
    ordersByStatus,
    recentOrders,
    topRunners,
    pendingFlags,
  ] = await Promise.all([
    db.order.count(),
    db.order.aggregate({ where: { status: "DELIVERED" }, _sum: { price: true } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "RUNNER" } }),
    db.order.groupBy({ by: ["status"], _count: { id: true } }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        runner: { select: { name: true } },
      },
    }),
    db.order.groupBy({
      by: ["runnerId"],
      where: { status: "DELIVERED", runnerId: { not: null } },
      _count: { id: true },
      _sum: { price: true },
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    }),
    db.flag.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true } },
        reported: { select: { name: true, gender: true } },
        order: { select: { id: true, pickupLocation: true, deliveryLocation: true } },
      },
    }),
  ]);

  const statusMap = Object.fromEntries(
    ordersByStatus.map((s) => [s.status, s._count.id])
  );

  const runnerIds = topRunners.map((r) => r.runnerId!);
  const runnerUsers = await db.user.findMany({
    where: { id: { in: runnerIds } },
    select: { id: true, name: true },
  });
  const runnerMap = Object.fromEntries(runnerUsers.map((r) => [r.id, r.name]));

  const STATUS_ORDER = ["PENDING", "ACCEPTED", "PICKED_UP", "WASHING", "READY", "DELIVERED", "CANCELLED"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <ShirtIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-400">WashMate — Business Overview</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {formatPrice(totalRevenue._sum.price ?? 0)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <WalletIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <ClipboardListIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <UsersIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Runners</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalRunners}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <BriefcaseIcon className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Orders by status */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Orders by Status</h2>
            </div>
            <div className="space-y-3">
              {STATUS_ORDER.filter((s) => statusMap[s]).map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`badge ${ORDER_STATUS_COLORS[status]} text-xs`}>
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.round((statusMap[status] / totalOrders) * 100)}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-sm font-semibold text-gray-700">
                      {statusMap[status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top runners */}
          <div className="card p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Top Runners</h2>
            </div>
            {topRunners.length === 0 ? (
              <p className="text-sm text-gray-400">No completed deliveries yet.</p>
            ) : (
              <div className="space-y-3">
                {topRunners.map((runner, i) => (
                  <div key={runner.runnerId} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                      {runnerMap[runner.runnerId!]?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{runnerMap[runner.runnerId!]}</p>
                      <p className="text-xs text-gray-400">{runner._count.id} deliveries</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">
                      {formatPrice(runner._sum.price ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flags */}
        {pendingFlags.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
              <FlagIcon className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Pending Reports</h2>
              <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                {pendingFlags.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingFlags.map((flag) => (
                <div key={flag.id} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {flag.reporter.name} reported {flag.reported.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{flag.reason}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Order: {flag.order.pickupLocation} → {flag.order.deliveryLocation}
                    </p>
                    {flag.reported.gender && (
                      <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        flag.reported.gender === "FEMALE" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        Runner is {flag.reported.gender.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <FlagActions flagId={flag.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        <div className="card">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {order.pickupLocation} → {order.deliveryLocation}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {order.customer.name}
                    {order.runner ? ` · Runner: ${order.runner.name}` : " · No runner yet"}
                    {" · "}{formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.price)}</p>
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-xs`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
