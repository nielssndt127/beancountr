"use client";

import { useState } from "react";
import { createExpense, updateExpense, deleteExpense } from "@/server/actions/expenses";
import { Plus, Trash2 } from "lucide-react";

const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const KHAKI = "#EAE3D2";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";
const AMBER = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";

type Expense = {
  id: string; date: Date; createdAt: Date; category: string; description: string;
  supplier: string | null; amount: number; vatAmount: number; deductible: boolean;
  notes: string | null; paymentMethod: string | null;
  expenseType: string; miles: number; mileageRate: number;
};
type Row = {
  date: string; category: string; description: string; supplier: string;
  amount: string; vatAmount: string; deductible: string;
  notes: string; paymentMethod: string; expenseType: string; miles: string; mileageRate: string;
};

const CATEGORIES = ["Software", "Equipment", "Travel", "Office", "Marketing", "Professional services", "Utilities", "Other"];
const PAYMENT_METHODS = ["Card", "Cash", "Bank transfer", "Other"];
const MILEAGE_RATE = 0.45;
const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
const toDateInput = (d: Date) => new Date(d).toISOString().split("T")[0];
const today = () => new Date().toISOString().split("T")[0];

function daysDiff(a: Date, b: Date) {
  return Math.abs((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24));
}

const empty: Row = {
  date: today(), category: "", description: "", supplier: "",
  amount: "", vatAmount: "0", deductible: "true",
  notes: "", paymentMethod: "Card", expenseType: "EXPENSE",
  miles: "", mileageRate: String(MILEAGE_RATE),
};

const cell: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: `2px solid ${GREEN}`,
  outline: "none", color: CHARCOAL, fontSize: "13px", padding: "2px 4px", width: "100%",
};
const selectCell: React.CSSProperties = { ...cell, cursor: "pointer" };

// Pill toggle for Expense / Mileage
function TypeToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: KHAKI, width: "fit-content" }}>
      {["EXPENSE", "MILEAGE"].map(t => (
        <button
          key={t} type="button" onClick={() => onChange(t)}
          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
          style={value === t ? { background: GREEN, color: "#fff" } : { background: "transparent", color: MUTED }}
        >
          {t === "EXPENSE" ? "Expense" : "Mileage"}
        </button>
      ))}
    </div>
  );
}

// Desktop inline card form
function DesktopCardForm({ row, set, onSave, onCancel, saving }: {
  row: Row;
  set: React.Dispatch<React.SetStateAction<Row>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const isMileage = row.expenseType === "MILEAGE";
  const calcAmount = isMileage ? (parseFloat(row.miles) || 0) * (parseFloat(row.mileageRate) || MILEAGE_RATE) : null;
  const labelStyle: React.CSSProperties = { color: MUTED, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <tr>
      <td colSpan={7} style={{ padding: "8px 12px", background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
        <div className="rounded-2xl p-5 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div><TypeToggle value={row.expenseType} onChange={v => set(r => ({ ...r, expenseType: v }))} /></div>

          {isMileage ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label style={labelStyle}>Date</label>
                <input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} />
              </div>
              <div className="space-y-1">
                <label style={labelStyle}>Description (purpose)</label>
                <input autoFocus placeholder="e.g. Client visit" value={row.description} onChange={e => set(r => ({ ...r, description: e.target.value }))} onKeyDown={e => e.key === "Enter" && onSave()} style={cell} />
              </div>
              <div className="space-y-1">
                <label style={labelStyle}>Miles</label>
                <input type="number" step="0.1" min="0" placeholder="0" value={row.miles} onChange={e => set(r => ({ ...r, miles: e.target.value }))} style={cell} />
              </div>
              <div className="space-y-1">
                <label style={labelStyle}>Auto-calc</label>
                <div className="text-sm font-mono font-semibold pt-1" style={{ color: CHARCOAL }}>
                  = {calcAmount !== null ? fmt(calcAmount) : "£0.00"}
                  <span className="text-xs font-normal ml-1" style={{ color: MUTED }}>({row.miles || "0"}mi × 45p)</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Supplier</label>
                  <input placeholder="e.g. Adobe Inc." value={row.supplier} onChange={e => set(r => ({ ...r, supplier: e.target.value }))} style={cell} />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Description</label>
                  <input autoFocus placeholder="e.g. Creative Cloud subscription" value={row.description} onChange={e => set(r => ({ ...r, description: e.target.value }))} onKeyDown={e => e.key === "Enter" && onSave()} style={cell} />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Category</label>
                  <select value={row.category} onChange={e => set(r => ({ ...r, category: e.target.value }))} style={selectCell}>
                    <option value="">Category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label style={labelStyle}>Amount £</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={row.amount} onChange={e => set(r => ({ ...r, amount: e.target.value }))} style={cell} />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>VAT £</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={row.vatAmount} onChange={e => set(r => ({ ...r, vatAmount: e.target.value }))} style={cell} />
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Payment method</label>
                  <select value={row.paymentMethod} onChange={e => set(r => ({ ...r, paymentMethod: e.target.value }))} style={selectCell}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label style={labelStyle}>Deductible</label>
                  <select value={row.deductible} onChange={e => set(r => ({ ...r, deductible: e.target.value }))} style={selectCell}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label style={labelStyle}>Notes</label>
            <input placeholder="Optional notes…" value={row.notes} onChange={e => set(r => ({ ...r, notes: e.target.value }))} style={cell} />
          </div>

          <div className="flex items-center gap-2 justify-end pt-1">
            <button onClick={onCancel} className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !row.description.trim() || (!isMileage && !row.amount) || (isMileage && !row.miles)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: GREEN, color: "#fff" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// Mobile stacked form
function MobileForm({ row, set, onSave, onCancel, saving }: {
  row: Row;
  set: React.Dispatch<React.SetStateAction<Row>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const isMileage = row.expenseType === "MILEAGE";
  const calcAmount = isMileage ? (parseFloat(row.miles) || 0) * (parseFloat(row.mileageRate) || MILEAGE_RATE) : null;
  const labelStyle: React.CSSProperties = { color: MUTED, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#F0F9F4", border: `1px solid ${BORDER}` }}>
      <TypeToggle value={row.expenseType} onChange={v => set(r => ({ ...r, expenseType: v }))} />

      {isMileage ? (
        <>
          <div className="space-y-1">
            <label style={labelStyle}>Description (purpose) *</label>
            <input autoFocus placeholder="e.g. Client visit" value={row.description} onChange={e => set(r => ({ ...r, description: e.target.value }))} style={cell} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label style={labelStyle}>Date</label>
              <input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Miles</label>
              <input type="number" step="0.1" min="0" placeholder="0" value={row.miles} onChange={e => set(r => ({ ...r, miles: e.target.value }))} style={cell} />
            </div>
          </div>
          {row.miles && (
            <div className="text-sm" style={{ color: MUTED }}>
              = <span className="font-mono font-semibold" style={{ color: CHARCOAL }}>{fmt(calcAmount!)}</span>
              <span className="text-xs ml-1">({row.miles}mi × 45p)</span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-1">
            <label style={labelStyle}>Description *</label>
            <input autoFocus placeholder="e.g. Adobe Creative Cloud" value={row.description} onChange={e => set(r => ({ ...r, description: e.target.value }))} onKeyDown={e => e.key === "Enter" && onSave()} style={cell} />
          </div>
          <div className="space-y-1">
            <label style={labelStyle}>Supplier</label>
            <input placeholder="e.g. Adobe Inc." value={row.supplier} onChange={e => set(r => ({ ...r, supplier: e.target.value }))} style={cell} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label style={labelStyle}>Date</label>
              <input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Amount £</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={row.amount} onChange={e => set(r => ({ ...r, amount: e.target.value }))} style={cell} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label style={labelStyle}>VAT £</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={row.vatAmount} onChange={e => set(r => ({ ...r, vatAmount: e.target.value }))} style={cell} />
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Payment method</label>
              <select value={row.paymentMethod} onChange={e => set(r => ({ ...r, paymentMethod: e.target.value }))} style={selectCell}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label style={labelStyle}>Category</label>
              <select value={row.category} onChange={e => set(r => ({ ...r, category: e.target.value }))} style={selectCell}>
                <option value="">Category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label style={labelStyle}>Deductible</label>
              <select value={row.deductible} onChange={e => set(r => ({ ...r, deductible: e.target.value }))} style={selectCell}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div className="space-y-1">
        <label style={labelStyle}>Notes</label>
        <input placeholder="Optional notes…" value={row.notes} onChange={e => set(r => ({ ...r, notes: e.target.value }))} style={cell} />
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:opacity-80" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !row.description.trim() || (!isMileage && !row.amount) || (isMileage && !row.miles)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: GREEN, color: "#fff" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const [adding, setAdding] = useState(expenses.length === 0);
  const [newRow, setNewRow] = useState<Row>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Row>(empty);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const vatTotal = expenses.reduce((s, e) => s + (e.vatAmount ?? 0), 0);
  const netTotal = total - vatTotal;
  const deductibleTotal = expenses.filter(e => e.deductible).reduce((s, e) => s + e.amount, 0);

  async function saveNew() {
    const isMileage = newRow.expenseType === "MILEAGE";
    if (!newRow.description.trim() || (!isMileage && !newRow.amount) || (isMileage && !newRow.miles) || saving) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(newRow).forEach(([k, v]) => fd.set(k, v));
    await createExpense(fd);
    setNewRow({ ...empty, date: today() });
    setSaving(false);
  }

  async function saveEdit() {
    if (!editId || saving) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(editRow).forEach(([k, v]) => fd.set(k, v));
    await updateExpense(editId, fd);
    setEditId(null);
    setSaving(false);
  }

  function startEdit(e: Expense) {
    setEditId(e.id);
    setEditRow({
      date: toDateInput(e.date),
      category: e.category,
      description: e.description,
      supplier: e.supplier ?? "",
      amount: String(e.amount),
      vatAmount: String(e.vatAmount ?? 0),
      deductible: e.deductible ? "true" : "false",
      notes: e.notes ?? "",
      paymentMethod: e.paymentMethod ?? "Card",
      expenseType: e.expenseType ?? "EXPENSE",
      miles: String(e.miles ?? ""),
      mileageRate: String(e.mileageRate ?? MILEAGE_RATE),
    });
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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CHARCOAL }}>Expenses</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            <span className="font-mono">{fmt(total)}</span> total
            {" "}(<span className="font-mono">{fmt(netTotal)}</span> net
            {vatTotal > 0 && <> · <span className="font-mono">{fmt(vatTotal)}</span> VAT</>})
            {" "}· <span className="font-mono">{fmt(deductibleTotal)}</span> deductible
          </p>
        </div>
        <button
          onClick={() => { setAdding(true); setNewRow({ ...empty, date: today() }); }}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-all"
          style={{ background: adding ? KHAKI : GREEN, color: adding ? CHARCOAL : "#fff" }}
        >
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm min-w-[680px]">
          <thead style={{ background: KHAKI }}>
            <tr>
              <TH label="Date" w="110px" />
              <TH label="Type" w="80px" />
              <TH label="Description" />
              <TH label="Amount" w="120px" />
              <TH label="Category" w="130px" />
              <TH label="Deductible" w="90px" />
              <th style={{ width: 48, borderBottom: `1px solid ${BORDER}` }} />
            </tr>
          </thead>
          <tbody>
            {adding && (
              <DesktopCardForm
                row={newRow} set={setNewRow}
                onSave={saveNew}
                onCancel={() => { setAdding(false); setNewRow({ ...empty, date: today() }); }}
                saving={saving}
              />
            )}

            {expenses.length === 0 && !adding && (
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>27 Mar 2026</td>
                <td className="px-3 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Expense</span></td>
                <td className="px-3 py-3 text-sm italic" style={{ color: MUTED }}>e.g. Adobe Creative Cloud</td>
                <td className="px-3 py-3 font-mono text-sm" style={{ color: MUTED }}>£54.99</td>
                <td className="px-3 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: KHAKI, color: MUTED }}>Software</span></td>
                <td className="px-3 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: KHAKI, color: MUTED }}>Yes</span></td>
                <td className="px-3 py-3">
                  <button onClick={() => setAdding(true)} className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap" style={{ background: GREEN, color: "#fff" }}>
                    + Add first
                  </button>
                </td>
              </tr>
            )}

            {expenses.map((e) => editId === e.id ? (
              <DesktopCardForm
                key={e.id} row={editRow} set={setEditRow}
                onSave={saveEdit} onCancel={() => setEditId(null)}
                saving={saving}
              />
            ) : (
              <tr key={e.id} onClick={() => startEdit(e)} className="cursor-pointer group transition-colors hover:bg-[#F0F9F4]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-3">
                  <div className="text-sm" style={{ color: MUTED }}>{fmtDate(e.date)}</div>
                  {daysDiff(e.createdAt, e.date) > 1 && (
                    <div className="text-xs mt-0.5" style={{ color: MUTED, opacity: 0.7 }}>logged {fmtDate(e.createdAt)}</div>
                  )}
                </td>
                <td className="px-3 py-3">
                  {e.expenseType === "MILEAGE"
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_AMBER, color: AMBER }}>Mileage</span>
                    : <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Expense</span>}
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium" style={{ color: CHARCOAL }}>{e.description}</div>
                  {e.supplier && <div className="text-xs mt-0.5" style={{ color: MUTED }}>{e.supplier}</div>}
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono font-semibold text-sm" style={{ color: CHARCOAL }}>{fmt(e.amount)}</div>
                  {e.vatAmount > 0 && <div className="text-xs mt-0.5" style={{ color: MUTED }}>incl. {fmt(e.vatAmount)} VAT</div>}
                  {e.expenseType === "MILEAGE" && e.miles > 0 && <div className="text-xs mt-0.5" style={{ color: MUTED }}>{e.miles}mi × 45p</div>}
                </td>
                <td className="px-3 py-3">
                  {e.category
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>{e.category}</span>
                    : <span className="text-xs" style={{ color: MUTED }}>—</span>}
                </td>
                <td className="px-3 py-3">
                  {e.deductible
                    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Yes</span>
                    : <span className="text-xs" style={{ color: MUTED }}>—</span>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={ev => { ev.stopPropagation(); handleDelete(e.id); }}
                      disabled={deleting === e.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                      style={{ color: MUTED }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-2 pb-4">
        {adding && (
          <MobileForm
            row={newRow} set={setNewRow}
            onSave={saveNew}
            onCancel={() => { setAdding(false); setNewRow({ ...empty, date: today() }); }}
            saving={saving}
          />
        )}

        {expenses.length === 0 && !adding && (
          <div className="rounded-2xl p-4 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-sm italic mb-3" style={{ color: MUTED }}>No expenses yet</p>
            <button onClick={() => setAdding(true)} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: GREEN, color: "#fff" }}>
              + Add first
            </button>
          </div>
        )}

        {expenses.map((e) => editId === e.id ? (
          <MobileForm
            key={e.id} row={editRow} set={setEditRow}
            onSave={saveEdit} onCancel={() => setEditId(null)}
            saving={saving}
          />
        ) : (
          <div
            key={e.id} onClick={() => startEdit(e)}
            className="rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-base" style={{ color: CHARCOAL }}>{e.description}</span>
              <span className="text-xs ml-3 flex-shrink-0" style={{ color: MUTED }}>{fmtDate(e.date)}</span>
            </div>
            {e.supplier && <div className="text-xs mb-2" style={{ color: MUTED }}>{e.supplier}</div>}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {e.expenseType === "MILEAGE"
                ? <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_AMBER, color: AMBER }}>Mileage</span>
                : <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Expense</span>}
              {e.category && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>{e.category}</span>}
              {e.deductible && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Deductible</span>}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="font-mono font-bold text-lg" style={{ color: GREEN }}>{fmt(e.amount)}</span>
                {e.vatAmount > 0 && <div className="text-xs mt-0.5" style={{ color: MUTED }}>incl. {fmt(e.vatAmount)} VAT</div>}
                {e.expenseType === "MILEAGE" && e.miles > 0 && <div className="text-xs mt-0.5" style={{ color: MUTED }}>{e.miles}mi × 45p</div>}
                {daysDiff(e.createdAt, e.date) > 1 && <div className="text-xs mt-0.5" style={{ color: MUTED }}>Logged {fmtDate(e.createdAt)}</div>}
              </div>
              <button
                onClick={ev => { ev.stopPropagation(); handleDelete(e.id); }}
                disabled={deleting === e.id}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40"
                style={{ color: MUTED }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {!adding && expenses.length > 0 && (
          <button
            onClick={() => { setAdding(true); setNewRow({ ...empty, date: today() }); }}
            className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: KHAKI, color: CHARCOAL, border: `1px solid ${BORDER}` }}
          >
            <Plus className="w-4 h-4" /> Add expense
          </button>
        )}
      </div>
    </div>
  );
}

