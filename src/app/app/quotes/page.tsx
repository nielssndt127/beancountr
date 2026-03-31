import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuotesClient } from "./quotes-client";

export default async function QuotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [quotes, clients] = await Promise.all([
    prisma.quote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lineItems: true,
        invoices: { select: { id: true, invoiceNumber: true } },
      },
    }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const prefix = user.quotePrefix || "QUO";
  const lastNum = quotes
    .map((q) => parseInt(q.quoteNumber.replace(/\D/g, "")) || 0)
    .reduce((max, n) => Math.max(max, n), 0);
  const nextQuoteNumber = `${prefix}-${String(lastNum + 1).padStart(3, "0")}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.beancountr.co.uk";

  return (
    <QuotesClient
      quotes={quotes}
      clients={clients}
      nextQuoteNumber={nextQuoteNumber}
      paymentTerms={user.paymentTerms}
      isPro={user.plan === "PRO"}
      appUrl={appUrl}
    />
  );
}
