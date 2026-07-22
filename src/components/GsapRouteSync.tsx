"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/SmoothScrollProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type GsapRouteSyncProps = {
  children: React.ReactNode;
};

/**
 * Resets scroll + ScrollTrigger state on client navigations so pinned/scrub
 * sections from the previous route do not freeze animations on the next page.
 */
export function GsapRouteSync({ children }: GsapRouteSyncProps) {
  const pathname = usePathname();
  const { getLenis } = useLenis();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const lenis = getLenis();
    lenis?.scrollTo(0, { immediate: true });

    ScrollTrigger.clearScrollMemory();

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
        lenis?.resize();
      });
    });

    return () => cancelAnimationFrame(raf1);
  }, [pathname, getLenis]);

  return <div key={pathname}>{children}</div>;
}
