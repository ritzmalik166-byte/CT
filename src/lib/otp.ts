import "server-only";

import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const OTP_COOKIE = "contact_otp";

const COUNTRY_PHONE_RULES = {
  India: {
    length: 10,
    regex: /^[6-9]\d{9}$/,
    countryCodes: ["91"],
  },
  UAE: {
    length: 9,
    regex: /^5\d{8}$/,
    countryCodes: ["971"],
  },
  UK: {
    length: 10,
    regex: /^7\d{9}$/,
    countryCodes: ["44"],
  },
  Singapore: {
    length: 8,
    regex: /^[89]\d{7}$/,
    countryCodes: ["65"],
  },
  USA: {
    length: 10,
    regex: /^[2-9]\d{2}[2-9]\d{6}$/,
    countryCodes: ["1"],
  },
} as const;

type Country = keyof typeof COUNTRY_PHONE_RULES;

function getSecret(): string {
  return (
    process.env.SMS_API_KEY ||
    ""
  );
}

/**
 * Generate a 4-digit OTP.
 * This matches the working friend's implementation.
 */
export function generateOtp(): string {
  return String(randomInt(0, 10000)).padStart(4, "0");
}

/**
 * Normalize phone to local digits.
 */
export function normalizeLocalPhone(
  phone: string,
  country: Country
): string {
  let digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";

  const rule = COUNTRY_PHONE_RULES[country];

  if (!rule) return digits;

  const maxLen = rule.length;

  const codes = [...rule.countryCodes].sort(
    (a, b) => b.length - a.length
  );

  for (const code of codes) {
    if (
      digits.startsWith(code) &&
      digits.length > maxLen
    ) {
      digits = digits.slice(code.length);
      break;
    }
  }

  if (
    digits.startsWith("0") &&
    digits.length > maxLen
  ) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Convert phone into the number expected by SMS API.
 *
 * Matches the friend's working implementation:
 * India -> local 10 digit number
 * Other countries -> country code + local number
 */
export function getSmsNumber(
  phone: string,
  country: Country
): string {
  const local = normalizeLocalPhone(phone, country);
  const rule = COUNTRY_PHONE_RULES[country];

  if (!rule || !local) {
    return local;
  }

  if (country === "India") {
    return local;
  }

  return `${rule.countryCodes[0]}${local}`;
}

/**
 * Validate phone number.
 */
export function validatePhoneForCountry(
  phone: string,
  country: Country
): string | null {
  if (!country || !COUNTRY_PHONE_RULES[country]) {
    return "Please select a valid country.";
  }

  const local = normalizeLocalPhone(phone, country);
  const rule = COUNTRY_PHONE_RULES[country];

  if (!local) {
    return "Please enter your phone number.";
  }

  if (
    local.length !== rule.length ||
    !rule.regex.test(local)
  ) {
    return "Please enter a valid phone number.";
  }

  if (/^(\d)\1+$/.test(local)) {
    return "Please enter a valid phone number.";
  }

  return null;
}

/**
 * Hash OTP so the raw OTP does not need to be stored.
 */
function hashOtp(
  otp: string,
  phone: string
): string {
  return createHmac("sha256", getSecret())
    .update(`${phone}:${otp}`)
    .digest("hex");
}

/**
 * Sign cookie payload.
 */
function sign(value: string): string {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

/**
 * Create signed OTP cookie value.
 */
export function createOtpCookieValue(
  phone: string,
  otp: string
): string {
  const now = Date.now();

  const payload = JSON.stringify({
    p: phone,
    h: hashOtp(otp, phone),
    e: now + OTP_TTL_MS,
    s: now,
  });

  const body = Buffer
    .from(payload)
    .toString("base64url");

  return `${body}.${sign(body)}`;
}

/**
 * Read and verify signed OTP cookie.
 */
function readSignedPayload(cookieValue: string) {
  if (!cookieValue || !getSecret()) {
    return null;
  }

  const separator = cookieValue.lastIndexOf(".");

  if (separator < 0) {
    return null;
  }

  const body = cookieValue.slice(0, separator);
  const signature = cookieValue.slice(separator + 1);

  const expected = sign(body);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (
    a.length !== b.length ||
    !timingSafeEqual(a, b)
  ) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer
        .from(body, "base64url")
        .toString("utf8")
    );
  } catch {
    return null;
  }
}

/**
 * OTP cookie settings.
 */
export function getOtpCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(
      OTP_TTL_MS / 1000
    ),
  };
}

export function getOtpCookieName(): string {
  return OTP_COOKIE;
}

/**
 * Check resend cooldown.
 */
export function assertCanResend(
  cookieValue: string
): number | null {
  const payload = readSignedPayload(cookieValue);

  if (!payload) {
    return null;
  }

  const waitMs =
    payload.s +
    RESEND_COOLDOWN_MS -
    Date.now();

  if (waitMs > 0) {
    return Math.ceil(waitMs / 1000);
  }

  return null;
}

/**
 * Verify OTP from signed cookie.
 */
export function verifyOtpFromCookie(
  cookieValue: string,
  phone: string,
  otp: string
): string | null {
  const payload =
    readSignedPayload(cookieValue);

  if (!payload) {
    return "OTP expired. Please request a new code.";
  }

  if (payload.e < Date.now()) {
    return "OTP expired. Please request a new code.";
  }

  if (payload.p !== phone) {
    return "Phone number does not match this OTP.";
  }

  const submitted = String(otp || "").trim();

  if (!/^\d{4}$/.test(submitted)) {
    return "Enter the 4-digit OTP.";
  }

  const expected = hashOtp(
    submitted,
    phone
  );

  const a = Buffer.from(payload.h);
  const b = Buffer.from(expected);

  if (
    a.length !== b.length ||
    !timingSafeEqual(a, b)
  ) {
    return "Invalid OTP. Please try again.";
  }

  return null;
}

/**
 * Send OTP through team's SMS gateway.
 */
export async function sendOtpSms(
  number: string,
  otp: string
): Promise<string> {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const senderId =
    process.env.SMS_SENDER_ID || "RITZMW";

  const template =
    process.env.SMS_OTP_TEMPLATE ||
    "{otp} is your verification code. Don't share your code with anyone. Team CONTENAISSANCE";

  if (!apiUrl || !apiKey) {
    throw new Error(
      "SMS is not configured."
    );
  }

  const message = template.replaceAll(
    "{otp}",
    otp
  );

  const url = new URL(apiUrl);

  url.searchParams.set(
    "apikey",
    apiKey
  );

  url.searchParams.set(
    "senderid",
    senderId
  );

  url.searchParams.set(
    "number",
    number
  );

  url.searchParams.set(
    "message",
    message
  );

  const response = await fetch(
    url.toString(),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const text = await response.text();

  console.log(
    "[OTP SMS] HTTP:",
    response.status
  );

  console.log(
    "[OTP SMS] Provider response:",
    text
  );

  if (!response.ok) {
    throw new Error(
      `SMS provider HTTP error: ${response.status}`
    );
  }

  return text;
}