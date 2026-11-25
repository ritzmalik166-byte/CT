import { createHash, createHmac, timingSafeEqual } from "crypto";

const MIN_SECRET_LENGTH = 32;
/** Signed requests older/newer than this are rejected (replay protection). */
const MAX_TIMESTAMP_SKEW_SEC = 5 * 60;

/** Separate from CT_MCP_SECRET on purpose: the webhook and the MCP connector never share credentials. */
function getWebhookSecret(): string | null {
  const secret = process.env.CT_WEBHOOK_SECRET?.trim();
  if (!secret || secret.length < MIN_SECRET_LENGTH || secret.startsWith("<")) {
    return null;
  }
  return secret;
}

export function isWebhookSecretConfigured(): boolean {
  return getWebhookSecret() !== null;
}

/** Constant-time comparison; hashing first makes both sides the same length. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export type WebhookAuthResult =
  | { ok: true; method: "hmac" | "secret" }
  | { ok: false; reason: string };

/**
 * Two accepted modes, both using the same webhook secret:
 *
 * 1. HMAC (preferred when the caller can compute it):
 *      X-CT-Timestamp: <unix seconds>
 *      X-CT-Signature: sha256=<hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`)>
 *    The timestamp must be within ±5 minutes of server time.
 *
 * 2. Shared secret header (for tools that cannot sign requests):
 *      Authorization: <secret>   (a "Bearer " prefix is tolerated)   or   X-Webhook-Secret: <secret>
 *
 * If X-CT-Signature is present, HMAC mode is enforced and the plain secret is ignored.
 * `reason` is for server logs only and never contains secret material.
 */
export function verifyWebhookRequest(
  headers: Headers,
  rawBody: Uint8Array,
  nowMs: number = Date.now(),
): WebhookAuthResult {
  const secret = getWebhookSecret();
  if (!secret) return { ok: false, reason: "webhook secret is not configured" };

  const signature = headers.get("x-ct-signature")?.trim();
  if (signature) {
    const timestamp = headers.get("x-ct-timestamp")?.trim();
    if (!timestamp || !/^\d{10}$/.test(timestamp)) {
      return { ok: false, reason: "missing or invalid X-CT-Timestamp" };
    }
    if (Math.abs(nowMs / 1000 - Number(timestamp)) > MAX_TIMESTAMP_SKEW_SEC) {
      return { ok: false, reason: "X-CT-Timestamp outside the allowed window" };
    }

    const provided = signature.replace(/^sha256=/i, "").toLowerCase();
    const expected = createHmac("sha256", secret).update(`${timestamp}.`).update(rawBody).digest("hex");

    return secretsMatch(provided, expected)
      ? { ok: true, method: "hmac" }
      : { ok: false, reason: "signature mismatch" };
  }

  const authorization = headers.get("authorization")?.trim();
  const token = authorization?.replace(/^Bearer\s+/i, "").trim() || headers.get("x-webhook-secret")?.trim();
  if (!token) return { ok: false, reason: "missing credentials" };

  return secretsMatch(token, secret)
    ? { ok: true, method: "secret" }
    : { ok: false, reason: "invalid secret" };
}
