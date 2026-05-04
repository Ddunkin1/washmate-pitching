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
  ActivityIcon,
  TrophyIcon,
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
    activeOrdersCount,
    ordersByStatus,
    recentOrders,
    topRunners,
    pendingFlags,
  ] = await Promise.all([
    db.order.count(),
    db.order.aggregate({ where: { status: "DELIVERED" }, _sum: { price: true } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "RUNNER" } }),
    db.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    db.order.groupBy({ by: ["status"], _count: { id: true } }),
    db.order.findMany({
      take: 8,
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

  const ACTIVE_STATUSES = ["PENDING", "ACCEPTED", "PICKED_UP", "WASHING", "READY"];
  const DONE_STATUSES = ["DELIVERED", "CANCELLED"];
  const STATUS_ORDER = [...ACTIVE_STATUSES, ...DONE_STATUSES];

  const RANK_COLORS = [
    "bg-yellow-400 text-white",
    "bg-gray-300 text-white",
    "bg-orange-300 text-white",
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-6 lg:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShirtIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">WashMate · Business Overview</p>
            </div>
          </div>
          {pendingFlags.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2">
              <FlagIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">
                {pendingFlags.length} pending report{pendingFlags.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 space-y-8">

        {/* ── Section 1: Key Metrics ── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Key Metrics</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Revenue</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">{formatPrice(totalRevenue._sum.price ?? 0)}</p>
                  <p className="mt-1 text-xs text-gray-400">from delivered orders</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
                  <WalletIcon className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Orders</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="mt-1 text-xs text-blue-500 font-medium">{activeOrdersCount} currently active</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <ClipboardListIcon className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Customers</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{totalCustomers}</p>
                  <p className="mt-1 text-xs text-gray-400">registered users</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                  <UsersIcon className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Runners</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{totalRunners}</p>
                  <p className="mt-1 text-xs text-gray-400">registered runners</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                  <BriefcaseIcon className="h-4 w-4 text-orange-500" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 2: Pending Reports (shown only if there are any) ── */}
        {pendingFlags.length > 0 && (
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">⚠ Needs Attention</p>
            <div className="card border-red-200 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-6 py-4">
                <FlagIcon className="h-4 w-4 text-red-500" />
                <h2 className="font-semibold text-red-700">Pending Reports</h2>
                <span className="ml-auto rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  {pendingFlags.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingFlags.map((flag) => (
                  <div key={flag.id} className="flex items-start justify-between gap-4 px-6 py-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        <span className="text-blue-600">{flag.reporter.name}</span>
                        {" reported "}
                        <span className="text-red-600">{flag.reported.name}</span>
                      </p>
                      <p className="text-sm text-gray-600">{flag.reason}</p>
                      <p className="text-xs text-gray-400">
                        Order: {flag.order.pickupLocation} → {flag.order.deliveryLocation}
                      </p>
                      {flag.reported.gender && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
          </section>
        )}

        {/* ── Section 3: Orders & Runners ── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Activity</p>
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Orders by Status */}
            <div className="card p-6">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                  <ActivityIcon className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Orders by Status</h2>
              </div>

              <div className="space-y-3">
                {STATUS_ORDER.filter((s) => statusMap[s]).map((status) => {
                  const count = statusMap[status];
                  const pct = Math.round((count / totalOrders) * 100);
                  const isActive = ACTIVE_STATUSES.includes(status);
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">{ORDER_STATUS_LABELS[status]}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{pct}%</span>
                          <span className="w-5 text-right text-sm font-bold text-gray-800">{count}</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${isActive ? "bg-blue-500" : status === "DELIVERED" ? "bg-green-500" : "bg-gray-300"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Runners */}
            <div className="card p-6 lg:col-span-2">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
                  <TrophyIcon className="h-4 w-4 text-orange-500" />
                </div>
                <h2 className="font-semibold text-gray-900">Top Runners</h2>
                <span className="ml-1 text-xs text-gray-400">by total earnings</span>
              </div>

              {topRunners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BriefcaseIcon className="h-10 w-10 text-gray-200" />
                  <p className="mt-3 text-sm text-gray-400">No completed deliveries yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topRunners.map((runner, i) => (
                    <div key={runner.runnerId} className={`flex items-center gap-3 rounded-xl p-3 ${i === 0 ? "bg-yellow-50 border border-yellow-100" : "bg-gray-50"}`}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${RANK_COLORS[i] ?? "bg-gray-100 text-gray-400"}`}>
                        {i + 1}
                      </span>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                        {runnerMap[runner.runnerId!]?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{runnerMap[runner.runnerId!]}</p>
                        <p className="text-xs text-gray-400">{runner._count.id} deliveries completed</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-green-600">
                        {formatPrice(runner._sum.price ?? 0)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ── Section 4: Recent Orders ── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Recent Orders</p>
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <span className="col-span-4">Route</span>
              <span className="col-span-2">Customer</span>
              <span className="col-span-2">Runner</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-1 text-right">Price</span>
              <span className="col-span-1 text-right">Status</span>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <p className="col-span-4 truncate text-sm font-medium text-gray-900">
                    {order.pickupLocation} → {order.deliveryLocation}
                  </p>
                  <p className="col-span-2 truncate text-sm text-gray-600">{order.customer.name}</p>
                  <p className="col-span-2 truncate text-sm text-gray-600">
                    {order.runner?.name ?? <span className="text-gray-300 italic">None yet</span>}
                  </p>
                  <p className="col-span-2 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  <p className="col-span-1 text-right text-sm font-bold text-gray-900">{formatPrice(order.price)}</p>
                  <div className="col-span-1 flex justify-end">
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-xs`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
