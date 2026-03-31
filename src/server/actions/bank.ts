"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export type TxInput = {
  date: string;
  amount: number;
  description: string;
  reference?: string;
};

export async function importBankTransactions(txs: TxInput[]): Promise<{ error?: string; count?: number }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.bankTransaction.createMany({
    data: txs.map((t) => ({
      userId: user.id,
      date: new Date(t.date),
      amount: t.amount,
      description: t.description,
      reference: t.reference ?? null,
    })),
  });

  revalidatePath("/app/bank");
  return { count: txs.length };
}

export async function confirmMatch(invoiceId: string, bankTransactionId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const [invoice, tx] = await Promise.all([
    prisma.invoice.findFirst({ where: { id: invoiceId, userId: user.id } }),
    prisma.bankTransaction.findFirst({ where: { id: bankTransactionId, userId: user.id } }),
  ]);
  if (!invoice || !tx) return { error: "Not found" };

  await prisma.$transaction([
    prisma.invoiceMatch.upsert({
      where: { invoiceId_bankTransactionId: { invoiceId, bankTransactionId } },
      create: { invoiceId, bankTransactionId, confirmedAt: new Date() },
      update: { confirmedAt: new Date() },
    }),
    prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } }),
  ]);

  revalidatePath("/app/bank");
  revalidatePath("/app/invoices");
  return {};
}

export async function deleteBankTransaction(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.bankTransaction.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/bank");
}
