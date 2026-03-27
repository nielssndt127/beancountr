"use client";

import { useState } from "react";
import { createExpense, updateExpense, deleteExpense } from "@/server/actions/expenses";
import { Plus, Check, X, Trash2 } from "lucide-react";

const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const KHAKI = "#EAE3D2";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

type Expense = { id: string; date: Date; category: string; description: string; amount: number; deductible: boolean };
type Row = { date: string; category: string; description: string; amount: string; deductible: string };

const CATEGORIES = ["Software", "Equipment", "Travel", "Office", "Marketing", "Professional services", "Utilities", "Other"];
const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
const toDateInput = (d: Date) => new Date(d).toISOString().split("T")[0];
const today = () => new Date().toISOString().split("T")[0];

const empty: Row = { date: today(), category: "", description: "", amount: "", deductible: "true" };

const cell: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: `2px solid ${GREEN}`,
  outline: "none", color: CHARCOAL, fontSize: "13px", padding: "2px 4px", width: "100%",
};
const selectCell: React.CSSProperties = { ...cell, cursor: "pointer" };

export function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const [adding, setAdding] = useState(expenses.length === 0);
  const [newRow, setNewRow] = useState<Row>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Row>(empty);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const deductible = expenses.filter(e => e.deductible).reduce((s, e) => s + e.amount, 0);

  async function saveNew() {
    if (!newRow.description.trim() || !newRow.amount || saving) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(newRow).forEach(([k, v]) => fd.set(k, v));
    await createExpense(fd);
    setNewRow({ ...empty, date: today() }); setSaving(false);
  }

  async function saveEdit() {
    if (!editId || saving) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(editRow).forEach(([k, v]) => fd.set(k, v));
    await updateExpense(editId, fd);
    setEditId(null); setSaving(false);
  }

  function startEdit(e: Expense) {
    setEditId(e.id);
    setEditRow({ date: toDateInput(e.date), category: e.category, description: e.description, amount: String(e.amount), deductible: e.deductible ? "true" : "false" });
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteExpense(id);
    setDeleting(null);
  }

  const TH = ({ label, w }: { label: string; w?: string }) => (
    <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}`, width: w }}>
      {label}
    </th>
  );

  const SaveCancel = ({ onSave, onCancel, disabled }: { onSave: () => void; onCancel: () => void; disabled?: boolean }) => (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={onSave} disabled={disabled || saving} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition-all" style={{ background: GREEN }}>
        <Check className="w-3.5 h-3.5 text-white" />
      </button>
      <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ border: `1px solid ${BORDER}` }}>
        <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CHARCOAL }}>Expenses</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            <span className="font-mono">{fmt(total)}</span> total · <span className="font-mono">{fmt(deductible)}</span> deductible
          </p>
        </div>
        <button onClick={() => { setAdding(true); setNewRow({ ...empty, date: today() }); }} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-all" style={{ background: adding ? KHAKI : GREEN, color: adding ? CHARCOAL : "#fff" }}>
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm min-w-[680px]">
          <thead style={{ background: KHAKI }}>
            <tr>
              <TH label="Date" w="110px" />
              <TH label="Category" w="140px" />
              <TH label="Description" />
              <TH label="Amount" w="100px" />
              <TH label="Deductible" w="100px" />
              <th style={{ width: 72, borderBottom: `1px solid ${BORDER}` }} />
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-2"><input type="date" value={newRow.date} onChange={e => setNewRow(r => ({ ...r, date: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2">
                  <select value={newRow.category} onChange={e => setNewRow(r => ({ ...r, category: e.target.value }))} style={selectCell}>
                    <option value="">Category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2"><input autoFocus placeholder="Description *" value={newRow.description} onChange={e => setNewRow(r => ({ ...r, description: e.target.value }))} onKeyDown={e => e.key === "Enter" && saveNew()} style={cell} /></td>
                <td className="px-3 py-2"><input type="number" step="0.01" min="0" placeholder="0.00" value={newRow.amount} onChange={e => setNewRow(r => ({ ...r, amount: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2">
                  <select value={newRow.deductible} onChange={e => setNewRow(r => ({ ...r, deductible: e.target.value }))} style={selectCell}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </td>
                <td className="px-3 py-2"><SaveCancel onSave={saveNew} onCancel={() => { setAdding(false); setNewRow({ ...empty, date: today() }); }} disabled={!newRow.description.trim() || !newRow.amount} />
                </td>
              </tr>
            )}

            {expenses.length === 0 && !adding && (
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>27 Mar 2026</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: KHAKI, color: MUTED }}>Software</span>
                </td>
                <td className="px-3 py-3 text-sm italic" style={{ color: MUTED }}>e.g. Adobe Creative Cloud</td>
                <td className="px-3 py-3 font-mono text-sm" style={{ color: MUTED }}>£54.99</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: KHAKI, color: MUTED }}>Yes</span>
                </td>
                <td className="px-3 py-3">
                  <button onClick={() => setAdding(true)} className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap" style={{ background: GREEN, color: "#fff" }}>
                    + Add first
                  </button>
                </td>
              </tr>
            )}
            {expenses.map((e) => editId === e.id ? (
              <tr key={e.id} style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-2"><input type="date" value={editRow.date} onChange={ev => setEditRow(r => ({ ...r, date: ev.target.value }))} style={cell} /></td>
                <td className="px-3 py-2">
                  <select value={editRow.category} onChange={ev => setEditRow(r => ({ ...r, category: ev.target.value }))} style={selectCell}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2"><input autoFocus value={editRow.description} onChange={ev => setEditRow(r => ({ ...r, description: ev.target.value }))} onKeyDown={ev => ev.key === "Enter" && saveEdit()} style={cell} /></td>
                <td className="px-3 py-2"><input type="number" step="0.01" value={editRow.amount} onChange={ev => setEditRow(r => ({ ...r, amount: ev.target.value }))} style={cell} /></td>
                <td className="px-3 py-2">
                  <select value={editRow.deductible} onChange={ev => setEditRow(r => ({ ...r, deductible: ev.target.value }))} style={selectCell}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </td>
                <td className="px-3 py-2"><SaveCancel onSave={saveEdit} onCancel={() => setEditId(null)} /></td>
              </tr>
            ) : (
              <tr key={e.id} onClick={() => startEdit(e)} className="cursor-pointer group transition-colors hover:bg-[#F0F9F4]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{fmtDate(e.date)}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>{e.category}</span>
                </td>
                <td className="px-3 py-3 font-medium" style={{ color: CHARCOAL }}>{e.description}</td>
                <td className="px-3 py-3 font-mono font-semibold text-sm" style={{ color: CHARCOAL }}>{fmt(e.amount)}</td>
                <td className="px-3 py-3">
                  {e.deductible
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Yes</span>
                    : <span className="text-xs" style={{ color: MUTED }}>No</span>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={ev => { ev.stopPropagation(); handleDelete(e.id); }} disabled={deleting === e.id} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40" style={{ color: MUTED }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
