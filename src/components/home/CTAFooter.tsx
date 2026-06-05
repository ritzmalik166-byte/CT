"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Waves from "@/components/Waves";
import { FooterAIEngagement } from "@/components/ai-engagement/FooterAIEngagement";
import { AIIconsMarquee } from "@/components/ui/AIIconsMarquee";
import {
  FOOTER_NEWSLETTER_SCRIPT_URL,
  submitToGoogleAppsScript,
} from "@/lib/googleSheets";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type SubmitStatus = "idle" | "loading" | "success" | "error";

const BRAND_TEXT = "CONTENAISSANCE";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const SHOW_AI_GAME = false;

export function CTAFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const brandTextRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useGSAP(
    () => {
      gsap.from(".footer-container", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Letter-by-letter pop-up animation for brand text
      const letters = brandTextRef.current?.querySelectorAll(".brand-letter");
      if (letters) {
        gsap.set(letters, { y: 100, opacity: 0 });
        
        gsap.to(letters, {
          scrollTrigger: {
            trigger: brandTextRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04,
          ease: "back.out(1.7)",
        });
      }
    },
    { scope: sectionRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setErrorMsg("Please enter your email.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const payload = {
        email: trimmed,
        source:
          typeof window !== "undefined"
            ? window.location.href
            : "footer",
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      await submitToGoogleAppsScript(FOOTER_NEWSLETTER_SCRIPT_URL, payload);

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Could not send right now. Please try again.");
    }
  };

  return (
    <section ref={sectionRef} className="relative bg-zinc-950">
      {/* Dotted SVG background area above the footer — below footer in stack order */}
      <div
        className={
          SHOW_AI_GAME
            ? "relative z-0 w-full h-[540px] sm:h-[620px] md:h-[720px] lg:h-[780px]"
            : "relative z-0 w-full h-[220px] sm:h-[260px] md:h-[300px]"
        }
      >
        {/* Dotted SVG */}
        <Image
          src="/assets/dotted.svg"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* Bottom gradient to blend into footer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />

        {/* AI Icons marquee — pinned to top of dotted area, nudged down from header */}
        <div className="absolute inset-x-0 top-0 z-10">
          <AIIconsMarquee className="pt-9 pb-2 sm:pt-11 sm:pb-3 md:pt-14" />
        </div>

        {SHOW_AI_GAME && <FooterAIEngagement />}
      </div>

      {/* Footer container — stacks above boy so legs hide behind rounded top */}
      <div
        className={
          SHOW_AI_GAME
            ? "relative z-10 -mt-28 sm:-mt-44 md:-mt-52 lg:-mt-56 mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8"
            : "relative z-10 -mt-10 sm:-mt-12 md:-mt-14 mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8"
        }
      >
        <footer
          className="footer-container relative isolate overflow-hidden rounded-t-[32px] sm:rounded-t-[60px] md:rounded-t-[80px] lg:rounded-t-[120px]"
          style={{
            background: "rgb(17, 17, 19)",
            minHeight: "320px",
          }}
        >
          {/* Waves background */}
          <div className="absolute inset-0 z-0">
            <Waves
              lineColor="#2c2c2c"
              backgroundColor="transparent"
              waveSpeedX={0.0125}
              waveSpeedY={0.01}
              waveAmpX={40}
              waveAmpY={20}
              friction={0.9}
              tension={0.01}
              maxCursorMove={120}
              xGap={12}
              yGap={36}
            />
          </div>

          {/* Inner radial gradient overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(17,17,19,0)_0%,rgba(17,17,19,0.55)_70%,rgba(17,17,19,0.95)_100%)]"
          />

          {/* Footer content */}
          <div className="relative z-10 px-4 pt-8 pb-6 sm:px-8 sm:pt-12 md:px-12 md:pt-16 lg:px-20 lg:pt-20">
            {/* Mobile / Tablet: center-aligned, stacked; lg+: side-by-side */}
            <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
              {/* Navigation links */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-2.5 lg:justify-start">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-white/80 transition-colors duration-300 hover:text-[#D4AF37] sm:text-base lg:text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Email subscription */}
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <p className="text-sm text-white sm:text-base lg:text-lg">
                  Still have a Question ?
                </p>
                <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:flex-row sm:gap-3">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== "idle") setStatus("idle");
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="Enter Your Email..."
                    disabled={status === "loading"}
                    required
                    autoComplete="email"
                    aria-invalid={status === "error"}
                    aria-describedby={errorMsg || status === "success" ? "footer-email-status" : undefined}
                    className="h-12 w-full flex-1 rounded-full border-2 border-white bg-white px-5 py-3 text-center text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-[#AE8C20] focus:ring-2 focus:ring-[#AE8C20]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[48px] sm:px-6 sm:text-left md:h-[52px] md:px-7"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="h-12 shrink-0 rounded-full bg-[#AE8C20] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(174,140,32,0.35)] transition-all duration-300 hover:bg-[#C9A730] hover:shadow-[0_12px_28px_rgba(174,140,32,0.45)] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[48px] sm:px-7 md:h-[52px] md:px-8"
                  >
                    {status === "loading" ? "Sending…" : "Send Us"}
                  </button>
                </form>
                <p
                  id="footer-email-status"
                  role="status"
                  aria-live="polite"
                  className={`mt-2 min-h-[1.25rem] text-xs sm:text-sm ${
                    status === "success"
                      ? "text-[#D4AF37]"
                      : status === "error"
                        ? "text-red-400"
                        : "text-transparent"
                  }`}
                >
                  {status === "success"
                    ? "Thanks! Your email was sent successfully."
                    : errorMsg}
                </p>
              </div>
            </div>

            {/* Large brand text — smaller on mobile */}
            <h2
              ref={brandTextRef}
              className="mt-10 overflow-hidden text-center font-bold leading-none tracking-tight text-white sm:mt-14 md:mt-16 lg:mt-20"
              style={{ fontSize: "clamp(1.75rem, 9vw, 8rem)" }}
            >
              {BRAND_TEXT.split("").map((letter, index) => (
                <span
                  key={index}
                  className="brand-letter inline-block"
                  style={{ willChange: "transform, opacity" }}
                >
                  {letter}
                </span>
              ))}
            </h2>

            {/* Bottom bar */}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-5 text-center sm:mt-8 sm:gap-4 md:mt-10 lg:flex-row lg:justify-between lg:text-left">
              <p className="text-[11px] text-white/60 sm:text-xs md:text-sm">
                © {new Date().getFullYear()} Contenaissance. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-white/60 sm:gap-4 sm:text-xs md:gap-6 md:text-sm">
                <Link
                  href="#privacy"
                  className="transition-colors duration-300 hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#cookies"
                  className="transition-colors duration-300 hover:text-white"
                >
                  Cookies Policy
                </Link>
                <span>
                  Website by{" "}
                  <a
                    href="https://ritzmediaworld.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 underline underline-offset-2 transition-colors duration-300 hover:text-[#AE8C20]"
                  >
                    ritzmediaworld
                  </a>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
