"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";
import { useContactLeadForm } from "@/hooks/useContactLeadForm";
import { useFloatingActionsVisible } from "@/hooks/useFloatingActionsVisible";
import {
  COUNTRY_OPTIONS,
  getPhoneMaxLength,
  getPhonePlaceholder,
  maskPhoneForDisplay,
} from "@/lib/contact-lead";
import {
  EMAIL_INVALID_MESSAGE,
  EMAIL_PATTERN,
  NAME_INVALID_MESSAGE,
  NAME_PATTERN,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

interface LeadCapturePopupProps {
  embedded?: boolean;
}

export function LeadCapturePopup({ embedded = false }: LeadCapturePopupProps) {
  const actionsVisible = useFloatingActionsVisible();
  const [isExpanded, setIsExpanded] = useState(false);
  const autoOpenedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [heroPresent, setHeroPresent] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);

  const leadSource =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#lead-popup`
      : "lead-popup";

  const handleSubmitted = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const {
    form,
    errors,
    status,
    errorMsg,
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
  } = useContactLeadForm({
    source: leadSource,
    onSubmitted: handleSubmitted,
    defaultService: "Other",
  });

  useLenisScrollLock(isExpanded || otpModalOpen);

  useEffect(() => {
    setMounted(true);
    setHeroPresent(Boolean(document.getElementById("cinematic-hero")));
  }, []);

  useEffect(() => {
    if (!isExpanded || otpModalOpen) return;

    const scrollEl = formScrollRef.current;
    if (!scrollEl) return;

    const onWheel = (event: WheelEvent) => {
      event.stopPropagation();

      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
        event.preventDefault();
      }
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    return () => scrollEl.removeEventListener("wheel", onWheel);
  }, [isExpanded, otpModalOpen]);

  useEffect(() => {
    if (!isExpanded && !otpModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded, otpModalOpen]);

  useEffect(() => {
    if (!actionsVisible || !heroPresent || autoOpenedRef.current) return;
    setIsExpanded(true);
    autoOpenedRef.current = true;
  }, [actionsVisible, heroPresent]);

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  const handleOpen = () => {
    setIsExpanded(true);
  };

  const showCluster = actionsVisible && heroPresent;
  const inputBase =
    "w-full rounded-xl border border-zinc-200/90 bg-white/80 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm transition-all duration-300 outline-none focus:border-[#AE8C20]/70 focus:bg-white focus:ring-2 focus:ring-[#AE8C20]/15 hover:border-zinc-300";
  const errorClasses = "border-red-400/80 focus:border-red-500 focus:ring-red-500/15";

  const fieldClass = (key: keyof typeof form, extra = "") =>
    cn(inputBase, errors[key] && errorClasses, extra);

  const FieldError = ({ name }: { name: keyof typeof form }) =>
    errors[name] ? (
      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-red-500">
        <svg className="mt-0.5 h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        {errors[name]}
      </p>
    ) : null;

  const floatingButtonClass = cn(
    "relative flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12",
    "border border-[#AE8C20]/50 bg-zinc-900/90 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)]",
    "backdrop-blur-md transition-[opacity,transform,background-color,border-color,color,box-shadow]",
    "duration-300 hover:border-[#AE8C20] hover:bg-[#AE8C20] hover:text-zinc-950 hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)]",
    "active:scale-95",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE8C20] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
  );

  const formPanel = (
    <motion.div
      key="lead-popup-panel"
      ref={formContainerRef}
      initial={{ opacity: 0, y: 28, scale: 0.92, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 20, scale: 0.94, filter: "blur(4px)" }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className={cn(
        "relative z-10 flex w-[min(calc(100vw-2rem),32rem)] max-h-[min(90dvh,calc(100dvh-2rem))] flex-col overflow-hidden rounded-[1.5rem]",
        "border border-[#AE8C20]/25 bg-white/95 shadow-[0_32px_100px_rgba(0,0,0,0.22),0_0_0_1px_rgba(174,140,32,0.1)] backdrop-blur-xl",
        "sm:w-[36rem] md:w-[40rem]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#AE8C20]/10 blur-[60px]" />

            <div className="relative shrink-0 border-b border-zinc-200/80 px-4 py-3.5 sm:px-5">
              <button
                type="button"
                onClick={handleMinimize}
                aria-label="Close lead form"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-500 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#AE8C20]">
              Get in Touch
              </p>
              <h2 id="lead-popup-title" className="mt-1 pr-8 text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
                Let&apos;s build together
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Share your brief — we respond within 24 hours.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
              <div
                ref={formScrollRef}
                data-lenis-prevent
                className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-4 py-4 sm:px-5 [scrollbar-width:thin] [scrollbar-color:#a1a1aa_transparent]"
              >
              <div className="grid gap-3">
                <div>
                  <label htmlFor="lead-fullName" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Full Name <span className="text-[#AE8C20]">*</span>
                  </label>
                  <input
                    id="lead-fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="name"
                    maxLength={50}
                    pattern={NAME_PATTERN}
                    title={NAME_INVALID_MESSAGE}
                    placeholder="Your full name"
                    className={fieldClass("fullName")}
                  />
                  <FieldError name="fullName" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lead-email" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                      Email <span className="text-[#AE8C20]">*</span>
                    </label>
                    <input
                      id="lead-email"
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
                      placeholder="you@example.com"
                      className={fieldClass("email")}
                    />
                    <FieldError name="email" />
                  </div>
                  <div>
                    <label htmlFor="lead-phone" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                      Phone <span className="text-[#AE8C20]">*</span>
                    </label>
                    <input
                      id="lead-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={getPhoneMaxLength(form.country)}
                      placeholder={getPhonePlaceholder(form.country)}
                      className={fieldClass("phone")}
                    />
                    <FieldError name="phone" />
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-country" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Country <span className="text-[#AE8C20]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="lead-country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={fieldClass("country", "cursor-pointer appearance-none pr-10")}
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
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

                <div>
                  <label htmlFor="lead-message" className="mb-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Message <span className="text-[#AE8C20]">*</span>
                  </label>
                  <textarea
                    id="lead-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows={3}
                    maxLength={1500}
                    placeholder="Tell us about your project…"
                    className={fieldClass("message", "resize-none")}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <FieldError name="message" />
                    <span className="ml-auto text-[10px] text-zinc-400">{form.message.length}/1500</span>
                  </div>
                </div>
              </div>
              </div>

              <div className="shrink-0 border-t border-zinc-200/80 bg-white/95 px-4 py-4 sm:px-5">
                <button
                  type="submit"
                  disabled={status === "loading" || sendingOtp}
                  className="group relative w-full overflow-hidden rounded-xl bg-[#AE8C20] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-950 shadow-[0_12px_32px_rgba(174,140,32,0.35)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>

                {status === "error" && errorMsg && (
                  <div className="mt-3 rounded-xl border border-red-400/30 bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                    {errorMsg}
                  </div>
                )}
              </div>
            </form>
    </motion.div>
  );

  const triggerButton =
    showCluster && !isExpanded ? (
      <motion.button
        key="lead-popup-trigger"
        type="button"
        onClick={handleOpen}
        aria-label="Open project enquiry form"
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ type: "spring", damping: 24, stiffness: 360 }}
        className={cn(floatingButtonClass, "pointer-events-auto")}
      >
        <span className="absolute inset-0 rounded-full bg-[#AE8C20]/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
        <svg className="relative h-5 w-5 sm:h-[1.2rem] sm:w-[1.2rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </motion.button>
    ) : null;

  return (
    <>
      {embedded ? (
        <AnimatePresence mode="wait">{triggerButton}</AnimatePresence>
      ) : (
        triggerButton
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {showCluster && isExpanded && !otpModalOpen && (
              <motion.div
                className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-popup-title"
              >
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[6px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  aria-label="Close lead form"
                  onClick={handleMinimize}
                />
                {formPanel}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {mounted &&
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
                aria-labelledby="lead-otp-title"
              >
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-zinc-950/70 backdrop-blur-md"
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
                        <h2 id="lead-otp-title" className="text-lg font-bold text-white sm:text-xl">
                          Verify Mobile Number
                        </h2>
                        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Enter the 4-digit code sent to</p>
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
                      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
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
                        className={cn(
                          "flex items-start gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm",
                          otpStatus.type === "success"
                            ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/35 bg-red-500/10 text-red-400"
                        )}
                      >
                        <span>{otpStatus.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || !isOtpComplete}
                      className="group relative w-full overflow-hidden rounded-xl bg-[#AE8C20] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-[0_0_40px_rgba(174,140,32,0.3)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? "Verifying & Submitting…" : "Verify & Submit"}
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

      {mounted &&
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
                  <p className="text-sm font-semibold text-white sm:text-base">Form submitted successfully!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
