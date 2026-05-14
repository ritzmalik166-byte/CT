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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LenisContextValue = {
  getLenis: () => Lenis | null;
};

const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
});

/** Pause Lenis when full-screen overlays lock body scroll (menu, modal). */
export function useLenisScrollLock(locked: boolean) {
  const { getLenis } = useContext(LenisContext);

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

/**
 * Smooth vertical scrolling (Lenis) synchronized with GSAP ScrollTrigger + pin sections.
 */
export function SmoothScrollProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lenisRef = useRef<Lenis | null>(null);

  const getLenis = useCallback(() => lenisRef.current, []);

  const contextValue = useMemo(() => ({ getLenis }), [getLenis]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      syncTouch: true,
      syncTouchLerp: 0.065,
      allowNestedScroll: true,
      touchMultiplier: 1.15,
    });

    lenisRef.current = lenis;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onLenisScroll);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(ticker);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <LenisContext.Provider value={contextValue}>
      <div className="site-scroll-stack relative isolate z-[var(--z-page-content)] flex w-full min-h-[100dvh] flex-1 touch-pan-y flex-col">
        {children}
      </div>
    </LenisContext.Provider>
  );
}
