import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PhoneIcon, MapPinIcon, WeightIcon } from "lucide-react";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { OrderActions } from "./order-actions";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true, dormitory: true, phone: true } },
      runner: { select: { id: true, name: true, phone: true } },
    },
  });

  if (!order) notFound();

  const isRunner = session?.user?.role === "RUNNER";
  const isCustomer = order.customerId === session?.user?.id;
  const isAssignedRunner = order.runnerId === session?.user?.id;

  const items = JSON.parse(order.items) as string[];

  const STATUS_STEPS = [
    "PENDING",
    "ACCEPTED",
    "PICKED_UP",
    "WASHING",
    "READY",
    "DELIVERED",
  ];

  const currentStep = STATUS_STEPS.indexOf(order.status);

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
        <span className={`ml-auto badge ${ORDER_STATUS_COLORS[order.status]} text-sm px-3 py-1`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Progress Bar */}
      {order.status !== "CANCELLED" && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Order Progress</h2>
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((step, index) => (
              <div key={step} className="flex flex-1 items-center gap-1">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      index < currentStep ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Posted</span>
            <span>Accepted</span>
            <span>Picked Up</span>
            <span>Washing</span>
            <span>Ready</span>
            <span>Done</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Info */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Laundry Items</h2>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {item}
              </span>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-100 p-3">
              <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide mb-1">
                Special Instructions
              </p>
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

        {/* People & Price */}
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Price</h2>
            <p className="text-4xl font-bold text-blue-600">{formatPrice(order.price)}</p>
            <p className="mt-1 text-xs text-gray-400">
              Posted on {formatDate(order.createdAt)}
            </p>
            {order.scheduledPickup && (
              <p className="mt-1 text-xs text-gray-400">
                Scheduled pickup: {formatDate(order.scheduledPickup)}
              </p>
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
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="ml-auto text-gray-400 hover:text-blue-600"
                  >
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
                    <a
                      href={`tel:${order.runner.phone}`}
                      className="ml-auto text-gray-400 hover:text-green-600"
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
                    ?
                  </div>
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

      {/* Actions */}
      <div className="mt-6">
        <OrderActions
          orderId={order.id}
          status={order.status}
          isRunner={isRunner}
          isCustomer={isCustomer}
          isAssignedRunner={isAssignedRunner}
        />
      </div>
    </div>
  );
}
