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
 * Lenis only on large viewports + fine pointer (mouse/trackpad).
 * Touch phones/tablets use native momentum scroll — avoids jank with ScrollTrigger pins + scrub.
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
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        limitCallbacks: true,
      });
      ScrollTrigger.refresh(true);
      return () => {
        ScrollTrigger.config({
          ignoreMobileResize: false,
          limitCallbacks: false,
        });
        ScrollTrigger.refresh(true);
      };
    }

    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");

    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let onRefresh: (() => void) | null = null;
    let onLenisScroll: (() => void) | null = null;

    const teardownLenis = () => {
      if (onRefresh) {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        onRefresh = null;
      }
      if (lenis && onLenisScroll) {
        lenis.off("scroll", onLenisScroll);
      }
      onLenisScroll = null;
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
        tickerFn = null;
      }
      if (lenis) {
        lenis.destroy();
        lenis = null;
        lenisRef.current = null;
      }
      gsap.ticker.lagSmoothing(500, 33);
    };

    const applyMode = () => {
      teardownLenis();

      if (!mq.matches) {
        ScrollTrigger.normalizeScroll(true);
        ScrollTrigger.config({
          ignoreMobileResize: true,
          limitCallbacks: true,
        });
        ScrollTrigger.refresh(true);
        return;
      }

      ScrollTrigger.normalizeScroll(false);
      ScrollTrigger.config({
        ignoreMobileResize: false,
        limitCallbacks: false,
      });

      lenis = new Lenis({
        syncTouch: false,
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      onLenisScroll = () => {
        ScrollTrigger.update();
      };
      lenis.on("scroll", onLenisScroll);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      onRefresh = () => lenis?.resize();
      ScrollTrigger.addEventListener("refresh", onRefresh);
      ScrollTrigger.refresh(true);
    };

    applyMode();
    mq.addEventListener("change", applyMode);

    return () => {
      mq.removeEventListener("change", applyMode);
      teardownLenis();
      ScrollTrigger.normalizeScroll(false);
      ScrollTrigger.config({
        ignoreMobileResize: false,
        limitCallbacks: false,
      });
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
