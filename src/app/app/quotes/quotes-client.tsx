"use client";

import { useState } from "react";
import { createQuote, sendQuote, updateQuoteStatus, deleteQuote, convertToInvoice } from "@/server/actions/quotes";
import { FileText, Plus, Trash2, ChevronDown, X, Send, Link2, ArrowRight, AlertCircle } from "lucide-react";
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

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";
const AMBER = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";

const statusConfig: Record<QuoteStatus, { label: string; bg: string; color: string }> = {
  DRAFT:    { label: "Draft",    bg: "#EAE3D2",   color: MUTED },
  SENT:     { label: "Sent",     bg: LIGHT_AMBER, color: AMBER },
  ACCEPTED: { label: "Accepted", bg: LIGHT_GREEN, color: GREEN },
  DECLINED: { label: "Declined", bg: "#FEE2E2",   color: "#DC2626" },
  EXPIRED:  { label: "Expired",  bg: "#F3F4F6",   color: "#6B7280" },
};

const inputStyle = { background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL } as React.CSSProperties;
const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";

type FormLineItem = { description: string; quantity: string; unitPrice: string };

export function QuotesClient({
  quotes, clients, nextQuoteNumber, paymentTerms, isPro, appUrl,
}: {
  quotes: Quote[];
  clients: Client[];
  nextQuoteNumber: string;
  paymentTerms: number;
  isPro: boolean;
  appUrl: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertModal, setConvertModal] = useState<Quote | null>(null);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [convertLineItems, setConvertLineItems] = useState<FormLineItem[]>([]);
  const [lineItems, setLineItems] = useState<FormLineItem[]>([{ description: "", quantity: "1", unitPrice: "" }]);

  const subtotal = lineItems.reduce((sum, li) => {
    return sum + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0);
  }, 0);

  const today = new Date().toISOString().split("T")[0];
  const expiryDefault = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  function openConvertModal(quote: Quote) {
    setConvertLineItems(quote.lineItems.map((li) => ({
      description: li.description,
      quantity: String(li.quantity),
      unitPrice: String(li.unitPrice),
    })));
    setAdjustmentNote("");
    setConvertModal(quote);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("lineItems", JSON.stringify(lineItems.map((li) => ({
      description: li.description,
      quantity: parseFloat(li.quantity) || 0,
      unitPrice: parseFloat(li.unitPrice) || 0,
    }))));
    await createQuote(fd);
    setShowForm(false);
    setLineItems([{ description: "", quantity: "1", unitPrice: "" }]);
  }

  async function handleSend(quote: Quote) {
    const email = window.prompt(`Send quote ${quote.quoteNumber} to:`, quote.recipientEmail ?? quote.client.email ?? "");
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

  async function handleConvert() {
    if (!convertModal) return;
    setConvertingId(convertModal.id);

    const origTotal = convertModal.total;
    const newTotal = convertLineItems.reduce((s, li) => s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0), 0);
    const priceChanged = Math.abs(newTotal - origTotal) > 0.01;

    if (priceChanged && !adjustmentNote.trim()) {
      alert("Please add a note explaining the price change.");
      setConvertingId(null);
      return;
    }

    const result = await convertToInvoice(
      convertModal.id,
      adjustmentNote.trim() || null,
      convertLineItems.map((li) => ({
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Quotes</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{quotes.length} quote{quotes.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Plus className="w-4 h-4" /> New quote
        </button>
      </div>

      {sendError && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "#FEE2E2", border: "1px solid #FCA5A5" }}>
          <p className="text-sm" style={{ color: "#DC2626" }}>Could not send: {sendError}</p>
          <button onClick={() => setSendError(null)}><X className="w-4 h-4" style={{ color: "#DC2626" }} /></button>
        </div>
      )}

      {quotes.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: LIGHT_GREEN }}>
            <FileText className="w-6 h-6" style={{ color: GREEN }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No quotes yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Create a quote and send it to a client. Convert it to an invoice once they agree.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          {quotes.map((quote) => {
            const cfg = statusConfig[quote.status];
            const publicUrl = `${appUrl}/q/${quote.publicId}`;
            const converted = quote.invoices.length > 0;
            return (
              <div key={quote.id} className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium" style={{ color: CHARCOAL }}>{quote.quoteNumber}</p>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {converted && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: LIGHT_GREEN, color: GREEN }}>
                        Converted to {quote.invoices[0].invoiceNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                    {quote.client.name} · Issued {fmtDate(quote.issueDate)} · Expires {fmtDate(quote.expiryDate)}
                  </p>
                  <button
                    onClick={() => handleCopyLink(quote.publicId)}
                    className="flex items-center gap-1 text-xs mt-1 hover:opacity-70 transition-opacity"
                    style={{ color: GREEN }}
                    title={publicUrl}
                  >
                    <Link2 className="w-3 h-3" />
                    {copied === quote.publicId ? "Copied!" : "Copy quote link"}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-sm font-semibold" style={{ color: CHARCOAL }}>{fmt(quote.total)}</p>

                  <button
                    onClick={() => handleSend(quote)}
                    disabled={sendingId === quote.id}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80 disabled:opacity-50 transition-all"
                    style={{ background: LIGHT_GREEN, color: GREEN }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingId === quote.id ? "Sending…" : "Send"}
                  </button>

                  {!converted && (quote.status === "SENT" || quote.status === "ACCEPTED" || quote.status === "DRAFT") && (
                    <button
                      onClick={() => openConvertModal(quote)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80 transition-all"
                      style={{ background: LIGHT_AMBER, color: AMBER }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      To invoice
                    </button>
                  )}

                  <div className="relative group">
                    <button className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors" style={{ color: MUTED }}>
                      Status <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 rounded-xl py-1 w-36 hidden group-hover:block z-10" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
                      {(["DRAFT", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"] as QuoteStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateQuoteStatus(quote.id, s)}
                          className="w-full text-left px-3 py-2 text-xs font-medium"
                          style={{ color: quote.status === s ? CHARCOAL : MUTED }}
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={async () => { setDeleting(quote.id); await deleteQuote(quote.id); setDeleting(null); }}
                    disabled={deleting === quote.id}
                    className="p-2 rounded-lg disabled:opacity-50"
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

      {/* Convert to invoice modal */}
      {convertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-lg my-8" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold" style={{ color: CHARCOAL }}>Convert {convertModal.quoteNumber} to invoice</h2>
              <button onClick={() => setConvertModal(null)} style={{ color: MUTED }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm" style={{ color: MUTED }}>
                Review the line items below. If anything has changed, update the amounts and add a note explaining why.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: CHARCOAL }}>Line items</label>
                {convertLineItems.map((li, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={li.description}
                      onChange={(e) => setConvertLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, description: e.target.value } : l))}
                      placeholder="Description"
                      className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
                      style={inputStyle}
                    />
                    <input
                      value={li.quantity}
                      onChange={(e) => setConvertLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: e.target.value } : l))}
                      type="number" min="0" step="0.25" placeholder="Qty"
                      className="w-16 px-3 py-2 rounded-xl text-sm focus:outline-none"
                      style={inputStyle}
                    />
                    <input
                      value={li.unitPrice}
                      onChange={(e) => setConvertLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, unitPrice: e.target.value } : l))}
                      type="number" min="0" step="0.01" placeholder="Rate"
                      className="w-24 px-3 py-2 rounded-xl text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {(() => {
                const newTotal = convertLineItems.reduce((s, li) => s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unitPrice) || 0), 0);
                const diff = newTotal - convertModal.total;
                const changed = Math.abs(diff) > 0.01;
                return changed ? (
                  <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: LIGHT_AMBER, border: `1px solid #EDCDA6` }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: AMBER }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: CHARCOAL }}>
                        Price changed by {fmt(Math.abs(diff))} ({diff > 0 ? "increase" : "decrease"})
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>A note is required explaining the change.</p>
                    </div>
                  </div>
                ) : null;
              })()}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>
                  Reason for price change <span style={{ color: MUTED, fontWeight: 400 }}>(required if total differs from quote)</span>
                </label>
                <textarea
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Additional revisions requested, scope expanded to include…"
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
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
                  {convertingId ? "Creating invoice…" : "Create invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New quote form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-lg my-8" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold" style={{ color: CHARCOAL }}>New quote</h2>
              <button onClick={() => setShowForm(false)} style={{ color: MUTED }}><X className="w-4 h-4" /></button>
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Quote number *</label>
                  <input name="quoteNumber" defaultValue={nextQuoteNumber} required className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Issue date *</label>
                  <input name="issueDate" type="date" defaultValue={today} required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Valid until *</label>
                  <input name="expiryDate" type="date" defaultValue={expiryDefault} required className={inputClass} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Recipient email</label>
                <input name="recipientEmail" type="email" placeholder="client@example.com" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: CHARCOAL }}>Line items</label>
                <div className="space-y-2">
                  {lineItems.map((li, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input value={li.description} onChange={(e) => setLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, description: e.target.value } : l))} placeholder="Description" className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2" style={inputStyle} />
                      <input value={li.quantity} onChange={(e) => setLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, quantity: e.target.value } : l))} placeholder="Qty" type="number" min="0" step="0.25" className="w-16 px-3 py-2 rounded-xl text-sm focus:outline-none" style={inputStyle} />
                      <input value={li.unitPrice} onChange={(e) => setLineItems(prev => prev.map((l, idx) => idx === i ? { ...l, unitPrice: e.target.value } : l))} placeholder="Rate" type="number" min="0" step="0.01" className="w-24 px-3 py-2 rounded-xl text-sm focus:outline-none" style={inputStyle} />
                      {lineItems.length > 1 && (
                        <button type="button" onClick={() => setLineItems(prev => prev.filter((_, idx) => idx !== i))} className="p-2 mt-0.5" style={{ color: MUTED }}><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setLineItems(prev => [...prev, { description: "", quantity: "1", unitPrice: "" }])} className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: GREEN }}>
                  <Plus className="w-3.5 h-3.5" /> Add line item
                </button>
              </div>
              <div className="rounded-xl p-3" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: MUTED }}>VAT rate</span>
                    <input name="vatRate" type="number" defaultValue="0" min="0" max="100" step="1" className="w-16 px-2 py-1 rounded-lg text-xs text-center focus:outline-none" style={{ border: `1px solid ${BORDER}`, background: "#fff", color: CHARCOAL }} />
                    <span className="text-sm" style={{ color: MUTED }}>%</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: CHARCOAL }}>{fmt(subtotal)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Notes</label>
                <textarea name="notes" rows={2} placeholder="Scope, assumptions, terms…" className={`${inputClass} resize-none`} style={inputStyle} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-full text-sm font-medium" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all" style={{ background: GREEN, color: "#fff" }}>Create quote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
