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

/**
 * Desktop:
 * Full cinematic smooth scroll
 *
 * Mobile / Tablet:
 * Lighter smooth scroll optimized for performance
 */
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.innerWidth < 1024 ||
    !window.matchMedia("(pointer: fine)").matches
  );
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let lenis: Lenis | null = null;
    let rafId = 0;

    /**
     * Better GSAP performance
     */
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
    });

    const startLenis = () => {
      const mobile = isMobileDevice();

      lenis = new Lenis({
        duration: mobile ? 0.5 : 0.85,

        easing: (t) =>
          mobile
            ? 1 - Math.pow(1 - t, 3)
            : Math.min(1, 1.001 - Math.pow(2, -10 * t)),

        orientation: "vertical",
        gestureOrientation: "vertical",

        smoothWheel: true,
        syncTouch: mobile,

        wheelMultiplier: mobile ? 0.9 : 1,
        touchMultiplier: mobile ? 0.8 : 1,

        lerp: mobile ? 0.09 : 0.16,

        autoRaf: false,
      });

      /**
       * Sync GSAP with Lenis
       */
      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };

      rafId = requestAnimationFrame(raf);
    };

    const stopLenis = () => {
      cancelAnimationFrame(rafId);

      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
    };

    const applyMode = () => {
      stopLenis();

      /**
       * Disable previous normalization
       */
      ScrollTrigger.normalizeScroll(false);

      /**
       * Start Lenis on ALL devices
       * but lighter on mobile
       */
      startLenis();

      /**
       * Refresh GSAP calculations
       */
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    };

    applyMode();

    /**
     * Handle resize/device changes
     */
    const mediaQueries = [
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(pointer: fine)"),
    ];

    mediaQueries.forEach((mq) => {
      mq.addEventListener("change", applyMode);
    });

    /**
     * Cleanup
     */
    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener("change", applyMode);
      });

      stopLenis();

      ScrollTrigger.normalizeScroll(false);

      ScrollTrigger.config({
        limitCallbacks: false,
        ignoreMobileResize: false,
      });

      ScrollTrigger.refresh(true);
    };
  }, []);

  return <>{children}</>;
}