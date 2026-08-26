"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CTAFooter } from "@/components/home/CTAFooter";
import { InnerPageNav } from "@/components/InnerPageNav";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";
import {
  EMAIL_INVALID_MESSAGE,
  EMAIL_PATTERN,
  getEmailValidationError,
  getNameValidationError,
  NAME_INVALID_MESSAGE,
  NAME_PATTERN,
} from "@/lib/validation";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby8DOgFwRAa65kLZaBohncDPmIrzPvOP2mf3-Row9835UrUl6QknU_NoOANwivOpps9/exec";


const SERVICES = [
  "AI Brand Films",
  "Digital-First Content",
  "AI-Powered Campaigns",
  "Visual Identity System",
  "Other",
];

const COUNTRY_OPTIONS = ["India", "UAE", "UK", "Singapore", "USA"] as const;
type CountryOption = (typeof COUNTRY_OPTIONS)[number];

/** Local mobile rules per country (digits only, no country code). */
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

type Status = "idle" | "loading" | "success" | "error";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  country: CountryOption;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

function hasInvalidRepeatedPattern(digits: string) {
  if (!digits) return false;
  if (/^(\d)\1+$/.test(digits)) return true;
  if (digits.length >= 4 && /^(\d)(\d)(?:\1\2)+$/.test(digits)) return true;
  if (digits.length >= 4 && /^(\d{2})\1+$/.test(digits)) return true;
  return false;
}

function normalizeLocalPhone(phone: string, country: CountryOption) {
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

function validatePhoneForCountry(phone: string, country: CountryOption | "") {
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

function getPhoneMaxLength(country: CountryOption) {
  const rule = COUNTRY_PHONE_RULES[country];
  if (!rule) return 15;
  const lengths = Array.isArray(rule.length) ? rule.length : [rule.length];
  return Math.max(...lengths) + 4;
}

function maskPhoneForDisplay(phone: string, country: CountryOption) {
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

const validateField = (name: keyof FormData, value: string, form: FormData): string => {
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
};

const validateAll = (form: FormData): FormErrors => {
  const errors: FormErrors = {};
  (Object.keys(form) as (keyof FormData)[]).forEach((k) => {
    const msg = validateField(k, form[k], form);
    if (msg) errors[k] = msg;
  });
  return errors;
};

const EMPTY_FORM: FormData = {
  fullName: "",
  email: "",
  phone: "",
  service: "",
  country: "India",
  message: "",
};

const OTP_LENGTH = 4;
const EMPTY_OTP_DIGITS = Array.from({ length: OTP_LENGTH }, () => "");

export default function ContactPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  // OTP & Step state
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP_DIGITS);
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const otpCode = otpDigits.join("");
  const isOtpComplete = otpDigits.every((digit) => digit.length === 1);
  const isSubmitting = verifyingOtp || status === "loading";

  const otpModalOpen = step === "otp";

  const resetOtpDigits = useCallback(() => {
    setOtpDigits(EMPTY_OTP_DIGITS);
  }, []);

  const focusOtpInput = useCallback((index: number) => {
    const el = otpInputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const applyOtpString = useCallback(
    (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const next = Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] || "");
      setOtpDigits(next);

      const filledCount = next.filter(Boolean).length;
      const focusIndex = filledCount >= OTP_LENGTH ? OTP_LENGTH - 1 : filledCount;
      window.setTimeout(() => focusOtpInput(focusIndex), 0);

      return next;
    },
    [focusOtpInput]
  );

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      focusOtpInput(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      e.preventDefault();
      const next = [...otpDigits];
      next[index - 1] = "";
      setOtpDigits(next);
      focusOtpInput(index - 1);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    applyOtpString(e.clipboardData.getData("text"));
  };

  useLenisScrollLock(otpModalOpen);

  const closeOtpModal = useCallback(() => {
    setStep("form");
    setOtpStatus(null);
    resetOtpDigits();
  }, [resetOtpDigits]);

  useEffect(() => {
    if (!showSuccessToast) return;
    const timer = window.setTimeout(() => setShowSuccessToast(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showSuccessToast]);

  useEffect(() => {
    if (!otpModalOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        closeOtpModal();
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      focusOtpInput(0);
    }, 120);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [otpModalOpen, closeOtpModal, isSubmitting, focusOtpInput]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useGSAP(
    () => {
      // Title — only split the first line, animate "Together" separately
      const firstLine = pageRef.current?.querySelector(".contact-title-line1");
      if (firstLine) {
        const split = SplitText.create(firstLine, { type: "chars" });
        gsap.fromTo(
          split.chars,
          { y: 80, opacity: 0, rotateX: -70 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            stagger: { each: 0.03 },
            ease: "back.out(1.5)",
            delay: 0.3,
          }
        );
      }

      gsap.fromTo(
        ".contact-title-line2",
        { y: 60, opacity: 0, filter: "blur(12px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.1,
          ease: "power3.out",
          delay: 0.65,
        }
      );

      gsap.fromTo(
        ".contact-sub",
        { y: 30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, delay: 0.7, ease: "power3.out" }
      );

      // Contact info — stagger on load (visible in left column above the fold)
      gsap.fromTo(
        ".contact-info-item",
        {
          y: 28,
          opacity: 0,
          filter: "blur(8px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.75,
          stagger: 0.08,
          delay: 0.85,
          ease: "power3.out",
        }
      );

      // Social link buttons - pop in with stagger
      gsap.fromTo(
        ".social-link-btn",
        {
          scale: 0,
          opacity: 0,
          rotate: -10,
        },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.5,
          stagger: 0.06,
          delay: 1.1,
          ease: "back.out(1.8)",
        }
      );

      // Quote text fade in
      const quoteText = pageRef.current?.querySelector(".contact-quote-text");
      if (quoteText) {
        gsap.fromTo(
          quoteText,
          {
            y: 24,
            opacity: 0,
            filter: "blur(8px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            delay: 1.2,
            ease: "power2.out",
          }
        );
      }

      // Quote cite slide in
      gsap.fromTo(
        ".contact-quote-cite",
        {
          x: -16,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.65,
          delay: 1.35,
          ease: "power3.out",
        }
      );

      // Form — animate on load so it is visible above the fold immediately
      gsap.fromTo(
        ".contact-form",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          delay: 0.45,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".form-field",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.05,
          delay: 0.55,
          ease: "power2.out",
        }
      );
    },
    { scope: pageRef }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as keyof FormData;
    const value = e.target.value;
    const nextForm = { ...form, [name]: value } as FormData;
    setForm(nextForm);

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, nextForm) }));
    }

    // Re-validate phone when country changes
    if (name === "country" && touched.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: validateField("phone", nextForm.phone, nextForm),
      }));
    }

    // Reset phone verification if phone or country changes
    if ((name === "phone" || name === "country") && isPhoneVerified) {
      const newNormalized = normalizeLocalPhone(nextForm.phone, nextForm.country);
      if (newNormalized !== verifiedPhone) {
        setIsPhoneVerified(false);
        setVerifiedPhone("");
        setOtpSent(false);
        resetOtpDigits();
        setOtpStatus(null);
      }
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as keyof FormData;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, e.target.value, { ...form, [name]: e.target.value }),
    }));
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setSendingOtp(true);
    setOtpStatus(null);

    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: form.phone,
          country: form.country,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      resetOtpDigits();
      setCooldown(45);
      setOtpStatus({
        type: "success",
        text: "New 4-digit OTP sent to your phone number.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not resend OTP. Please try again.";
      setOtpStatus({
        type: "error",
        text: msg,
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const submitFormLead = async (localPhone: string) => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const messageWithCountry = `${form.message.trim()}\n\nCountry: ${form.country}`;

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        contactNumber: localPhone,
        subject: form.service,
        message: messageWithCountry,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        source: typeof window !== "undefined" ? window.location.href : "contact-page",
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
          console.warn("[contact] Telegram notification failed (optional)");
        }
      } catch (telegramErr) {
        // eslint-disable-next-line no-console
        console.warn("[contact] Telegram notification failed (optional)", telegramErr);
      }

      // eslint-disable-next-line no-console
      console.info("[contact] lead submitted", payload);

      setStatus("idle");
      setErrorMsg("");
      setStep("form");
      setForm(EMPTY_FORM);
      setErrors({});
      setTouched({});
      setIsPhoneVerified(false);
      setVerifiedPhone("");
      setOtpSent(false);
      resetOtpDigits();
      setOtpStatus(null);
      setShowSuccessToast(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[contact] submission failed", err);
      setStatus("error");
      setErrorMsg("Could not reach our server. Check your network and try again.");
      setStep("form");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      service: true,
      country: true,
      message: true,
    });

    if (Object.keys(allErrors).length > 0) {
      setStatus("error");
      setErrorMsg("Please fix the highlighted fields and try again.");
      const firstInvalid = (Object.keys(allErrors) as (keyof FormData)[])[0];
      const el = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
      el?.focus();
      return;
    }

    // Trigger OTP sending and navigate to OTP screen
    setSendingOtp(true);
    setStatus("idle");
    setErrorMsg("");
    setOtpStatus(null);

    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          phone: form.phone,
          country: form.country,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      resetOtpDigits();
      setCooldown(45);
      setStep("otp");
      setOtpStatus({
        type: "success",
        text: `4-digit OTP sent to your phone number.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send OTP. Please try again.";
      setStatus("error");
      setErrorMsg(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!isOtpComplete || !/^\d{4}$/.test(otpCode)) {
      setOtpStatus({
        type: "error",
        text: "Please enter all 4 digits of the OTP.",
      });
      const emptyIndex = otpDigits.findIndex((d) => !d);
      focusOtpInput(emptyIndex === -1 ? 0 : emptyIndex);
      return;
    }

    setVerifyingOtp(true);
    setOtpStatus(null);

    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phone: form.phone,
          country: form.country,
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data?.verified) {
        throw new Error(data.error || "OTP verification failed");
      }

      const localPhone = normalizeLocalPhone(form.phone, form.country);
      setIsPhoneVerified(true);
      setVerifiedPhone(localPhone);

      await submitFormLead(localPhone);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed. Check the OTP and try again.";
      setOtpStatus({
        type: "error",
        text: msg,
      });
      resetOtpDigits();
      focusOtpInput(0);
      setVerifyingOtp(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all duration-300 outline-none focus:border-[#AE8C20]/70 focus:bg-zinc-900 focus:ring-2 focus:ring-[#AE8C20]/20 hover:border-zinc-700 sm:py-3";
  const errorClasses = "border-red-500/70 focus:border-red-500 focus:ring-red-500/20";

  const fieldClass = (key: keyof FormData, extra = "") =>
    `${inputBase} ${errors[key] ? errorClasses : ""} ${extra}`.trim();

  const FieldError = ({ name }: { name: keyof FormData }) =>
    errors[name] ? (
      <p className="mt-2 flex items-start gap-1.5 text-xs text-red-400">
        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        {errors[name]}
      </p>
    ) : null;

  return (
    <div ref={pageRef} className="relative bg-zinc-950 text-white">
      <InnerPageNav
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        currentPage="contact"
      />

      {/* ── HERO + FORM (two-column, above the fold) ─────────────────── */}
      <section className="relative px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-10 lg:pb-24 lg:pt-32">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#AE8C20]/10 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/4 translate-y-1/4 rounded-full bg-[#AE8C20]/6 blur-[120px]" />
        </div>

        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #AE8C20 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-x-12 lg:gap-y-8 xl:grid-cols-[minmax(0,440px)_1fr] xl:gap-x-16">
            {/* Heading — first on mobile, left column on desktop */}
            <header className="order-1 lg:col-start-1 lg:row-start-1">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#AE8C20] sm:text-xs">
                Get in Touch
              </p>
              <h1
                className="overflow-visible text-[clamp(2.25rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.06em]"
                style={{ perspective: "800px" }}
              >
                <span className="contact-title-line1 block pb-0.5">Let&apos;s Build</span>
                <span className="contact-title-line2 block overflow-visible bg-gradient-to-r from-[#AE8C20] via-[#D4AF37] to-[#AE8C20] bg-clip-text pb-1 text-transparent">
                  Together
                </span>
              </h1>
              <p className="contact-sub mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:mt-5 md:text-[15px]">
                Tell us about your project — we respond within 24 hours. Let&apos;s create something extraordinary.
              </p>
            </header>

            {/* Form — second on mobile (above the fold), right column on desktop */}
            <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-start">
              <form
                onSubmit={handleFormSubmit}
                className="contact-form relative rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-[1.75rem] sm:p-6 lg:sticky lg:top-28"
              >
                  <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#AE8C20]/8 blur-[80px]" />

                  <div className="relative mb-4 flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-4 sm:mb-5">
                    <div>
                      <h2 className="text-sm font-bold uppercase text-white sm:text-base">
                        Start Your Project
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">All fields required</p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-[#AE8C20]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] sm:inline-flex">
                      24h Response
                    </span>
                  </div>

                  <div className="relative grid gap-3.5 sm:gap-4">
                    {/* Row 1 — Full name */}
                    <div className="form-field">
                      <label htmlFor="fullName" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                        Full Name <span className="text-[#AE8C20]">*</span>
                      </label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      autoComplete="name"
                      maxLength={50}
                      pattern={NAME_PATTERN}
                      title={NAME_INVALID_MESSAGE}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? "fullName-error" : undefined}
                      placeholder="Your full name"
                      className={fieldClass("fullName")}
                    />
                    <FieldError name="fullName" />
                  </div>

                  {/* Row 2 — Email + Phone */}
                  <div className="form-field grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                        Email Address <span className="text-[#AE8C20]">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="email"
                        inputMode="email"
                        maxLength={254}
                        pattern={EMAIL_PATTERN}
                        title={EMAIL_INVALID_MESSAGE}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        placeholder="you@example.com"
                        className={fieldClass("email")}
                      />
                      <FieldError name="email" />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                          Contact Number <span className="text-[#AE8C20]">*</span>
                        </label>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          autoComplete="tel"
                          inputMode="tel"
                          maxLength={getPhoneMaxLength(form.country)}
                          aria-invalid={!!errors.phone}
                          placeholder={
                            form.country === "India"
                              ? "9876543210"
                              : form.country === "UAE"
                                ? "501234567"
                                : form.country === "UK"
                                  ? "7123456789"
                                  : form.country === "Singapore"
                                    ? "81234567"
                                    : "2025550123"
                          }
                          className={fieldClass("phone")}
                        />
                      </div>
                      <FieldError name="phone" />
                    </div>
                  </div>

                  {/* Row 3 — Service + Country */}
                  <div className="form-field grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label htmlFor="service" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                        Service Interest <span className="text-[#AE8C20]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="service"
                          name="service"
                          value={form.service}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          aria-invalid={!!errors.service}
                          className={fieldClass("service", "cursor-pointer appearance-none pr-12")}
                        >
                          <option value="" disabled>Select a service</option>
                          {SERVICES.map((s) => (
                            <option key={s} value={s} className="bg-zinc-900 text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                      <FieldError name="service" />
                    </div>
                    <div>
                      <label htmlFor="country" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                        Country <span className="text-[#AE8C20]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="country"
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          aria-invalid={!!errors.country}
                          className={fieldClass("country", "cursor-pointer appearance-none pr-12")}
                        >
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c} value={c} className="bg-zinc-900 text-white">
                              {c}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                      <FieldError name="country" />
                    </div>
                  </div>

                  {/* Row 4 — Message */}
                  <div className="form-field">
                    <label htmlFor="message" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      Enquiry Message <span className="text-[#AE8C20]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      rows={4}
                      maxLength={1500}
                      aria-invalid={!!errors.message}
                      placeholder="Tell us about your project, goals, and timeline…"
                      className={fieldClass("message", "resize-none")}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <FieldError name="message" />
                      <span className="ml-auto text-[10px] text-zinc-500">
                        {form.message.length}/1500
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="form-field">
                    <button
                      type="submit"
                      disabled={status === "loading" || sendingOtp}
                      className="group relative w-full overflow-hidden rounded-xl bg-[#AE8C20] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-[0_0_40px_rgba(174,140,32,0.3)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#D4AF37] hover:shadow-[0_0_60px_rgba(174,140,32,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {sendingOtp ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending OTP…
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>

                    {/* Status messages */}
                    {status === "error" && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        {errorMsg || "Something went wrong. Please try again or email us directly."}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Contact details — third on mobile, left column below heading on desktop */}
            <aside className="order-3 flex flex-col gap-4 sm:gap-5 lg:col-start-1 lg:row-start-2">
              {[
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  ),
                  label: "Email",
                  value: "info@ritzmediaworld.com",
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  ),
                  label: "Phone",
                  value: "+91-9220516777",
                },
                {
                  icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  ),
                  label: "Location",
                  value: "Unit No. 404, 4th Floor, Corporate Park Tower A1, Sector 142, Noida, Uttar Pradesh 201305, India",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="contact-info-item flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 backdrop-blur-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#AE8C20]/30 bg-[#AE8C20]/10 text-[#AE8C20]">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-0.5 break-words text-sm font-medium leading-snug text-white">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="contact-info-item rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 backdrop-blur-sm">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Follow Us
                </p>
                <div className="social-links-container flex flex-wrap gap-3">
                  <a
                    href="https://www.instagram.com/contenaissance/"
                    title="Follow Contenaissance on Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="social-link-btn flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/108385521/"
                    title="Follow Contenaissance on LinkedIn"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="social-link-btn flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@Contenaissance"
                    title="Subscribe to Contenaissance on YouTube"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="social-link-btn flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61579738437856"
                    title="Follow Contenaissance on Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="social-link-btn flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://x.com/contenaissance"
                    title="Follow Contenaissance on X"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="social-link-btn flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <blockquote className="contact-info-item border-l-2 border-[#AE8C20]/50 pl-4">
                <p className="contact-quote-text text-sm italic leading-relaxed text-zinc-400">
                  &ldquo;Where human creativity meets artificial precision , we craft experiences that define the future.&rdquo;
                </p>
                <cite className="contact-quote-cite mt-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#AE8C20]">
                  — Contenaissance Studio
                </cite>
              </blockquote>
            </aside>
          </div>
        </div>
      </section>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {otpModalOpen && (
              <motion.div
                className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="otp-modal-title"
              >
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  aria-label="Close verification modal"
                  onClick={() => {
                    if (!isSubmitting) closeOtpModal();
                  }}
                />

                <motion.div
                  className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/95 shadow-[0_32px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(174,140,32,0.12)] backdrop-blur-xl sm:rounded-[1.75rem]"
                  initial={{ opacity: 0, scale: 0.92, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={{ type: "spring", damping: 26, stiffness: 320 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#AE8C20]/12 blur-[70px]" />

                  <div className="relative border-b border-zinc-800/70 px-5 py-4 sm:px-6 sm:py-5">
                    <button
                      type="button"
                      onClick={closeOtpModal}
                      disabled={isSubmitting}
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:right-5 sm:top-5"
                      aria-label="Close"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="flex items-start gap-3 pr-10">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#AE8C20]/35 bg-[#AE8C20]/10 text-[#AE8C20]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <div>
                        <h2 id="otp-modal-title" className="text-lg font-bold text-white sm:text-xl">
                          Verify Mobile Number
                        </h2>
                        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                          Enter the 4-digit code sent to
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-[#D4AF37] sm:text-base">
                          {maskPhoneForDisplay(form.phone, form.country)}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500">{form.country}</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyAndSubmit} className="relative space-y-4 px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6">
                    <div>
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                        4-Digit Verification Code
                      </p>
                      <div
                        className="flex justify-center gap-2 sm:gap-3"
                        onPaste={handleOtpPaste}
                      >
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              otpInputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            value={digit}
                            aria-label={`Digit ${index + 1} of verification code`}
                            disabled={isSubmitting}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onFocus={(e) => e.target.select()}
                            className="h-12 w-11 rounded-xl border border-zinc-800 bg-zinc-950/90 text-center text-xl font-bold text-white outline-none transition-all focus:border-[#AE8C20] focus:ring-2 focus:ring-[#AE8C20]/25 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-12 sm:text-2xl"
                          />
                        ))}
                      </div>
                    </div>

                    {otpStatus && (
                      <div
                        className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm ${
                          otpStatus.type === "success"
                            ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/35 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {otpStatus.type === "success" ? (
                          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                          </svg>
                        )}
                        <span>{otpStatus.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !isOtpComplete}
                      className="group relative w-full overflow-hidden rounded-xl bg-[#AE8C20] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-[0_0_40px_rgba(174,140,32,0.3)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#D4AF37] hover:shadow-[0_0_60px_rgba(174,140,32,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Verifying & Submitting…
                          </>
                        ) : (
                          "Verify & Submit"
                        )}
                      </span>
                    </button>

                    <div className="flex flex-col gap-3 border-t border-zinc-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={closeOtpModal}
                        disabled={isSubmitting}
                        className="text-xs text-zinc-400 underline underline-offset-4 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ← Change Phone / Edit
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={sendingOtp || cooldown > 0 || isSubmitting}
                        className="text-xs font-semibold text-[#D4AF37] transition-colors hover:text-white disabled:text-zinc-500"
                      >
                        {sendingOtp ? "Sending..." : cooldown > 0 ? `Resend Code (${cooldown}s)` : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                className="fixed bottom-6 left-1/2 z-[calc(var(--z-modal)+10)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:bottom-8"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ type: "spring", damping: 24, stiffness: 320 }}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-3 rounded-xl border border-[#AE8C20]/35 bg-zinc-900/95 px-4 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_40px_rgba(174,140,32,0.15)] backdrop-blur-md sm:px-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/15 text-emerald-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-white sm:text-base">✓ Form submitted successfully!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <CTAFooter showBrandHeading={false} />
    </div>
  );
}
