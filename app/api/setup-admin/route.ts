import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "washmate-setup-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmail = "admin@washmate.com";
  const adminPassword = "adminpassword";

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Check if already exists in Prisma
  const existing = await db.user.findFirst({ where: { email: adminEmail } });
  if (existing) {
    return NextResponse.json({ message: "Admin already exists", email: adminEmail });
  }

  // Create Supabase auth user (no email confirmation needed)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: "Admin", role: "ADMIN" },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Failed to create auth user" }, { status: 500 });
  }

  // Create Prisma user with ADMIN role
  await db.user.create({
    data: {
      supabaseId: data.user.id,
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      gender: "MALE",
    },
  });

  return NextResponse.json({
    message: "Admin account created successfully",
    email: adminEmail,
    password: adminPassword,
  });
}
