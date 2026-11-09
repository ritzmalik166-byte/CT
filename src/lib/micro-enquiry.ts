import "server-only";

import { query } from "@/lib/db";
import { sendMail } from "@/lib/handle-nodemailer";
import { renderAdminEnquiryEmail } from "@/lib/email-templates";

/**
 * Micro-enquiry service.
 *
 * Fires the moment an email OTP is generated for an international number,
 * so the admin sees WHO tried to enquire even if they never verify the OTP.
 * This is intentionally independent from the verified-lead flow
 * (/api/enquiry -> leads table + Telegram), which is untouched.
 */

export type EnquirySnapshot = {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  phone?: string;
  country?: string;
  subject?: string;
  message?: string;
};

export type MicroEnquiryContext = {
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
};

function getAdminRecipients(): string | null {
  return (
    process.env.ENQUIRY_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    null
  );
}

/** The website form prefixes "Country: X" to the message; drop it (shown separately). */
function cleanMessage(message?: string): string | undefined {
  return message?.replace(/^\s*Country:[^\n]*\n+/i, "").trim() || undefined;
}

export async function notifyAdminOfMicroEnquiry(
  enquiry: EnquirySnapshot,
  ctx: MicroEnquiryContext
): Promise<void> {
  const to = getAdminRecipients();

  if (!to) {
    console.warn("[micro-enquiry] No ENQUIRY_ADMIN_EMAIL configured, skipping.");
    return;
  }

  const receivedAt =
    new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " IST";

  const { subject, html, text } = renderAdminEnquiryEmail({
    fullName: enquiry.fullName,
    email: enquiry.email,
    phone: enquiry.contactNumber,
    phoneE164Digits: enquiry.phone,
    country: enquiry.country,
    service: enquiry.subject,
    message: cleanMessage(enquiry.message),
    sessionId: ctx.sessionId,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    receivedAt,
  });

  await sendMail({
    to,
    subject,
    html,
    text,
    replyTo: enquiry.email?.trim() || undefined,
  });

  await query(
    `UPDATE otp_verifications SET admin_notified_at = NOW() WHERE session_id = ?`,
    [ctx.sessionId]
  );
}
