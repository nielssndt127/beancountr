"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { InvoiceStatus } from "@prisma/client";
import { sendInvoiceEmail } from "@/lib/email";

export async function createInvoice(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  if (user.plan === "FREE") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await prisma.invoice.count({ where: { userId: user.id, createdAt: { gte: startOfMonth } } });
    if (count >= 5) {
      return { error: "Free accounts are limited to 5 invoices per month. Upgrade to Pro for unlimited invoices." };
    }
  }

  const lineItemsJson = formData.get("lineItems") as string;
  const lineItems: { description: string; quantity: number; unitPrice: number }[] = JSON.parse(lineItemsJson);

  const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const vatRate = parseFloat((formData.get("vatRate") as string) || "0") / 100;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  const recipientEmail = (formData.get("recipientEmail") as string) || null;

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
      recipientEmail,
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
  return {};
}

export async function sendInvoice(id: string, recipientEmail: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { client: true },
  });
  if (!invoice) return { error: "Invoice not found" };

  try {
    await sendInvoiceEmail({
      to: recipientEmail,
      senderName: user.fullName ?? user.email,
      businessName: user.businessName,
      invoiceNumber: invoice.invoiceNumber,
      publicId: invoice.publicId,
      total: invoice.total,
      dueDate: invoice.dueDate,
      isPro: user.plan === "PRO",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send email" };
  }

  await prisma.invoice.update({
    where: { id },
    data: {
      status: InvoiceStatus.SENT,
      recipientEmail,
    },
  });

  revalidatePath("/app/invoices");
  return {};
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

// Called from the public invoice page — marks viewed_at and notifies freelancer (Pro only)
export async function markInvoiceViewed(publicId: string) {
  await prisma.invoice.updateMany({
    where: { publicId, viewedAt: null },
    data: { viewedAt: new Date() },
  });
}
