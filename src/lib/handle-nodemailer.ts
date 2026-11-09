import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Shared Nodemailer transport.
 *
 * Required env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional env:
 *   SMTP_SECURE ("true" for port 465), MAIL_FROM ("Contenaissance <no-reply@...>")
 */

declare global {
  // eslint-disable-next-line no-var
  var __ctMailTransport: Transporter | undefined;
}

function getTransport(): Transporter {
  if (global.__ctMailTransport) {
    return global.__ctMailTransport;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Email (SMTP) is not configured.");
  }

  const port = Number(process.env.SMTP_PORT ?? 587);

  global.__ctMailTransport = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return global.__ctMailTransport;
}

export function getMailFrom(): string {
  return (
    process.env.MAIL_FROM ||
    `Contenaissance <${process.env.SMTP_USER ?? "no-reply@contenaissance.com"}>`
  );
}

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendMail(input: SendMailInput) {
  const info = await getTransport().sendMail({
    from: getMailFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });

  return { messageId: info.messageId };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
