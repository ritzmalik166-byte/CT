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
      "Create high-performing AI-generated content for social media, advertising, reels, digital campaigns, branded storytelling, audience engagement, and multi-platform brand experiences across modern digital ecosystems.",
  },
  {
    title: "AI-Powered Campaigns",
    description:
      "Enhance marketing campaigns with AI-driven creative strategy, automated content production, audience targeting, and performance-focused digital advertising.",
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
      const section = sectionRef.current;
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!section || !pin || !track) return;

      const mm = gsap.matchMedia();

      /** Desktop / tablet ≥768px: pinned horizontal scrub (unchanged behavior, lighter header). */
      mm.add("(min-width: 768px)", () => {
        gsap.set(section.querySelectorAll(".use-case-card"), { opacity: 1 });

        const header = section.querySelector(".expertise-header");
        if (header) {
          gsap.fromTo(
            header,
            { y: 44, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 78%",
                toggleActions: "play none none reverse",
              },
            },
          );
        }

        const maxScroll = () => Math.max(0, track.scrollWidth - pin.offsetWidth);

        const tween = gsap.to(track, {
          x: () => -maxScroll(),
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${Math.max(maxScroll(), 1)}`,
            scrub: 0.85,
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
      });

      /** Mobile &lt;768px: cards use a simple fade-in (opacity) once when scrolled into view. */
      mm.add("(max-width: 767px)", () => {
        const header = section.querySelector(".expertise-header");
        const cards = section.querySelectorAll(".use-case-card");

        const headerTween = header
          ? gsap.fromTo(
              header,
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: header,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              },
            )
          : null;

        const cardCleanups: Array<() => void> = [];

        cards.forEach((card) => {
          const tween = gsap.fromTo(
            card,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.55,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
          cardCleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });

        return () => {
          if (headerTween) {
            headerTween.scrollTrigger?.kill();
            headerTween.kill();
          }
          cardCleanups.forEach((cleanup) => cleanup());
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white pb-8 md:pb-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[320px] w-[320px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#AE8C20]/[0.06] blur-[72px] md:h-[600px] md:w-[600px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] translate-y-1/2 -translate-x-1/2 rounded-full bg-[#AE8C20]/[0.06] blur-[72px] md:h-[600px] md:w-[600px] md:blur-[120px]" />
      </div>

      {/* Canvas particles are heavy on mobile GPUs — desktop / tablet only */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block">
        <FloatingParticles
          className="absolute inset-0 h-full w-full"
          particleCount={160}
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
          <h2 className="mt-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#AE8C20] bg-clip-text text-2xl font-bold leading-[1.05] tracking-tight text-transparent sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl">
            AI Creative Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 sm:mt-5 sm:text-base md:text-lg">
            AI-powered creative solutions for campaigns, content, branding, &
            digital experiences.
          </p>
        </div>
      </div>

      {/* md+: pinned horizontal strip. &lt;md: vertical stack in document flow */}
      <div
        ref={pinRef}
        className="expertise-pin relative z-10 mt-10 flex w-full flex-col gap-8 px-4 pb-12 sm:mt-12 sm:gap-10 sm:px-6 md:mt-0 md:h-[min(100dvh,720px)] md:min-h-[480px] md:items-center md:gap-0 md:overflow-hidden md:px-0 md:pb-0"
      >
        <div
          ref={trackRef}
          className="expertise-track flex w-full flex-col gap-6 md:w-max md:flex-row md:items-stretch md:gap-8 md:px-8 lg:gap-8 lg:px-10"
        >
          {USE_CASES.map((useCase) => (
            <article
              key={useCase.title}
              className="use-case-card group relative mx-auto flex w-full max-w-xl shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_20px_50px_-15px_rgba(24,24,27,0.12)] sm:p-7 md:mx-0 md:w-[420px] md:max-w-none md:p-8 lg:w-[460px]"
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

              <div className="relative flex min-h-[260px] flex-col sm:min-h-[300px] md:min-h-[320px]">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
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
