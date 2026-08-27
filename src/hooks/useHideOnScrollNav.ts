"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD_PX = 10;

export function useHideOnScrollNav(forceVisible = false) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= SCROLL_THRESHOLD_PX) {
        setVisible(true);
        lastScrollY.current = currentY;
        return;
      }

      if (Math.abs(delta) < SCROLL_THRESHOLD_PX) return;

      setVisible(delta < 0);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return forceVisible || visible;
}
