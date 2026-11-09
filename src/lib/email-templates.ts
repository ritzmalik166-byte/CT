import "server-only";

import { escapeHtml } from "@/lib/handle-nodemailer";

/**
 * Branded transactional email templates (Contenaissance).
 *
 * Built for email clients, not browsers: table layout, inline styles,
 * 600px max width, web-safe fonts, no external CSS. Tested patterns for
 * Gmail, Outlook (incl. desktop/MSO), Apple Mail and mobile clients.
 */

const BRAND = {
  name: "Contenaissance",
  tagline: "Ritz Genai Storytelling Studios",
  logoUrl:
    process.env.MAIL_LOGO_URL ||
    "https://res.cloudinary.com/dsr1aulr7/image/upload/v1793942632/logo_1_eyfvjp.png",
  website: "https://www.contenaissance.com",
  websiteLabel: "contenaissance.com",
  instagram: "https://www.instagram.com/contenaissance",
  linkedin: "https://www.linkedin.com/company/contenaissance",
};

const C = {
  ink: "#0E0E10", // header / footer
  ink2: "#17171A",
  gold: "#C9A24A",
  goldLight: "#E6C77A",
  goldDeep: "#9A7428",
  paper: "#FFFFFF",
  ivory: "#FAF7F0", // panels
  canvas: "#EFECE6", // outer background
  line: "#E7E1D3",
  text: "#1E1E22",
  muted: "#6B6B73",
  faint: "#9A9AA2",
};

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

const e = (v?: string | null) => escapeHtml(v?.trim() || "");
const eMultiline = (v?: string | null) => e(v).replace(/\r?\n/g, "<br/>");

// ---------------------------------------------------------------------------
// Shared frame
// ---------------------------------------------------------------------------

function layout(opts: {
  title: string;
  preheader: string;
  body: string;
  footerNote: string;
}): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(opts.title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { text-decoration:none; }
  @media only screen and (max-width:620px) {
    .container { width:100% !important; }
    .px { padding-left:24px !important; padding-right:24px !important; }
    .otp-cell { width:48px !important; height:60px !important; font-size:28px !important; }
    .stack { display:block !important; width:100% !important; }
    .btn-gap { padding:0 0 10px 0 !important; }
    .h1 { font-size:24px !important; line-height:32px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.canvas};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.canvas};">
    ${e(opts.preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.canvas};">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${C.paper};border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(14,14,16,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${C.ink}" style="background-color:${C.ink};background-image:linear-gradient(160deg, ${C.ink2} 0%, ${C.ink} 70%);padding:34px 24px 28px;">
              <a href="${BRAND.website}" target="_blank" style="text-decoration:none;">
                <img src="${BRAND.logoUrl}" width="170" height="83" alt="${BRAND.name} — ${BRAND.tagline}" style="display:block;width:170px;height:auto;max-width:170px;border:0;color:${C.gold};font-family:${SERIF};font-size:22px;letter-spacing:3px;">
              </a>
            </td>
          </tr>
          <!-- Gold rule -->
          <tr>
            <td height="3" bgcolor="${C.gold}" style="height:3px;line-height:3px;font-size:0;background-color:${C.gold};background-image:linear-gradient(90deg, ${C.goldDeep} 0%, ${C.goldLight} 50%, ${C.goldDeep} 100%);">&nbsp;</td>
          </tr>

          ${opts.body}

          <!-- Footer -->
          <tr>
            <td bgcolor="${C.ink}" class="px" style="background-color:${C.ink};padding:28px 40px 30px;" align="center">
              <p style="margin:0 0 6px;font-family:${SERIF};font-size:15px;letter-spacing:3px;text-transform:uppercase;color:${C.goldLight};">${BRAND.name}</p>
              <p style="margin:0 0 16px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.faint};">${BRAND.tagline}</p>
              <p style="margin:0 0 18px;font-family:${SANS};font-size:13px;line-height:20px;">
                <a href="${BRAND.website}" target="_blank" style="color:${C.gold};text-decoration:none;">${BRAND.websiteLabel}</a>
                <span style="color:#3A3A40;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                <a href="${BRAND.instagram}" target="_blank" style="color:${C.gold};text-decoration:none;">Instagram</a>
                <span style="color:#3A3A40;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                <a href="${BRAND.linkedin}" target="_blank" style="color:${C.gold};text-decoration:none;">LinkedIn</a>
              </p>
              <p style="margin:0;font-family:${SANS};font-size:11px;line-height:17px;color:#7C7C84;">
                ${opts.footerNote}<br/>
                &copy; ${year} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function eyebrow(label: string) {
  return `<p style="margin:0 0 10px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${C.goldDeep};">${label}</p>`;
}

function detailRows(rows: [string, string][]) {
  return rows
    .map(
      ([label, valueHtml], i) => `
      <tr>
        <td class="stack" width="150" valign="top" style="padding:12px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.muted};">${label}</td>
        <td class="stack" valign="top" style="padding:12px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SANS};font-size:15px;line-height:22px;color:${C.text};">${valueHtml}</td>
      </tr>`
    )
    .join("");
}

function button(href: string, label: string, primary: boolean) {
  const bg = primary ? C.gold : C.paper;
  const fg = primary ? C.ink : C.text;
  const border = primary ? C.gold : C.line;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" bgcolor="${bg}" style="border-radius:8px;background-color:${bg};border:1px solid ${border};">
      <a href="${href}" target="_blank" style="display:inline-block;padding:13px 22px;font-family:${SANS};font-size:14px;font-weight:700;color:${fg};text-decoration:none;border-radius:8px;">${label}</a>
    </td></tr></table>`;
}

// ---------------------------------------------------------------------------
// 1) OTP verification email (to the visitor)
// ---------------------------------------------------------------------------

export function renderOtpEmail(input: {
  otp: string;
  name?: string;
  ttlMinutes: number;
  service?: string;
  phone?: string;
  country?: string;
}): { subject: string; html: string; text: string } {
  const firstName = input.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hello ${e(firstName)},` : "Hello,";

  const digits = input.otp
    .split("")
    .map(
      (d) => `
        <td style="padding:0 5px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td class="otp-cell" width="56" height="68" align="center" valign="middle" bgcolor="${C.paper}" style="width:56px;height:68px;background-color:${C.paper};border:1px solid ${C.gold};border-radius:10px;font-family:${SERIF};font-size:34px;font-weight:700;color:${C.ink};">${e(d)}</td>
          </tr></table>
        </td>`
    )
    .join("");

  const summary: [string, string][] = [];
  if (input.service?.trim()) summary.push(["Service", e(input.service)]);
  if (input.phone?.trim())
    summary.push([
      "Phone",
      `${e(input.phone)}${input.country ? ` <span style="color:${C.muted};">(${e(input.country)})</span>` : ""}`,
    ]);

  const body = `
    <tr>
      <td class="px" style="padding:44px 48px 8px;">
        ${eyebrow("Email verification")}
        <h1 class="h1" style="margin:0 0 18px;font-family:${SERIF};font-size:28px;line-height:36px;font-weight:400;color:${C.ink};">Confirm your enquiry</h1>
        <p style="margin:0 0 14px;font-family:${SANS};font-size:15px;line-height:24px;color:${C.text};">${greeting}</p>
        <p style="margin:0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.text};">
          Thank you for reaching out to ${BRAND.name}. Enter the verification code below to confirm your enquiry.
        </p>
      </td>
    </tr>

    <tr>
      <td class="px" style="padding:30px 48px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.ivory}" style="background-color:${C.ivory};border:1px solid ${C.line};border-radius:12px;">
          <tr>
            <td align="center" style="padding:28px 16px 26px;">
              <p style="margin:0 0 16px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${C.muted};">Your verification code</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${digits}</tr></table>
              <p style="margin:18px 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${C.muted};">
                This code expires in <strong style="color:${C.ink};">${input.ttlMinutes} minutes</strong> and can be used only once.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${
      summary.length
        ? `<tr>
      <td class="px" style="padding:30px 48px 0;">
        ${eyebrow("Enquiry summary")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detailRows(summary)}</table>
      </td>
    </tr>`
        : ""
    }

    <tr>
      <td class="px" style="padding:30px 48px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="3" bgcolor="${C.gold}" style="width:3px;background-color:${C.gold};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
            <td style="padding:4px 0 4px 16px;font-family:${SANS};font-size:13px;line-height:20px;color:${C.muted};">
              <strong style="color:${C.text};">Keep this code private.</strong> ${BRAND.name} will never ask for it by phone, chat or email. If you didn't request this code, ignore this email and no enquiry will be submitted.
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const text = [
    firstName ? `Hello ${firstName},` : "Hello,",
    "",
    `Thank you for reaching out to ${BRAND.name}.`,
    "",
    `Your verification code is: ${input.otp}`,
    `It expires in ${input.ttlMinutes} minutes and can be used only once.`,
    ...(summary.length
      ? [
          "",
          "Enquiry summary",
          ...(input.service ? [`Service: ${input.service}`] : []),
          ...(input.phone ? [`Phone: ${input.phone}${input.country ? ` (${input.country})` : ""}`] : []),
        ]
      : []),
    "",
    `Keep this code private. ${BRAND.name} will never ask for it. If you didn't request this code, ignore this email.`,
    "",
    `Team ${BRAND.name}`,
    BRAND.website,
  ].join("\n");

  return {
    subject: `${input.otp} is your ${BRAND.name} verification code`,
    html: layout({
      title: `${BRAND.name} verification code`,
      preheader: `Your verification code is ${input.otp}. It expires in ${input.ttlMinutes} minutes.`,
      body,
      footerNote: "You received this email because this address was used to submit an enquiry on our website.",
    }),
    text,
  };
}

// ---------------------------------------------------------------------------
// 2) Admin enquiry alert (micro-enquiry, OTP not yet verified)
// ---------------------------------------------------------------------------

export function renderAdminEnquiryEmail(input: {
  fullName?: string;
  email?: string;
  phone?: string; // as typed by the visitor
  phoneE164Digits?: string; // country code + number, digits only
  country?: string;
  service?: string;
  message?: string;
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  receivedAt: string; // preformatted
}): { subject: string; html: string; text: string } {
  const name = input.fullName?.trim() || "Unknown visitor";
  const email = input.email?.trim();
  const digits = (input.phoneE164Digits || input.phone || "").replace(/\D/g, "");
  const phoneDisplay = digits ? `+${digits}` : input.phone?.trim() || "";

  const contactRows: [string, string][] = [
    ["Name", `<strong>${e(name)}</strong>`],
    [
      "Email",
      email
        ? `<a href="mailto:${e(email)}" style="color:${C.goldDeep};text-decoration:underline;">${e(email)}</a>`
        : `<span style="color:${C.faint};">Not provided</span>`,
    ],
    [
      "Phone",
      phoneDisplay
        ? `<a href="tel:${e(phoneDisplay)}" style="color:${C.text};text-decoration:none;">${e(phoneDisplay)}</a>`
        : `<span style="color:${C.faint};">Not provided</span>`,
    ],
    ["Country", e(input.country) || `<span style="color:${C.faint};">—</span>`],
    ["Service", e(input.service) || `<span style="color:${C.faint};">—</span>`],
  ];

  const techRows: [string, string][] = [
    ["Received", e(input.receivedAt)],
    ["Session ID", `<span style="font-family:${MONO};font-size:12px;">${e(input.sessionId)}</span>`],
    ["IP address", `<span style="font-family:${MONO};font-size:12px;">${e(input.ipAddress) || "—"}</span>`],
    ["Device", `<span style="font-size:12px;color:${C.muted};">${e(input.userAgent) || "—"}</span>`],
  ];

  const buttons: string[] = [];
  if (email)
    buttons.push(
      button(
        `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: Your enquiry with ${BRAND.name}`)}`,
        "Reply by email",
        true
      )
    );
  if (digits) {
    buttons.push(button(`https://wa.me/${digits}`, "WhatsApp", false));
    buttons.push(button(`tel:+${digits}`, "Call", false));
  }

  const body = `
    <tr>
      <td class="px" style="padding:40px 48px 6px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>
          <td bgcolor="#FFF4DB" style="background-color:#FFF4DB;border:1px solid #F0D58E;border-radius:999px;padding:6px 14px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8A6410;">
            &#9679;&nbsp; OTP sent &middot; Not yet verified
          </td>
        </tr></table>
        <h1 class="h1" style="margin:0 0 12px;font-family:${SERIF};font-size:28px;line-height:36px;font-weight:400;color:${C.ink};">New international enquiry</h1>
        <p style="margin:0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.text};">
          <strong>${e(name)}</strong>${input.country ? ` from <strong>${e(input.country)}</strong>` : ""} has started an enquiry${input.service ? ` about <strong>${e(input.service)}</strong>` : ""}. An email verification code has been sent to them. You will get a separate notification if they complete verification.
        </p>
      </td>
    </tr>

    <tr>
      <td class="px" style="padding:28px 48px 0;">
        ${eyebrow("Contact details")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detailRows(contactRows)}</table>
      </td>
    </tr>

    ${
      input.message?.trim()
        ? `<tr>
      <td class="px" style="padding:26px 48px 0;">
        ${eyebrow("Message")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.ivory}" style="background-color:${C.ivory};border:1px solid ${C.line};border-left:3px solid ${C.gold};border-radius:10px;">
          <tr><td style="padding:18px 20px;font-family:${SANS};font-size:15px;line-height:24px;color:${C.text};">${eMultiline(input.message)}</td></tr>
        </table>
      </td>
    </tr>`
        : ""
    }

    ${
      buttons.length
        ? `<tr>
      <td class="px" style="padding:28px 48px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          ${buttons.map((b) => `<td class="stack btn-gap" style="padding:0 10px 0 0;">${b}</td>`).join("")}
        </tr></table>
      </td>
    </tr>`
        : ""
    }

    <tr>
      <td class="px" style="padding:32px 48px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">
          <tr><td style="padding-top:22px;">
            ${eyebrow("Submission details")}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detailRows(techRows)}</table>
          </td></tr>
        </table>
      </td>
    </tr>`;

  const text = [
    "NEW INTERNATIONAL ENQUIRY (OTP sent, not yet verified)",
    "",
    `Name: ${name}`,
    `Email: ${email || "-"}`,
    `Phone: ${phoneDisplay || "-"}`,
    `Country: ${input.country || "-"}`,
    `Service: ${input.service || "-"}`,
    "",
    "Message:",
    input.message?.trim() || "-",
    "",
    `Received: ${input.receivedAt}`,
    `Session ID: ${input.sessionId}`,
    `IP address: ${input.ipAddress || "-"}`,
    `Device: ${input.userAgent || "-"}`,
  ].join("\n");

  return {
    subject: `New enquiry: ${name}${input.country ? ` (${input.country})` : ""}${input.service ? `, ${input.service}` : ""} [OTP pending]`,
    html: layout({
      title: "New international enquiry",
      preheader: `${name}${input.country ? ` from ${input.country}` : ""}${input.service ? ` is interested in ${input.service}` : " started an enquiry"}. OTP not yet verified.`,
      body,
      footerNote: "Internal notification for the Contenaissance team. Do not forward outside the organisation.",
    }),
    text,
  };
}
