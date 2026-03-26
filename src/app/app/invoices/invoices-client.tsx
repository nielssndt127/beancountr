"use client";

import { useState } from "react";
import { createInvoice, updateInvoiceStatus, deleteInvoice } from "@/server/actions/invoices";
import { FileText, Plus, Trash2, ChevronDown, X } from "lucide-react";
import { InvoiceStatus } from "@prisma/client";

type Client = { id: string; name: string };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type Invoice = {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes: string | null;
  client: Client;
  lineItems: LineItem[];
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-stone-100 text-stone-600" },
  SENT: { label: "Sent", className: "bg-blue-50 text-blue-600" },
  PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-600" },
  OVERDUE: { label: "Overdue", className: "bg-red-50 text-red-600" },
};

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const CARD = "oklch(0.22 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";
const inputStyle = { background: CARD, border: `1px solid ${BORDER}`, color: CREAM, "--tw-ring-color": CREAM } as React.CSSProperties;
const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const ringStyle = { "--tw-ring-color": "oklch(0.94 0.025 80)" } as React.CSSProperties;

type FormLineItem = { description: string; quantity: string; unitPrice: string };

export function InvoicesClient({
  invoices,
  clients,
  nextInvoiceNumber,
  paymentTerms,
}: {
  invoices: Invoice[];
  clients: Client[];
  nextInvoiceNumber: string;
  paymentTerms: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<FormLineItem[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);

  const subtotal = lineItems.reduce((sum, li) => {
    const q = parseFloat(li.quantity) || 0;
    const p = parseFloat(li.unitPrice) || 0;
    return sum + q * p;
  }, 0);

  const today = new Date().toISOString().split("T")[0];
  const dueDefault = new Date(Date.now() + paymentTerms * 86400000).toISOString().split("T")[0];

  function addLineItem() {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "" }]);
  }

  function removeLineItem(i: number) {
    setLineItems(lineItems.filter((_, idx) => idx !== i));
  }

  function updateLineItem(i: number, field: keyof FormLineItem, value: string) {
    setLineItems(lineItems.map((li, idx) => (idx === i ? { ...li, [field]: value } : li)));
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("lineItems", JSON.stringify(lineItems.map((li) => ({
      description: li.description,
      quantity: parseFloat(li.quantity) || 0,
      unitPrice: parseFloat(li.unitPrice) || 0,
    }))));
    await createInvoice(fd);
    setShowForm(false);
    setLineItems([{ description: "", quantity: "1", unitPrice: "" }]);
  }

  async function handleStatusChange(id: string, status: InvoiceStatus) {
    await updateInvoiceStatus(id, status);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteInvoice(id);
    setDeleting(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Invoices</h1>
          <p className="text-stone-400 text-sm mt-1">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: CREAM, color: CHARCOAL }}
        >
          <Plus className="w-4 h-4" /> New invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl card-shadow p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-stone-300" />
          </div>
          <p className="font-medium text-stone-700 mb-1">No invoices yet</p>
          <p className="text-sm text-stone-400">Create your first invoice to start getting paid.</p>
        </div>
      ) : (
        <div className="rounded-2xl card-shadow overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="divide-y divide-stone-50">
            {invoices.map((invoice) => {
              const cfg = statusConfig[invoice.status];
              return (
                <div key={invoice.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-stone-900">{invoice.invoiceNumber}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {invoice.client.name} · Issued {fmtDate(invoice.issueDate)} · Due {fmtDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-stone-800 font-data">{fmt(invoice.total)}</p>
                    {/* Status dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                        Status <ChevronDown className="w-3 h-3" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-xl card-shadow border border-stone-100 py-1 w-36 hidden group-hover:block z-10">
                        {(["DRAFT", "SENT", "PAID", "OVERDUE"] as InvoiceStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(invoice.id, s)}
                            className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-stone-50 transition-colors ${invoice.status === s ? "text-stone-900" : "text-stone-500"}`}
                          >
                            {statusConfig[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      disabled={deleting === invoice.id}
                      className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New invoice modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl card-shadow w-full max-w-lg my-8">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">New invoice</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Client *</label>
                  <select name="clientId" required className={inputClass} style={inputStyle}>
                    <option value="">Select client…</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Invoice number *</label>
                  <input name="invoiceNumber" defaultValue={nextInvoiceNumber} required className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Issue date *</label>
                  <input name="issueDate" type="date" defaultValue={today} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Due date *</label>
                  <input name="dueDate" type="date" defaultValue={dueDefault} required className={inputClass} style={inputStyle} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Line items</label>
                <div className="space-y-2">
                  {lineItems.map((li, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        value={li.description}
                        onChange={(e) => updateLineItem(i, "description", e.target.value)}
                        placeholder="Description"
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={inputStyle}
                      />
                      <input
                        value={li.quantity}
                        onChange={(e) => updateLineItem(i, "quantity", e.target.value)}
                        placeholder="Qty"
                        type="number"
                        min="0"
                        step="0.25"
                        className="w-16 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={inputStyle}
                      />
                      <input
                        value={li.unitPrice}
                        onChange={(e) => updateLineItem(i, "unitPrice", e.target.value)}
                        placeholder="Rate"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={inputStyle}
                      />
                      {lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(i)} className="p-2 rounded-lg text-stone-300 hover:text-red-500 transition-colors mt-0.5">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addLineItem} className="mt-2 text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: "oklch(0.94 0.025 80)" }}>
                  <Plus className="w-3.5 h-3.5" /> Add line item
                </button>
              </div>

              {/* Totals */}
              <div className="bg-stone-50 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-data font-medium text-stone-800">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-500">VAT rate</span>
                    <input
                      name="vatRate"
                      type="number"
                      defaultValue="0"
                      min="0"
                      max="100"
                      step="1"
                      className="w-16 px-2 py-1 rounded-lg border border-stone-200 text-xs text-center focus:outline-none"
                    />
                    <span className="text-sm text-stone-500">%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-stone-200 pt-1 mt-1">
                  <span className="text-stone-700">Total</span>
                  <span className="font-data text-stone-900">{fmt(subtotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes</label>
                <textarea name="notes" rows={2} placeholder="Payment instructions, thank you note…" className={`${inputClass} resize-none`} style={inputStyle} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: "oklch(0.94 0.025 80)", color: "oklch(0.16 0.008 80)" }}>
                  Create invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
