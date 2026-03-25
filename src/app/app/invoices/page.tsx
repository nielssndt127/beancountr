import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { InvoicesClient } from "./invoices-client";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        lineItems: true,
      },
    }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Next invoice number suggestion
  const prefix = user.invoicePrefix || "INV";
  const lastNum = invoices
    .map((inv) => parseInt(inv.invoiceNumber.replace(/\D/g, "")) || 0)
    .reduce((max, n) => Math.max(max, n), 0);
  const nextInvoiceNumber = `${prefix}-${String(lastNum + 1).padStart(3, "0")}`;

  return <InvoicesClient invoices={invoices} clients={clients} nextInvoiceNumber={nextInvoiceNumber} paymentTerms={user.paymentTerms} />;
}
