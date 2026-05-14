"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
}

/** Desktop / trackpad: Lenis smooth scroll. Touch phones: native scroll + GSAP normalization (avoids Lenis vs. touch jitter). */
function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return false;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const wideEnough = window.matchMedia("(min-width: 1024px)").matches;
  return finePointer && wideEnough;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let lenis: Lenis | null = null;
    let rafId = 0;

    /** Throttle ST fires during scroll — big win on mobile */
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
    });

    const startLenis = () => {
      lenis = new Lenis({
        duration: 0.75,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        syncTouch: false,
        lerp: 0.16,
        autoRaf: false,
      });

      lenis.on("scroll", ScrollTrigger.update);

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    };

    const stopLenis = () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };

    const applyMode = () => {
      stopLenis();
      ScrollTrigger.normalizeScroll(false);

      if (shouldUseLenis()) {
        startLenis();
      } else {
        /** Touch / phones: native momentum + GSAP touch scroll normalization (no Lenis fighting the browser) */
        ScrollTrigger.normalizeScroll(true);
      }

      ScrollTrigger.refresh(true);
    };

    applyMode();

    const mqs = [
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(pointer: fine)"),
    ];
    mqs.forEach((mq) => mq.addEventListener("change", applyMode));

    return () => {
      mqs.forEach((mq) => mq.removeEventListener("change", applyMode));
      stopLenis();
      ScrollTrigger.normalizeScroll(false);
      ScrollTrigger.config({ limitCallbacks: false, ignoreMobileResize: false });
      ScrollTrigger.refresh(true);
    };
  }, []);

  return <>{children}</>;
}
