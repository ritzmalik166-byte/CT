"use client";

import { useCallback, useRef } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";
import { useFloatingActionsVisible } from "@/hooks/useFloatingActionsVisible";
import {
  easeOutQuint,
  scrollToTopDurationSec,
  smoothNativeScrollToTop,
} from "@/lib/smooth-scroll-to-top";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  /** When true, positioning is handled by a parent cluster (e.g. FloatingActionCluster). */
  embedded?: boolean;
}

export function ScrollToTop({ embedded = false }: ScrollToTopProps) {
  const { getLenis } = useLenis();
  const visible = useFloatingActionsVisible();
  const isScrollingRef = useRef(false);

  const scrollToTop = useCallback(() => {
    if (isScrollingRef.current) return;

    const lenis = getLenis();
    const distance = lenis ? lenis.scroll : window.scrollY;
    if (distance <= 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      return;
    }

    const durationSec = scrollToTopDurationSec(distance);
    const easing = easeOutQuint;

    isScrollingRef.current = true;
    const release = () => {
      isScrollingRef.current = false;
    };

    if (lenis) {
      lenis.scrollTo(0, {
        duration: durationSec,
        easing,
        onComplete: release,
      });
      return;
    }

    void smoothNativeScrollToTop(durationSec * 1000, easing).finally(release);
  }, [getLenis]);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        embedded
          ? "relative flex items-center justify-center"
          : "fixed z-[var(--z-chrome)] flex items-center justify-center",
        "rounded-full",
        "border border-[#AE8C20]/50 bg-zinc-900/90 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)]",
        "backdrop-blur-md transition-[opacity,transform,background-color,border-color,color,box-shadow]",
        "duration-300 hover:border-[#AE8C20] hover:bg-[#AE8C20] hover:text-zinc-950 hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)]",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE8C20] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        !embedded &&
          "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
        "h-11 w-11 sm:h-12 sm:w-12",
        !embedded && "sm:bottom-8 sm:right-8",
        embedded && !visible && "hidden",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <svg
        className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.25}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
