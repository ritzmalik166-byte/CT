"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Waves from "@/components/Waves";
import { AIIconsMarquee } from "@/components/ui/AIIconsMarquee";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BRAND_TEXT = "CONTENAISSANCE";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export function CTAFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const brandTextRef = useRef<HTMLHeadingElement>(null);
  const [email, setEmail] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Email submitted:", email);
      setEmail("");
    }
  };

  return (
    <section ref={sectionRef} className="relative bg-zinc-950">
      {/* Dotted SVG background area above the footer */}
      <div className="relative w-full h-[400px] sm:h-[480px] md:h-[550px]">
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

        {/* AI Icons marquee — floats on the dotted surface */}
        <div className="absolute inset-x-0 top-[28%] -translate-y-1/2">
          <AIIconsMarquee />
        </div>
      </div>

      {/* Footer container with rounded top corners */}
      <div className="relative -mt-32 sm:-mt-40 md:-mt-48 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <footer
          className="footer-container relative overflow-hidden rounded-t-[60px] sm:rounded-t-[80px] md:rounded-t-[100px] lg:rounded-t-[120px]"
          style={{
            background: "rgba(17, 17, 19, 0.90)",
            minHeight: "450px",
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
          <div className="relative z-10 px-6 pt-12 pb-6 sm:px-10 sm:pt-16 md:px-14 md:pt-20 lg:px-20">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              {/* Navigation links */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:gap-x-16">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-base font-medium text-white/80 transition-colors duration-300 hover:text-white sm:text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Email subscription */}
              <div className="w-full max-w-md lg:max-w-lg">
                <p className="text-base text-white sm:text-lg">
                  Still have a questions
                </p>
                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email..."
                    className="h-[50px] flex-1 rounded-full border-2 border-white bg-white px-6 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-[#AE8C20] focus:ring-2 focus:ring-[#AE8C20]/30"
                  />
                  <button
                    type="submit"
                    className="h-[50px] shrink-0 rounded-full bg-[#AE8C20] px-8 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(174,140,32,0.35)] transition-all duration-300 hover:bg-[#C9A730] hover:shadow-[0_12px_28px_rgba(174,140,32,0.45)]"
                  >
                    send us
                  </button>
                </form>
              </div>
            </div>

            {/* Large brand text */}
            <h2
              ref={brandTextRef}
              className="mt-12 overflow-hidden text-center text-[clamp(2.5rem,12vw,8rem)] font-bold leading-none tracking-tight text-white sm:mt-16 md:mt-20"
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
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:mt-10 md:flex-row">
              <p className="text-sm text-white/60">
                © {new Date().getFullYear()} Contenaissance. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/60 sm:gap-6">
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
