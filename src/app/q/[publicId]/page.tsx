import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { markQuoteViewed } from "@/server/actions/quotes";
import type { Metadata } from "next";

type Props = { params: Promise<{ publicId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicId } = await params;
  const quote = await prisma.quote.findUnique({
    where: { publicId },
    include: { user: { select: { businessName: true, fullName: true } } },
  });
  if (!quote) return { title: "Quote not found" };
  const sender = quote.user.businessName ?? quote.user.fullName ?? "Freelancer";
  return { title: `Quote ${quote.quoteNumber} from ${sender}` };
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
  amber: "#D4A373",
  muted: "rgba(31,31,31,0.55)",
  border: "rgba(31,31,31,0.1)",
  card: "#FDFAF4",
  lightGreen: "#E6F2ED",
  lightAmber: "#F6E7D8",
};

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:    { bg: "#EAE3D2",      color: C.muted,    label: "Draft" },
  SENT:     { bg: C.lightAmber,   color: C.amber,    label: "Awaiting approval" },
  ACCEPTED: { bg: C.lightGreen,   color: C.green,    label: "Accepted" },
  DECLINED: { bg: "#FEE2E2",      color: "#DC2626",  label: "Declined" },
  EXPIRED:  { bg: "#F3F4F6",      color: "#6B7280",  label: "Expired" },
};

export default async function PublicQuotePage({ params }: Props) {
  const { publicId } = await params;

  const quote = await prisma.quote.findUnique({
    where: { publicId },
    include: {
      lineItems: true,
      client: true,
      user: {
        select: {
          fullName: true, businessName: true, address: true, email: true, phone: true,
          bankAccountName: true, bankSortCode: true, bankAccountNo: true,
          bankName: true, bankIban: true, plan: true, logoUrl: true,
        },
      },
    },
  });

  if (!quote) notFound();
  await markQuoteViewed(publicId);

  const sender = quote.user;
  const senderName = sender.businessName ?? sender.fullName ?? "Your supplier";
  const isPro = sender.plan === "PRO";
  const ss = statusStyles[quote.status] ?? statusStyles.SENT;
  const isExpired = quote.status === "EXPIRED" || new Date(quote.expiryDate) < new Date();

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ background: C.charcoal, borderRadius: 16, padding: "28px 32px", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            {isPro && sender.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sender.logoUrl} alt={senderName} style={{ height: 48, objectFit: "contain" }} />
            ) : (
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.cream }}>{senderName}</p>
            )}
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(245,241,232,0.55)" }}>Quote {quote.quoteNumber}</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 999, background: ss.bg, color: ss.color }}>
            {ss.label}
          </span>
        </div>

        {/* Dates & addresses */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 32px", marginBottom: 2, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>From</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal }}>{senderName}</p>
            {sender.address && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, whiteSpace: "pre-line" }}>{sender.address}</p>}
            {sender.email && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>{sender.email}</p>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>To</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.charcoal }}>{quote.client.name}</p>
            {quote.client.address && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.muted, whiteSpace: "pre-line" }}>{quote.client.address}</p>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted }}>Dates</p>
            <p style={{ margin: 0, fontSize: 12, color: C.charcoal }}>Issued: {fmtDate(quote.issueDate)}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, color: isExpired ? "#DC2626" : C.charcoal }}>
              Valid until: {fmtDate(quote.expiryDate)}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px", gap: 8, padding: "12px 24px", borderBottom: `1px solid ${C.border}` }}>
            {["Description", "Qty", "Unit price", "Amount"].map((h) => (
              <p key={h} style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, textAlign: h === "Description" ? "left" : "right" }}>{h}</p>
            ))}
          </div>
          {quote.lineItems.map((li) => (
            <div key={li.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px", gap: 8, padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 14, color: C.charcoal }}>{li.description}</p>
              <p style={{ margin: 0, fontSize: 14, color: C.muted, textAlign: "right" }}>{li.quantity}</p>
              <p style={{ margin: 0, fontSize: 14, color: C.muted, textAlign: "right" }}>{fmt(li.unitPrice)}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.charcoal, textAlign: "right" }}>{fmt(li.amount)}</p>
            </div>
          ))}
          <div style={{ padding: "16px 24px" }}>
            {quote.vatAmount > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Subtotal</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.charcoal }}>{fmt(quote.subtotal)}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.muted }}>VAT</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.charcoal }}>{fmt(quote.vatAmount)}</p>
                </div>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.charcoal }}>Quote total</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.charcoal }}>{fmt(quote.total)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 2 }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: C.charcoal }}>Notes</p>
            <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6, whiteSpace: "pre-line" }}>{quote.notes}</p>
          </div>
        )}

        {/* Footer */}
        {!isPro && (
          <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: C.muted }}>
            Sent via <a href="https://www.beancountr.co.uk" style={{ color: C.muted }}>Beancountr</a>
          </p>
        )}
      </div>
    </div>
  );
}
