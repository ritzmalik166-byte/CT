"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ContactLeadFormData,
  ContactLeadFormErrors,
  ContactLeadStatus,
  EMPTY_CONTACT_LEAD_FORM,
  EMPTY_OTP_DIGITS,
  OTP_LENGTH,
  normalizeLocalPhone,
  submitContactLead,
  validateAllContactLeadFields,
  validateContactLeadField,
} from "@/lib/contact-lead";

type OtpStatus = { type: "success" | "error"; text: string } | null;

interface UseContactLeadFormOptions {
  source: string;
  onSubmitted?: () => void;
  /** When set, service is hidden from UI and submitted with this value. */
  defaultService?: string;
}

export function useContactLeadForm({
  source,
  onSubmitted,
  defaultService,
}: UseContactLeadFormOptions) {
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [status, setStatus] = useState<ContactLeadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<ContactLeadFormData>(() => ({
    ...EMPTY_CONTACT_LEAD_FORM,
    ...(defaultService ? { service: defaultService } : {}),
  }));
  const [errors, setErrors] = useState<ContactLeadFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactLeadFormData, boolean>>>({});
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP_DIGITS);
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState<OtpStatus>(null);
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

    const focusTimer = window.setTimeout(() => {
      focusOtpInput(0);
    }, 120);

    return () => {
      document.removeEventListener("keydown", handleKey);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as keyof ContactLeadFormData;
    const value = e.target.value;
    const nextForm = { ...form, [name]: value } as ContactLeadFormData;
    setForm(nextForm);

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateContactLeadField(name, value, nextForm) }));
    }

    if (name === "country" && touched.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: validateContactLeadField("phone", nextForm.phone, nextForm),
      }));
    }

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
    const name = e.target.name as keyof ContactLeadFormData;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateContactLeadField(name, e.target.value, { ...form, [name]: e.target.value }),
    }));
  };

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
      await submitContactLead(form, localPhone, source);

      setStatus("idle");
      setErrorMsg("");
      setStep("form");
      setForm(
        defaultService
          ? { ...EMPTY_CONTACT_LEAD_FORM, service: defaultService }
          : EMPTY_CONTACT_LEAD_FORM
      );
      setErrors({});
      setTouched({});
      setIsPhoneVerified(false);
      setVerifiedPhone("");
      setOtpSent(false);
      resetOtpDigits();
      setOtpStatus(null);
      setShowSuccessToast(true);
      onSubmitted?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[contact-lead] submission failed", err);
      setStatus("error");
      setErrorMsg("Could not reach our server. Check your network and try again.");
      setStep("form");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitForm = defaultService
      ? { ...form, service: form.service || defaultService }
      : form;

    const allErrors = validateAllContactLeadFields(submitForm);
    setErrors(allErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      ...(defaultService ? {} : { service: true }),
      country: true,
      message: true,
    });

    if (Object.keys(allErrors).length > 0) {
      setStatus("error");
      setErrorMsg("Please fix the highlighted fields and try again.");
      const firstInvalid = (Object.keys(allErrors) as (keyof ContactLeadFormData)[])[0];
      const el = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
      el?.focus();
      return;
    }

    if (defaultService && form.service !== submitForm.service) {
      setForm(submitForm);
    }

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
        text: "4-digit OTP sent to your phone number.",
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

  return {
    form,
    errors,
    status,
    errorMsg,
    step,
    otpDigits,
    otpStatus,
    otpModalOpen,
    otpInputRefs,
    sendingOtp,
    isSubmitting,
    isOtpComplete,
    cooldown,
    showSuccessToast,
    handleChange,
    handleBlur,
    handleFormSubmit,
    handleVerifyAndSubmit,
    handleResendOtp,
    handleOtpDigitChange,
    handleOtpKeyDown,
    handleOtpPaste,
    closeOtpModal,
  };
}
