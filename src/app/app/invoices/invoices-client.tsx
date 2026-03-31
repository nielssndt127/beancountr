"use client";

import { useState } from "react";
import { createInvoice, sendInvoice, updateInvoiceStatus, deleteInvoice } from "@/server/actions/invoices";
import { FileText, Plus, Trash2, ChevronDown, X, Send, Link2, Eye, Lock } from "lucide-react";
import { InvoiceStatus } from "@prisma/client";

type Client = { id: string; name: string; email: string | null };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type Invoice = {
  id: string;
  publicId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes: string | null;
  recipientEmail: string | null;
  viewedAt: Date | null;
  client: Client;
  lineItems: LineItem[];
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const AMBER = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

const statusConfig: Record<InvoiceStatus, { label: string; bg: string; color: string }> = {
  DRAFT: { label: "Draft", bg: "#EAE3D2", color: MUTED },
  SENT: { label: "Sent", bg: LIGHT_AMBER, color: AMBER },
  PAID: { label: "Paid", bg: LIGHT_GREEN, color: GREEN },
  OVERDUE: { label: "Overdue", bg: "#FEE2E2", color: "#DC2626" },
};

const inputStyle = { background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL } as React.CSSProperties;
const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";

type FormLineItem = { description: string; quantity: string; unitPrice: string };

export function InvoicesClient({
  invoices,
  clients,
  nextInvoiceNumber,
  paymentTerms,
  isPro,
  appUrl,
}: {
  invoices: Invoice[];
  clients: Client[];
  nextInvoiceNumber: string;
  paymentTerms: number;
  isPro: boolean;
  appUrl: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  async function handleSend(invoice: Invoice) {
    const email = window.prompt(
      `Send invoice ${invoice.invoiceNumber} to:`,
      invoice.recipientEmail ?? invoice.client.email ?? ""
    );
    if (!email) return;

    setSendingId(invoice.id);
    setSendError(null);
    const result = await sendInvoice(invoice.id, email);
    setSendingId(null);
    if (result.error) setSendError(result.error);
  }

  async function handleCopyLink(publicId: string) {
    const url = `${appUrl}/i/${publicId}`;
    await navigator.clipboard.writeText(url);
    setCopied(publicId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Invoices</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Plus className="w-4 h-4" /> New invoice
        </button>
      </div>

      {sendError && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "#FEE2E2", border: "1px solid #FCA5A5" }}>
          <p className="text-sm" style={{ color: "#DC2626" }}>Could not send: {sendError}</p>
          <button onClick={() => setSendError(null)}><X className="w-4 h-4" style={{ color: "#DC2626" }} /></button>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: LIGHT_GREEN }}>
            <FileText className="w-6 h-6" style={{ color: GREEN }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No invoices yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Create your first invoice to start getting paid.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          {invoices.map((invoice) => {
            const cfg = statusConfig[invoice.status];
            const isViewed = !!invoice.viewedAt;
            const publicUrl = `${appUrl}/i/${invoice.publicId}`;
            return (
              <div key={invoice.id} className="flex items-center justify-between px-5 py-4 transition-colors" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium" style={{ color: CHARCOAL }}>{invoice.invoiceNumber}</p>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {/* Viewed badge — Pro only */}
                    {isPro && isViewed && invoice.status === "SENT" && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>
                        <Eye className="w-3 h-3" /> Viewed
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: MUTED }}>
                    {invoice.client.name} · Issued {fmtDate(invoice.issueDate)} · Due {fmtDate(invoice.dueDate)}
                  </p>
                  {/* Public link */}
                  <button
                    onClick={() => handleCopyLink(invoice.publicId)}
                    className="flex items-center gap-1 text-xs mt-1 transition-opacity hover:opacity-70"
                    style={{ color: GREEN }}
                    title={publicUrl}
                  >
                    <Link2 className="w-3 h-3" />
                    {copied === invoice.publicId ? "Copied!" : "Copy public link"}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-sm font-semibold font-data" style={{ color: CHARCOAL }}>{fmt(invoice.total)}</p>

                  {/* Send button */}
                  <button
                    onClick={() => handleSend(invoice)}
                    disabled={sendingId === invoice.id}
                    title="Send invoice by email"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                    style={{ background: LIGHT_GREEN, color: GREEN }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingId === invoice.id ? "Sending…" : "Send"}
                  </button>

                  {/* Status dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors" style={{ color: MUTED }}>
                      Status <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 rounded-xl py-1 w-36 hidden group-hover:block z-10" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
                      {(["DRAFT", "SENT", "PAID", "OVERDUE"] as InvoiceStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(invoice.id, s)}
                          className="w-full text-left px-3 py-2 text-xs font-medium transition-colors"
                          style={{ color: invoice.status === s ? CHARCOAL : MUTED }}
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(invoice.id)}
                    disabled={deleting === invoice.id}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{ color: MUTED }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pro upsell for viewed tracking */}
      {!isPro && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ background: LIGHT_AMBER, border: `1px solid #EDCDA6` }}>
          <Lock className="w-4 h-4 flex-shrink-0" style={{ color: AMBER }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: CHARCOAL }}>Know when clients open your invoices</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>Upgrade to Pro to see a &ldquo;Viewed&rdquo; badge the moment a client opens your invoice link.</p>
          </div>
          <a href="/pricing" className="text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0 transition-opacity hover:opacity-80" style={{ background: AMBER, color: "#fff" }}>
            Upgrade
          </a>
        </div>
      )}

      {/* New invoice modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-lg my-8" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold" style={{ color: CHARCOAL }}>New invoice</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: MUTED }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Client *</label>
                  <select name="clientId" required className={inputClass} style={inputStyle}>
                    <option value="">Select client…</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Invoice number *</label>
                  <input name="invoiceNumber" defaultValue={nextInvoiceNumber} required className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Issue date *</label>
                  <input name="issueDate" type="date" defaultValue={today} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Due date *</label>
                  <input name="dueDate" type="date" defaultValue={dueDefault} required className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Recipient email</label>
                <input
                  name="recipientEmail"
                  type="email"
                  placeholder="client@example.com"
                  className={inputClass}
                  style={inputStyle}
                />
                <p className="text-xs mt-1" style={{ color: MUTED }}>Optional — you can also send later.</p>
              </div>

              {/* Line items */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CHARCOAL }}>Line items</label>
                <div className="space-y-2">
                  {lineItems.map((li, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input
                        value={li.description}
                        onChange={(e) => updateLineItem(i, "description", e.target.value)}
                        placeholder="Description"
                        className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={inputStyle}
                      />
                      <input
                        value={li.quantity}
                        onChange={(e) => updateLineItem(i, "quantity", e.target.value)}
                        placeholder="Qty"
                        type="number"
                        min="0"
                        step="0.25"
                        className="w-16 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={inputStyle}
                      />
                      <input
                        value={li.unitPrice}
                        onChange={(e) => updateLineItem(i, "unitPrice", e.target.value)}
                        placeholder="Rate"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                        style={inputStyle}
                      />
                      {lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(i)} className="p-2 rounded-lg transition-colors mt-0.5" style={{ color: MUTED }}>
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addLineItem} className="mt-2 text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: GREEN }}>
                  <Plus className="w-3.5 h-3.5" /> Add line item
                </button>
              </div>

              {/* Totals */}
              <div className="rounded-xl p-3 space-y-1" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: MUTED }}>Subtotal</span>
                  <span className="font-data font-medium" style={{ color: CHARCOAL }}>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: MUTED }}>VAT rate</span>
                    <input
                      name="vatRate"
                      type="number"
                      defaultValue="0"
                      min="0"
                      max="100"
                      step="1"
                      className="w-16 px-2 py-1 rounded-lg text-xs text-center focus:outline-none"
                      style={{ border: `1px solid ${BORDER}`, background: "#fff", color: CHARCOAL }}
                    />
                    <span className="text-sm" style={{ color: MUTED }}>%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 mt-1" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <span style={{ color: CHARCOAL }}>Total</span>
                  <span className="font-data" style={{ color: CHARCOAL }}>{fmt(subtotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Notes</label>
                <textarea name="notes" rows={2} placeholder="Payment instructions, thank you note…" className={`${inputClass} resize-none`} style={inputStyle} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
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
