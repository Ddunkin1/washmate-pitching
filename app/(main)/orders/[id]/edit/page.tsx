import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { parseItems } from "@/lib/utils";
import { EditOrderForm } from "./edit-form";

export default async function EditOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const order = await db.order.findUnique({ where: { id: params.id } });

  if (!order) notFound();
  if (order.customerId !== user.id) redirect(`/orders/${params.id}`);
  if (order.status !== "PENDING") redirect(`/orders/${params.id}`);

  const items = parseItems(order.items);

  return (
    <EditOrderForm
      orderId={order.id}
      initialItems={items}
      initialForm={{
        pickupLocation: order.pickupLocation,
        deliveryLocation: order.deliveryLocation,
        weight: order.weight?.toString() ?? "1",
        scheduledPickup: order.scheduledPickup
          ? new Date(order.scheduledPickup).toISOString().slice(0, 16)
          : "",
        specialInstructions: order.specialInstructions ?? "",
      }}
    />
  );
}
