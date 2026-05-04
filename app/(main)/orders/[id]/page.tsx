import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PhoneIcon, MapPinIcon, WeightIcon } from "lucide-react";
import { formatPrice, formatDate, parseItems } from "@/lib/utils";
import { OrderDetailClient } from "./order-detail-client";
import { FlagRunnerButton } from "./flag-runner-button";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true, dormitory: true, phone: true } },
      runner: { select: { id: true, name: true, phone: true } },
    },
  });

  const [existingReview, existingFlag] = await Promise.all([
    order ? db.review.findFirst({ where: { orderId: params.id, reviewerId: user.id } }) : null,
    order ? db.flag.findFirst({ where: { orderId: params.id, reporterId: user.id } }) : null,
  ]);

  if (!order) notFound();

  const isRunner = user.role === "RUNNER";
  const isCustomer = order.customerId === user.id;
  const isAssignedRunner = order.runnerId === user.id;

  const items = parseItems(order.items);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/orders" className="text-gray-400 hover:text-gray-600">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-xs text-gray-400 font-mono">{order.id}</p>
        </div>
      </div>

      <OrderDetailClient
        orderId={order.id}
        initialStatus={order.status}
        isRunner={isRunner}
        isCustomer={isCustomer}
        isAssignedRunner={isAssignedRunner}
        existingReview={!!existingReview}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Laundry Items</h2>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                <span className="font-bold">{item.qty}×</span>
                {item.name}
              </span>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-100 p-3">
              <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide mb-1">Special Instructions</p>
              <p className="text-sm text-yellow-800">{order.specialInstructions}</p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Pickup:</span> {order.pickupLocation}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Delivery:</span> {order.deliveryLocation}
            </div>
            {order.weight && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <WeightIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Weight:</span> {order.weight} kg
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Price</h2>
            <p className="text-4xl font-bold text-blue-600">{formatPrice(order.price)}</p>
            <p className="mt-1 text-xs text-gray-400">Posted on {formatDate(order.createdAt)}</p>
            {order.scheduledPickup && (
              <p className="mt-1 text-xs text-gray-400">Scheduled pickup: {formatDate(order.scheduledPickup)}</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-semibold text-gray-900">People</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {order.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-xs text-gray-400">Customer · {order.customer.dormitory}</p>
                </div>
                {order.customer.phone && (
                  <a href={`tel:${order.customer.phone}`} className="ml-auto text-gray-400 hover:text-blue-600">
                    <PhoneIcon className="h-4 w-4" />
                  </a>
                )}
              </div>

              {order.runner ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                    {order.runner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.runner.name}</p>
                    <p className="text-xs text-gray-400">Runner</p>
                  </div>
                  {order.runner.phone && (
                    <a href={`tel:${order.runner.phone}`} className="ml-auto text-gray-400 hover:text-green-600">
                      <PhoneIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">?</div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">No runner yet</p>
                    <p className="text-xs text-gray-400">Waiting for a runner to accept</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCustomer && order.runnerId && !existingFlag && (
        <div className="mt-4 flex justify-end">
          <FlagRunnerButton orderId={order.id} />
        </div>
      )}
      {isCustomer && order.runnerId && existingFlag && (
        <p className="mt-4 text-right text-xs text-orange-600 font-medium">
          Flag submitted ({existingFlag.status.toLowerCase()}). Admin is reviewing.
        </p>
      )}
    </div>
  );
}
