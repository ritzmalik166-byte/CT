"use client";

import { ScrollToTop } from "@/components/ScrollToTop";

export function FloatingActionCluster() {
  return (
    <div
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[var(--z-chrome)] sm:bottom-8 sm:right-8"
      aria-label="Page actions"
    >
      <ScrollToTop embedded />
    </div>
  );
}
