"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function deleteAccount(): Promise<{ success: boolean }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const userId = user.id;

  // Delete in dependency order: line items → invoices → time entries → expenses → clients → user
  // InvoiceLineItem cascades from Invoice via onDelete: Cascade, but we delete explicitly to be safe
  await prisma.invoiceLineItem.deleteMany({
    where: { invoice: { userId } },
  });

  await prisma.timeEntry.deleteMany({ where: { userId } });

  await prisma.invoice.deleteMany({ where: { userId } });

  await prisma.expense.deleteMany({ where: { userId } });

  await prisma.client.deleteMany({ where: { userId } });

  await prisma.user.delete({ where: { id: userId } });

  // Sign out from Supabase
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  return { success: true };
}
