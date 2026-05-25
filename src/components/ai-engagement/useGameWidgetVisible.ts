"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";

const REVEAL_SECTION_ID = "but-are-you-section";
const FALLBACK_SCROLL_PX = 320;

function isRevealSectionVisible(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const opacity = Number.parseFloat(window.getComputedStyle(el).opacity);
  const inView =
    rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.28;
  return inView && opacity > 0.2;
}

export function useGameWidgetVisible() {
  const { getLenis } = useLenis();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let revealEl: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;
    let pollId: number | null = null;

    const updateFromScroll = () => {
      const lenis = getLenis();
      const y = lenis ? lenis.scroll : window.scrollY;
      setVisible(y > FALLBACK_SCROLL_PX);
    };

    const updateFromReveal = () => {
      if (!revealEl) return;
      setVisible(isRevealSectionVisible(revealEl));
    };

    const attachRevealObserver = () => {
      revealEl = document.getElementById(REVEAL_SECTION_ID);
      if (!revealEl) return false;

      observer = new IntersectionObserver(updateFromReveal, {
        threshold: [0, 0.15, 0.35, 0.55],
        rootMargin: "-8% 0px -12% 0px",
      });
      observer.observe(revealEl);
      window.addEventListener("scroll", updateFromReveal, { passive: true });

      const lenis = getLenis();
      if (lenis) lenis.on("scroll", updateFromReveal);

      updateFromReveal();
      return true;
    };

    if (!attachRevealObserver()) {
      updateFromScroll();
      window.addEventListener("scroll", updateFromScroll, { passive: true });

      const lenis = getLenis();
      if (lenis) lenis.on("scroll", updateFromScroll);

      pollId = window.setInterval(() => {
        if (attachRevealObserver()) {
          window.removeEventListener("scroll", updateFromScroll);
          if (lenis) lenis.off("scroll", updateFromScroll);
          if (pollId !== null) window.clearInterval(pollId);
        }
      }, 400);
    }

    return () => {
      if (pollId !== null) window.clearInterval(pollId);
      observer?.disconnect();
      window.removeEventListener("scroll", updateFromReveal);
      window.removeEventListener("scroll", updateFromScroll);
      const lenis = getLenis();
      if (lenis) {
        lenis.off("scroll", updateFromReveal);
        lenis.off("scroll", updateFromScroll);
      }
    };
  }, [getLenis]);

  return visible;
}
