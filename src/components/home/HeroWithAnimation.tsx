"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const HERO_VIDEO_URL =
  "https://contenaissance.blob.core.windows.net/ct-assets/Mzha%20Nhi%20Aaya-02.1.mp4";

export function HeroWithAnimation() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);
  const talkButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    (context, contextSafe) => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-nav", { y: -20, opacity: 0, duration: 0.65 })
        .from(".hero-nav-item", { y: -12, opacity: 0, stagger: 0.06, duration: 0.42 }, "-=0.36");

      // Button hover animations with contextSafe
      const ctaButton = ctaButtonRef.current;
      const talkButton = talkButtonRef.current;
      const menuButton = menuButtonRef.current;

      if (ctaButton && contextSafe) {
        const ctaEnter = contextSafe(() => {
          gsap.to(ctaButton, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(ctaButton.querySelector(".cta-arrow"), {
            x: 4,
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(ctaButton, {
            boxShadow: "0 10px 40px -10px rgba(200, 230, 74, 0.5)",
            duration: 0.3,
          });
        });

        const ctaLeave = contextSafe(() => {
          gsap.to(ctaButton, {
            scale: 1,
            boxShadow: "0 0 0 0 rgba(200, 230, 74, 0)",
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(ctaButton.querySelector(".cta-arrow"), {
            x: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        ctaButton.addEventListener("mouseenter", ctaEnter);
        ctaButton.addEventListener("mouseleave", ctaLeave);
      }

      if (talkButton && contextSafe) {
        const talkEnter = contextSafe(() => {
          gsap.to(talkButton, {
            scale: 1.05,
            backgroundColor: "#18181b",
            color: "#ffffff",
            duration: 0.3,
            ease: "power2.out",
          });
        });

        const talkLeave = contextSafe(() => {
          gsap.to(talkButton, {
            scale: 1,
            backgroundColor: "transparent",
            color: "#18181b",
            duration: 0.3,
            ease: "power2.out",
          });
        });

        talkButton.addEventListener("mouseenter", talkEnter);
        talkButton.addEventListener("mouseleave", talkLeave);
      }

      if (menuButton && contextSafe) {
        const lines = menuButton.querySelectorAll(".hero-menu-line");
        const menuEnter = contextSafe(() => {
          gsap.to(lines[0], { y: -2, width: "100%", duration: 0.25, ease: "power2.out" });
          gsap.to(lines[1], { scaleX: 0.8, duration: 0.25, ease: "power2.out" });
          gsap.to(lines[2], { y: 2, width: "100%", duration: 0.25, ease: "power2.out" });
        });

        const menuLeave = contextSafe(() => {
          gsap.to(lines[0], { y: 0, width: "1.25rem", duration: 0.25, ease: "power2.out" });
          gsap.to(lines[1], { scaleX: 1, duration: 0.25, ease: "power2.out" });
          gsap.to(lines[2], { y: 0, width: "1rem", duration: 0.25, ease: "power2.out" });
        });

        menuButton.addEventListener("mouseenter", menuEnter);
        menuButton.addEventListener("mouseleave", menuLeave);
      }

      // Nav link hover animations
      const navLinks = rootRef.current?.querySelectorAll(".hero-nav-link");
      navLinks?.forEach((link) => {
        if (contextSafe) {
          const linkEnter = contextSafe(() => {
            gsap.to(link, {
              y: -2,
              duration: 0.25,
              ease: "power2.out",
            });
          });

          const linkLeave = contextSafe(() => {
            gsap.to(link, {
              y: 0,
              duration: 0.25,
              ease: "power2.out",
            });
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

        scrollTl
          .to(videoContainerRef.current, {
            ...video,
            ease: "none",
            duration: 1,
          })
          .fromTo(
            ".reveal-content",
            {
              opacity: 0,
              y: 40,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
            },
            0.5
          )
          .fromTo(
            ".reveal-tagline",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4 },
            0.55
          );

        // SplitText animation for tagline - letter wave effect
        const taglineSplit = SplitText.create(".reveal-tagline", {
          type: "chars",
        });

        scrollTl.fromTo(
          taglineSplit.chars,
          { opacity: 0, y: 10, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            stagger: { each: 0.015, from: "center" },
            ease: "back.out(2)",
          },
          0.6
        );

        // SplitText animation for headline - river/wave effect
        const headlineSplit = SplitText.create(".reveal-headline", {
          type: "words,chars",
        });

        scrollTl.fromTo(
          headlineSplit.chars,
          {
            opacity: 0,
            y: 30,
            rotateX: -60,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.5,
            stagger: {
              each: 0.015,
              from: "start",
            },
            ease: "back.out(1.7)",
          },
          0.7
        );

        // SplitText animation for description - word-by-word fade in
        const descriptionSplit = SplitText.create(".reveal-description", {
          type: "words",
        });

        scrollTl
          .fromTo(
            descriptionSplit.words,
            { opacity: 0, y: 15, filter: "blur(3px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.3,
              stagger: { each: 0.02, from: "start" },
              ease: "power2.out",
            },
            0.85
          )
          .fromTo(
            ".reveal-cta",
            { opacity: 0, y: 15, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
            0.95
          );
      };

      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        createScrollTimeline({
          end: "+=80%",
          scrub: 1.2,
          video: {
            width: "calc(100% - 2rem)",
            height: "32svh",
            top: "4rem",
            left: "1rem",
            borderRadius: "1rem",
          },
        });
      });

      mm.add("(min-width: 768px)", () => {
        createScrollTimeline({
          end: "+=100%",
          scrub: 1.5,
          video: {
            width: "90%",
            height: "35vh",
            top: "4.5rem",
            left: "5%",
            borderRadius: "1.5rem",
          },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="relative">
      <section
        ref={heroSectionRef}
        className="relative isolate h-[100svh] bg-white"
      >
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
          <div className="absolute inset-0 bg-black/20" />

          {/* <div className="hero-overlay-text absolute inset-0 z-20 flex items-end px-6 pb-16 md:px-10 md:pb-20">
            <h1 className="max-w-[700px] text-[clamp(2.4rem,5.8vw,4rem)] font-semibold leading-[1.04] tracking-tight text-white">
              <span className="hero-title-line block">We&apos;re building the future</span>
              <span className="hero-title-line block">of language AI</span>
            </h1>
          </div> */}
        </div>

        <header className="hero-nav relative z-30 px-5 pb-[25px] pt-[25px] md:px-9">
          <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4">
            <Link href="/" className="hero-nav-item flex items-center gap-2.5 justify-self-start">
              <Image
                src="/assets/favicon.png"
                alt="Contenaisance logo"
                width={148}
                height={44}
                className="h-8 w-auto sm:h-9 md:h-11"
                priority
              />
            </Link>

            <div className="hidden" />

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                ref={menuButtonRef}
                type="button"
                aria-label="Open menu"
                className="hero-nav-item hero-menu-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-zinc-900/20 bg-white/80 shadow-[0_4px_18px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-[#AE8C20]/40 hover:bg-white sm:h-11 sm:w-11 md:h-12 md:w-12"
              >
                <span className="flex flex-col items-center justify-center gap-[5px]">
                  <span className="hero-menu-line h-[2px] w-5 rounded-full bg-zinc-900 sm:w-6" />
                  <span className="hero-menu-line h-[2px] w-5 rounded-full bg-zinc-900 sm:w-6" />
                  <span className="hero-menu-line h-[2px] w-4 rounded-full bg-zinc-900 sm:w-5" />
                </span>
              </button>
              <button
                ref={talkButtonRef}
                type="button"
                className="hero-nav-item hero-talk-button cursor-pointer rounded-full border border-zinc-900 px-3 py-2 text-xs font-medium text-zinc-900 sm:px-4 sm:text-sm md:px-6"
              >
                Let&apos;s Talk!
              </button>
            </div>
          </div>
        </header>

        <div className="reveal-content absolute inset-x-0 top-[calc(4rem+33svh)] z-0 mx-auto flex w-full max-w-[1120px] flex-col items-center justify-start px-5 pb-8 pt-3 text-center sm:pb-10 sm:pt-4 md:top-[calc(4.5rem+36vh)] md:px-10 md:pb-12 md:pt-5">
          <p className="reveal-tagline text-xs font-semibold uppercase tracking-[0.18em] text-[#c8e64a] sm:text-sm sm:tracking-[0.2em]">
            Fast, Secure and Scalable
          </p>
          <h2 className="reveal-headline font-display mt-2 max-w-3xl text-[clamp(1.75rem,7vw,3.25rem)] font-normal leading-[1.1] tracking-tight text-zinc-950 sm:mt-3 md:mt-4">
            We&apos;re building the future
            <br />
            of language AI
          </h2>
          <p className="reveal-description mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 sm:mt-3 sm:text-base md:mt-4">
            We empower enterprises to build amazing products and capture true business value with language AI
          </p>
          <Link
            ref={ctaButtonRef}
            href="#try"
            className="reveal-cta group mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#c8e64a] px-5 py-2.5 text-sm font-semibold text-zinc-900 sm:mt-4 sm:px-6 sm:py-3 md:mt-5 md:px-7 md:py-3"
          >
            Try it now
            <span className="cta-arrow inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
