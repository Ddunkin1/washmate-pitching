import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return db.user.findUnique({ where: { supabaseId: user.id } });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await db.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.customerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!order.runnerId) return NextResponse.json({ error: "No runner assigned." }, { status: 400 });

  const existing = await db.flag.findFirst({
    where: { orderId: params.id, reporterId: user.id },
  });
  if (existing) return NextResponse.json({ error: "You already flagged this order." }, { status: 409 });

  const { reason } = await req.json();
  if (!reason?.trim()) return NextResponse.json({ error: "Reason is required." }, { status: 400 });

  const flag = await db.flag.create({
    data: {
      orderId: params.id,
      reporterId: user.id,
      reportedId: order.runnerId,
      reason,
    },
  });

  return NextResponse.json(flag, { status: 201 });
}
