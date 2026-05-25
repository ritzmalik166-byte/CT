"use client";

import { AIEngagementWidget } from "@/components/ai-engagement/AIEngagementWidget";
import { ScrollToTop } from "@/components/ScrollToTop";

export function FloatingActionCluster() {
  return (
    <div
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[var(--z-chrome)] flex flex-col items-end gap-3 sm:bottom-8 sm:right-8"
      aria-label="Page actions"
    >
      <div className="pointer-events-auto">
        <AIEngagementWidget />
      </div>
      <ScrollToTop embedded />
    </div>
  );
}
