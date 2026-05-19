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
import { ScrollToTop } from "@/components/ScrollToTop";

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

    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrowMq = window.matchMedia("(max-width: 1024px)");
    const coarsePointerMq = window.matchMedia("(pointer: coarse)");

    const prefersNativeScroll = () =>
      reducedMotionMq.matches || narrowMq.matches || coarsePointerMq.matches;

    let lenisInstance: Lenis | null = null;
    let rafId = 0;
    let onLenisScroll: (() => void) | undefined;
    let onScrollTriggerRefresh: (() => void) | undefined;

    function tearDownLenis() {
      cancelAnimationFrame(rafId);
      rafId = 0;

      const lenis = lenisInstance;
      if (!lenis) return;

      if (onScrollTriggerRefresh) {
        ScrollTrigger.removeEventListener("refresh", onScrollTriggerRefresh);
        onScrollTriggerRefresh = undefined;
      }
      if (onLenisScroll) {
        lenis.off("scroll", onLenisScroll);
        onLenisScroll = undefined;
      }

      lenis.destroy();
      lenisInstance = null;
      lenisRef.current = null;
      ScrollTrigger.refresh(true);
    }

    function startLenis() {
      if (prefersNativeScroll()) {
        ScrollTrigger.refresh(true);
        return;
      }

      const lenis = new Lenis({
        syncTouch: true,
      });
      lenisInstance = lenis;
      lenisRef.current = lenis;

      onLenisScroll = () => {
        ScrollTrigger.update();
      };
      lenis.on("scroll", onLenisScroll);

      onScrollTriggerRefresh = () => {
        lenis.resize();
      };
      ScrollTrigger.addEventListener("refresh", onScrollTriggerRefresh);
      ScrollTrigger.refresh(true);

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }

    function apply() {
      tearDownLenis();
      startLenis();
    }

    apply();

    reducedMotionMq.addEventListener("change", apply);
    narrowMq.addEventListener("change", apply);
    coarsePointerMq.addEventListener("change", apply);

    return () => {
      reducedMotionMq.removeEventListener("change", apply);
      narrowMq.removeEventListener("change", apply);
      coarsePointerMq.removeEventListener("change", apply);
      tearDownLenis();
    };
  }, []);

  return (
    <LenisContext.Provider value={contextValue}>
      <div className="site-scroll-stack relative z-[var(--z-page-content)] flex w-full min-h-[100dvh] flex-1 touch-pan-y flex-col">
        {children}
        <ScrollToTop />
      </div>
    </LenisContext.Provider>
  );
}
