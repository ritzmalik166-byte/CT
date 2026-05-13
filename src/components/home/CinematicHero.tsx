"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { HamburgerMenu } from "./HamburgerMenu";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HERO_VIDEO_URL =
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/Mzha%20Nhi%20Aaya-02.1.mp4";

export function CinematicHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useGSAP(
    (context, contextSafe) => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      tl.from(".hero-nav", { y: -30, opacity: 0, duration: 1 })
        .from(".hero-nav-item", { y: -15, opacity: 0, stagger: 0.08, duration: 0.6 }, "-=0.6")
        .from(".hero-scroll-indicator", { y: -20, opacity: 0, duration: 0.6 }, "-=0.3");

      const ctaButton = ctaButtonRef.current;
      if (ctaButton && contextSafe) {
        const handleMouseMove = contextSafe((e: MouseEvent) => {
          const rect = ctaButton.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * 0.15;
          const deltaY = (e.clientY - centerY) * 0.15;
          
          gsap.to(ctaButton, {
            x: deltaX,
            y: deltaY,
            duration: 0.4,
            ease: "power3.out",
          });
        });

        const handleMouseLeave = contextSafe(() => {
          gsap.to(ctaButton, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
          });
        });

        const handleMouseEnter = contextSafe(() => {
          gsap.to(ctaButton, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(ctaButton.querySelector(".cta-glow"), {
            opacity: 1,
            scale: 1.2,
            duration: 0.4,
          });
        });

        ctaButton.addEventListener("mousemove", handleMouseMove as EventListener);
        ctaButton.addEventListener("mouseleave", handleMouseLeave);
        ctaButton.addEventListener("mouseenter", handleMouseEnter);
      }

      const navLinks = rootRef.current?.querySelectorAll(".hero-nav-link");
      navLinks?.forEach((link) => {
        if (contextSafe) {
          const underline = link.querySelector(".nav-underline");
          
          const linkEnter = contextSafe(() => {
            gsap.to(link, { y: -2, duration: 0.3, ease: "power2.out" });
            if (underline) {
              gsap.to(underline, { scaleX: 1, duration: 0.3, ease: "power2.out" });
            }
          });

          const linkLeave = contextSafe(() => {
            gsap.to(link, { y: 0, duration: 0.3, ease: "power2.out" });
            if (underline) {
              gsap.to(underline, { scaleX: 0, duration: 0.3, ease: "power2.out" });
            }
          });

          link.addEventListener("mouseenter", linkEnter);
          link.addEventListener("mouseleave", linkLeave);
        }
      });

      const createScrollTimeline = ({
        end,
        scrub,
        video,
      }: {
        end: string;
        scrub: number;
        video: {
          width: string;
          height: string;
          top: string;
          left: string;
          borderRadius: string;
        };
      }) => {
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end,
            scrub,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        if (!videoContainerRef.current) return;

        scrollTl
          .to(videoContainerRef.current, {
            ...video,
            ease: "none",
            duration: 1,
          })
          .to(".hero-overlay-gradient", {
            opacity: 0.6,
            duration: 0.5,
          }, 0)
          .to(".hero-content-overlay", {
            opacity: 0,
            y: -50,
            duration: 0.5,
          }, 0)
          .fromTo(
            ".reveal-content",
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
            0.4
          )
          .fromTo(
            ".reveal-tagline",
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5 },
            0.5
          )
          .fromTo(
            ".reveal-headline",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
            0.55
          )
          .fromTo(
            ".reveal-cta",
            { opacity: 0, y: 20, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
            0.75
          );
      };

      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        createScrollTimeline({
          end: "+=80%",
          scrub: 1.2,
          video: {
            width: "calc(100% - 2rem)",
            height: "28svh",
            top: "6.5rem",
            left: "1rem",
            borderRadius: "1.5rem",
          },
        });
      });

      mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
        createScrollTimeline({
          end: "+=90%",
          scrub: 1.4,
          video: {
            width: "calc(100% - 4rem)",
            height: "32vh",
            top: "7.5rem",
            left: "2rem",
            borderRadius: "2rem",
          },
        });
      });

      mm.add("(min-width: 1024px)", () => {
        createScrollTimeline({
          end: "+=100%",
          scrub: 1.5,
          video: {
            width: "85%",
            height: "38vh",
            top: "8.5rem",
            left: "7.5%",
            borderRadius: "2.25rem",
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      {/* Mouse-follow gradient blob */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(174, 140, 32, 0.15), transparent 40%)`,
        }}
      />

      {/* Persistent logo - fixed to viewport, always visible */}
      <Link href="/" className="fixed left-4 top-4 z-[110] sm:left-5 sm:top-5 md:left-9 md:top-6">
        <Image
          src="/assets/favicon.png"
          alt="Contenaissance"
          width={220}
          height={66}
          className="h-10 w-auto sm:h-12 md:h-16"
          priority
        />
      </Link>

      {/* Persistent hamburger menu - fixed to viewport, always visible */}
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((v) => !v)}
        className="group fixed right-4 top-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)] sm:right-5 sm:top-5 sm:h-12 sm:w-12 md:right-9 md:top-6 md:h-14 md:w-14"
      >
        {menuOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <span className="flex h-5 items-end gap-[3px]">
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-5" />
            <span className="h-5 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-3" />
            <span className="h-3 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-5" />
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-3" />
          </span>
        )}
      </button>

      {/* Full-screen hamburger menu overlay */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage="studio" />

      <section
        ref={heroSectionRef}
        className="relative isolate h-[115svh] overflow-hidden bg-white"
      >
        {/* Background ambient glows */}
        <div className="ambient-glow left-0 top-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
        <div className="ambient-glow bottom-0 right-0 translate-x-1/2 translate-y-1/2 animate-pulse-glow" style={{ animationDelay: "2s" }} />

        {/* Video container */}
        <div
          ref={videoContainerRef}
          className="pointer-events-none absolute top-0 left-0 z-10 h-full w-full overflow-hidden"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
          
          {/* Gradient overlays */}
          <div className="hero-overlay-gradient absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 via-transparent to-zinc-950/30" />
          
          {/* Subtle vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)" }} />
        </div>

        {/* Spacer header — keeps hero layout balanced without duplicate logo */}
        <header className="hero-nav absolute left-0 right-0 top-0 z-40 px-4 py-4 sm:px-5 sm:py-5 md:px-9 md:py-6">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
            {/* Logo placeholder (actual logo is fixed above) */}
            <span aria-hidden className="h-10 w-auto sm:h-12 md:h-16" />
            {/* Spacer to keep grid balance */}
            <span aria-hidden className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14" />
          </div>
        </header>

        {/* Content overlay on video */}
        <div className="hero-content-overlay absolute inset-0 z-20 flex flex-col">
          {/* Hero content */}
          

          {/* Scroll indicator */}
          <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="scroll-indicator text-white/40" />
          </div>
        </div>

        {/* Floating particles background for the reveal section */}
        <div className="absolute inset-x-0 top-[calc(5.5rem+28svh)] bottom-0 z-0 overflow-hidden sm:top-[calc(7rem+32vh)] md:top-[calc(8rem+36vh)]">
          <FloatingParticles 
            className="absolute inset-0 h-full w-full" 
            particleCount={280}
            colors={["#AE8C20"]}
            mouseRadius={220}
            attractStrength={1.5}
          />
        </div>

        {/* Revealed content after scroll - below video */}
        <div className="reveal-content absolute inset-x-0 bottom-0 top-[calc(6.5rem+30svh)] z-20 mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center px-4 py-8 text-center opacity-0 sm:top-[calc(7.5rem+34vh)] sm:px-6 sm:py-10 md:top-[calc(8.5rem+39vh)] md:py-14">
          {/* Spinning circle - top left corner (only visible when reveal-content is visible) */}
          <Image
            src="/assets/circle_revolve.png"
            alt=""
            width={180}
            height={180}
            className="pointer-events-none absolute left-0 top-2 h-16 w-16 animate-spin-slow sm:left-2 sm:top-8 sm:h-24 sm:w-24 md:left-4 md:top-10 md:h-28 md:w-28 lg:left-8"
          />
          <p className="reveal-tagline text-base font-medium tracking-tight text-zinc-600 sm:text-xl md:text-3xl">
            &ldquo;AI is changing so fast in 2026&rdquo;
          </p>
          <div className="reveal-headline relative mt-4 flex items-center justify-center sm:mt-6 md:mt-8">
            <h2 className="relative z-10 max-w-5xl text-[clamp(2.5rem,9vw,7.25rem)] font-bold leading-[0.88] tracking-[-0.06em] text-zinc-950">
              But are you?
            </h2>
          </div>
          <Link
            ref={ctaButtonRef}
            href="#portfolio"
            className="reveal-cta group relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full bg-zinc-950 px-6 py-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(174,140,32,0.4)] sm:mt-12 sm:px-7 sm:text-[0.68rem] md:mt-16"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#AE8C20] to-transparent opacity-0 transition-all duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#AE8C20] via-[#D4AF37] to-[#AE8C20] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10">Portfolio</span>
            <svg className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
