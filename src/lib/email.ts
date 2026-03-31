import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "invoices@beancountr.co.uk";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.beancountr.co.uk";

export type InvoiceEmailPayload = {
  to: string;
  senderName: string;
  businessName: string | null;
  invoiceNumber: string;
  publicId: string;
  total: number;
  dueDate: Date;
  isPro: boolean;
};

function fmtGbp(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

function buildInvoiceHtml(p: InvoiceEmailPayload): string {
  const publicUrl = `${APP_URL}/i/${p.publicId}`;
  const displayName = p.businessName ?? p.senderName;
  const footerLine = p.isPro
    ? ""
    : `<p style="margin:0;font-size:11px;color:#9ca3af;">Sent via <a href="${APP_URL}" style="color:#9ca3af;">Beancountr</a></p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:#1F1F1F;padding:28px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#F5F1E8;">${displayName}</p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(245,241,232,0.6);">Invoice ${p.invoiceNumber}</p>
          </td>
        </tr>

        <!-- Amount -->
        <tr>
          <td style="padding:32px 32px 24px;border-bottom:1px solid #f3f4f6;">
            <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Amount due</p>
            <p style="margin:0;font-size:36px;font-weight:700;color:#111827;">${fmtGbp(p.total)}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Due by ${fmtDate(p.dueDate)}</p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
              Please find your invoice attached. You can view a full breakdown and confirm payment using the button below.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:#4F7D6A;">
                  <a href="${publicUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                    View invoice
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
              Or copy this link: <a href="${publicUrl}" style="color:#4F7D6A;">${publicUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
            ${footerLine}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type ReminderEmailPayload = {
  to: string;
  senderName: string;
  businessName: string | null;
  invoiceNumber: string;
  publicId: string;
  total: number;
  dueDate: Date;
  daysOverdue: number;
};

function buildReminderHtml(p: ReminderEmailPayload): string {
  const publicUrl = `${APP_URL}/i/${p.publicId}`;
  const displayName = p.businessName ?? p.senderName;
  const overdueNote =
    p.daysOverdue > 0
      ? `This invoice is <strong>${p.daysOverdue} day${p.daysOverdue !== 1 ? "s" : ""} overdue</strong>.`
      : "This invoice is now due.";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td style="background:#1F1F1F;padding:28px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#F5F1E8;">${displayName}</p>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(245,241,232,0.6);">Payment reminder</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px;border-bottom:1px solid #f3f4f6;">
            <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Amount due</p>
            <p style="margin:0;font-size:36px;font-weight:700;color:#111827;">${fmtGbp(p.total)}</p>
            <p style="margin:8px 0 0;font-size:13px;color:#dc2626;">${overdueNote}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
              This is a friendly reminder that invoice ${p.invoiceNumber} for ${fmtGbp(p.total)} is still outstanding.
              Please arrange payment at your earliest convenience.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:#4F7D6A;">
                  <a href="${publicUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                    View invoice
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Sent via <a href="${APP_URL}" style="color:#9ca3af;">Beancountr</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendReminderEmail(payload: ReminderEmailPayload) {
  const subject = `Payment reminder: invoice ${payload.invoiceNumber} from ${payload.businessName ?? payload.senderName} (${fmtGbp(payload.total)})`;
  const { error } = await getResend().emails.send({
    from: FROM,
    to: payload.to,
    subject,
    html: buildReminderHtml(payload),
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}

export async function sendInvoiceEmail(payload: InvoiceEmailPayload) {
  const subject = `Invoice ${payload.invoiceNumber} from ${payload.businessName ?? payload.senderName} (${fmtGbp(payload.total)} due ${fmtDate(payload.dueDate)})`;

  const { error } = await getResend().emails.send({
    from: FROM,
    to: payload.to,
    subject,
    html: buildInvoiceHtml(payload),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}
