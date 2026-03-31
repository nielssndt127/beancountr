import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminClient } from "./admin-client";

const ADMIN_EMAIL = "niels.schnadt@gmail.com";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    redirect("/app/dashboard");
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const startOfMonth  = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  // Fetch all users with counts
  const rawUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      businessName: true,
      plan: true,
      createdAt: true,
      _count: {
        select: {
          invoices: true,
          timeEntries: true,
          expenses: true,
          clients: true,
          quotes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get last activity per user (latest of invoice / timeEntry / expense / quote)
  const [lastInvoices, lastTime, lastExpenses, lastQuotes] = await Promise.all([
    prisma.invoice.groupBy({ by: ["userId"], _max: { createdAt: true } }),
    prisma.timeEntry.groupBy({ by: ["userId"], _max: { createdAt: true } }),
    prisma.expense.groupBy({ by: ["userId"], _max: { createdAt: true } }),
    prisma.quote.groupBy({ by: ["userId"], _max: { createdAt: true } }),
  ]);

  const lastActivityMap: Record<string, Date | null> = {};
  for (const u of rawUsers) {
    const dates = [
      lastInvoices.find(r => r.userId === u.id)?._max.createdAt,
      lastTime.find(r => r.userId === u.id)?._max.createdAt,
      lastExpenses.find(r => r.userId === u.id)?._max.createdAt,
      lastQuotes.find(r => r.userId === u.id)?._max.createdAt,
    ].filter(Boolean) as Date[];
    lastActivityMap[u.id] = dates.length
      ? new Date(Math.max(...dates.map(d => d.getTime())))
      : null;
  }

  const users = rawUsers.map(u => ({
    ...u,
    lastActive: lastActivityMap[u.id] ?? null,
  }));

  // Metrics
  const metrics = {
    total:             users.length,
    pro:               users.filter(u => u.plan === "PRO").length,
    activeThirtyDays:  users.filter(u => lastActivityMap[u.id] && lastActivityMap[u.id]! >= thirtyDaysAgo).length,
    newThisMonth:      users.filter(u => u.createdAt >= startOfMonth).length,
    dormant:           users.filter(u => !lastActivityMap[u.id]).length,
  };

  return <AdminClient users={users} metrics={metrics} />;
}
