import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return db.user.findUnique({ where: { supabaseId: user.id } });
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    where: user.role === "RUNNER"
      ? { runnerId: user.id }
      : { customerId: user.id },
    include: {
      customer: { select: { id: true, name: true, dormitory: true, phone: true } },
      runner: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { items, specialInstructions, pickupLocation, deliveryLocation, scheduledPickup, weight, runnerGenderPreference } = body;

  if (!items || !pickupLocation || !deliveryLocation) {
    return NextResponse.json(
      { error: "Items, pickup location, and delivery location are required." },
      { status: 400 }
    );
  }

  const kilos = parseFloat(weight) || 1;
  const parsedItems: string[] = Array.isArray(items) ? items : [];
  const bedsheetSurcharge = parsedItems.includes("Bedsheets") ? 10 : 0;
  const price = kilos * 25 + bedsheetSurcharge;

  const order = await db.order.create({
    data: {
      customerId: user.id,
      items: JSON.stringify(items),
      specialInstructions: specialInstructions || null,
      pickupLocation,
      deliveryLocation,
      scheduledPickup: scheduledPickup ? new Date(scheduledPickup) : null,
      weight: kilos,
      price,
      runnerGenderPreference: runnerGenderPreference || "ANY",
    },
  });

  return NextResponse.json(order, { status: 201 });
}
