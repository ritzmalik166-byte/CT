"use client";

import { motion } from "framer-motion";
import { Orbit, Puzzle } from "lucide-react";
import { useState } from "react";
import { AIEngagementModal } from "./AIEngagementModal";
import { ENGAGEMENT_MODE_CONFIG } from "./engagement-rotation";
import { gameTheme } from "./game-theme";
import { useRotatingEngagement } from "./useRotatingEngagement";
import { cn } from "@/lib/utils";

export function AIEngagementWidget() {
  const [open, setOpen] = useState(false);
  const mode = useRotatingEngagement();
  const config = ENGAGEMENT_MODE_CONFIG[mode];
  const ModeIcon = mode === "picture-puzzle" ? Puzzle : Orbit;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={config.ariaLabel}
          className={cn(
          "group relative flex max-w-full items-center gap-1.5 overflow-hidden rounded-full sm:gap-2",
          "border bg-zinc-900/85 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)]",
          "backdrop-blur-md transition-[border-color,box-shadow] duration-300",
          gameTheme.widgetBorder,
          gameTheme.widgetHover,
          gameTheme.ring,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "h-9 pl-2 pr-2.5 sm:h-auto sm:py-2 sm:pl-3 sm:pr-4"
        )}
        initial={{ opacity: 0, y: 14, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.15 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          className={cn("pointer-events-none absolute inset-0 rounded-full", gameTheme.widgetPulse)}
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <span
          className={cn(
            "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
            gameTheme.widgetIcon
          )}
        >
          <motion.span
            key={mode}
            initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex items-center justify-center"
          >
            <ModeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          </motion.span>
        </span>

        <motion.span
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-[5.75rem] truncate bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-left text-[10px] font-semibold leading-tight text-transparent min-[400px]:max-w-[6.5rem] sm:max-w-none sm:text-sm"
        >
          {config.widgetLabel}
        </motion.span>
      </motion.button>

      <AIEngagementModal open={open} onClose={() => setOpen(false)} mode={mode} />
    </>
  );
}
