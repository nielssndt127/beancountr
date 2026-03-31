"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { QuoteStatus, InvoiceStatus } from "@prisma/client";
import { sendQuoteEmail } from "@/lib/email";

export async function createQuote(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const lineItemsJson = formData.get("lineItems") as string;
  const lineItems: { description: string; quantity: number; unitPrice: number }[] = JSON.parse(lineItemsJson);

  const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const vatRate = parseFloat((formData.get("vatRate") as string) || "0") / 100;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  await prisma.quote.create({
    data: {
      userId: user.id,
      clientId: formData.get("clientId") as string,
      quoteNumber: formData.get("quoteNumber") as string,
      issueDate: new Date(formData.get("issueDate") as string),
      expiryDate: new Date(formData.get("expiryDate") as string),
      status: QuoteStatus.DRAFT,
      subtotal,
      vatAmount,
      total,
      notes: (formData.get("notes") as string) || null,
      recipientEmail: (formData.get("recipientEmail") as string) || null,
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

  revalidatePath("/app/quotes");
  return {};
}

export async function sendQuote(id: string, recipientEmail: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { client: true },
  });
  if (!quote) return { error: "Quote not found" };

  try {
    await sendQuoteEmail({
      to: recipientEmail,
      senderName: user.fullName ?? user.email,
      businessName: user.businessName,
      quoteNumber: quote.quoteNumber,
      publicId: quote.publicId,
      total: quote.total,
      expiryDate: quote.expiryDate,
      isPro: user.plan === "PRO",
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send email" };
  }

  await prisma.quote.update({
    where: { id },
    data: { status: QuoteStatus.SENT, recipientEmail },
  });

  revalidatePath("/app/quotes");
  return {};
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.quote.updateMany({
    where: { id, userId: user.id },
    data: { status },
  });
  revalidatePath("/app/quotes");
}

export async function deleteQuote(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.quote.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/quotes");
}

export async function markQuoteViewed(publicId: string) {
  await prisma.quote.updateMany({
    where: { publicId, viewedAt: null },
    data: { viewedAt: new Date() },
  });
}

export async function convertToInvoice(
  quoteId: string,
  adjustmentNote: string | null,
  lineItemOverrides?: { description: string; quantity: number; unitPrice: number }[]
): Promise<{ error?: string; invoiceId?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, userId: user.id },
    include: { lineItems: true, client: true },
  });
  if (!quote) return { error: "Quote not found" };

  // Use overridden line items if provided, else copy from quote
  const items = lineItemOverrides ?? quote.lineItems.map((li) => ({
    description: li.description,
    quantity: li.quantity,
    unitPrice: li.unitPrice,
  }));

  const subtotal = items.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const vatRate = quote.vatAmount > 0 ? quote.vatAmount / quote.subtotal : 0;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  // Generate invoice number
  const prefix = user.invoicePrefix || "INV";
  const existing = await prisma.invoice.findMany({
    where: { userId: user.id },
    select: { invoiceNumber: true },
  });
  const lastNum = existing
    .map((inv) => parseInt(inv.invoiceNumber.replace(/\D/g, "")) || 0)
    .reduce((max, n) => Math.max(max, n), 0);
  const invoiceNumber = `${prefix}-${String(lastNum + 1).padStart(3, "0")}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + user.paymentTerms);

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: quote.clientId,
      quoteId: quote.id,
      invoiceNumber,
      issueDate: new Date(),
      dueDate,
      status: InvoiceStatus.DRAFT,
      subtotal,
      vatAmount,
      total,
      notes: quote.notes,
      adjustmentNote: adjustmentNote || null,
      recipientEmail: quote.recipientEmail,
      lineItems: {
        create: items.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          amount: li.quantity * li.unitPrice,
        })),
      },
    },
  });

  // Mark quote as accepted
  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: QuoteStatus.ACCEPTED },
  });

  revalidatePath("/app/quotes");
  revalidatePath("/app/invoices");
  return { invoiceId: invoice.id };
}
