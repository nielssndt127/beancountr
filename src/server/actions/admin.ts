"use server";

import { getCurrentUser } from "@/lib/get-user";
import { getResend } from "@/lib/email";

const ADMIN_EMAIL = "niels.schnadt@gmail.com";

function assertAdmin(email: string | null | undefined) {
  if (email !== ADMIN_EMAIL) throw new Error("Unauthorized");
}

export async function sendAdminEmail(
  to: string[],
  subject: string,
  body: string
): Promise<{ sent: number; errors: string[] }> {
  const user = await getCurrentUser();
  assertAdmin(user?.email);

  if (!to.length) throw new Error("No recipients");

  const resend = getResend();
  const errors: string[] = [];
  let sent = 0;

  // Send in small batches to avoid rate limits
  for (const email of to) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "hello@beancountr.co.uk",
        to: email,
        subject,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1F1F1F;">
            ${body.split("\n").map(line => line.trim() ? `<p style="margin: 0 0 16px; line-height: 1.6;">${line}</p>` : "<br/>").join("")}
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #EAE3D2;" />
            <p style="font-size: 12px; color: #8C8278;">You're receiving this because you have a Beancountr account. <a href="https://www.beancountr.co.uk" style="color: #4F7D6A;">beancountr.co.uk</a></p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      errors.push(`${email}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return { sent, errors };
}
