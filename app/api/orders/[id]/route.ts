import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return db.user.findUnique({ where: { supabaseId: user.id } });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true, dormitory: true, phone: true } },
      runner: { select: { id: true, name: true, phone: true } },
      review: true,
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const hasAccess =
    order.customerId === user.id ||
    order.runnerId === user.id ||
    user.role === "RUNNER";

  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(order);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "PENDING") return NextResponse.json({ error: "Only pending orders can be edited." }, { status: 400 });

  const { items, pickupLocation, deliveryLocation, weight, scheduledPickup, specialInstructions } = await req.json();

  if (!items || items.length === 0) return NextResponse.json({ error: "Select at least one item." }, { status: 400 });
  if (!pickupLocation || !deliveryLocation) return NextResponse.json({ error: "Pickup and delivery locations are required." }, { status: 400 });

  const kilos = parseFloat(weight) || 1;
  const price = kilos * 25;

  const updated = await db.order.update({
    where: { id: params.id },
    data: {
      items: JSON.stringify(items),
      pickupLocation,
      deliveryLocation,
      weight: kilos,
      price,
      scheduledPickup: scheduledPickup ? new Date(scheduledPickup) : null,
      specialInstructions: specialInstructions || null,
    },
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();

  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const STATUS_FLOW: Record<string, string> = {
    accept: "ACCEPTED",
    pickup: "PICKED_UP",
    wash: "WASHING",
    ready: "READY",
    deliver: "DELIVERED",
    cancel: "CANCELLED",
  };

  const newStatus = STATUS_FLOW[action];
  if (!newStatus) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const updateData: Record<string, unknown> = { status: newStatus };

  if (action === "accept") {
    if (user.role !== "RUNNER") {
      return NextResponse.json({ error: "Only runners can accept orders." }, { status: 403 });
    }
    updateData.runnerId = user.id;
  }

  const updated = await db.order.update({
    where: { id: params.id },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true, dormitory: true, phone: true } },
      runner: { select: { id: true, name: true, phone: true } },
    },
  });

  return NextResponse.json(updated);
}
