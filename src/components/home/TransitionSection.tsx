"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function TransitionSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Animate the tagline
      gsap.from(".transition-tagline", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Animate the headline words
      gsap.from(".transition-word", {
        scrollTrigger: {
          trigger: ".transition-headline",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      // Animate the CTA button
      gsap.from(".transition-cta", {
        scrollTrigger: {
          trigger: ".transition-cta",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: "back.out(1.7)",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#fff] py-32 md:py-40 lg:py-48"
    >
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/5 blur-[150px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        {/* Tagline */}
        <p className="transition-tagline text-sm font-semibold uppercase tracking-[0.3em] text-[#AE8C20]">
          Ready to Transform?
        </p>

        {/* Headline */}
        <h2 className="transition-headline mt-6 text-4xl font-bold leading-tight text-black sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="transition-word inline-block">Let&apos;s</span>{" "}
          <span className="transition-word inline-block">Build</span>{" "}
          <span className="transition-word inline-block">Something</span>{" "}
          <span className="transition-word inline-block text-[#AE8C20]">
            Extraordinary
          </span>
        </h2>

        {/* Subtext */}
        <p className="transition-tagline mx-auto mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
          Partner with us to create AI-powered experiences that captivate and convert.
        </p>

        {/* CTA Button */}
        <a
          href="#contact"
          className="transition-cta group mt-10 inline-flex items-center gap-3 rounded-full bg-[#AE8C20] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(174,140,32,0.4)] transition-all duration-300 hover:scale-105 hover:bg-[#C9A730] hover:shadow-[0_15px_40px_rgba(174,140,32,0.5)]"
        >
          <span>Get in Touch</span>
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
