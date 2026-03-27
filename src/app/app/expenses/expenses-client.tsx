"use client";

import { useState, useRef, useEffect } from "react";
import { createExpense, updateExpense, deleteExpense } from "@/server/actions/expenses";
import { Plus, Check, X, Trash2, Paperclip, ExternalLink, ImageIcon, FileText, ZoomIn } from "lucide-react";
import { createClient } from "@/lib/supabase";

const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const KHAKI = "#EAE3D2";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

type Expense = { id: string; date: Date; category: string; description: string; amount: number; deductible: boolean; receiptUrl: string | null };
type Row = { date: string; category: string; description: string; amount: string; deductible: string; receiptUrl: string };

const CATEGORIES = ["Software", "Equipment", "Travel", "Office", "Marketing", "Professional services", "Utilities", "Other"];
const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
const toDateInput = (d: Date) => new Date(d).toISOString().split("T")[0];
const today = () => new Date().toISOString().split("T")[0];

const empty: Row = { date: today(), category: "", description: "", amount: "", deductible: "true", receiptUrl: "" };

const cell: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: `2px solid ${GREEN}`,
  outline: "none", color: CHARCOAL, fontSize: "13px", padding: "2px 4px", width: "100%",
};
const selectCell: React.CSSProperties = { ...cell, cursor: "pointer" };

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url);
}
function isPdf(url: string) {
  return /\.pdf$/i.test(url);
}

function ReceiptModal({ url, description, onClose }: { url: string; description: string; onClose: () => void }) {
  const isImg = isImage(url);
  const isPDF = isPdf(url);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: CARD, maxWidth: "90vw", maxHeight: "90vh", minWidth: 320 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            {isPDF ? <FileText className="w-4 h-4" style={{ color: GREEN }} /> : <ImageIcon className="w-4 h-4" style={{ color: GREEN }} />}
            <span className="text-sm font-semibold truncate max-w-[200px]" style={{ color: CHARCOAL }}>{description}</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
              style={{ background: LIGHT_GREEN, color: GREEN }}
            >
              <ExternalLink className="w-3 h-3" /> Open full size
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1" style={{ maxHeight: "75vh" }}>
          {isImg ? (
            <img src={url} alt={description} className="block w-full h-auto" style={{ maxHeight: "75vh", objectFit: "contain" }} />
          ) : isPDF ? (
            <iframe src={url} title={description} className="w-full" style={{ height: "75vh", minWidth: "60vw", border: "none" }} />
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: MUTED }} />
              <p className="text-sm mb-3" style={{ color: MUTED }}>Preview not available for this file type.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline" style={{ color: GREEN }}>
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptBadge({ url, description, onView }: { url: string; description: string; onView: () => void }) {
  const isImg = isImage(url);
  const isPDF = isPdf(url);
  return (
    <button
      onClick={e => { e.stopPropagation(); onView(); }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
      style={{ background: LIGHT_GREEN, color: GREEN }}
      title="View receipt"
    >
      {isPDF ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
      Receipt
      <ZoomIn className="w-2.5 h-2.5" />
    </button>
  );
}

function FileUploadButton({
  currentUrl,
  onUploaded,
  uploading,
  setUploading,
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("receipts").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-40"
        style={{ background: currentUrl ? LIGHT_GREEN : KHAKI, color: currentUrl ? GREEN : CHARCOAL }}
      >
        <Paperclip className="w-3 h-3" />
        {uploading ? "Uploading…" : currentUrl ? "Change" : "Attach receipt"}
      </button>
      {currentUrl && (
        <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: GREEN }}>
          View
        </a>
      )}
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
  const [uploading, setUploading] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<{ url: string; description: string } | null>(null);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const deductibleTotal = expenses.filter(e => e.deductible).reduce((s, e) => s + e.amount, 0);

  async function saveNew() {
    if (!newRow.description.trim() || !newRow.amount || saving || uploading) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(newRow).forEach(([k, v]) => fd.set(k, v));
    await createExpense(fd);
    setNewRow({ ...empty, date: today() }); setSaving(false);
  }

  async function saveEdit() {
    if (!editId || saving || uploading) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(editRow).forEach(([k, v]) => fd.set(k, v));
    await updateExpense(editId, fd);
    setEditId(null); setSaving(false);
  }

  function startEdit(e: Expense) {
    setEditId(e.id);
    setEditRow({
      date: toDateInput(e.date), category: e.category, description: e.description,
      amount: String(e.amount), deductible: e.deductible ? "true" : "false",
      receiptUrl: e.receiptUrl ?? "",
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

  const SaveCancel = ({ onSave, onCancel, disabled }: { onSave: () => void; onCancel: () => void; disabled?: boolean }) => (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={onSave} disabled={disabled || saving || uploading} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition-all" style={{ background: GREEN }}>
        <Check className="w-3.5 h-3.5 text-white" />
      </button>
      <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ border: `1px solid ${BORDER}` }}>
        <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
      </button>
    </div>
  );

  // Desktop new/edit row
  const DesktopEditRow = ({ row, set, onSave, onCancel, isNew }: {
    row: Row; set: React.Dispatch<React.SetStateAction<Row>>;
    onSave: () => void; onCancel: () => void; isNew?: boolean;
  }) => (
    <tr style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
      <td className="px-3 py-2"><input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} /></td>
      <td className="px-3 py-2">
        <select value={row.category} onChange={e => set(r => ({ ...r, category: e.target.value }))} style={selectCell}>
          <option value="">Category…</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="px-3 py-2"><input autoFocus={isNew} placeholder="Description *" value={row.description} onChange={e => set(r => ({ ...r, description: e.target.value }))} onKeyDown={e => e.key === "Enter" && onSave()} style={cell} /></td>
      <td className="px-3 py-2"><input type="number" step="0.01" min="0" placeholder="0.00" value={row.amount} onChange={e => set(r => ({ ...r, amount: e.target.value }))} style={cell} /></td>
      <td className="px-3 py-2">
        <select value={row.deductible} onChange={e => set(r => ({ ...r, deductible: e.target.value }))} style={selectCell}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <FileUploadButton
          currentUrl={row.receiptUrl}
          onUploaded={url => set(r => ({ ...r, receiptUrl: url }))}
          uploading={uploading}
          setUploading={setUploading}
        />
      </td>
      <td className="px-3 py-2">
        <SaveCancel onSave={onSave} onCancel={onCancel} disabled={!row.description.trim() || !row.amount} />
      </td>
    </tr>
  );

  // Mobile stacked form
  const MobileForm = ({ row, set, onSave, onCancel }: {
    row: Row; set: React.Dispatch<React.SetStateAction<Row>>;
    onSave: () => void; onCancel: () => void;
  }) => (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#F0F9F4", border: `1px solid ${BORDER}` }}>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Description *</label>
        <input autoFocus placeholder="e.g. Adobe Creative Cloud" value={row.description} onChange={e => set(r => ({ ...r, description: e.target.value }))} onKeyDown={e => e.key === "Enter" && onSave()} style={cell} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Date</label>
          <input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Amount £</label>
          <input type="number" step="0.01" min="0" placeholder="0.00" value={row.amount} onChange={e => set(r => ({ ...r, amount: e.target.value }))} style={cell} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Category</label>
          <select value={row.category} onChange={e => set(r => ({ ...r, category: e.target.value }))} style={selectCell}>
            <option value="">Category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Deductible</label>
          <select value={row.deductible} onChange={e => set(r => ({ ...r, deductible: e.target.value }))} style={selectCell}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Receipt / Invoice</label>
        <FileUploadButton
          currentUrl={row.receiptUrl}
          onUploaded={url => set(r => ({ ...r, receiptUrl: url }))}
          uploading={uploading}
          setUploading={setUploading}
        />
        {row.receiptUrl && isImage(row.receiptUrl) && (
          <img src={row.receiptUrl} alt="Receipt preview" className="mt-2 rounded-xl max-h-40 object-contain w-full" style={{ border: `1px solid ${BORDER}` }} />
        )}
      </div>
      <SaveCancel onSave={onSave} onCancel={onCancel} disabled={!row.description.trim() || !row.amount} />
    </div>
  );

  return (
    <>
    {viewReceipt && (
      <ReceiptModal url={viewReceipt.url} description={viewReceipt.description} onClose={() => setViewReceipt(null)} />
    )}
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CHARCOAL }}>Expenses</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            <span className="font-mono">{fmt(total)}</span> total · <span className="font-mono">{fmt(deductibleTotal)}</span> deductible
          </p>
        </div>
        <button onClick={() => { setAdding(true); setNewRow({ ...empty, date: today() }); }} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-all" style={{ background: adding ? KHAKI : GREEN, color: adding ? CHARCOAL : "#fff" }}>
          <Plus className="w-4 h-4" /> Add expense
        </button>
      </div>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden md:block rounded-2xl overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm min-w-[780px]">
          <thead style={{ background: KHAKI }}>
            <tr>
              <TH label="Date" w="110px" />
              <TH label="Category" w="130px" />
              <TH label="Description" />
              <TH label="Amount" w="100px" />
              <TH label="Deductible" w="90px" />
              <TH label="Receipt" w="130px" />
              <th style={{ width: 72, borderBottom: `1px solid ${BORDER}` }} />
            </tr>
          </thead>
          <tbody>
            {adding && (
              <DesktopEditRow row={newRow} set={setNewRow} onSave={saveNew} onCancel={() => { setAdding(false); setNewRow({ ...empty, date: today() }); }} isNew />
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
                <td className="px-3 py-3 text-sm italic" style={{ color: MUTED }}>—</td>
                <td className="px-3 py-3">
                  <button onClick={() => setAdding(true)} className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap" style={{ background: GREEN, color: "#fff" }}>
                    + Add first
                  </button>
                </td>
              </tr>
            )}

            {expenses.map((e) => editId === e.id ? (
              <DesktopEditRow key={e.id} row={editRow} set={setEditRow} onSave={saveEdit} onCancel={() => setEditId(null)} />
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
                  {e.receiptUrl
                    ? <ReceiptBadge url={e.receiptUrl} description={e.description} onView={() => setViewReceipt({ url: e.receiptUrl!, description: e.description })} />
                    : <span className="text-xs" style={{ color: MUTED }}>—</span>}
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

      {/* Mobile card list — hidden on md+ */}
      <div className="md:hidden space-y-2 pb-4">
        {adding && (
          <MobileForm row={newRow} set={setNewRow} onSave={saveNew} onCancel={() => { setAdding(false); setNewRow({ ...empty, date: today() }); }} />
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
          <MobileForm key={e.id} row={editRow} set={setEditRow} onSave={saveEdit} onCancel={() => setEditId(null)} />
        ) : (
          <div
            key={e.id}
            onClick={() => startEdit(e)}
            className="rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity"
            style={{ background: CARD, border: `1px solid ${BORDER}` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-semibold text-base" style={{ color: CHARCOAL }}>{e.description}</span>
              <span className="text-xs ml-3 flex-shrink-0" style={{ color: MUTED }}>{fmtDate(e.date)}</span>
            </div>
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {e.category && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>{e.category}</span>
              )}
              {e.deductible && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>Deductible</span>
              )}
              {e.receiptUrl && <ReceiptBadge url={e.receiptUrl} description={e.description} onView={() => setViewReceipt({ url: e.receiptUrl!, description: e.description })} />}
            </div>
            {e.receiptUrl && isImage(e.receiptUrl) && (
              <img src={e.receiptUrl} alt="Receipt" className="rounded-xl mb-3 max-h-32 object-cover w-full" style={{ border: `1px solid ${BORDER}` }} />
            )}
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-lg" style={{ color: GREEN }}>{fmt(e.amount)}</span>
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
    </>
  );
}
