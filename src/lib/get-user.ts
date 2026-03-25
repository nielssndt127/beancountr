import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Upsert user record so first login creates the Prisma row
  const dbUser = await prisma.user.upsert({
    where: { supabaseUserId: user.id },
    update: {},
    create: {
      supabaseUserId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? null,
    },
  });

  return dbUser;
}
