import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type { RowDataPacket } from "mysql2/promise";

import { getPool, query, queryOne } from "@/lib/db";
import { sendMail } from "@/lib/handle-nodemailer";
import { renderOtpEmail } from "@/lib/email-templates";
import { generateOtp } from "@/lib/otp";
import type { EnquirySnapshot } from "@/lib/micro-enquiry";

/**
 * Email OTP for international (non-Indian) numbers.
 * The SMS provider only supports Indian numbers, so for every other country
 * the OTP is delivered by email and tracked in `otp_verifications`.
 */

const OTP_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR_PER_RECIPIENT = 5;
const MAX_SENDS_PER_HOUR_PER_IP = 30;

const EMAIL_OTP_COOKIE = "contact_otp_sid";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isInternationalRequest(country: string): boolean {
  return country !== "India";
}

export function getEmailOtpCookieName(): string {
  return EMAIL_OTP_COOKIE;
}

export function getEmailOtpCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OTP_TTL_MINUTES * 60,
  };
}

function getSecret(): string {
  const secret = process.env.OTP_HASH_SECRET || process.env.SMS_API_KEY || "";
  if (!secret) {
    throw new Error("OTP_HASH_SECRET is not configured.");
  }
  return secret;
}

function hashOtp(sessionId: string, otp: string): string {
  return createHmac("sha256", getSecret())
    .update(`${sessionId}:${otp}`)
    .digest("hex");
}

export function getClientMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const ua = request.headers.get("user-agent");

  return {
    ipAddress: ip ? ip.slice(0, 45) : null,
    userAgent: ua ? ua.slice(0, 512) : null,
  };
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

// ---------------------------------------------------------------------------
// TABLE BOOTSTRAP
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __ctOtpTableReady: Promise<void> | undefined;
}

const CREATE_OTP_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS otp_verifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  channel ENUM('email', 'sms') NOT NULL DEFAULT 'email',
  purpose VARCHAR(50) NOT NULL DEFAULT 'contact_enquiry',
  recipient VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  country VARCHAR(50) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  status ENUM('pending', 'verified', 'expired', 'superseded', 'blocked') NOT NULL DEFAULT 'pending',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts TINYINT UNSIGNED NOT NULL DEFAULT 5,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  last_attempt_at DATETIME NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  enquiry_payload JSON NULL,
  delivery_status ENUM('queued', 'sent', 'failed') NOT NULL DEFAULT 'queued',
  delivery_error VARCHAR(500) NULL,
  admin_notified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_otp_session_id (session_id),
  INDEX idx_otp_recipient_created (recipient, created_at),
  INDEX idx_otp_phone_created (phone, created_at),
  INDEX idx_otp_ip_created (ip_address, created_at),
  INDEX idx_otp_status_expires (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

/**
 * Makes sure `otp_verifications` exists before it is used.
 * Checks information_schema first; creates the table only if it is missing.
 * Runs once per server process (result is cached; retried on failure).
 */
export function ensureOtpTable(): Promise<void> {
  if (!global.__ctOtpTableReady) {
    global.__ctOtpTableReady = (async () => {
      const existing = await queryOne<{ c: number }>(
        `SELECT COUNT(*) AS c FROM information_schema.tables
          WHERE table_schema = DATABASE() AND table_name = 'otp_verifications'`
      );

      if (Number(existing?.c ?? 0) > 0) {
        return;
      }

      console.log("[email-otp] otp_verifications table missing, creating it.");
      await query(CREATE_OTP_TABLE_SQL);
    })().catch((error) => {
      global.__ctOtpTableReady = undefined;
      throw error;
    });
  }

  return global.__ctOtpTableReady;
}

// ---------------------------------------------------------------------------
// SEND
// ---------------------------------------------------------------------------

export async function createEmailOtpSession(input: {
  phone: string; // normalized number incl. country code
  country: string;
  email?: string;
  enquiry: EnquirySnapshot;
  ipAddress: string | null;
  userAgent: string | null;
}): Promise<Result<{ sessionId: string; maskedEmail: string }>> {
  const email = input.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
    return {
      ok: false,
      error: "A valid email address is required to verify international numbers.",
    };
  }

  await ensureOtpTable();

  // Resend cooldown (per phone or email).
  const last = await queryOne<{ age: number }>(
    `SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age
       FROM otp_verifications
      WHERE phone = ? OR recipient = ?
      ORDER BY created_at DESC
      LIMIT 1`,
    [input.phone, email]
  );

  if (last && Number(last.age) < RESEND_COOLDOWN_SECONDS) {
    return {
      ok: false,
      error: `Please wait ${RESEND_COOLDOWN_SECONDS - Number(last.age)} seconds before requesting another OTP.`,
    };
  }

  // Hourly caps.
  const recipientCount = await queryOne<{ c: number }>(
    `SELECT COUNT(*) AS c FROM otp_verifications
      WHERE (phone = ? OR recipient = ?)
        AND created_at > NOW() - INTERVAL 1 HOUR`,
    [input.phone, email]
  );

  if (Number(recipientCount?.c ?? 0) >= MAX_SENDS_PER_HOUR_PER_RECIPIENT) {
    return {
      ok: false,
      status: 429,
      error: "Too many OTP requests. Please try again later.",
    };
  }

  if (input.ipAddress) {
    const ipCount = await queryOne<{ c: number }>(
      `SELECT COUNT(*) AS c FROM otp_verifications
        WHERE ip_address = ? AND created_at > NOW() - INTERVAL 1 HOUR`,
      [input.ipAddress]
    );

    if (Number(ipCount?.c ?? 0) >= MAX_SENDS_PER_HOUR_PER_IP) {
      return {
        ok: false,
        status: 429,
        error: "Too many OTP requests. Please try again later.",
      };
    }
  }

  // Every request = new session. Retire older pending sessions.
  await query(
    `UPDATE otp_verifications
        SET status = 'superseded'
      WHERE status = 'pending' AND (phone = ? OR recipient = ?)`,
    [input.phone, email]
  );

  const sessionId = randomUUID();
  const otp = generateOtp();

  await query(
    `INSERT INTO otp_verifications
       (session_id, channel, purpose, recipient, phone, country, otp_hash,
        status, attempts, max_attempts, expires_at, ip_address, user_agent,
        enquiry_payload, delivery_status)
     VALUES (?, 'email', 'contact_enquiry', ?, ?, ?, ?, 'pending', 0, ?,
             NOW() + INTERVAL ${OTP_TTL_MINUTES} MINUTE, ?, ?, ?, 'queued')`,
    [
      sessionId,
      email,
      input.phone,
      input.country,
      hashOtp(sessionId, otp),
      MAX_VERIFY_ATTEMPTS,
      input.ipAddress,
      input.userAgent,
      JSON.stringify(input.enquiry),
    ]
  );

  try {
    await sendOtpEmail(email, otp, input.enquiry);
    await query(
      `UPDATE otp_verifications SET delivery_status = 'sent' WHERE session_id = ?`,
      [sessionId]
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("[email-otp] Failed to send OTP email:", reason);
    await query(
      `UPDATE otp_verifications
          SET delivery_status = 'failed', status = 'expired', delivery_error = ?
        WHERE session_id = ?`,
      [reason.slice(0, 500), sessionId]
    );
    return {
      ok: false,
      status: 502,
      error: "Unable to send OTP email. Please try again.",
    };
  }

  return { ok: true, data: { sessionId, maskedEmail: maskEmail(email) } };
}

// ---------------------------------------------------------------------------
// VERIFY
// ---------------------------------------------------------------------------

type OtpRow = RowDataPacket & {
  id: number;
  phone: string;
  otp_hash: string;
  status: string;
  attempts: number;
  max_attempts: number;
  is_expired: number;
};

export async function verifyEmailOtpSession(
  sessionId: string | undefined,
  phone: string,
  otp: string
): Promise<string | null> {
  if (!sessionId) {
    return "No OTP found. Please request a new OTP.";
  }

  const submitted = String(otp || "").trim();
  if (!/^\d{4}$/.test(submitted)) {
    return "Enter the 4-digit OTP.";
  }

  await ensureOtpTable();

  const conn = await getPool().getConnection();

  try {
    await conn.beginTransaction();

    // Row lock prevents parallel brute-force requests from racing attempts.
    const [rows] = await conn.query<OtpRow[]>(
      `SELECT id, phone, otp_hash, status, attempts, max_attempts,
              (expires_at <= NOW()) AS is_expired
         FROM otp_verifications
        WHERE session_id = ?
        FOR UPDATE`,
      [sessionId]
    );

    const row = rows[0];

    const finish = async (message: string | null) => {
      await conn.commit();
      return message;
    };

    if (!row) {
      return finish("No OTP found. Please request a new OTP.");
    }

    if (row.status === "verified") {
      return finish("This OTP has already been used. Please request a new one.");
    }

    if (row.status !== "pending") {
      return finish(
        row.status === "blocked"
          ? "Too many incorrect attempts. Please request a new OTP."
          : "OTP expired. Please request a new code."
      );
    }

    if (Number(row.is_expired)) {
      await conn.query(
        `UPDATE otp_verifications SET status = 'expired' WHERE id = ?`,
        [row.id]
      );
      return finish("OTP expired. Please request a new code.");
    }

    if (row.phone !== phone) {
      return finish("Phone number does not match this OTP.");
    }

    const expected = Buffer.from(hashOtp(sessionId, submitted));
    const stored = Buffer.from(row.otp_hash);
    const matches =
      expected.length === stored.length && timingSafeEqual(expected, stored);

    if (!matches) {
      const attempts = row.attempts + 1;
      const blocked = attempts >= row.max_attempts;

      await conn.query(
        `UPDATE otp_verifications
            SET attempts = ?, last_attempt_at = NOW(), status = ?
          WHERE id = ?`,
        [attempts, blocked ? "blocked" : "pending", row.id]
      );

      return finish(
        blocked
          ? "Too many incorrect attempts. Please request a new OTP."
          : `Invalid OTP. ${row.max_attempts - attempts} attempt(s) left.`
      );
    }

    await conn.query(
      `UPDATE otp_verifications
          SET status = 'verified', verified_at = NOW(),
              attempts = attempts + 1, last_attempt_at = NOW()
        WHERE id = ?`,
      [row.id]
    );

    return finish(null);
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${"*".repeat(Math.max(1, user.length - visible.length))}@${domain}`;
}

async function sendOtpEmail(to: string, otp: string, enquiry: EnquirySnapshot) {
  const digits = (enquiry.phone || "").replace(/\D/g, "");
  const { subject, html, text } = renderOtpEmail({
    otp,
    name: enquiry.fullName,
    ttlMinutes: OTP_TTL_MINUTES,
    service: enquiry.subject,
    phone: digits ? `+${digits}` : enquiry.contactNumber,
    country: enquiry.country,
  });

  await sendMail({ to, subject, html, text });
}
