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
