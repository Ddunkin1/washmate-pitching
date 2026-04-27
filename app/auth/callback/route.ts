import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const existing = await db.user.findUnique({
        where: { supabaseId: data.user.id },
      });

      if (!existing) {
        const meta = data.user.user_metadata;
        await db.user.create({
          data: {
            supabaseId: data.user.id,
            email: data.user.email!,
            name: meta.name || "Student",
            role: meta.role === "RUNNER" ? "RUNNER" : "CUSTOMER",
            studentId: meta.studentId || null,
            dormitory: meta.dormitory || null,
            phone: meta.phone || null,
          },
        });
      }

      return NextResponse.redirect(`${origin}/login?verified=1`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
