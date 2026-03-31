import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { markInvoiceViewed } from "@/server/actions/invoices";
import { PrintButton } from "./print-button";
import type { Metadata } from "next";

type Props = { params: Promise<{ publicId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: { user: { select: { businessName: true, fullName: true } } },
  });
  if (!invoice) return { title: "Invoice not found" };
  const sender = invoice.user.businessName ?? invoice.user.fullName ?? "Freelancer";
  return { title: `Invoice ${invoice.invoiceNumber} from ${sender}` };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

const C = {
  cream: "#F5F1E8",
  charcoal: "#1F1F1F",
  green: "#4F7D6A",
  muted: "rgba(31,31,31,0.55)",
  border: "rgba(31,31,31,0.1)",
  card: "#FDFAF4",
  lightGreen: "#E6F2ED",
};

export default async function PublicInvoicePage({ params }: Props) {
  const { publicId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { publicId },
    include: {
      lineItems: true,
      client: true,
      user: {
        select: {
          fullName: true,
          businessName: true,
          address: true,
          email: true,
          phone: true,
          bankAccountName: true,
          bankSortCode: true,
          bankAccountNo: true,
          bankName: true,
          bankIban: true,
          plan: true,
          logoUrl: true,
        },
      },
    },
  });

  if (!invoice) notFound();

  // Mark as viewed (no-op if already set; only writes once)
  await markInvoiceViewed(publicId);

  const sender = invoice.user;
  const senderName = sender.businessName ?? sender.fullName ?? "Your supplier";
  const isPro = sender.plan === "PRO";

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div
          style={{
            background: C.charcoal,
            borderRadius: 16,
            padding: "28px 32px",
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            {isPro && sender.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sender.logoUrl} alt={senderName} style={{ height: 48, objectFit: "contain" }} />
            ) : (
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.cream }}>{senderName}</p>
            )}
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(245,241,232,0.55)" }}>
              Invoice {invoice.invoiceNumber}
            </p>
          </div>

          {/* Status badge */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 999,
              background: isPaid ? C.lightGreen : isOverdue ? "#FEE2E2" : "rgba(245,241,232,0.12)",
              color: isPaid ? C.green : isOverdue ? "#DC2626" : C.cream,
            }}
          >
            {isPaid ? "Paid" : isOverdue ? "Overdue" : invoice.status === "SENT" ? "Payment due" : invoice.status}
          </span>
        </div>

        {/* Dates & addresses */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "24px 32px",
            marginBottom: 2,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 24,
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>From</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal }}>{senderName}</p>
            {sender.address && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, whiteSpace: "pre-line" }}>{sender.address}</p>}
            {sender.email && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{sender.email}</p>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>To</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal }}>{invoice.client.name}</p>
            {invoice.client.address && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, whiteSpace: "pre-line" }}>{invoice.client.address}</p>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>Dates</p>
            <p style={{ margin: 0, fontSize: 12, color: C.charcoal }}>Issued: {fmtDate(invoice.issueDate)}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, color: isOverdue ? "#DC2626" : C.charcoal }}>
              Due: {fmtDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 2,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 90px 90px",
              gap: 8,
              padding: "12px 24px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {["Description", "Qty", "Unit price", "Amount"].map((h) => (
              <p key={h} style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, textAlign: h === "Description" ? "left" : "right" }}>
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {invoice.lineItems.map((li) => (
            <div
              key={li.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 90px 90px",
                gap: 8,
                padding: "14px 24px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, color: C.charcoal }}>{li.description}</p>
              <p style={{ margin: 0, fontSize: 14, color: C.muted, textAlign: "right" }}>{li.quantity}</p>
              <p style={{ margin: 0, fontSize: 14, color: C.muted, textAlign: "right" }}>{fmt(li.unitPrice)}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.charcoal, textAlign: "right" }}>{fmt(li.amount)}</p>
            </div>
          ))}

          {/* Totals */}
          <div style={{ padding: "16px 24px" }}>
            {invoice.vatAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Subtotal</p>
                <p style={{ margin: 0, fontSize: 13, color: C.charcoal }}>{fmt(invoice.subtotal)}</p>
              </div>
            )}
            {invoice.vatAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: C.muted }}>VAT</p>
                <p style={{ margin: 0, fontSize: 13, color: C.charcoal }}>{fmt(invoice.vatAmount)}</p>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.charcoal }}>Total due</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.charcoal }}>{fmt(invoice.total)}</p>
            </div>
          </div>
        </div>

        {/* Bank details — always show the three pillars of UK payment */}
        {(sender.bankAccountName || sender.bankSortCode || sender.bankAccountNo) && (
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 2,
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: C.charcoal }}>Payment details</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {sender.bankAccountName && (
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>Account name</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal }}>{sender.bankAccountName}</p>
                </div>
              )}
              {sender.bankSortCode && (
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>Sort code</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>{sender.bankSortCode}</p>
                </div>
              )}
              {sender.bankAccountNo && (
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>Account number</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>{sender.bankAccountNo}</p>
                </div>
              )}
            </div>
            {sender.bankName && (
              <p style={{ margin: "12px 0 0", fontSize: 12, color: C.muted }}>Bank: {sender.bankName}</p>
            )}
            {sender.bankIban && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>IBAN: {sender.bankIban}</p>
            )}
            <p style={{ margin: "12px 0 0", fontSize: 12, color: C.muted }}>
              Reference: <strong style={{ color: C.charcoal }}>{invoice.invoiceNumber}</strong>
            </p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 2,
            }}
          >
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: C.charcoal }}>Notes</p>
            <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6, whiteSpace: "pre-line" }}>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        {!isPro && (
          <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: C.muted }}>
            Sent via{" "}
            <a href="https://www.beancountr.co.uk" style={{ color: C.muted }}>
              Beancountr
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
