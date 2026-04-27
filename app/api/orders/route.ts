import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where =
    session.user.role === "RUNNER"
      ? { runnerId: session.user.id }
      : { customerId: session.user.id };

  const orders = await db.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, dormitory: true, phone: true } },
      runner: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    items,
    specialInstructions,
    pickupLocation,
    deliveryLocation,
    scheduledPickup,
    weight,
  } = body;

  if (!items || !pickupLocation || !deliveryLocation) {
    return NextResponse.json(
      { error: "Items, pickup location, and delivery location are required." },
      { status: 400 }
    );
  }

  const kilos = parseFloat(weight) || 1;
  const price = kilos * 50;

  const order = await db.order.create({
    data: {
      customerId: session.user.id,
      items: JSON.stringify(items),
      specialInstructions: specialInstructions || null,
      pickupLocation,
      deliveryLocation,
      scheduledPickup: scheduledPickup ? new Date(scheduledPickup) : null,
      weight: kilos,
      price,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
