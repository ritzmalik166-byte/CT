"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisContextValue = {
  getLenis: () => Lenis | null;
};

const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
});

/** Pause Lenis when full-screen overlays lock body scroll (menu, modal). */
export function useLenis() {
  return useContext(LenisContext);
}

export function useLenisScrollLock(locked: boolean) {
  const { getLenis } = useLenis();

  useEffect(() => {
    if (!locked) return;

    const lenis = getLenis();
    if (!lenis) return;

    lenis.stop();

    return () => {
      lenis.start();
    };
  }, [locked, getLenis]);
}

export function SmoothScrollProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lenisRef = useRef<Lenis | null>(null);

  const getLenis = useCallback(() => lenisRef.current, []);

  const contextValue = useMemo(() => ({ getLenis }), [getLenis]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      ScrollTrigger.refresh(true);
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis();
    lenisRef.current = lenis;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onLenisScroll);

    const onScrollTriggerRefresh = () => {
      lenis.resize();
    };
    ScrollTrigger.addEventListener("refresh", onScrollTriggerRefresh);
    ScrollTrigger.refresh(true);

    // Use requestAnimationFrame to continuously update the scroll
    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener("refresh", onScrollTriggerRefresh);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.refresh(true);
    };
  }, []);

  return (
    <LenisContext.Provider value={contextValue}>
      <div className="site-scroll-stack relative z-[var(--z-page-content)] flex w-full min-h-[100dvh] flex-1 touch-pan-y flex-col">
        {children}
      </div>
    </LenisContext.Provider>
  );
}
