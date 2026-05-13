"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMemo, useRef } from "react";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Testimonial =
  | {
      variant: "featured";
      name: string;
      role: string;
      image: string;
    }
  | {
      variant: "quote";
      quote: string;
      name: string;
      role: string;
      company: string;
      initials: string;
    };

const TESTIMONIALS: Testimonial[] = [
  {
    variant: "featured",
    name: "Sarah Mitchell",
    role: "Founder • Elevate AI",
    image: "/assets/ct-testimonial.jpg",
  },
  {
    variant: "quote",
    quote:
      "Their AI powered workflow helped us scale content production faster while maintaining premium quality across every campaign.",
    name: "Sophia Williams",
    role: "Marketing Director",
    company: "Nova Digital",
    initials: "SW",
  },
  {
    variant: "quote",
    quote:
      "From intelligent automation to creative execution, the team delivered experiences that genuinely elevated our brand presence.",
    name: "Elena Rossi",
    role: "CMO",
    company: "Lumina Labs",
    initials: "ER",
  },
  {
    variant: "quote",
    quote:
      "The combination of strategy, design, and AI innovation gave our business a completely new digital identity.",
    name: "Arjun Mehta",
    role: "Head of Brand",
    company: "Northline AI",
    initials: "AM",
  },
  {
    variant: "quote",
    quote:
      "Their ability to merge cinematic visuals with intelligent AI solutions made every deliverable feel futuristic and premium.",
    name: "Emily Chen",
    role: "Creative Strategist",
    company: "BrightForge",
    initials: "EC",
  },
  {
    variant: "quote",
    quote:
      "We needed a partner who could move fast without compromising innovation, creativity, or execution quality.",
    name: "Nicolas Sanchez",
    role: "Product Lead",
    company: "GreenByte",
    initials: "NS",
  },
];

/* ───────────────────────────────────────────────────────────────
   Quote Card – minimal white card with orange quote mark
─────────────────────────────────────────────────────────────── */
function QuoteCard({ item }: { item: Extract<Testimonial, { variant: "quote" }> }) {
  return (
    <article className="flex h-[340px] w-[260px] shrink-0 flex-col  bg-white p-5 sm:h-[380px] sm:w-[280px] sm:p-6 md:h-[400px] md:w-[300px]">
      {/* Orange quote mark */}
      <span className="text-4xl font-bold leading-none text-[#E85D04] sm:text-5xl" aria-hidden>
        &ldquo;&ldquo;
      </span>

      {/* Quote text */}
      <p className="mt-4 flex-1 text-[13px] leading-relaxed text-zinc-700 sm:text-[14px] md:text-[15px]">
        {item.quote}
      </p>

      {/* Author info */}
      <div className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white sm:h-10 sm:w-10 sm:text-[11px]"
          aria-hidden
        >
          {item.initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
          <p className="text-xs text-zinc-500">
            {item.role}
            <br />
            {item.company}
          </p>
        </div>
      </div>
    </article>
  );
}

/* ───────────────────────────────────────────────────────────────
   Featured Card – large image card on left
─────────────────────────────────────────────────────────────── */
function FeaturedCard({ item }: { item: Extract<Testimonial, { variant: "featured" }> }) {
  return (
    <article className="relative flex h-full min-h-[340px] w-full flex-col overflow-hidden sm:min-h-[380px] md:min-h-[400px]">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
        {/* Placeholder portrait gradient – replace with actual image if available */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-zinc-600/30 via-zinc-500/20 to-zinc-900/90" /> */}
        {/* Stylized portrait silhouette */}
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          {/* <svg
            className="h-3/4 w-3/4 text-zinc-400"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <ellipse cx="100" cy="70" rx="45" ry="55" />
            <ellipse cx="100" cy="190" rx="70" ry="50" />
          </svg> */}
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Content overlay at bottom */}
      <div className="relative z-10 mt-auto bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 sm:p-6">
        <h3 className="text-xl font-semibold text-white sm:text-2xl">{item.name}</h3>
        <p className="mt-1 text-sm text-white/70">{item.role}</p>
        <button className="mt-4 flex items-center gap-2 text-sm font-medium text-[#D4AF37] transition-colors hover:text-[#E8C547]">
          <span className="border-b border-[#D4AF37]/60 pb-0.5">Watch Video</span>
        </button>
      </div>
    </article>
  );
}

/* ───────────────────────────────────────────────────────────────
   Main Section
─────────────────────────────────────────────────────────────── */
export function TransitionSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const quoteOnly = useMemo(
    () =>
      TESTIMONIALS.filter((t): t is Extract<Testimonial, { variant: "quote" }> => t.variant === "quote"),
    []
  );

  const featured = useMemo(
    () =>
      TESTIMONIALS.find((t): t is Extract<Testimonial, { variant: "featured" }> => t.variant === "featured"),
    []
  );

  const loopItems = useMemo(() => [...quoteOnly, ...quoteOnly], [quoteOnly]);

  useGSAP(
    () => {
      const header = sectionRef.current?.querySelector(".testimonial-header");
      if (header) {
        const headerChildren = header.querySelectorAll(".testimonial-header > *");
        gsap.fromTo(
          headerChildren,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const cards = sectionRef.current?.querySelectorAll(".quote-card-anim");
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#fafafa] py-14 md:py-20 lg:py-24">
      {/* Golden floating particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <FloatingParticles
          className="absolute inset-0 h-full w-full"
          particleCount={150}
          colors={["#AE8C20"]}
          mouseRadius={180}
          attractStrength={1.2}
          speed={0.35}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* Header */}
        <div className="testimonial-header mb-10 flex flex-col items-start gap-4 sm:mb-12 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#AE8C20] sm:w-10" aria-hidden />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#AE8C20] sm:text-xs">
                Client Stories
              </p>
            </div>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.4em] text-zinc-400 sm:text-xs">
              testimonials
            </p>
            <h2
              className="mt-3 font-bold tracking-tight text-zinc-900"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1.1 }}
            >
              AI Driven Creative Excellence
            </h2>
          </div>
          <p className="max-w-sm text-sm text-zinc-500 md:text-right md:text-base">
          Where strategy design and AI unite
          </p>
        </div>

        {/* Main grid: featured card left + scrolling quotes right */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6">
          {/* Featured Card – left side */}
          {featured && (
            <div className="quote-card-anim w-full shrink-0 lg:w-[280px] xl:w-[320px]">
              <FeaturedCard item={featured} />
            </div>
          )}

          {/* Quote Cards – horizontal scrolling strip */}
          <div className="relative flex-1 overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#fafafa] to-transparent sm:w-12" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#fafafa] to-transparent sm:w-12" />

            <style>{`
              @keyframes testimonial-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .testimonial-track {
                display: flex;
                width: max-content;
                gap: 1rem;
                animation: testimonial-scroll 40s linear infinite;
              }
              @media (min-width: 640px) {
                .testimonial-track { gap: 1.25rem; }
              }
              .testimonial-track:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="testimonial-track py-2">
              {loopItems.map((item, i) => (
                <QuoteCard key={`q-${item.name}-${i}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
