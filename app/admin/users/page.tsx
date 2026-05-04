import { db } from "@/lib/db";
import { formatPrice, runnerEarnings } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    where: { role: { in: ["CUSTOMER", "RUNNER"] } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { ordersAsCustomer: true, ordersAsRunner: true } },
    },
  });

  const runnerIds = users.filter((u) => u.role === "RUNNER").map((u) => u.id);
  const earnings = await db.order.groupBy({
    by: ["runnerId"],
    where: { runnerId: { in: runnerIds }, status: "DELIVERED" },
    _sum: { price: true },
  });
  const earningsMap = Object.fromEntries(
    earnings.map((e) => [e.runnerId!, e._sum.price ?? 0])
  );

  const customers = users.filter((u) => u.role === "CUSTOMER");
  const runners = users.filter((u) => u.role === "RUNNER");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">{customers.length} customers · {runners.length} runners</p>
      </div>

      {/* Runners */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Runners</p>
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:grid">
            <span className="col-span-4">Name</span>
            <span className="col-span-3">Email</span>
            <span className="col-span-2">Gender</span>
            <span className="col-span-1 text-center">Jobs</span>
            <span className="col-span-2 text-right">Earnings (90%)</span>
          </div>
          <div className="divide-y divide-gray-100">
            {runners.map((u) => (
              <div key={u.id} className="flex flex-col gap-1 px-6 py-4 hover:bg-gray-50 transition-colors lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                </div>
                <p className="col-span-3 text-sm text-gray-500">{u.email}</p>
                <p className="col-span-2 text-xs text-gray-400 capitalize">{u.gender?.toLowerCase() ?? "—"}</p>
                <p className="col-span-1 text-center text-sm font-semibold text-gray-700">{u._count.ordersAsRunner}</p>
                <p className="col-span-2 text-right text-sm font-bold text-green-600">
                  {formatPrice(runnerEarnings(earningsMap[u.id] ?? 0))}
                </p>
              </div>
            ))}
            {runners.length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-400">No runners yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Customers */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Customers</p>
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:grid">
            <span className="col-span-4">Name</span>
            <span className="col-span-4">Email</span>
            <span className="col-span-2">Dormitory</span>
            <span className="col-span-2 text-right">Orders</span>
          </div>
          <div className="divide-y divide-gray-100">
            {customers.map((u) => (
              <div key={u.id} className="flex flex-col gap-1 px-6 py-4 hover:bg-gray-50 transition-colors lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                </div>
                <p className="col-span-4 text-sm text-gray-500">{u.email}</p>
                <p className="col-span-2 text-sm text-gray-400">{u.dormitory ?? "—"}</p>
                <p className="col-span-2 text-right text-sm font-semibold text-gray-700">{u._count.ordersAsCustomer}</p>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="px-6 py-8 text-sm text-gray-400">No customers yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
