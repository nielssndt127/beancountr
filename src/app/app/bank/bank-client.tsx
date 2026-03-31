"use client";

import { useState, useRef } from "react";
import { importBankTransactions, confirmMatch, deleteBankTransaction } from "@/server/actions/bank";
import { Upload, Landmark, CheckCircle, Trash2, X, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";

type Match = {
  id: string;
  confirmedAt: Date | null;
  invoice: { id: string; invoiceNumber: string; total: number; client: { name: string } };
};
type Transaction = {
  id: string;
  date: Date;
  amount: number;
  description: string;
  reference: string | null;
  matches: Match[];
};
type OpenInvoice = {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
  client: { name: string };
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const CREAM = "#F5F1E8";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";
const AMBER = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";

// Simple CSV parser — handles quoted fields and common line endings
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

function detectColumns(headers: string[]): { dateIdx: number; amountIdx: number; descIdx: number; refIdx: number } {
  const h = headers.map((h) => h.toLowerCase());
  const find = (...terms: string[]) => h.findIndex((col) => terms.some((t) => col.includes(t)));
  return {
    dateIdx:   find("date"),
    amountIdx: find("amount", "value", "money in", "credit", "debit"),
    descIdx:   find("description", "narrative", "name", "payee", "memo", "details"),
    refIdx:    find("reference", "ref", "notes"),
  };
}

export function BankClient({ transactions, openInvoices, isPro }: {
  transactions: Transaction[];
  openInvoices: OpenInvoice[];
  isPro: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Smart match: find open invoices whose total matches a transaction amount
  function findMatchSuggestion(tx: Transaction): OpenInvoice | null {
    if (tx.matches.some((m) => m.confirmedAt)) return null; // already confirmed
    return openInvoices.find((inv) => Math.abs(inv.total - tx.amount) < 0.01) ?? null;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) throw new Error("CSV appears empty or has no data rows.");

      const { dateIdx, amountIdx, descIdx, refIdx } = detectColumns(rows[0]);
      if (dateIdx === -1 || amountIdx === -1 || descIdx === -1) {
        throw new Error("Could not detect required columns (Date, Amount, Description). Please check your CSV format.");
      }

      const txs = rows.slice(1).flatMap((row) => {
        const dateStr = row[dateIdx];
        const rawAmount = row[amountIdx]?.replace(/[£,\s]/g, "");
        const amount = parseFloat(rawAmount);
        const description = row[descIdx] ?? "";
        if (!dateStr || isNaN(amount) || amount === 0) return [];
        return [{ date: dateStr, amount: Math.abs(amount), description, reference: refIdx >= 0 ? row[refIdx] : undefined }];
      });

      if (txs.length === 0) throw new Error("No valid transactions found in the file.");
      const result = await importBankTransactions(txs);
      if (result.error) throw new Error(result.error);
      setImportResult(`Imported ${result.count} transaction${result.count !== 1 ? "s" : ""}.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleConfirm(txId: string, invoiceId: string) {
    setConfirmingId(txId);
    await confirmMatch(invoiceId, txId);
    setConfirmingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteBankTransaction(id);
    setDeletingId(null);
  }

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Bank feed</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Import your bank statements and match payments to invoices.</p>
        </div>
        <div className="rounded-2xl p-10 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: LIGHT_AMBER }}>
            <Lock className="w-6 h-6" style={{ color: AMBER }} />
          </div>
          <p className="font-semibold mb-2" style={{ color: CHARCOAL }}>Pro feature</p>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: MUTED }}>
            Import CSV bank statements, automatically spot payments that match your invoices, and confirm them as paid in one click.
          </p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all" style={{ background: GREEN, color: "#fff" }}>
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Bank feed</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Import a CSV from your bank and match payments to open invoices.</p>
      </div>

      {/* Upload */}
      <div className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h2 className="font-semibold mb-1" style={{ color: CHARCOAL }}>Import statement</h2>
        <p className="text-xs mb-4" style={{ color: MUTED }}>
          Export a CSV from your bank (Monzo, Starling, HSBC, etc.) and upload it here. Most formats are supported automatically.
        </p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Upload className="w-4 h-4" />
          {importing ? "Importing…" : "Upload CSV"}
        </button>

        {importResult && (
          <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: GREEN }}>
            <CheckCircle className="w-4 h-4" /> {importResult}
          </div>
        )}
        {importError && (
          <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "#FEE2E2", border: "1px solid #FCA5A5" }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: "#DC2626" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {importError}
            </div>
            <button onClick={() => setImportError(null)}><X className="w-4 h-4" style={{ color: "#DC2626" }} /></button>
          </div>
        )}
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: LIGHT_GREEN }}>
            <Landmark className="w-6 h-6" style={{ color: GREEN }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No transactions yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Upload your first bank CSV to get started.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="font-semibold text-sm" style={{ color: CHARCOAL }}>Transactions</h2>
            <span className="text-xs" style={{ color: MUTED }}>{transactions.length} imported</span>
          </div>
          {transactions.map((tx) => {
            const confirmed = tx.matches.find((m) => m.confirmedAt);
            const suggestion = findMatchSuggestion(tx);
            return (
              <div key={tx.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm font-medium truncate" style={{ color: CHARCOAL }}>{tx.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                      {fmtDate(tx.date)}
                      {tx.reference && ` · Ref: ${tx.reference}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold" style={{ color: CHARCOAL }}>{fmt(tx.amount)}</span>
                    {confirmed ? (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>
                        <CheckCircle className="w-3 h-3" /> Matched to {confirmed.invoice.invoiceNumber}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 rounded-lg disabled:opacity-50"
                        style={{ color: MUTED }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Smart match suggestion */}
                {suggestion && !confirmed && (
                  <div className="mx-5 mb-3 rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: LIGHT_AMBER, border: `1px solid #EDCDA6` }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: CHARCOAL }}>
                        Payment spotted: matches invoice {suggestion.invoiceNumber} ({suggestion.client.name}, {fmt(suggestion.total)})
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>Was this payment for that invoice?</p>
                    </div>
                    <button
                      onClick={() => handleConfirm(tx.id, suggestion.id)}
                      disabled={confirmingId === tx.id}
                      className="ml-4 flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                      style={{ background: GREEN, color: "#fff" }}
                    >
                      {confirmingId === tx.id ? "Confirming…" : "Yes, mark as paid"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
