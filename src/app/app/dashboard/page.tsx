import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateFinancials, formatCurrency, formatDate } from "@/lib/calculations";
import { TrendingUp, TrendingDown, Wallet, Shield, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { InvoiceStatus } from "@prisma/client";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-stone-100 text-stone-600" },
  SENT: { label: "Sent", className: "bg-blue-50 text-blue-600" },
  PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-600" },
  OVERDUE: { label: "Overdue", className: "bg-red-50 text-red-600" },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [invoices, timeEntries, expenses, recentInvoices, recentTimeEntries] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: user.id, issueDate: { gte: startOfMonth, lte: endOfMonth } },
      select: { total: true, status: true },
    }),
    prisma.timeEntry.findMany({
      where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { hours: true, rate: true },
    }),
    prisma.expense.findMany({
      where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    prisma.timeEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  // Income: paid invoice totals + uninvoiced time entry value
  const invoiceIncome = invoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((sum, i) => sum + i.total, 0);
  const timeIncome = timeEntries.reduce((sum, t) => sum + t.hours * t.rate, 0);
  const income = invoiceIncome || timeIncome; // prefer invoices if any are paid, else use time
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unpaidInvoices = recentInvoices.filter((i) => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE).reduce((sum, i) => sum + i.total, 0);

  const financials = calculateFinancials(income, totalExpenses, user.taxReserveRate, user.pensionRate);

  const monthName = now.toLocaleString("en-GB", { month: "long" });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">{monthName} {now.getFullYear()} overview</p>
      </div>

      {unpaidInvoices > 0 && (
        <div className="flex items-center justify-between rounded-2xl px-5 py-4" style={{ background: "oklch(0.97 0.05 195)" }}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.72 0.22 48)" }} />
            <p className="text-sm font-medium text-stone-800">
              {formatCurrency(unpaidInvoices)} in unpaid invoices
            </p>
          </div>
          <Link href="/app/invoices" className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: "oklch(0.72 0.22 48)" }}>
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Income</span>
            <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-stone-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-data">{formatCurrency(financials.income)}</p>
          <p className="text-xs text-stone-400 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-stone-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-data">{formatCurrency(financials.expenses)}</p>
          <p className="text-xs text-stone-400 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Profit</span>
            <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-stone-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-data">{formatCurrency(financials.profit)}</p>
          <p className="text-xs text-stone-400 mt-1">After expenses</p>
        </div>

        <div className="rounded-2xl p-5 card-shadow" style={{ background: "oklch(0.98 0.02 60)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Tax reserve</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-900 font-data">{formatCurrency(financials.taxReserve)}</p>
          <p className="text-xs text-amber-600 mt-1">Set aside · {Math.round(user.taxReserveRate * 100)}% of profit</p>
        </div>

        <div className="rounded-2xl p-5 card-shadow" style={{ background: "oklch(0.97 0.02 240)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Pension</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-900 font-data">{formatCurrency(financials.pensionReserve)}</p>
          <p className="text-xs text-blue-600 mt-1">Set aside · {Math.round(user.pensionRate * 100)}% of profit</p>
        </div>

        <div className="rounded-2xl p-5 card-shadow" style={{ background: "oklch(0.97 0.04 145)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Safe to spend</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-900 font-data">{formatCurrency(financials.safeToSpend)}</p>
          <p className="text-xs text-emerald-600 mt-1">After all reserves</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between">
            <h2 className="font-semibold text-stone-800 text-sm">Recent invoices</h2>
            <Link href="/app/invoices" className="text-xs font-medium transition-colors" style={{ color: "oklch(0.72 0.22 48)" }}>View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-stone-400">No invoices yet</p>
              <Link href="/app/invoices" className="text-xs font-medium mt-1 block" style={{ color: "oklch(0.72 0.22 48)" }}>Create one →</Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recentInvoices.map((inv) => {
                const cfg = statusConfig[inv.status];
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-stone-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{inv.invoiceNumber}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{inv.client.name} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-stone-800 font-data">{formatCurrency(inv.total)}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-50 flex items-center justify-between">
            <h2 className="font-semibold text-stone-800 text-sm">Recent time entries</h2>
            <Link href="/app/time" className="text-xs font-medium transition-colors" style={{ color: "oklch(0.72 0.22 48)" }}>View all</Link>
          </div>
          {recentTimeEntries.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-stone-400">No time logged yet</p>
              <Link href="/app/time" className="text-xs font-medium mt-1 block" style={{ color: "oklch(0.72 0.22 48)" }}>Log time →</Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recentTimeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-stone-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{entry.project || "Untitled"}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{entry.client.name} · {formatDate(entry.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-800 font-data">{formatCurrency(entry.hours * entry.rate)}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{entry.hours}h @ {formatCurrency(entry.rate)}/hr</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-stone-300 text-center pb-2">
        Planning estimates only — not formal tax advice. Use your accountant&apos;s rates if you have them.
      </p>
    </div>
  );
}
