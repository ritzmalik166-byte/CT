"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";
import { gameTheme } from "./game-theme";
import { NeuralWheelGame } from "./NeuralWheelGame";
import { cn } from "@/lib/utils";

interface AIEngagementModalProps {
  open: boolean;
  onClose: () => void;
}

export function AIEngagementModal({ open, onClose }: AIEngagementModalProps) {
  useLenisScrollLock(open);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-engagement-title"
          className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={cn(
              "relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-zinc-950/92 backdrop-blur-xl sm:rounded-3xl",
              gameTheme.modalBorder,
              gameTheme.modalShadow
            )}
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 sm:px-5">
              <div>
                <p
                  id="ai-engagement-title"
                  className={cn(
                    "text-sm font-bold uppercase tracking-[0.12em]",
                    gameTheme.accentStrong
                  )}
                >
                  AI Engagement
                </p>
                <p className="text-xs text-zinc-500">Neural wheel mini-game</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2",
                  gameTheme.ring
                )}
                aria-label="Close AI game"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="max-h-[min(78vh,640px)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <NeuralWheelGame />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
