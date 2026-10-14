"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { InnerPageNav } from "@/components/InnerPageNav";
import { HERO_VIDEO_SRC, NAV_LINKS } from "./content";
import { usePrefersReducedMotion } from "./motion";

const POINTER_SPRING = { stiffness: 70, damping: 18, mass: 0.8 };
const TITLE_WORDS = ["AI", "Services"];

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const pointerX = useSpring(0, POINTER_SPRING);
  const pointerY = useSpring(0, POINTER_SPRING);
  const tiltX = useTransform(pointerY, [-0.5, 0.5], [7, -7]);
  const tiltY = useTransform(pointerX, [-0.5, 0.5], [-9, 9]);
  const mediaX = useTransform(pointerX, [-0.5, 0.5], ["1.5%", "-1.5%"]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    if (reduceMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.05 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <>
      <InnerPageNav menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} currentPage="services" />

      <section
        ref={sectionRef}
        aria-labelledby="ai-services-title"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        className="relative isolate flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-[#1c1e20] text-white"
      >
        <nav
          aria-label="Primary"
          className="absolute left-1/2 top-6 z-10 hidden h-14 -translate-x-1/2 items-center gap-8 md:flex lg:gap-10"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={`group relative text-[13px] font-medium tracking-[0.01em] transition-colors duration-300 ${
                link.active ? "text-white" : "text-white/65 hover:text-white"
              }`}
            >
              {link.label}
              <span
                aria-hidden
                className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  link.active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          ))}
        </nav>

        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 will-change-transform"
          style={reduceMotion ? { scale: 1.04 } : { x: mediaX, y: mediaY, scale: mediaScale }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#5b6166_0%,#2a2d30_55%,#121314_100%)]" />
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale-[35%]"
            src={HERO_VIDEO_SRC}
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
        </motion.div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.15)_28%,rgba(0,0,0,0.2)_62%,rgba(0,0,0,0.7)_100%)]"
        />

        <motion.div
          className="relative px-5 pt-[14vh] text-center [perspective:1100px]"
          style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        >
          <motion.div
            className="[transform-style:preserve-3d]"
            style={reduceMotion ? undefined : { rotateX: tiltX, rotateY: tiltY }}
          >
            <p
              className="ais-serif ais-fade-up text-[clamp(1.15rem,1.9vw,1.75rem)] font-medium tracking-[0.22em] text-white/90 [translate:0_0_40px]"
              style={{ "--ais-delay": "0.55s" } as React.CSSProperties}
            >
              Services
            </p>

            <h1
              id="ai-services-title"
              className="ais-serif mt-[clamp(2.5rem,9vh,6rem)] text-[clamp(3.5rem,10.5vw,9rem)] font-semibold leading-[0.95] tracking-[-0.01em] drop-shadow-[0_10px_40px_rgba(0,0,0,0.35)] [translate:0_0_90px]"
            >
              {TITLE_WORDS.map((word, i) => (
                <span
                  key={word}
                  className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom"
                >
                  <span
                    className="ais-rise"
                    style={{ "--ais-delay": `${0.7 + i * 0.12}s` } as React.CSSProperties}
                  >
                    {word}
                  </span>
                  {i < TITLE_WORDS.length - 1 ? "\u00a0" : null}
                </span>
              ))}
            </h1>
          </motion.div>
        </motion.div>

        <a
          href="#services"
          className="ais-fade-up group absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-white/70 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          style={{ "--ais-delay": "1.3s" } as React.CSSProperties}
        >
          Scroll
          <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-white/20">
            <span className="ais-scroll-cue-line absolute inset-0 bg-white" />
          </span>
        </a>
      </section>
    </>
  );
}
