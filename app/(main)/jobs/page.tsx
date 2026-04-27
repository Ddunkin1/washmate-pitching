import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { BriefcaseIcon, MapPinIcon, WeightIcon } from "lucide-react";
import { AcceptJobButton } from "./accept-job-button";

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RUNNER") redirect("/dashboard");

  const jobs = await db.order.findMany({
    where: { status: "PENDING", runnerId: null },
    include: { customer: { select: { name: true, dormitory: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
        <p className="mt-1 text-sm text-gray-500">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"} waiting for a runner
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <BriefcaseIcon className="h-14 w-14 text-gray-200" />
          <p className="mt-4 text-base font-medium text-gray-500">No available jobs right now.</p>
          <p className="mt-1 text-sm text-gray-400">Check back later — new orders get posted frequently.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const items = JSON.parse(job.items) as string[];
            return (
              <div key={job.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {job.customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{job.customer.name}</p>
                        <p className="text-xs text-gray-400">{job.customer.dormitory}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">Pickup:</span> {job.pickupLocation}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">Deliver to:</span> {job.deliveryLocation}
                      </div>
                      {job.weight && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <WeightIcon className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium">Weight:</span> {job.weight} kg
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <span key={item} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                          {item}
                        </span>
                      ))}
                    </div>
                    {job.specialInstructions && (
                      <p className="mt-2 text-xs text-gray-400 italic">Note: {job.specialInstructions}</p>
                    )}
                    <p className="mt-3 text-xs text-gray-400">Posted {formatDate(job.createdAt)}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-3">
                    <p className="text-2xl font-bold text-green-600">{formatPrice(job.price)}</p>
                    <AcceptJobButton orderId={job.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
