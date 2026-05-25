"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { AIEngagementModal } from "./AIEngagementModal";
import { gameTheme } from "./game-theme";
import { CTA_PHRASES } from "./types";
import { cn } from "@/lib/utils";

export function AIEngagementWidget() {
  const [open, setOpen] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % CTA_PHRASES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={CTA_PHRASES[phraseIndex]}
        className={cn(
          "group relative flex items-center gap-2 overflow-hidden rounded-full",
          "border bg-zinc-900/85 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)]",
          "backdrop-blur-md transition-[border-color,box-shadow] duration-300",
          gameTheme.widgetBorder,
          gameTheme.widgetHover,
          gameTheme.ring,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "h-10 pl-2.5 pr-3 sm:h-auto sm:py-2 sm:pl-3 sm:pr-4"
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
            "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8",
            gameTheme.widgetIcon
          )}
        >
          <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        </span>

        <motion.span
          key={phraseIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-[8.5rem] truncate bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-left text-[11px] font-semibold leading-tight text-transparent sm:max-w-none sm:text-sm"
        >
          {CTA_PHRASES[phraseIndex]}
        </motion.span>
      </motion.button>

      <AIEngagementModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
