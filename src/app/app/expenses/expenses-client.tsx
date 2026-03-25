"use client";

import { useState } from "react";
import { createExpense, updateExpense, deleteExpense } from "@/server/actions/expenses";
import { Receipt, Plus, Pencil, Trash2 } from "lucide-react";

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

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const ringStyle = { "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties;

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
          <h1 className="text-2xl font-bold text-stone-900">Expenses</h1>
          <p className="text-stone-400 text-sm mt-1">
            <span className="font-data">{fmt(totalAmount)}</span> total · <span className="font-data">{fmt(deductibleAmount)}</span> deductible
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: "oklch(0.62 0.22 195)" }}
        >
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-6 h-6 text-stone-300" />
          </div>
          <p className="font-medium text-stone-700 mb-1">No expenses yet</p>
          <p className="text-sm text-stone-400">Track your business expenses here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="divide-y divide-stone-50">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-stone-400">{expense.category}</span>
                      <span className="text-stone-200">·</span>
                      <span className="text-xs text-stone-400">{fmtDate(expense.date)}</span>
                      {expense.deductible && (
                        <>
                          <span className="text-stone-200">·</span>
                          <span className="text-xs text-emerald-500 font-medium">Deductible</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-stone-800 font-data">{fmt(expense.amount)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingExpense(expense)} className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} disabled={deleting === expense.id} className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">{editData ? "Edit expense" : "Add expense"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Date *</label>
                  <input name="date" type="date" defaultValue={editData ? toDateInput(editData.date) : new Date().toISOString().split("T")[0]} required className={inputClass} style={ringStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Amount (£) *</label>
                  <input name="amount" type="number" step="0.01" min="0" defaultValue={editData?.amount ?? ""} required className={inputClass} style={ringStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
                <select name="category" defaultValue={editData?.category ?? ""} required className={inputClass} style={ringStyle}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description *</label>
                <input name="description" defaultValue={editData?.description ?? ""} required placeholder="e.g. Figma subscription" className={inputClass} style={ringStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tax deductible?</label>
                <select name="deductible" defaultValue={editData?.deductible === false ? "false" : "true"} className={inputClass} style={ringStyle}>
                  <option value="true">Yes — deductible</option>
                  <option value="false">No — not deductible</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingExpense(null); }} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "oklch(0.62 0.22 195)" }}>
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
