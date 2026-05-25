"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";

const HERO_SECTION_ID = "cinematic-hero";

function isHeroInView(hero: HTMLElement) {
  const rect = hero.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

export function useGameWidgetVisible() {
  const { getLenis } = useLenis();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let heroEl: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;
    let pollId: number | null = null;
    let attached = false;

    const update = () => {
      heroEl = document.getElementById(HERO_SECTION_ID);
      if (!heroEl) {
        setVisible(true);
        return;
      }
      setVisible(!isHeroInView(heroEl));
    };

    const attachHeroObserver = () => {
      if (attached) return true;
      heroEl = document.getElementById(HERO_SECTION_ID);
      if (!heroEl) return false;

      attached = true;
      observer = new IntersectionObserver(update, {
        threshold: [0, 0.05, 0.15, 0.35, 0.6, 1],
      });
      observer.observe(heroEl);
      update();
      return true;
    };

    if (!attachHeroObserver()) {
      setVisible(true);
      pollId = window.setInterval(() => {
        if (attachHeroObserver() && pollId !== null) {
          window.clearInterval(pollId);
        }
      }, 400);
    }

    window.addEventListener("scroll", update, { passive: true });
    const lenis = getLenis();
    if (lenis) lenis.on("scroll", update);

    return () => {
      if (pollId !== null) window.clearInterval(pollId);
      observer?.disconnect();
      window.removeEventListener("scroll", update);
      if (lenis) lenis.off("scroll", update);
    };
  }, [getLenis]);

  return visible;
}
