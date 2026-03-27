"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export async function createExpense(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const expenseType = (formData.get("expenseType") as string) || "EXPENSE";
  const miles = parseFloat(formData.get("miles") as string) || 0;
  const mileageRate = parseFloat(formData.get("mileageRate") as string) || 0.45;
  const amount = expenseType === "MILEAGE"
    ? miles * mileageRate
    : parseFloat(formData.get("amount") as string);
  await prisma.expense.create({
    data: {
      userId: user.id,
      date: new Date(formData.get("date") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount,
      deductible: formData.get("deductible") === "true",
      receiptUrl: (formData.get("receiptUrl") as string) || null,
      supplier: (formData.get("supplier") as string) || null,
      notes: (formData.get("notes") as string) || null,
      vatAmount: parseFloat(formData.get("vatAmount") as string) || 0,
      paymentMethod: (formData.get("paymentMethod") as string) || null,
      expenseType,
      miles,
      mileageRate,
    },
  });
  revalidatePath("/app/expenses");
}

export async function updateExpense(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const receiptUrl = formData.get("receiptUrl") as string;
  const expenseType = (formData.get("expenseType") as string) || "EXPENSE";
  const miles = parseFloat(formData.get("miles") as string) || 0;
  const mileageRate = parseFloat(formData.get("mileageRate") as string) || 0.45;
  const amount = expenseType === "MILEAGE"
    ? miles * mileageRate
    : parseFloat(formData.get("amount") as string);
  await prisma.expense.updateMany({
    where: { id, userId: user.id },
    data: {
      date: new Date(formData.get("date") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount,
      deductible: formData.get("deductible") === "true",
      // Only update receiptUrl if a value was explicitly passed
      ...(receiptUrl !== null ? { receiptUrl: receiptUrl || null } : {}),
      supplier: (formData.get("supplier") as string) || null,
      notes: (formData.get("notes") as string) || null,
      vatAmount: parseFloat(formData.get("vatAmount") as string) || 0,
      paymentMethod: (formData.get("paymentMethod") as string) || null,
      expenseType,
      miles,
      mileageRate,
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
