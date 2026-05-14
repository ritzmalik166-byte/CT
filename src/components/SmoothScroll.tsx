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

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(pointer: fine)").matches;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Always respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | null = null;
    let rafId = 0;

    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
    });

    const startLenis = () => {
      const touch = isTouchDevice();

      lenis = new Lenis({
        // On touch devices: only smooth wheel events (e.g. Magic Trackpad, bluetooth mouse)
        // Native finger scroll is left completely alone — it runs on compositor thread
        smoothWheel: true,
        syncTouch: false,          // ← KEY: never intercept native touch momentum

        wheelMultiplier: touch ? 1 : 1,
        touchMultiplier: 1,        // irrelevant when syncTouch is false

        duration: touch ? 0.6 : 0.9,

        // Expo-out on desktop, quint-out on touch (lighter math, less main-thread work)
        easing: touch
          ? (t) => 1 - Math.pow(1 - t, 5)          // quintic ease-out
          : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out

        lerp: touch ? 0.12 : 0.1, // higher = snappier (less lag)

        orientation: "vertical",
        gestureOrientation: "vertical",
        autoRaf: false,
      });

      // Sync GSAP ScrollTrigger with Lenis's scroll position
      lenis.on("scroll", ScrollTrigger.update);

      // Tight RAF loop — no extra work inside
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    const stopLenis = () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };

    const applyMode = () => {
      stopLenis();
      ScrollTrigger.normalizeScroll(false); // never normalize on mobile
      startLenis();
      requestAnimationFrame(() => ScrollTrigger.refresh(true));
    };

    applyMode();

    const mq = window.matchMedia("(pointer: fine)");
    mq.addEventListener("change", applyMode);

    return () => {
      mq.removeEventListener("change", applyMode);
      stopLenis();
      ScrollTrigger.normalizeScroll(false);
      ScrollTrigger.config({ limitCallbacks: false, ignoreMobileResize: false });
      ScrollTrigger.refresh(true);
    };
  }, []);

  return <>{children}</>;
}