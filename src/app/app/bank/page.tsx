import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BankClient } from "./bank-client";

export default async function BankPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [transactions, openInvoices] = await Promise.all([
    prisma.bankTransaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: {
        matches: {
          include: { invoice: { include: { client: { select: { name: true } } } } },
        },
      },
    }),
    prisma.invoice.findMany({
      where: { userId: user.id, status: { in: ["SENT", "OVERDUE"] } },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return <BankClient transactions={transactions} openInvoices={openInvoices} isPro={user.plan === "PRO"} />;
}
