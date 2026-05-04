import { db } from "@/lib/db";
import { FlagIcon } from "lucide-react";
import { FlagActions } from "../flag-actions";

export default async function AdminFlagsPage() {
  const flags = await db.flag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true } },
      reported: { select: { name: true, gender: true } },
      order: { select: { id: true, pickupLocation: true, deliveryLocation: true } },
    },
  });

  const pending = flags.filter((f) => f.status === "PENDING");
  const resolved = flags.filter((f) => f.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">{pending.length} pending · {resolved.length} resolved</p>
      </div>

      {pending.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Pending</p>
          <div className="card divide-y divide-gray-100">
            {pending.map((flag) => (
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
        </section>
      )}

      {pending.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <FlagIcon className="h-10 w-10 text-gray-200" />
          <p className="mt-3 text-sm font-medium text-gray-500">No pending reports</p>
        </div>
      )}

      {resolved.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Resolved</p>
          <div className="card divide-y divide-gray-100">
            {resolved.map((flag) => (
              <div key={flag.id} className="flex items-start justify-between gap-4 px-6 py-4 opacity-60">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {flag.reporter.name} reported {flag.reported.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{flag.reason}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  flag.status === "REVIEWED" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {flag.status === "REVIEWED" ? "Reviewed" : "Dismissed"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
