import { sendTelegramMessage } from "../../../../helper/telegram";
import { jsonError, jsonServerError, jsonSuccess } from "@/lib/api-response";

type EnquiryType = "contact" | "footer";

type EnquiryBody = {
  type?: EnquiryType;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  subject?: string;
  message?: string;
  source?: string;
  timestamp?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMessage(body: EnquiryBody) {
  const type = body.type === "footer" ? "footer" : "contact";
  const timestamp =
    body.timestamp?.trim() ||
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const source = body.source?.trim() || (type === "footer" ? "footer" : "contact-page");
  const email = body.email?.trim() || "—";

  if (type === "footer") {
    return [
      "<b>New Footer Enquiry</b>",
      "",
      `<b>Email:</b> ${escapeHtml(email)}`,
      `<b>Source:</b> ${escapeHtml(source)}`,
      `<b>Time:</b> ${escapeHtml(timestamp)}`,
    ].join("\n");
  }

  return [
    "<b>New Contact Enquiry</b>",
    "",
    `<b>Name:</b> ${escapeHtml(body.fullName?.trim() || "—")}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Phone:</b> ${escapeHtml(body.contactNumber?.trim() || "—")}`,
    `<b>Service:</b> ${escapeHtml(body.subject?.trim() || "—")}`,
    `<b>Message:</b> ${escapeHtml(body.message?.trim() || "—")}`,
    `<b>Source:</b> ${escapeHtml(source)}`,
    `<b>Time:</b> ${escapeHtml(timestamp)}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnquiryBody;
    const type = body.type === "footer" ? "footer" : "contact";
    const email = body.email?.trim();

    if (!email) {
      return jsonError("Email is required");
    }

    if (type === "contact") {
      if (!body.fullName?.trim() || !body.subject?.trim() || !body.message?.trim()) {
        return jsonError("Name, service, and message are required");
      }
    }

    await sendTelegramMessage(buildMessage({ ...body, type, email }));

    return jsonSuccess({ sent: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send enquiry notification";
    console.error("[enquiry] telegram failed", error);
    return jsonServerError(message);
  }
}
