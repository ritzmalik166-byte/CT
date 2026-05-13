"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

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

export function ExpertiseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const header = sectionRef.current?.querySelector(".expertise-header");
      if (header) {
        gsap.fromTo(
          header,
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
      }

      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track) return;

      const maxScroll = () => Math.max(0, track.scrollWidth - pin.offsetWidth);

      const tween = gsap.to(track, {
        x: () => -maxScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${Math.max(maxScroll(), 1)}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white pb-8 md:pb-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#AE8C20]/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-y-1/2 -translate-x-1/2 rounded-full bg-[#AE8C20]/[0.06] blur-[120px]" />
      </div>

      {/* Golden floating particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <FloatingParticles
          className="absolute inset-0 h-full w-full"
          particleCount={180}
          colors={["#AE8C20"]}
          mouseRadius={200}
          attractStrength={1.3}
          speed={0.4}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 md:pt-20">
        <div className="expertise-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#AE8C20]/30 bg-[#AE8C20]/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8C20] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Expertise
          </span>
          <h2 className="mt-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#AE8C20] bg-clip-text text-3xl font-bold leading-[1.05] tracking-tight text-transparent sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
            AI Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 sm:mt-5 sm:text-base md:text-lg">
            Merging human creative intuition with the raw power of neural intelligence.
          </p>
        </div>
      </div>

      {/* Pinned horizontal strip: vertical scroll scrubs the row right → left */}
      <div
        ref={pinRef}
        className="expertise-pin relative z-10 flex h-[min(100dvh,720px)] min-h-[380px] w-full items-center overflow-hidden md:min-h-[480px] md:h-screen"
      >
        <div
          ref={trackRef}
          className="expertise-track flex w-max items-stretch gap-4 px-4 will-change-transform sm:gap-6 sm:px-6 md:gap-8 md:px-8 lg:px-10"
        >
          {USE_CASES.map((useCase) => (
            <article
              key={useCase.title}
              className="use-case-card group relative flex w-[min(88vw,400px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_20px_50px_-15px_rgba(24,24,27,0.12)] sm:w-[380px] sm:p-7 md:w-[420px] md:p-8 lg:w-[460px]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-full group-hover:opacity-100"
                style={{ mixBlendMode: "soft-light" }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#AE8C20]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#AE8C20]/0 blur-3xl transition-all duration-700 group-hover:bg-[#AE8C20]/15"
              />

              <div className="relative flex min-h-[320px] flex-col sm:min-h-[340px]">
                <span className="inline-flex w-fit rounded-md bg-[#AE8C20]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8C20]">
                  Use Case
                </span>
                <h3 className="mt-4 text-xl font-bold leading-tight text-zinc-900 md:text-2xl">
                  {useCase.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 md:text-base">
                  {useCase.description}
                </p>
                <a
                  href="/contact"
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
          ))}
        </div>
      </div>
    </section>
  );
}
