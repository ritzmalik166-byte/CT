import {
  getEmailValidationError,
  getNameValidationError,
} from "@/lib/validation";

export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby8DOgFwRAa65kLZaBohncDPmIrzPvOP2mf3-Row9835UrUl6QknU_NoOANwivOpps9/exec";

export const SERVICES = [
  "AI Brand Films",
  "Digital-First Content",
  "AI-Powered Campaigns",
  "Visual Identity System",
  "Other",
] as const;

export const COUNTRY_OPTIONS = ["India", "UAE", "UK", "Singapore", "USA"] as const;
export type CountryOption = (typeof COUNTRY_OPTIONS)[number];

export type ContactLeadStatus = "idle" | "loading" | "success" | "error";

export interface ContactLeadFormData {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  country: CountryOption;
  message: string;
}

export type ContactLeadFormErrors = Partial<Record<keyof ContactLeadFormData, string>>;

const COUNTRY_PHONE_RULES: Record<
  CountryOption,
  {
    length: number | number[];
    regex: RegExp;
    countryCodes: string[];
    message: string;
  }
> = {
  India: {
    length: 10,
    regex: /^[6-9]\d{9}$/,
    countryCodes: ["91"],
    message: "Enter a valid 10-digit Indian mobile number starting with 6–9.",
  },
  UAE: {
    length: 9,
    regex: /^5\d{8}$/,
    countryCodes: ["971"],
    message: "Enter a valid 9-digit UAE mobile number starting with 5.",
  },
  UK: {
    length: 10,
    regex: /^7\d{9}$/,
    countryCodes: ["44"],
    message: "Enter a valid 10-digit UK mobile number starting with 7.",
  },
  Singapore: {
    length: 8,
    regex: /^[89]\d{7}$/,
    countryCodes: ["65"],
    message: "Enter a valid 8-digit Singapore mobile number starting with 8 or 9.",
  },
  USA: {
    length: 10,
    regex: /^[2-9]\d{2}[2-9]\d{6}$/,
    countryCodes: ["1"],
    message: "Enter a valid 10-digit USA phone number (area code cannot start with 0 or 1).",
  },
};

const REPEATED_PATTERN_MESSAGE =
  "Please enter a valid phone number. Repeated patterns like 9999999999, 8888888888, 0000000000, or 9898989898 are not allowed.";

export const EMPTY_CONTACT_LEAD_FORM: ContactLeadFormData = {
  fullName: "",
  email: "",
  phone: "",
  service: "",
  country: "India",
  message: "",
};

export const OTP_LENGTH = 4;
export const EMPTY_OTP_DIGITS = Array.from({ length: OTP_LENGTH }, () => "");

function hasInvalidRepeatedPattern(digits: string) {
  if (!digits) return false;
  if (/^(\d)\1+$/.test(digits)) return true;
  if (digits.length >= 4 && /^(\d)(\d)(?:\1\2)+$/.test(digits)) return true;
  if (digits.length >= 4 && /^(\d{2})\1+$/.test(digits)) return true;
  return false;
}

export function normalizeLocalPhone(phone: string, country: CountryOption) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";

  const rule = COUNTRY_PHONE_RULES[country];
  if (!rule) return digits;

  const lengths = Array.isArray(rule.length) ? rule.length : [rule.length];
  const maxLen = Math.max(...lengths);

  const codes = [...(rule.countryCodes || [])].sort((a, b) => b.length - a.length);
  for (const code of codes) {
    if (digits.startsWith(code) && digits.length > maxLen) {
      digits = digits.slice(code.length);
      break;
    }
  }

  if (digits.startsWith("0") && digits.length > maxLen) {
    digits = digits.slice(1);
  }

  return digits;
}

export function validatePhoneForCountry(phone: string, country: CountryOption | "") {
  if (!country) {
    return "Please select a country.";
  }

  const rule = COUNTRY_PHONE_RULES[country];
  if (!rule) {
    return "Please select a valid country.";
  }

  const local = normalizeLocalPhone(phone, country);
  if (!local) {
    return "Please enter your phone number.";
  }

  const lengths = Array.isArray(rule.length) ? rule.length : [rule.length];
  if (!lengths.includes(local.length) || !rule.regex.test(local)) {
    return rule.message;
  }

  if (hasInvalidRepeatedPattern(local)) {
    return REPEATED_PATTERN_MESSAGE;
  }

  return null;
}

export function getPhoneMaxLength(country: CountryOption) {
  const rule = COUNTRY_PHONE_RULES[country];
  if (!rule) return 15;
  const lengths = Array.isArray(rule.length) ? rule.length : [rule.length];
  return Math.max(...lengths) + 4;
}

export function maskPhoneForDisplay(phone: string, country: CountryOption) {
  const local = normalizeLocalPhone(phone, country);
  if (!local) return phone;

  const visibleTail = local.slice(-4);
  const maskedBody = "•".repeat(Math.max(0, local.length - 4));
  const rule = COUNTRY_PHONE_RULES[country];
  const code = rule?.countryCodes?.[0];

  if (code) {
    return `+${code} ${maskedBody}${visibleTail}`;
  }

  return `${maskedBody}${visibleTail}`;
}

export function validateContactLeadField(
  name: keyof ContactLeadFormData,
  value: string,
  form: ContactLeadFormData
): string {
  const v = value.trim();
  switch (name) {
    case "fullName":
      return getNameValidationError(value);
    case "email":
      return getEmailValidationError(value);
    case "phone":
      return validatePhoneForCountry(value, form.country) || "";
    case "service":
      if (!v) return "Please choose a service.";
      return "";
    case "country":
      if (!v || !(COUNTRY_OPTIONS as readonly string[]).includes(v)) {
        return "Please select a country.";
      }
      return "";
    case "message":
      if (!v) return "Message is required.";
      if (v.length < 10) return "Message must be at least 10 characters.";
      if (v.length > 1500) return "Message is too long (max 1500 characters).";
      return "";
    default:
      return "";
  }
}

export function validateAllContactLeadFields(form: ContactLeadFormData): ContactLeadFormErrors {
  const errors: ContactLeadFormErrors = {};
  (Object.keys(form) as (keyof ContactLeadFormData)[]).forEach((k) => {
    const msg = validateContactLeadField(k, form[k], form);
    if (msg) errors[k] = msg;
  });
  return errors;
}

export function getPhonePlaceholder(country: CountryOption) {
  switch (country) {
    case "India":
      return "9876543210";
    case "UAE":
      return "501234567";
    case "UK":
      return "7123456789";
    case "Singapore":
      return "81234567";
    default:
      return "2025550123";
  }
}

export async function submitContactLead(
  form: ContactLeadFormData,
  localPhone: string,
  source: string
) {
  const messageWithCountry = `${form.message.trim()}\n\nCountry: ${form.country}`;

  const payload = {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    contactNumber: localPhone,
    subject: form.service,
    message: messageWithCountry,
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    source,
  };

  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  try {
    const telegramRes = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "contact", ...payload }),
    });

    if (!telegramRes.ok) {
      // eslint-disable-next-line no-console
      console.warn("[contact-lead] Telegram notification failed (optional)");
    }
  } catch (telegramErr) {
    // eslint-disable-next-line no-console
    console.warn("[contact-lead] Telegram notification failed (optional)", telegramErr);
  }

  return payload;
}
