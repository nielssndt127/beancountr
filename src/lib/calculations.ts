export interface FinancialSummary {
  income: number;
  expenses: number;
  profit: number;
  taxReserve: number;
  pensionReserve: number;
  safeToSpend: number;
}

export function calculateFinancials(
  income: number,
  expenses: number,
  taxReserveRate: number,
  pensionRate: number
): FinancialSummary {
  const profit = income - expenses;
  const taxReserve = Math.max(profit, 0) * taxReserveRate;
  const pensionReserve = Math.max(profit, 0) * pensionRate;
  const safeToSpend = profit - taxReserve - pensionReserve;

  return {
    income,
    expenses,
    profit,
    taxReserve,
    pensionReserve,
    safeToSpend,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
