import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Find all SENT invoices past their due date that have a recipient email
  // Only for Pro users (automated reminders are a Pro feature)
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: "SENT",
      dueDate: { lt: now },
      recipientEmail: { not: null },
      user: { plan: "PRO" },
    },
    include: {
      user: { select: { fullName: true, businessName: true } },
    },
  });

  let sent = 0;
  let errors = 0;

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / 86400000);

    // Mark as overdue
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "OVERDUE" },
    });

    // Send reminder to client
    try {
      await sendReminderEmail({
        to: invoice.recipientEmail!,
        senderName: invoice.user.fullName ?? "Your supplier",
        businessName: invoice.user.businessName,
        invoiceNumber: invoice.invoiceNumber,
        publicId: invoice.publicId,
        total: invoice.total,
        dueDate: invoice.dueDate,
        daysOverdue,
      });
      sent++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ processed: overdueInvoices.length, sent, errors });
}
