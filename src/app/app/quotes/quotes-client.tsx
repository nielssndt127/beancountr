"use client";

import { useState } from "react";
import { createQuote, sendQuote, updateQuoteStatus, deleteQuote, convertToInvoice } from "@/server/actions/quotes";
import { createClientByName } from "@/server/actions/clients";
import { ClipboardList, Plus, Trash2, X, Send, Link2, ArrowRight, AlertCircle, Check, ChevronDown } from "lucide-react";
import { QuoteStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

type Client = { id: string; name: string; email: string | null };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type Quote = {
  id: string;
  publicId: string;
  quoteNumber: string;
  issueDate: Date;
  expiryDate: Date;
  status: QuoteStatus;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes: string | null;
  recipientEmail: string | null;
  client: Client;
  lineItems: LineItem[];
  invoices: { id: string; invoiceNumber: string }[];
};

const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

const CHARCOAL = "#1F1F1F";
const GREEN    = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD   = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED  = "rgba(31,31,31,0.55)";
const AMBER  = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";
const CREAM  = "#F5F1E8";

const statusConfig: Record<QuoteStatus, { label: string; bg: string; color: string }> = {
  DRAFT:    { label: "Draft",    bg: "#EAE3D2",   color: MUTED },
  SENT:     { label: "Sent",     bg: LIGHT_AMBER, color: AMBER },
  ACCEPTED: { label: "Accepted", bg: LIGHT_GREEN, color: GREEN },
  DECLINED: { label: "Declined", bg: "#FEE2E2",   color: "#DC2626" },
  EXPIRED:  { label: "Expired",  bg: "#F3F4F6",   color: "#6B7280" },
};

const cell: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: `2px solid ${GREEN}`,
  outline: "none", color: CHARCOAL, fontSize: "13px", padding: "2px 4px", width: "100%",
};

type FormLineItem = { description: string; quantity: string; unitPrice: string };
const emptyLI = (): FormLineItem => ({ description: "", quantity: "1", unitPrice: "" });

type FormState = {
  clientName: string;
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  recipientEmail: string;
  vatRate: string;
  notes: string;
};

export function QuotesClient({
  quotes, clients, nextQuoteNumber, paymentTerms: _paymentTerms, isPro: _isPro, appUrl,
}: {
  quotes: Quote[];
  clients: Client[];
  nextQuoteNumber: string;
  paymentTerms: number;
  isPro: boolean;
  appUrl: string;
}) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const expiryDefault = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    clientName: "", quoteNumber: nextQuoteNumber,
    issueDate: today, expiryDate: expiryDefault,
    recipientEmail: "", vatRate: "0", notes: "",
  });
  const [lineItems, setLineItems] = useState<FormLineItem[]>([emptyLI()]);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting]     = useState<string | null>(null);
  const [sendingId, setSendingId]   = useState<string | null>(null);
  const [sendError, setSendError]   = useState<string | null>(null);
  const [copied, setCopied]         = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertModal, setConvertModal] = useState<Quote | null>(null);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [convertLineItems, setConvertLineItems] = useState<FormLineItem[]>([]);

  const subtotal = lineItems.reduce((s, li) =>
    s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0), 0);

  function setF(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function openForm() {
    setForm({ clientName: "", quoteNumber: nextQuoteNumber, issueDate: today, expiryDate: expiryDefault, recipientEmail: "", vatRate: "0", notes: "" });
    setLineItems([emptyLI()]);
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim() || saving) return;
    setSaving(true);

    // Resolve or create client
    let clientId: string;
    const existing = clients.find(c => c.name.toLowerCase() === form.clientName.trim().toLowerCase());
    if (existing) {
      clientId = existing.id;
    } else {
      try {
        const newClient = await createClientByName(form.clientName.trim());
        clientId = newClient.id;
      } catch {
        alert("Could not create client. You may have reached the free plan limit (3 clients).");
        setSaving(false);
        return;
      }
    }

    const fd = new FormData();
    fd.set("clientId", clientId);
    fd.set("quoteNumber", form.quoteNumber);
    fd.set("issueDate", form.issueDate);
    fd.set("expiryDate", form.expiryDate);
    fd.set("recipientEmail", form.recipientEmail);
    fd.set("vatRate", form.vatRate);
    fd.set("notes", form.notes);
    fd.set("lineItems", JSON.stringify(lineItems.map(li => ({
      description: li.description,
      quantity: parseFloat(li.quantity) || 0,
      unitPrice: parseFloat(li.unitPrice) || 0,
    }))));
    await createQuote(fd);
    closeForm();
    setSaving(false);
  }

  async function handleSend(quote: Quote) {
    const email = window.prompt(`Send ${quote.quoteNumber} to:`, quote.recipientEmail ?? quote.client.email ?? "");
    if (!email) return;
    setSendingId(quote.id);
    setSendError(null);
    const result = await sendQuote(quote.id, email);
    setSendingId(null);
    if (result.error) setSendError(result.error);
  }

  async function handleCopyLink(publicId: string) {
    await navigator.clipboard.writeText(`${appUrl}/q/${publicId}`);
    setCopied(publicId);
    setTimeout(() => setCopied(null), 2000);
  }

  function openConvertModal(quote: Quote) {
    setConvertLineItems(quote.lineItems.map(li => ({
      description: li.description,
      quantity: String(li.quantity),
      unitPrice: String(li.unitPrice),
    })));
    setAdjustmentNote("");
    setConvertModal(quote);
  }

  async function handleConvert() {
    if (!convertModal) return;
    const newTotal = convertLineItems.reduce((s, li) => s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0), 0);
    const priceChanged = Math.abs(newTotal - convertModal.total) > 0.01;
    if (priceChanged && !adjustmentNote.trim()) {
      alert("Please add a note explaining the price change.");
      return;
    }
    setConvertingId(convertModal.id);
    const result = await convertToInvoice(
      convertModal.id,
      adjustmentNote.trim() || null,
      convertLineItems.map(li => ({
        description: li.description,
        quantity: parseFloat(li.quantity) || 0,
        unitPrice: parseFloat(li.unitPrice) || 0,
      }))
    );
    setConvertingId(null);
    setConvertModal(null);
    if (!result.error) router.push("/app/invoices");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Quotes</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{quotes.length} quote{quotes.length !== 1 ? "s" : ""}</p>
        </div>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
            style={{ background: GREEN, color: "#fff" }}
          >
            <Plus className="w-4 h-4" /> New quote
          </button>
        )}
      </div>

      {/* ── Send error ── */}
      {sendError && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "#FEE2E2", border: "1px solid #FCA5A5" }}>
          <p className="text-sm" style={{ color: "#DC2626" }}>Could not send: {sendError}</p>
          <button onClick={() => setSendError(null)}><X className="w-4 h-4" style={{ color: "#DC2626" }} /></button>
        </div>
      )}

      {/* ── Inline new-quote form ── */}
      {showForm && (
        <form onSubmit={handleCreate}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#F0F9F4", border: `1.5px solid ${GREEN}` }}>

            {/* Form header */}
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <p className="text-sm font-semibold" style={{ color: GREEN }}>New quote</p>
              <button type="button" onClick={closeForm} style={{ color: MUTED }}><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-4">
              {/* Row 1: Client / Quote number / Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Client *</label>
                  <input
                    value={form.clientName}
                    onChange={e => setF("clientName", e.target.value)}
                    placeholder="Client name"
                    required
                    list="quote-client-list"
                    style={cell}
                    autoComplete="off"
                  />
                  <datalist id="quote-client-list">
                    {clients.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Quote #</label>
                  <input value={form.quoteNumber} onChange={e => setF("quoteNumber", e.target.value)} required style={cell} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Issue date</label>
                  <input type="date" value={form.issueDate} onChange={e => setF("issueDate", e.target.value)} required style={cell} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Valid until</label>
                  <input type="date" value={form.expiryDate} onChange={e => setF("expiryDate", e.target.value)} required style={cell} />
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Recipient email</label>
                  <input type="email" value={form.recipientEmail} onChange={e => setF("recipientEmail", e.target.value)} placeholder="client@example.com" style={cell} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>VAT %</label>
                  <input type="number" min="0" max="100" step="1" value={form.vatRate} onChange={e => setF("vatRate", e.target.value)} placeholder="0" style={cell} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: MUTED }}>Line items</label>
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="text-left pb-1 text-xs font-semibold uppercase tracking-wider pr-2" style={{ color: MUTED }}>Description</th>
                      <th className="text-left pb-1 text-xs font-semibold uppercase tracking-wider w-16 pr-2" style={{ color: MUTED }}>Qty</th>
                      <th className="text-left pb-1 text-xs font-semibold uppercase tracking-wider w-24 pr-2" style={{ color: MUTED }}>Rate £</th>
                      <th className="text-right pb-1 text-xs font-semibold uppercase tracking-wider w-20" style={{ color: MUTED }}>Amount</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((li, i) => {
                      const amt = (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0);
                      return (
                        <tr key={i}>
                          <td className="pr-2 py-1">
                            <input value={li.description} onChange={e => setLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, description: e.target.value } : l))} placeholder="Description" style={cell} />
                          </td>
                          <td className="pr-2 py-1">
                            <input type="number" step="0.25" min="0" value={li.quantity} onChange={e => setLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: e.target.value } : l))} style={cell} />
                          </td>
                          <td className="pr-2 py-1">
                            <input type="number" step="0.01" min="0" value={li.unitPrice} onChange={e => setLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, unitPrice: e.target.value } : l))} placeholder="0.00" style={cell} />
                          </td>
                          <td className="text-right py-1 text-xs font-mono" style={{ color: CHARCOAL }}>{fmt(amt)}</td>
                          <td className="py-1 pl-1">
                            {lineItems.length > 1 && (
                              <button type="button" onClick={() => setLineItems(prev => prev.filter((_, idx) => idx !== i))} style={{ color: MUTED }}>
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => setLineItems(prev => [...prev, emptyLI()])}
                  className="mt-2 text-xs font-medium flex items-center gap-1"
                  style={{ color: GREEN }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add line item
                </button>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Notes</label>
                <input value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Scope, assumptions, terms…" style={cell} />
              </div>

              {/* Footer: total + actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-bold font-mono" style={{ color: GREEN }}>{fmt(subtotal)} subtotal</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={closeForm} className="px-4 py-2 rounded-full text-sm font-medium" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={!form.clientName.trim() || saving}
                    className="px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                    style={{ background: GREEN, color: "#fff" }}
                  >
                    {saving ? "Saving…" : "Create quote"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── Quotes table ── */}
      {quotes.length === 0 && !showForm ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: LIGHT_GREEN }}>
            <ClipboardList className="w-6 h-6" style={{ color: GREEN }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No quotes yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Create a quote and send it to a client. Convert it to an invoice once they agree.</p>
        </div>
      ) : quotes.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Quote #", "Client", "Issued", "Expires", "Total", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: MUTED }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => {
                  const cfg = statusConfig[quote.status];
                  const converted = quote.invoices.length > 0;
                  return (
                    <tr key={quote.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-semibold text-xs" style={{ color: CHARCOAL }}>{quote.quoteNumber}</p>
                        {converted && (
                          <span className="text-xs" style={{ color: GREEN }}>→ {quote.invoices[0].invoiceNumber}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: CHARCOAL }}>{quote.client.name}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: MUTED }}>{fmtDate(quote.issueDate)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: MUTED }}>{fmtDate(quote.expiryDate)}</td>
                      <td className="px-4 py-3 text-xs font-semibold font-mono whitespace-nowrap" style={{ color: CHARCOAL }}>{fmt(quote.total)}</td>
                      <td className="px-4 py-3">
                        <div className="relative group inline-block">
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label} <ChevronDown className="w-3 h-3 opacity-60" />
                          </span>
                          <div className="absolute left-0 top-full mt-1 rounded-xl py-1 w-36 hidden group-hover:block z-10 shadow-lg" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
                            {(["DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"] as QuoteStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => updateQuoteStatus(quote.id, s)}
                                className="w-full text-left px-3 py-2 text-xs font-medium hover:opacity-70"
                                style={{ color: quote.status === s ? CHARCOAL : MUTED }}
                              >
                                {statusConfig[s].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {/* Copy link */}
                          <button
                            onClick={() => handleCopyLink(quote.publicId)}
                            title="Copy quote link"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-all"
                            style={{ color: MUTED }}
                          >
                            {copied === quote.publicId
                              ? <Check className="w-3.5 h-3.5" style={{ color: GREEN }} />
                              : <Link2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Send */}
                          <button
                            onClick={() => handleSend(quote)}
                            disabled={sendingId === quote.id}
                            title="Send by email"
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 disabled:opacity-40 transition-all"
                            style={{ color: MUTED }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* To invoice */}
                          {!converted && (quote.status === "SENT" || quote.status === "ACCEPTED" || quote.status === "DRAFT") && (
                            <button
                              onClick={() => openConvertModal(quote)}
                              title="Convert to invoice"
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-all"
                              style={{ color: AMBER }}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={async () => { setDeleting(quote.id); await deleteQuote(quote.id); setDeleting(null); }}
                            disabled={deleting === quote.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 disabled:opacity-40 transition-all"
                            style={{ color: MUTED }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked list */}
          <div className="sm:hidden divide-y" style={{ borderColor: BORDER }}>
            {quotes.map(quote => {
              const cfg = statusConfig[quote.status];
              const converted = quote.invoices.length > 0;
              return (
                <div key={quote.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: CHARCOAL }}>{quote.quoteNumber}</p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{quote.client.name} · {fmtDate(quote.expiryDate)}</p>
                      {converted && <p className="text-xs mt-0.5" style={{ color: GREEN }}>→ {quote.invoices[0].invoiceNumber}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold font-mono" style={{ color: CHARCOAL }}>{fmt(quote.total)}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopyLink(quote.publicId)} className="flex items-center gap-1 text-xs font-medium" style={{ color: GREEN }}>
                      <Link2 className="w-3 h-3" />
                      {copied === quote.publicId ? "Copied!" : "Copy link"}
                    </button>
                    <button onClick={() => handleSend(quote)} disabled={sendingId === quote.id} className="flex items-center gap-1 text-xs font-medium" style={{ color: MUTED }}>
                      <Send className="w-3 h-3" /> Send
                    </button>
                    {!converted && (quote.status === "SENT" || quote.status === "ACCEPTED" || quote.status === "DRAFT") && (
                      <button onClick={() => openConvertModal(quote)} className="flex items-center gap-1 text-xs font-medium" style={{ color: AMBER }}>
                        <ArrowRight className="w-3 h-3" /> To invoice
                      </button>
                    )}
                    <button onClick={async () => { setDeleting(quote.id); await deleteQuote(quote.id); setDeleting(null); }} disabled={deleting === quote.id} className="ml-auto" style={{ color: MUTED }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Convert to invoice modal (kept as focused overlay — complex multi-field review) ── */}
      {convertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-lg my-8" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold text-sm" style={{ color: CHARCOAL }}>Convert {convertModal.quoteNumber} → invoice</h2>
              <button onClick={() => setConvertModal(null)} style={{ color: MUTED }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs" style={{ color: MUTED }}>
                Review line items. Update amounts if anything changed and add a note if the total differs from the quote.
              </p>

              {/* Editable line items */}
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="text-left pb-1.5 text-xs font-semibold uppercase tracking-wider pr-2" style={{ color: MUTED }}>Description</th>
                    <th className="text-left pb-1.5 text-xs font-semibold uppercase tracking-wider w-14 pr-2" style={{ color: MUTED }}>Qty</th>
                    <th className="text-left pb-1.5 text-xs font-semibold uppercase tracking-wider w-20" style={{ color: MUTED }}>Rate £</th>
                  </tr>
                </thead>
                <tbody>
                  {convertLineItems.map((li, i) => (
                    <tr key={i}>
                      <td className="pr-2 py-1">
                        <input value={li.description} onChange={e => setConvertLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, description: e.target.value } : l))} style={cell} />
                      </td>
                      <td className="pr-2 py-1">
                        <input type="number" step="0.25" min="0" value={li.quantity} onChange={e => setConvertLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: e.target.value } : l))} style={cell} />
                      </td>
                      <td className="py-1">
                        <input type="number" step="0.01" min="0" value={li.unitPrice} onChange={e => setConvertLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, unitPrice: e.target.value } : l))} style={cell} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price change warning */}
              {(() => {
                const newTotal = convertLineItems.reduce((s, li) => s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0), 0);
                const diff = newTotal - convertModal.total;
                return Math.abs(diff) > 0.01 ? (
                  <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: LIGHT_AMBER, border: `1px solid #EDCDA6` }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: AMBER }} />
                    <p className="text-xs" style={{ color: CHARCOAL }}>
                      Price changed by {fmt(Math.abs(diff))} ({diff > 0 ? "increase" : "decrease"}). A note is required.
                    </p>
                  </div>
                ) : null;
              })()}

              {/* Adjustment note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
                  Note <span style={{ fontWeight: 400 }}>(required if total changed)</span>
                </label>
                <input
                  value={adjustmentNote}
                  onChange={e => setAdjustmentNote(e.target.value)}
                  placeholder="e.g. Scope expanded to include additional revisions"
                  style={{ ...cell, borderBottom: `2px solid ${GREEN}` }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setConvertModal(null)} className="flex-1 py-2.5 rounded-full text-sm font-medium" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={!!convertingId}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
                  style={{ background: GREEN, color: "#fff" }}
                >
                  {convertingId ? "Creating…" : "Create invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
