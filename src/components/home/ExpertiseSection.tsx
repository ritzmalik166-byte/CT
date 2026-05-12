"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const USE_CASES = [
  {
    title: "AI Brand Films",
    description:
      "Discover how to turn your brand story into a cinematic experience via AI-driven 3D technology. We use generative AI to make brand films with dynamic live action in a synthetic environment that boosts your brand and captures imagination!",
  },
  {
    title: "Digital-First Content",
    description:
      "Design high-velocity content for any modern digital consumption platform. Using advanced AI tools, we help you craft compelling and contextual visuals that connect with your audience across diverse social ecosystems.",
  },
  {
    title: "AI-Powered Campaigns",
    description:
      "Enhance campaigns with AI and scale marketing. Our strategies are based on data and performance, guaranteeing you the best ROI for your digital marketing budget.",
  },
  {
    title: "Visual Identity Systems",
    description:
      "Create your brand's AI-driven visual identity system. We design brand frameworks that are memorable and scalable and apply the necessary look and feel to brand touchpoints in an AI-enabled world.",
  },
];

// Chain link component
function ChainLink({ className = "" }: { className?: string }) {
  return (
    <div className={`chain-link relative h-6 w-3 ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 border-[#AE8C20]/60" />
    </div>
  );
}

// Vertical chain segment
function ChainSegment({ length = 5 }: { length?: number }) {
  return (
    <div className="chain-segment flex flex-col items-center -space-y-1">
      {Array.from({ length }).map((_, i) => (
        <ChainLink key={i} />
      ))}
    </div>
  );
}

export function ExpertiseSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Header animation
      gsap.from(".expertise-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      });

      // Main chain drops down
      gsap.from(".main-chain", {
        scrollTrigger: {
          trigger: ".chain-container",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        scaleY: 0,
        transformOrigin: "top center",
        duration: 0.8,
        ease: "power2.out",
      });

      // Cards drop and swing into place
      const cards = gsap.utils.toArray<HTMLElement>(".hanging-card");
      cards.forEach((card, i) => {
        const connector = card.querySelector(".card-connector");
        const cardBody = card.querySelector(".card-body");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".chain-container",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        // Connector chain drops
        tl.from(
          connector,
          {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 0.4,
            ease: "power2.out",
          },
          i * 0.15
        );

        // Card drops with swing. Keep cards visible by default so they never
        // disappear if the scroll trigger initializes while already in view.
        tl.from(
          cardBody,
          {
            y: -80,
            scale: 0.96,
            rotation: i % 2 === 0 ? -8 : 8,
            transformOrigin: "top center",
            duration: 0.75,
            ease: "elastic.out(1, 0.55)",
            clearProps: "transform",
          },
          i * 0.15 + 0.2
        );
      });

      // Chain links shimmer
      gsap.to(".chain-link", {
        scrollTrigger: {
          trigger: ".chain-container",
          start: "top 70%",
          toggleActions: "play none none none",
        },
        borderColor: "rgba(174, 140, 32, 0.9)",
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#AE8C20]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-y-1/2 -translate-x-1/2 rounded-full bg-[#AE8C20]/[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <div className="expertise-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#AE8C20]/30 bg-[#AE8C20]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#AE8C20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Expertise
          </span>
          <h2 className="mt-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#AE8C20] bg-clip-text text-4xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            AI Services
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-base text-zinc-600 md:text-lg">
          Merging human creative intuition with the raw power of neural intelligence.


          </p>
        </div>

        {/* Chain container */}
        <div className="chain-container relative mt-16 lg:mt-20">
          {/* Main horizontal chain bar */}
          <div className="main-chain relative mx-auto flex h-10 max-w-5xl items-center justify-center">
            {/* Horizontal chain */}
            <div className="flex items-center gap-0">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="chain-link h-3 w-5 rounded-full border-2 border-[#AE8C20]/50 -ml-1 first:ml-0"
                />
              ))}
            </div>
            {/* Hook at top */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="h-8 w-8 rounded-full border-4 border-[#AE8C20]/70 bg-white" />
              <div className="absolute left-1/2 top-6 h-4 w-1 -translate-x-1/2 bg-[#AE8C20]/70" />
            </div>
          </div>

          {/* Hanging cards grid */}
          <div className="relative mt-4 grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((useCase, index) => (
              <div
                key={useCase.title}
                className="hanging-card relative flex flex-col items-center pt-8 lg:pt-12"
              >
                {/* Connector chain from main bar to card */}
                <div className="card-connector absolute -top-9 left-1/2 -translate-x-1/2">
                  <ChainSegment length={index % 2 === 0 ? 4 : 6} />
                </div>

                {/* Card body */}
                <article
                  className="card-body group relative w-full overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-[0_10px_40px_-12px_rgba(24,24,27,0.1)] transition-all duration-500 hover:-translate-y-1 hover:border-[#AE8C20]/40 hover:shadow-[0_30px_70px_-20px_rgba(174,140,32,0.35)] md:p-7"
                  style={{ marginTop: index % 2 === 0 ? "2.25rem" : "3.5rem" }}
                >
                  {/* Pin/hook at top of card */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="h-6 w-6 rounded-full border-3 border-[#AE8C20] bg-gradient-to-br from-[#D4AF37] to-[#AE8C20] shadow-lg" />
                  </div>

                  {/* Shine sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-full group-hover:opacity-100"
                    style={{ mixBlendMode: "soft-light" }}
                  />

                  {/* Top sheen line */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#AE8C20]/60 to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Corner glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#AE8C20]/0 blur-3xl transition-all duration-700 group-hover:bg-[#AE8C20]/25"
                  />

                  <div className="relative flex flex-1 flex-col">
                    {/* Use case badge */}
                    <span className="inline-flex w-fit items-center rounded-md bg-[#AE8C20]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8C20]">
                      Use Case
                    </span>

                    <h3 className="mt-4 text-xl font-bold leading-tight text-zinc-900 md:text-2xl">
                      {useCase.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">
                      {useCase.description}
                    </p>

                    <a
                      href="#contact"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#AE8C20] transition-all duration-300 group-hover:gap-3"
                    >
                      Explore More
                      <svg
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
