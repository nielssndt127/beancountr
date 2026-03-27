"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export async function createExpense(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.expense.create({
    data: {
      userId: user.id,
      date: new Date(formData.get("date") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: parseFloat(formData.get("amount") as string),
      deductible: formData.get("deductible") === "true",
      receiptUrl: (formData.get("receiptUrl") as string) || null,
    },
  });
  revalidatePath("/app/expenses");
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const receiptUrl = formData.get("receiptUrl") as string;
  await prisma.expense.updateMany({
    where: { id, userId: user.id },
    data: {
      date: new Date(formData.get("date") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: parseFloat(formData.get("amount") as string),
      deductible: formData.get("deductible") === "true",
      // Only update receiptUrl if a value was explicitly passed
      ...(receiptUrl !== null ? { receiptUrl: receiptUrl || null } : {}),
    },
  });
  revalidatePath("/app/expenses");
}

export async function deleteExpense(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.expense.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/expenses");
}
