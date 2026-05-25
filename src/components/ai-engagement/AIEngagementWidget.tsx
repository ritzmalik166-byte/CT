"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { AIEngagementModal } from "./AIEngagementModal";
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
          "border border-[#AE8C20]/45 bg-zinc-900/85 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)]",
          "backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300",
          "hover:border-[#AE8C20] hover:shadow-[0_12px_32px_rgba(174,140,32,0.28)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE8C20] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "h-11 pl-3 pr-3 sm:h-auto sm:py-2.5 sm:pl-3 sm:pr-4"
        )}
        initial={{ opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full bg-[#AE8C20]/10"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#AE8C20] to-[#D4AF37] text-zinc-950 shadow-[0_0_16px_rgba(174,140,32,0.45)]">
          <Brain className="h-4 w-4" aria-hidden />
        </span>

        <motion.span
          key={phraseIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative hidden max-w-[9.5rem] truncate text-left text-xs font-semibold leading-tight sm:inline sm:max-w-none sm:text-sm"
        >
          {CTA_PHRASES[phraseIndex]}
        </motion.span>
      </motion.button>

      <AIEngagementModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
