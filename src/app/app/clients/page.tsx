import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { ClientsClient } from "./clients-client";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { invoices: true, timeEntries: true } },
    },
  });

  return <ClientsClient clients={clients} />;
}
