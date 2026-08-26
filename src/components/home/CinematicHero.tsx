"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { RotatingCircleText } from "@/components/ui/RotatingCircleText";
import { HamburgerMenu } from "./HamburgerMenu";
import { HERO_VIDEO_URL } from "@/lib/critical-assets";
import { SHOW_INDEPENDENCE_DAY } from "../../../site-config";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REVEAL_HEADLINE_WORDS = [
  { text: "But", rotate: -2.5 },
  { text: "are", rotate: 0 },
  { text: "you?", rotate: 2.5 },
] as const;

const TAGLINE_TEXT = "AI is changing so fast in 2026";
const independenceWords = [
  "80th",
  "Independence",
  "Day",
  "15 August",
];

export function CinematicHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavBg, setShowNavBg] = useState(true);
  const lastScrollY = useRef(0);
  const [independenceWord, setIndependenceWord] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!SHOW_INDEPENDENCE_DAY) return;

    const currentWord = independenceWords[wordIndex];

    const timer = setTimeout(
      () => {
        if (isTyping) {
          if (charIndex < currentWord.length) {
            setIndependenceWord(currentWord.slice(0, charIndex + 1));
            setCharIndex((prev) => prev + 1);
          } else {
            setIsTyping(false);
          }
        } else {
          if (charIndex > 0) {
            setIndependenceWord(currentWord.slice(0, charIndex - 1));
            setCharIndex((prev) => prev - 1);
          } else {
            setWordIndex((prev) => (prev + 1) % independenceWords.length);
            setIsTyping(true);
          }
        }
      },
      isTyping
        ? 90
        : charIndex === currentWord.length
          ? 1100
          : 45
    );

    return () => clearTimeout(timer);
  }, [wordIndex, charIndex, isTyping]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const getHeroFlowEl = () => {
      const hero = heroSectionRef.current;
      if (!hero) return null;
      const parent = hero.parentElement;
      return parent?.classList.contains("pin-spacer") ? parent : hero;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollY.current;
      const heroFlow = getHeroFlowEl();
      const heroBottom = heroFlow
        ? heroFlow.getBoundingClientRect().bottom
        : Number.POSITIVE_INFINITY;

      // Keep chrome visible for the full hero + pinned GSAP sequence.
      // Hide-on-scroll only begins after the hero block has left the viewport.
      if (heroBottom > 0 || currentScrollY <= 10) {
        setShowNavBg(true);
      } else if (currentScrollY > previousScrollY) {
        setShowNavBg(false);
      } else if (currentScrollY < previousScrollY) {
        setShowNavBg(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    ScrollTrigger.addEventListener("refresh", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      ScrollTrigger.removeEventListener("refresh", handleScroll);
    };
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
        const videoEl = videoContainerRef.current;
        if (!videoEl || !heroSectionRef.current) return;

        const initialVideo = {
          width: "100%",
          height: "100dvh",
          top: "0px",
          left: "0px",
          borderRadius: "0px",
        };

        gsap.set(videoEl, initialVideo);

        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end,
            scrub,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            onRefresh(self) {
              if (self.scroll() <= 1) {
                self.animation?.progress(0);
              }
            },
          },
        });

        scrollTl
          .fromTo(
            videoEl,
            { ...initialVideo },
            {
              ...video,
              ease: "none",
              duration: 1,
            },
            0
          )
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
            ".reveal-page-title",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
            0.52
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
    <>
      <AnimatePresence>
        {SHOW_INDEPENDENCE_DAY && showNavBg && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
        pointer-events-none
        fixed
        inset-x-0
        top-0
        z-40
        h-[60px]
        overflow-hidden
        sm:h-[70px]
        md:h-[80px]
      "
          >
            <Image
              src="/independence/independence-header.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-white/10" />

            <div className="absolute inset-x-0 bottom-0 h-px bg-black/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed chrome lives outside overflow-hidden so it cannot be clipped */}
      <AnimatePresence initial={false}>
        {(showNavBg || menuOpen) && (
          <motion.div
            key="site-logo"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed left-4 top-2 z-50 sm:left-5 sm:top-2 md:left-9 md:top-3"
          >
<a
  href="/"
  title="Home"
  onClick={(e) => {
    e.preventDefault();
    setMenuOpen(false);

    const hero = document.getElementById("cinematic-hero");

    if (hero) {
      hero.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.location.href = "/";
    }
  }}
>
  <Image
    src="/assets/favicon.png"
    alt="Contenaissance"
    title="Contenaissance"
    width={220}
    height={66}
    className="h-10 w-auto sm:h-12 md:h-16"
    priority
  />
</a>
          </motion.div>
        )}
      </AnimatePresence>
      {SHOW_INDEPENDENCE_DAY && (
        <div
          className="
      pointer-events-none
      fixed
      top-0
      left-[105px]
      right-[52px]
      z-50
      flex
      h-[60px]
      flex-col
      items-center
      justify-center

      sm:left-[180px]
      sm:right-[70px]
      sm:h-[70px]

      md:left-[220px]
      md:right-[100px]
      md:h-[72px]

      lg:left-1/2
      lg:right-auto
      lg:h-[80px]
      lg:-translate-x-1/2
    "
        >
          {/* Mobile + Tablet */}
          <div className="flex items-center justify-center gap-1.5 lg:hidden">
            <span className="shrink-0 text-[10px] sm:text-xs md:text-sm">
              🇮🇳
            </span>

            <span
              className="
          whitespace-nowrap
          text-[9px]
          font-bold
          uppercase
          tracking-[0.08em]
          text-[#138808]
          sm:text-[10px]
          md:text-[11px]
        "
            >
              {independenceWord}
              <span className="ml-[2px] animate-pulse text-[#FF9933]">|</span>
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden items-center gap-3 whitespace-nowrap lg:flex">
            <span className="text-lg">🇮🇳</span>

            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-800">
              Celebrating
            </span>

            <span className="text-base font-bold tracking-[0.06em] text-[#138808]">
              80 Years of Independence
            </span>

            <span className="text-zinc-400">•</span>

            <span className="text-xs font-medium tracking-[0.16em] text-zinc-600">
              15 AUGUST 2026
            </span>
          </div>

          {/* One single tricolor underline */}
          {/* <div className="mt-1.5 h-[2px] w-20 overflow-hidden rounded-full sm:w-24 md:w-28 lg:w-40">
            <span className="block h-full w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          </div> */}
        </div>
      )}

      <AnimatePresence initial={false}>
        {(showNavBg || menuOpen) && (
          <motion.button
            key="site-hamburger"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group fixed right-4 top-2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)] sm:right-5 sm:top-2 sm:h-12 sm:w-12 md:right-9 md:top-3 md:h-14 md:w-14"
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
          </motion.button>
        )}
      </AnimatePresence>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage="studio" />

      <div ref={rootRef} className="relative overflow-hidden">
        {/* Mouse-follow gradient blob */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(174, 140, 32, 0.15), transparent 40%)`,
          }}
        />

        <section
          id="cinematic-hero"
          ref={heroSectionRef}
          className="relative isolate h-[115svh] min-h-[100dvh] overflow-hidden bg-white"
        >
          {/* Background ambient glows */}
          <div className="ambient-glow left-0 top-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
          <div className="ambient-glow bottom-0 right-0 translate-x-1/2 translate-y-1/2 animate-pulse-glow" style={{ animationDelay: "2s" }} />

          {/* Video container */}
          <div
            ref={videoContainerRef}
            className="pointer-events-none absolute top-0 left-0 z-10 h-[100dvh] w-full overflow-hidden"
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

          {/* Revealed content after scroll - below video (mobile: stacked in-flow + gap; md+: circle absolute left) */}
          <div className="reveal-content absolute inset-x-0 bottom-0 top-[calc(6.5rem+30svh)] z-20 mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center gap-6 px-4 py-8 text-center opacity-0 sm:top-[calc(7.5rem+34vh)] sm:px-6 sm:py-10 md:top-[calc(8.5rem+39vh)] md:gap-0 md:px-12 md:py-14 lg:px-16">
            {/* Rotating circular typography — replaces static circle asset */}
            <RotatingCircleText
              reducedMotion={prefersReducedMotion}
              className="pointer-events-none relative z-10 mx-auto !h-24 !w-24 sm:!h-28 sm:!w-28 md:absolute md:left-4 md:top-10 md:z-auto md:mx-0 md:!h-36 md:!w-36 lg:left-8 lg:top-10 lg:!h-40 lg:!w-40"
            />
            <h1 className="reveal-page-title max-w-4xl text-[clamp(1.125rem,3.2vw,2rem)] font-semibold leading-snug tracking-tight text-zinc-900 max-md:[text-wrap:balance] md:max-w-5xl md:text-[clamp(1.25rem,2.8vw,2.25rem)]">
              AI Story Telling Agency & AI Creative Studio
            </h1>
            {prefersReducedMotion ? (
              <p className="reveal-tagline w-full max-w-md px-1 text-base font-medium leading-snug tracking-tight text-zinc-600 max-md:[text-wrap:balance] sm:text-xl md:text-3xl">
                &ldquo;{TAGLINE_TEXT}&rdquo;
              </p>
            ) : (
              <p
                className="reveal-tagline w-full max-w-md px-1 text-center text-base font-medium leading-snug tracking-tight text-zinc-600 max-md:[text-wrap:balance] sm:text-xl md:max-w-none md:text-3xl md:px-0 [perspective:1100px]"
              >
                <span className="inline-block select-none" aria-hidden>
                  &ldquo;
                </span>
                {TAGLINE_TEXT.split("").map((char, i) =>
                  char === " " ? (
                    <span key={`tagline-space-${i}`} className="inline-block w-[0.22em] shrink-0" aria-hidden />
                  ) : (
                    <span
                      key={`tagline-char-${i}-${char}`}
                      className="tagline-char inline-block origin-[50%_90%] cursor-default text-zinc-600 [transform:translate3d(0,0,0)_scale(1)_rotateX(0deg)] transition-[transform,color,text-shadow,filter] duration-200 ease-[cubic-bezier(0.34,1.45,0.64,1)] will-change-transform [transform-style:preserve-3d] hover:relative hover:z-10 hover:text-zinc-950 hover:[transform:translate3d(0,-0.04em,1.4rem)_scale(1.42)_rotateX(10deg)] hover:[text-shadow:0_0.35em_0.5em_rgba(174,140,32,0.35)]"
                    >
                      {char}
                    </span>
                  )
                )}
                <span className="inline-block select-none" aria-hidden>
                  &rdquo;
                </span>
              </p>
            )}
            {/* <div
              id="but-are-you-section"
              className="reveal-headline relative flex w-full justify-center px-1 max-md:mt-0 md:mt-8"
            >
              {prefersReducedMotion ? (
                <p className="relative z-10 max-w-5xl text-center text-[clamp(2rem,8.5vw,7.25rem)] font-bold leading-[0.92] tracking-[-0.06em] text-zinc-950 max-md:max-w-[min(100%,18rem)] md:leading-[0.88] md:max-w-5xl">
                  But are you?
                </p>
              ) : (
                <motion.p
                  className="relative z-10 max-w-5xl cursor-default text-center text-[clamp(2rem,8.5vw,7.25rem)] font-bold leading-[0.92] tracking-[-0.06em] max-md:max-w-[min(100%,18rem)] md:leading-[0.88] md:max-w-5xl"
                  initial="rest"
                  whileHover="hover"
                  variants={{
                    rest: { scale: 1 },
                    hover: {
                      scale: 1.02,
                      transition: {
                        staggerChildren: 0.055,
                        delayChildren: 0.03,
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                >
                  {REVEAL_HEADLINE_WORDS.map((w, i) => (
                    <motion.span
                      key={w.text}
                      className={`inline-block text-zinc-950 ${i < REVEAL_HEADLINE_WORDS.length - 1 ? "mr-[0.12em]" : ""}`}
                      variants={{
                        rest: {
                          y: 0,
                          rotate: 0,
                          color: "#0a0a0a",
                          textShadow: "0 0 0 rgba(174, 140, 32, 0)",
                        },
                        hover: {
                          y: -7,
                          rotate: w.rotate,
                          color: "#AE8C20",
                          textShadow: "0 14px 40px rgba(174, 140, 32, 0.4)",
                          transition: { type: "spring", stiffness: 440, damping: 20 },
                        },
                      }}
                    >
                      {w.text}
                    </motion.span>
                  ))}
                </motion.p>
              )}
            </div> */}
            <div
              id="but-are-you-section"
              className="reveal-headline relative flex w-full justify-center px-1 max-md:mt-0 md:mt-8"
            >
              <motion.p
                className={`
    relative z-10
    max-w-5xl
    cursor-default
    text-center
    text-[clamp(2rem,8.5vw,7.25rem)]
    font-bold
    leading-[0.92]
    tracking-[-0.06em]
    max-md:max-w-[min(100%,18rem)]
    md:leading-[0.88]
    md:max-w-5xl
    py-5

    ${SHOW_INDEPENDENCE_DAY
                    ? `
          bg-[url('/independence/tricolor.jpg')]
          bg-cover
          bg-center
          bg-no-repeat
          bg-clip-text
          text-transparent
          [-webkit-background-clip:text]
          [-webkit-text-fill-color:transparent]
        `
                    : `
          text-zinc-950
        `
                  }
  `}
                initial={{ scale: 1 }}
                whileHover={{
                  scale: 1.02,
                  transition: {
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
              >
                But are you?
              </motion.p>
            </div>
            <Link
              ref={ctaButtonRef}
              href="/portfolio"
              title="Portfolio"
              className="reveal-cta group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-zinc-950 px-6 py-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(174,140,32,0.4)] max-md:mt-0 sm:px-7 sm:text-[0.68rem] md:mt-16 md:px-12 md:py-4 md:text-[0.74rem] md:tracking-[0.2em] lg:px-14"
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
    </>
  );
}
