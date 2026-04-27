import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return db.user.findUnique({ where: { supabaseId: user.id } });
}
