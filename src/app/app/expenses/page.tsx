import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "./expenses-client";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return <ExpensesClient expenses={expenses} />;
}
