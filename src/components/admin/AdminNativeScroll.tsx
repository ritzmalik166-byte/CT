"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LENIS_HTML_CLASSES = [
  "lenis",
  "lenis-smooth",
  "lenis-stopped",
  "lenis-scrolling",
  "lenis-autoToggle",
] as const;

function resetPublicScrollEffects() {
  const root = document.documentElement;

  root.classList.remove(...LENIS_HTML_CLASSES);
  document.body.classList.remove(...LENIS_HTML_CLASSES);
  root.classList.add("admin-native-scroll");
  root.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");

  try {
    ScrollTrigger.scrollerProxy(document.documentElement, {});
    ScrollTrigger.clearScrollMemory();
    ScrollTrigger.refresh(true);
  } catch {
    // ScrollTrigger may not be registered yet
  }

  gsap.ticker.lagSmoothing(500, 33);
}

/** Ensures admin uses native browser scroll — no Lenis / GSAP scroll proxy. */
export function AdminNativeScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    resetPublicScrollEffects();

    return () => {
      document.documentElement.classList.remove("admin-native-scroll");
    };
  }, []);

  return children;
}
