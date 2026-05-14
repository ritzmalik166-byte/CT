"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
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
    <article className="flex h-[320px] w-[min(78vw,240px)] shrink-0 flex-col bg-white p-4 shadow-sm ring-1 ring-zinc-200/80 sm:h-[350px] sm:w-[260px] sm:p-5 md:h-[380px] md:w-[280px] md:p-6 lg:h-[400px] lg:w-[300px]">
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
    <article className="relative w-full overflow-hidden rounded-2xl ring-1 ring-zinc-200/80 lg:h-full lg:min-h-[400px] lg:flex-shrink-0 lg:rounded-none lg:ring-0">
      {/* Mobile / tablet: portrait card; lg+: fills left column */}
      <div className="relative aspect-[3/4] w-full max-h-[min(68svh,520px)] min-h-[280px] sm:aspect-[4/5] sm:max-h-[min(62svh,560px)] sm:min-h-[320px] lg:absolute lg:inset-0 lg:aspect-auto lg:max-h-none lg:min-h-0">
        <Image
          src={item.image}
          alt={`${item.name} — spotlight`}
          fill
          className="object-cover object-top sm:object-center"
          sizes="(max-width: 1024px) 92vw, 320px"
        />
      </div>

      {/* Vignette + bottom fade for readable text */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

      {/* Text overlay — centered below lg to match stacked layout */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-4 pt-24 text-center sm:px-5 sm:pb-5 lg:items-start lg:p-6 lg:text-left">
        <h3 className="text-xl font-semibold text-white sm:text-2xl">{item.name}</h3>
        <p className="mt-1 text-sm text-white/75">{item.role}</p>
        <button
          type="button"
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-[#D4AF37] transition-colors hover:text-[#E8C547] lg:justify-start"
        >
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
        <div className="testimonial-header mb-10 flex flex-col items-center gap-4 text-center sm:mb-12 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-8 md:text-left">
          <div className="mx-auto flex w-full max-w-xl flex-col md:mx-0">
            <div className="flex items-center justify-center gap-3 md:justify-start">
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
          <p className="mx-auto max-w-sm text-sm text-zinc-500 md:mx-0 md:text-base md:text-right">
            Where strategy design and AI unite
          </p>
        </div>

        {/* Stacked on mobile/tablet (featured → marquee); side-by-side from lg */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-6 xl:gap-8">
          {featured && (
            <div className="quote-card-anim order-1 w-full shrink-0 lg:order-none lg:w-[280px] xl:w-[320px]">
              <FeaturedCard item={featured} />
            </div>
          )}

          {/* Quote marquee: full-width row below featured until lg */}
          <div className="relative order-2 min-h-0 w-full min-w-0 flex-1 lg:order-none lg:self-stretch">
            {/* Extend strip to viewport edges on small screens for scroll affordance */}
            <div className="relative -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-0 lg:overflow-hidden lg:px-0">

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#fafafa] to-transparent sm:w-10 lg:left-0 lg:w-12" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#fafafa] to-transparent sm:w-10 lg:right-0 lg:w-12" />

            <style>{`
              @keyframes testimonial-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .testimonial-track {
                display: flex;
                width: max-content;
                gap: 0.75rem;
                animation: testimonial-scroll 40s linear infinite;
              }
              @media (min-width: 640px) {
                .testimonial-track { gap: 1.25rem; }
              }
              .testimonial-track:hover {
                animation-play-state: paused;
              }
              @media (prefers-reduced-motion: reduce) {
                .testimonial-track {
                  animation: none !important;
                  transform: translateX(0);
                }
              }
            `}</style>

            <div className="quote-card-anim testimonial-track py-1 sm:py-2">
              {loopItems.map((item, i) => (
                <QuoteCard key={`q-${item.name}-${i}`} item={item} />
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
