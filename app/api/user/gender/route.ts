import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { gender } = await req.json();
  if (gender !== "MALE" && gender !== "FEMALE") {
    return NextResponse.json({ error: "Invalid gender." }, { status: 400 });
  }

  await db.user.update({
    where: { supabaseId: user.id },
    data: { gender },
  });

  return NextResponse.json({ ok: true });
}
