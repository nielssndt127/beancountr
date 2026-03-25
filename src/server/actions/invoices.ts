"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { InvoiceStatus } from "@prisma/client";

export async function createInvoice(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const lineItemsJson = formData.get("lineItems") as string;
  const lineItems: { description: string; quantity: number; unitPrice: number }[] = JSON.parse(lineItemsJson);

  const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const vatRate = parseFloat((formData.get("vatRate") as string) || "0") / 100;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: formData.get("clientId") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      issueDate: new Date(formData.get("issueDate") as string),
      dueDate: new Date(formData.get("dueDate") as string),
      status: InvoiceStatus.DRAFT,
      subtotal,
      vatAmount,
      total,
      notes: (formData.get("notes") as string) || null,
      lineItems: {
        create: lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          amount: li.quantity * li.unitPrice,
        })),
      },
    },
  });
  revalidatePath("/app/invoices");
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.invoice.updateMany({
    where: { id, userId: user.id },
    data: { status },
  });
  revalidatePath("/app/invoices");
}

export async function deleteInvoice(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.invoice.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/invoices");
}
