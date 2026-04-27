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
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Can only review delivered orders." }, { status: 400 });
  }

  const isCustomer = order.customerId === user.id;
  const isRunner = order.runnerId === user.id;

  if (!isCustomer && !isRunner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.review.findFirst({
    where: { orderId: params.id, reviewerId: user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this order." }, { status: 409 });
  }

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const revieweeId = isCustomer ? order.runnerId! : order.customerId;

  const review = await db.review.create({
    data: {
      orderId: params.id,
      reviewerId: user.id,
      revieweeId,
      rating: parseInt(rating),
      comment: comment || null,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
