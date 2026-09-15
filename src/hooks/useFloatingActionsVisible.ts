"use client";

import type Lenis from "lenis";
import { useEffect, useState } from "react";
import { useLenis } from "@/components/SmoothScrollProvider";

/** Matches hero shrink / scroll-to-top reveal threshold. */
export const FLOATING_ACTIONS_SHOW_AFTER_PX = 320;

export function useFloatingActionsVisible() {
  const { getLenis } = useLenis();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lenisBound: Lenis | null = null;

    const update = () => {
      const lenis = getLenis();
      const y = lenis ? lenis.scroll : window.scrollY;
      setVisible(y > FLOATING_ACTIONS_SHOW_AFTER_PX);
    };

    const bindLenis = () => {
      const lenis = getLenis();
      if (!lenis || lenis === lenisBound) return;
      if (lenisBound) lenisBound.off("scroll", update);
      lenisBound = lenis;
      lenis.on("scroll", update);
    };

    update();
    bindLenis();
    window.addEventListener("scroll", update, { passive: true });

    const attachPoll = window.setInterval(() => {
      bindLenis();
      update();
    }, 400);

    return () => {
      window.clearInterval(attachPoll);
      window.removeEventListener("scroll", update);
      if (lenisBound) lenisBound.off("scroll", update);
    };
  }, [getLenis]);

  return visible;
}
