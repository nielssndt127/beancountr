import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateFinancials, formatCurrency, formatDate } from "@/lib/calculations";
import { TrendingUp, TrendingDown, Wallet, Shield, AlertCircle, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { InvoiceStatus } from "@prisma/client";
import { MonthNav } from "./month-nav";

const BG     = "oklch(0.94 0.025 80)";
const CARD   = "oklch(0.97 0.015 80)";
const TEXT   = "oklch(0.16 0.008 80)";
const BORDER = "oklch(0.88 0.015 80)";
const MUTED  = "oklch(0.45 0.01 80)";
const ACCENT = "oklch(0.22 0.008 80)";

const statusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  DRAFT:   { label: "Draft",   bg: "oklch(0.90 0.01 80)",  text: "oklch(0.35 0.01 80)"  },
  SENT:    { label: "Sent",    bg: "oklch(0.88 0.04 230)", text: "oklch(0.30 0.08 230)" },
  PAID:    { label: "Paid",    bg: "oklch(0.88 0.06 145)", text: "oklch(0.28 0.10 145)" },
  OVERDUE: { label: "Overdue", bg: "oklch(0.90 0.06 25)",  text: "oklch(0.35 0.15 25)"  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // ── Resolve selected month ──────────────────────────────────────────────────
  const params = await searchParams;
  const monthStr = params.month;

  let year: number, month: number;
  if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
    const [y, m] = monthStr.split("-").map(Number);
    year  = y;
    month = m - 1; // convert to 0-indexed
  } else {
    const now = new Date();
    year  = now.getFullYear();
    month = now.getMonth();
  }

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth   = new Date(year, month + 1, 0, 23, 59, 59);
  const monthLabel   = startOfMonth.toLocaleString("en-GB", { month: "long", year: "numeric" });

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // ── Queries ─────────────────────────────────────────────────────────────────
  const [invoices, timeEntries, expenses, recentInvoices, recentTimeEntries, allUnpaid] = await Promise.all([
    // Month income: PAID invoices issued in selected month
    prisma.invoice.findMany({
      where: { userId: user.id, issueDate: { gte: startOfMonth, lte: endOfMonth } },
      select: { total: true, status: true },
    }),
    // Month time entries
    prisma.timeEntry.findMany({
      where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { hours: true, rate: true },
    }),
    // Month expenses
    prisma.expense.findMany({
      where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { amount: true },
    }),
    // Recent invoices (for the list widget — always latest 5 regardless of month)
    prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    // Recent time entries (same)
    prisma.timeEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    // All-time unpaid invoices (SENT + OVERDUE across every month)
    prisma.invoice.findMany({
      where: { userId: user.id, status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] } },
      select: { total: true, status: true, invoiceNumber: true, issueDate: true },
    }),
  ]);

  // ── Calculations ─────────────────────────────────────────────────────────
  const invoiceIncome  = invoices.filter(i => i.status === InvoiceStatus.PAID).reduce((s, i) => s + i.total, 0);
  const timeIncome     = timeEntries.reduce((s, t) => s + t.hours * t.rate, 0);
  const income         = invoiceIncome || timeIncome;
  const totalExpenses  = expenses.reduce((s, e) => s + e.amount, 0);
  const financials     = calculateFinancials(income, totalExpenses, user.taxReserveRate, user.pensionRate);

  const unpaidCount    = allUnpaid.length;
  const unpaidTotal    = allUnpaid.reduce((s, i) => s + i.total, 0);
  const overdueCount   = allUnpaid.filter(i => i.status === InvoiceStatus.OVERDUE).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: TEXT }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{monthLabel} overview</p>
        </div>
        <MonthNav year={year} month={month} />
      </div>

      {/* ── Unpaid invoices alert (all time) ── */}
      {unpaidCount > 0 && (
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ background: overdueCount > 0 ? "oklch(0.95 0.04 25)" : CARD, border: `1px solid ${overdueCount > 0 ? "oklch(0.86 0.07 25)" : BORDER}` }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: overdueCount > 0 ? "oklch(0.55 0.15 25)" : TEXT }} />
            <div>
              <p className="text-sm font-medium" style={{ color: TEXT }}>
                {formatCurrency(unpaidTotal)} outstanding across {unpaidCount} unpaid invoice{unpaidCount !== 1 ? "s" : ""}
                {overdueCount > 0 && (
                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.90 0.06 25)", color: "oklch(0.40 0.15 25)" }}>
                    {overdueCount} overdue
                  </span>
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>These are from all months, not just {monthLabel}.</p>
            </div>
          </div>
          <Link href="/app/invoices" className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap transition-colors" style={{ color: MUTED }}>
            View invoices <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Safe to Spend formula ── */}
      <div className="rounded-2xl px-6 py-5" style={{ background: ACCENT }}>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "oklch(0.65 0.01 80)" }}>
            {monthLabel}
          </p>
          {!isCurrentMonth && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)", color: "oklch(0.65 0.01 80)" }}>
              historical
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: "oklch(0.65 0.01 80)" }}>Income</p>
            <p className="text-xl font-bold font-data" style={{ color: BG }}>{formatCurrency(financials.income)}</p>
          </div>
          <span className="text-lg font-bold" style={{ color: "oklch(0.65 0.01 80)" }}>−</span>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: "oklch(0.65 0.01 80)" }}>Tax buffer ({Math.round(user.taxReserveRate * 100)}%)</p>
            <p className="text-xl font-bold font-data" style={{ color: BG }}>{formatCurrency(financials.taxReserve)}</p>
          </div>
          <span className="text-lg font-bold" style={{ color: "oklch(0.65 0.01 80)" }}>−</span>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: "oklch(0.65 0.01 80)" }}>Pension ({Math.round(user.pensionRate * 100)}%)</p>
            <p className="text-xl font-bold font-data" style={{ color: BG }}>{formatCurrency(financials.pensionReserve)}</p>
          </div>
          <span className="text-lg font-bold" style={{ color: "oklch(0.65 0.01 80)" }}>=</span>
          <div className="text-center">
            <p className="text-xs mb-1 font-semibold" style={{ color: "oklch(0.75 0.12 145)" }}>Safe to spend</p>
            <p className="text-2xl font-bold font-data" style={{ color: "oklch(0.85 0.14 145)" }}>
              {formatCurrency(financials.safeToSpend)}
            </p>
          </div>
        </div>
        {/* Income basis note */}
        <div className="flex items-start gap-1.5 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.01 80)" }} />
          <p className="text-xs" style={{ color: "oklch(0.55 0.01 80)" }}>
            Income counts invoices <strong style={{ color: "oklch(0.60 0.01 80)" }}>issued</strong> in {monthLabel} that are marked paid.
            If a March invoice is paid in April, it will show in March&apos;s view, not April&apos;s.
            Use the arrows above to check previous months.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>Income</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <TrendingUp className="w-4 h-4" style={{ color: BG }} />
            </div>
          </div>
          <p className="text-2xl font-bold font-data" style={{ color: TEXT }}>{formatCurrency(financials.income)}</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Paid invoices issued this month</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>Expenses</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <TrendingDown className="w-4 h-4" style={{ color: BG }} />
            </div>
          </div>
          <p className="text-2xl font-bold font-data" style={{ color: TEXT }}>{formatCurrency(financials.expenses)}</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>This month</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>Profit</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <Wallet className="w-4 h-4" style={{ color: BG }} />
            </div>
          </div>
          <p className="text-2xl font-bold font-data" style={{ color: TEXT }}>{formatCurrency(financials.profit)}</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>After expenses</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "oklch(0.93 0.04 80)", border: "1px solid oklch(0.86 0.04 80)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "oklch(0.40 0.04 80)" }}>Tax reserve</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <Shield className="w-4 h-4" style={{ color: BG }} />
            </div>
          </div>
          <p className="text-2xl font-bold font-data" style={{ color: TEXT }}>{formatCurrency(financials.taxReserve)}</p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.04 80)" }}>Set aside · {Math.round(user.taxReserveRate * 100)}% of profit</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "oklch(0.93 0.03 230)", border: "1px solid oklch(0.86 0.05 230)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "oklch(0.35 0.06 230)" }}>Pension</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <Shield className="w-4 h-4" style={{ color: BG }} />
            </div>
          </div>
          <p className="text-2xl font-bold font-data" style={{ color: TEXT }}>{formatCurrency(financials.pensionReserve)}</p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.35 0.06 230)" }}>Set aside · {Math.round(user.pensionRate * 100)}% of profit</p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "oklch(0.93 0.05 145)", border: "1px solid oklch(0.86 0.07 145)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "oklch(0.30 0.08 145)" }}>Safe to spend</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <Wallet className="w-4 h-4" style={{ color: BG }} />
            </div>
          </div>
          <p className="text-2xl font-bold font-data" style={{ color: TEXT }}>{formatCurrency(financials.safeToSpend)}</p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.30 0.08 145)" }}>After all reserves</p>
        </div>
      </div>

      {/* ── Recent lists ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="font-semibold text-sm" style={{ color: TEXT }}>Recent invoices</h2>
            <Link href="/app/invoices" className="text-xs font-medium transition-colors" style={{ color: MUTED }}>View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm" style={{ color: MUTED }}>No invoices yet</p>
              <Link href="/app/invoices" className="text-xs font-medium mt-1 block" style={{ color: TEXT }}>Create one →</Link>
            </div>
          ) : (
            <div>
              {recentInvoices.map((inv) => {
                const cfg = statusConfig[inv.status];
                return (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3.5 transition-colors" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: TEXT }}>{inv.invoiceNumber}</p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{inv.client.name} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold font-data" style={{ color: TEXT }}>{formatCurrency(inv.total)}</span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="font-semibold text-sm" style={{ color: TEXT }}>Recent time entries</h2>
            <Link href="/app/time" className="text-xs font-medium transition-colors" style={{ color: MUTED }}>View all</Link>
          </div>
          {recentTimeEntries.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm" style={{ color: MUTED }}>No time logged yet</p>
              <Link href="/app/time" className="text-xs font-medium mt-1 block" style={{ color: TEXT }}>Log time →</Link>
            </div>
          ) : (
            <div>
              {recentTimeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-6 py-3.5 transition-colors" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: TEXT }}>{entry.project || "Untitled"}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{entry.client.name} · {formatDate(entry.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold font-data" style={{ color: TEXT }}>{formatCurrency(entry.hours * entry.rate)}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{entry.hours}h @ {formatCurrency(entry.rate)}/hr</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-center pb-2" style={{ color: MUTED }}>
        Planning estimates only. Use your accountant&apos;s figures for your actual tax bill.
      </p>
    </div>
  );
}
