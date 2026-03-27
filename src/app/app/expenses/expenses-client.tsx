"use client";

import { useState } from "react";
import { createExpense, updateExpense, deleteExpense } from "@/server/actions/expenses";
import { Receipt, Plus, Pencil, Trash2 } from "lucide-react";

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

type Expense = {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
  deductible: boolean;
};

const CATEGORIES = ["Software", "Equipment", "Travel", "Office", "Marketing", "Professional services", "Utilities", "Other"];

function fmt(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}
function toDateInput(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

const inputStyle = { background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL, "--tw-ring-color": GREEN } as React.CSSProperties;

export function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const deductibleAmount = expenses.filter((e) => e.deductible).reduce((sum, e) => sum + e.amount, 0);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createExpense(new FormData(e.currentTarget));
    setShowForm(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingExpense) return;
    await updateExpense(editingExpense.id, new FormData(e.currentTarget));
    setEditingExpense(null);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteExpense(id);
    setDeleting(null);
  }

  const modal = showForm || editingExpense;
  const editData = editingExpense;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Expenses</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            <span className="font-data">{fmt(totalAmount)}</span> total · <span className="font-data">{fmt(deductibleAmount)}</span> deductible
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: LIGHT_GREEN }}>
            <Receipt className="w-6 h-6" style={{ color: GREEN }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No expenses yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Track your business expenses here.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between px-6 py-4 transition-colors" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: LIGHT_GREEN }}>
                    <Receipt className="w-4 h-4" style={{ color: GREEN }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: CHARCOAL }}>{expense.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: MUTED }}>{expense.category}</span>
                      <span style={{ color: BORDER }}>·</span>
                      <span className="text-xs" style={{ color: MUTED }}>{fmtDate(expense.date)}</span>
                      {expense.deductible && (
                        <>
                          <span style={{ color: BORDER }}>·</span>
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: LIGHT_GREEN, color: GREEN }}>Deductible</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold font-data" style={{ color: CHARCOAL }}>{fmt(expense.amount)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingExpense(expense)} className="p-2 rounded-lg transition-colors" style={{ color: MUTED }}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} disabled={deleting === expense.id} className="p-2 rounded-lg transition-colors disabled:opacity-50" style={{ color: MUTED }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold" style={{ color: CHARCOAL }}>{editData ? "Edit expense" : "Add expense"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Date *</label>
                  <input name="date" type="date" defaultValue={editData ? toDateInput(editData.date) : new Date().toISOString().split("T")[0]} required className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Amount (£) *</label>
                  <input name="amount" type="number" step="0.01" min="0" defaultValue={editData?.amount ?? ""} required className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Category *</label>
                <select name="category" defaultValue={editData?.category ?? ""} required className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Description *</label>
                <input name="description" defaultValue={editData?.description ?? ""} required placeholder="e.g. Figma subscription" className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Tax deductible?</label>
                <select name="deductible" defaultValue={editData?.deductible === false ? "false" : "true"} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle}>
                  <option value="true">Yes — deductible</option>
                  <option value="false">No — not deductible</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingExpense(null); }} className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
                  {editData ? "Save changes" : "Add expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
