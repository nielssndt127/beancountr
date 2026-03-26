import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to find existing user first
  const existing = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (existing) return existing;

  // Check if email is already taken by a seed/old record and update it
  const byEmail = await prisma.user.findUnique({
    where: { email: user.email! },
  });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { supabaseUserId: user.id },
    });
  }

  // Create a fresh user record
  return prisma.user.create({
    data: {
      supabaseUserId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? null,
    },
  });
}
