"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { CTAFooter } from "@/components/home/CTAFooter";
import { HamburgerMenu } from "@/components/home/HamburgerMenu";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby8DOgFwRAa65kLZaBohncDPmIrzPvOP2mf3-Row9835UrUl6QknU_NoOANwivOpps9/exec";


const SERVICES = [
  "AI Brand Films",
  "Digital-First Content",
  "AI-Powered Campaigns",
  "Visual Identity System",
  "Other",
];

type Status = "idle" | "loading" | "success" | "error";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;
// Allow +, spaces, dashes, parentheses, but require 7–15 digits in total
const PHONE_DIGITS_REGEX = /^[+\d][\d\s().-]{6,18}$/;

const validateField = (name: keyof FormData, value: string): string => {
  const v = value.trim();
  switch (name) {
    case "fullName":
      if (!v) return "Full name is required.";
      if (v.length < 2) return "Name must be at least 2 characters.";
      if (!NAME_REGEX.test(v)) return "Use letters, spaces, hyphens or apostrophes only.";
      return "";
    case "email":
      if (!v) return "Email is required.";
      if (!EMAIL_REGEX.test(v)) return "Enter a valid email address.";
      return "";
    case "phone":
      if (!v) return ""; // optional
      if (!PHONE_DIGITS_REGEX.test(v)) return "Enter a valid phone number.";
      if ((v.match(/\d/g) || []).length < 7) return "Phone must have at least 7 digits.";
      return "";
    case "service":
      if (!v) return "Please choose a service.";
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
    const msg = validateField(k, form[k]);
    if (msg) errors[k] = msg;
  });
  return errors;
};

export default function ContactPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

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

      gsap.fromTo(
        ".contact-info-item",
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-info-item",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".contact-form",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".contact-form",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".form-field",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".contact-form",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
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
    setForm((prev) => ({ ...prev, [name]: value }));
    // Re-validate live only if the user already touched the field
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as keyof FormData;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate everything and surface errors
    const allErrors = validateAll(form);
    setErrors(allErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      service: true,
      message: true,
    });

    if (Object.keys(allErrors).length > 0) {
      setStatus("error");
      setErrorMsg("Please fix the highlighted fields and try again.");
      // Focus the first invalid field
      const firstInvalid = (Object.keys(allErrors) as (keyof FormData)[])[0];
      const el = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
      el?.focus();
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Field names match what the Google Apps Script doPost expects:
      // fullName, email, subject (= service), message, contactNumber (= phone).
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        contactNumber: form.phone.trim(),
        subject: form.service,
        message: form.message.trim(),
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        source: typeof window !== "undefined" ? window.location.href : "contact-page",
      };

      // POST as text/plain — Apps Script reads it via e.postData.contents.
      // text/plain avoids the CORS preflight, while no-cors keeps the request fire-and-forget.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      // eslint-disable-next-line no-console
      console.info("[contact] lead submitted", payload);

      setStatus("success");
      setErrorMsg("");
      setForm({ fullName: "", email: "", phone: "", service: "", message: "" });
      setErrors({});
      setTouched({});
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[contact] submission failed", err);
      setStatus("error");
      setErrorMsg("Could not reach our server. Check your network and try again.");
    }
  };

  const inputBase =
    "w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all duration-300 outline-none focus:border-[#AE8C20]/70 focus:bg-zinc-900 focus:ring-2 focus:ring-[#AE8C20]/20 hover:border-zinc-700";
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
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage="contact" />

      {/* Fixed header */}
      <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/favicon.png"
              alt="Contenaissance"
              width={220}
              height={66}
              className="h-10 w-auto sm:h-12 md:h-16"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Hamburger */}
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((v) => !v)}
        className="group fixed right-4 top-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] sm:right-5 sm:top-5 sm:h-12 sm:w-12 md:right-9 md:top-6 md:h-14 md:w-14"
      >
        {menuOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <span className="flex h-5 items-end gap-[3px]">
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all group-hover:h-5" />
            <span className="h-5 w-[2.5px] rounded-full bg-current transition-all group-hover:h-3" />
            <span className="h-3 w-[2.5px] rounded-full bg-current transition-all group-hover:h-5" />
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all group-hover:h-3" />
          </span>
        )}
      </button>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-36 md:px-10 md:pb-24 md:pt-48">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/10 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-[#AE8C20]/6 blur-[140px]" />
        </div>

        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #AE8C20 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1400px] text-center lg:text-left">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#AE8C20] sm:mb-5 sm:text-xs">
            Get in Touch
          </p>
          <h1
            className="overflow-visible text-[clamp(2.75rem,11vw,9.5rem)] font-bold leading-[1] tracking-[-0.07em]"
            style={{ perspective: "800px" }}
          >
            <span className="contact-title-line1 block pb-1">Let&apos;s Build</span>
            <span className="contact-title-line2 block overflow-visible bg-gradient-to-r from-[#AE8C20] via-[#D4AF37] to-[#AE8C20] bg-clip-text pb-4 text-transparent">
              Together
            </span>
          </h1>

          <p className="contact-sub mx-auto mt-6 max-w-xl text-sm leading-loose text-zinc-400 sm:mt-8 md:text-base lg:mx-0">
            Tell us about your project and we&apos;ll get back to you within 24 hours. Let&apos;s create something extraordinary.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <section className="relative px-4 pb-20 sm:px-6 sm:pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-20 xl:grid-cols-[440px_1fr]">

            {/* LEFT — Contact Info */}
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Info cards */}
              {[
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  ),
                  label: "Email",
                  value: "info@ritzmediaworld.com",
                },
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  ),
                  label: "Phone",
                  value: "+91-9220516777",
                },
                {
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  ),
                  label: "Location",
                  value: "Unit No. 404, 4Th Floor Corporate Park, Tower A1 Sector 142, Noida, Uttar Pradesh, India",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="contact-info-item flex items-start gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-4 backdrop-blur-sm sm:gap-4 sm:px-6 sm:py-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#AE8C20]/30 bg-[#AE8C20]/10 text-[#AE8C20] sm:h-11 sm:w-11">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-white">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Socials */}
              <div className="contact-info-item rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-6 py-5 backdrop-blur-sm">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Follow Us
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Instagram", href: "https://www.instagram.com/contenaissance/" },
                    { label: "LinkedIn", href: "https://www.linkedin.com/company/108385521/" },
                    { label: "YouTube", href: "https://www.youtube.com/@Contenaissance" },
                    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61579738437856" },
                    { label: "X", href: "https://x.com/contenaissance" },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-[#AE8C20]/50 hover:text-[#AE8C20]"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <blockquote className="contact-info-item border-l-2 border-[#AE8C20]/50 pl-6">
                <p className="text-sm italic leading-loose text-zinc-400">
                  &ldquo;Where human creativity meets artificial precision — we craft experiences that define the future.&rdquo;
                </p>
                <cite className="mt-3 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#AE8C20]">
                  — Contenaissance Studio
                </cite>
              </blockquote>
            </div>

            {/* RIGHT — Form */}
            <form
              onSubmit={handleSubmit}
              className="contact-form relative rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 backdrop-blur-sm sm:rounded-[2rem] sm:p-7 md:p-10"
            >
              {/* Glow inside form */}
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#AE8C20]/6 blur-[100px]" />

              <div className="relative grid gap-5">
                {/* Row 1 — Full name */}
                <div className="form-field">
                  <label htmlFor="fullName" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
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
                    maxLength={60}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    placeholder="Your full name"
                    className={fieldClass("fullName")}
                  />
                  <FieldError name="fullName" />
                </div>

                {/* Row 2 — Email + Phone */}
                <div className="form-field grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
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
                      maxLength={100}
                      aria-invalid={!!errors.email}
                      placeholder="you@example.com"
                      className={fieldClass("email")}
                    />
                    <FieldError name="email" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                      Contact Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={20}
                      aria-invalid={!!errors.phone}
                      placeholder="+91 98765 43210"
                      className={fieldClass("phone")}
                    />
                    <FieldError name="phone" />
                  </div>
                </div>

                {/* Row 3 — Service Interest */}
                <div className="form-field">
                  <label htmlFor="service" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
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

                {/* Row 4 — Message */}
                <div className="form-field">
                  <label htmlFor="message" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                    Enquiry Message <span className="text-[#AE8C20]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows={6}
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
                    disabled={status === "loading"}
                    className="group relative w-full overflow-hidden rounded-2xl bg-[#AE8C20] px-8 py-4 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-[0_0_40px_rgba(174,140,32,0.3)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#D4AF37] hover:shadow-[0_0_60px_rgba(174,140,32,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {status === "loading" ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending…
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
                  {status === "success" && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm text-green-400">
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Message sent! We&apos;ll get back to you within 24 hours.
                    </div>
                  )}
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
        </div>
      </section>

      <CTAFooter />
    </div>
  );
}
