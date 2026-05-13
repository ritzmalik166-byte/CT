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
    gridArea: "brand",
  },
  {
    title: "Digital-First Content",
    description:
      "Design high-velocity content for any modern digital consumption platform. Using advanced AI tools, we help you craft compelling and contextual visuals that connect with your audience across diverse social ecosystems.",
    gridArea: "digital",
  },
  {
    title: "AI-Powered Campaigns",
    description:
      "Enhance campaigns with AI and scale marketing. Our strategies are based on data and performance, guaranteeing you the best ROI for your digital marketing budget.",
    gridArea: "campaigns",
  },
  {
    title: "Visual Identity Systems",
    description:
      "Create your brand's AI-driven visual identity system. We design brand frameworks that are memorable and scalable and apply the necessary look and feel to brand touchpoints in an AI-enabled world.",
    gridArea: "identity",
  },
];

export function ExpertiseSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Header animation - smooth scrub-based reveal
      gsap.fromTo(
        ".expertise-header",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top 55%",
            scrub: 0.8,
          },
        }
      );

      // Cards overlap animation - cards come from different directions and stack
      const cards = gsap.utils.toArray<HTMLElement>(".use-case-card");
      
      // Starting positions for overlap effect (cards spread out, then converge)
      const startingPositions = [
        { x: -120, y: 150, rotation: -8, scale: 0.9 },   // Card 1: from left
        { x: 120, y: 200, rotation: 6, scale: 0.9 },    // Card 2: from right
        { x: -100, y: 180, rotation: -5, scale: 0.9 },  // Card 3: from left
        { x: 100, y: 220, rotation: 7, scale: 0.9 },    // Card 4: from right
      ];

      // Final overlapping positions (slight offsets for stacked look)
      const finalPositions = [
        { x: 0, y: 0, rotation: 0, scale: 1 },
        { x: 0, y: -15, rotation: 0, scale: 1 },
        { x: 0, y: -10, rotation: 0, scale: 1 },
        { x: 0, y: -20, rotation: 0, scale: 1 },
      ];

      cards.forEach((card, i) => {
        // Set z-index for proper stacking
        gsap.set(card, { zIndex: cards.length - i });

        gsap.fromTo(
          card,
          {
            x: startingPositions[i].x,
            y: startingPositions[i].y,
            rotation: startingPositions[i].rotation,
            scale: startingPositions[i].scale,
            opacity: 0,
          },
          {
            x: finalPositions[i].x,
            y: finalPositions[i].y,
            rotation: finalPositions[i].rotation,
            scale: finalPositions[i].scale,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".cards-container",
              start: `top ${90 - i * 5}%`,
              end: `top ${45 - i * 5}%`,
              scrub: 0.8,
            },
          }
        );
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

        {/* Bento Grid Cards Container */}
        <div className="cards-container relative mt-16 lg:mt-20">
          {/* Scattered bento-style grid layout */}
          <div 
            className="relative grid gap-5 md:gap-6"
            style={{
              gridTemplateColumns: "repeat(12, 1fr)",
              gridTemplateRows: "auto auto auto",
              gridTemplateAreas: `
                "brand brand brand brand brand digital digital digital digital digital digital digital"
                ". campaigns campaigns campaigns campaigns campaigns identity identity identity identity identity ."
              `,
            }}
          >
            {USE_CASES.map((useCase, index) => {
              const offsetStyles = [
                { marginTop: "0" },
                { marginTop: "2rem" },
                { marginTop: "1rem" },
                { marginTop: "2.5rem" },
              ];
              
              return (
                <article
                  key={useCase.title}
                  className="use-case-card group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-[0_20px_50px_-15px_rgba(24,24,27,0.15)] transition-all duration-500 hover:-translate-y-2 hover:border-[#AE8C20]/40 hover:shadow-[0_35px_80px_-20px_rgba(174,140,32,0.3)] md:p-7 lg:p-8 will-change-transform"
                  style={{ 
                    gridArea: useCase.gridArea,
                    ...offsetStyles[index],
                  }}
                >
                  {/* Shine sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-full group-hover:opacity-100"
                    style={{ mixBlendMode: "soft-light" }}
                  />

                  {/* Top accent line */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#AE8C20]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Corner glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#AE8C20]/0 blur-3xl transition-all duration-700 group-hover:bg-[#AE8C20]/20"
                  />

                  <div className="relative flex h-full flex-col">
                    {/* Use case badge */}
                    <span className="inline-flex w-fit items-center rounded-md bg-[#AE8C20]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8C20]">
                      Use Case
                    </span>

                    <h3 className="mt-4 text-xl font-bold leading-tight text-zinc-900 md:text-2xl lg:text-3xl">
                      {useCase.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 md:text-base">
                      {useCase.description}
                    </p>

                    <a
                      href="#contact"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#AE8C20] transition-all duration-300 group-hover:gap-3"
                    >
                      Explore Now
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
