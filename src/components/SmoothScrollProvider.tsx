"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FloatingActionCluster } from "@/components/FloatingActionCluster";
import { GsapRouteSync } from "@/components/GsapRouteSync";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    let onLenisScroll: (() => void) | undefined;
    let onScrollTriggerRefresh: (() => void) | undefined;
    let lenisTicker: ((time: number) => void) | undefined;
    let proxyConfigured = false;

    function tearDownLenis() {
      const lenis = lenisInstance;

      if (lenisTicker) {
        gsap.ticker.remove(lenisTicker);
        lenisTicker = undefined;
      }

      if (proxyConfigured) {
        try {
          ScrollTrigger.scrollerProxy(document.documentElement, {});
        } catch {
          // ScrollTrigger may not be ready during fast route transitions
        }
        proxyConfigured = false;
      }

      if (lenis) {
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
      }

      ScrollTrigger.refresh(true);
    }

    function startLenis() {
      if (prefersNativeScroll()) {
        ScrollTrigger.refresh(true);
        return;
      }

      const lenis = new Lenis({
        syncTouch: true,
        // Snappier on desktop so scrubbed pin sections don't feel like they're fighting the wheel
        lerp: 0.075,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
      });
      lenisInstance = lenis;
      lenisRef.current = lenis;

      onLenisScroll = () => {
        ScrollTrigger.update();
      };
      lenis.on("scroll", onLenisScroll);

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value?: number) {
          if (typeof value === "number") {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType:
          document.body.style.transform !== "" ? "transform" : "fixed",
      });
      proxyConfigured = true;

      onScrollTriggerRefresh = () => {
        lenis.resize();
      };
      ScrollTrigger.addEventListener("refresh", onScrollTriggerRefresh);
      ScrollTrigger.refresh(true);

      lenisTicker = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(lenisTicker);
      gsap.ticker.lagSmoothing(0);
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
        <GsapRouteSync>{children}</GsapRouteSync>
        <FloatingActionCluster />
      </div>
    </LenisContext.Provider>
  );
}
