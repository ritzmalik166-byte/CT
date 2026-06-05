"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Zap } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";
import { gameTheme } from "../game-theme";
import { cn } from "@/lib/utils";

const RAIL_W = 76;

interface BubbleShooterModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  playfieldW: number;
  playfieldH: number;
  showRail: boolean;
  score: number;
  combo: number;
}

export function BubbleShooterModal({
  open,
  onClose,
  children,
  playfieldW,
  playfieldH,
  showRail,
  score,
  combo,
}: BubbleShooterModalProps) {
  useLenisScrollLock(open);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [compact, setCompact] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gameW = playfieldW + (showRail && !compact ? RAIL_W : 0);
  const gameH = playfieldH;

  const updateScale = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const compactLayout = window.matchMedia("(max-width: 639px)").matches;
    setCompact(compactLayout);

    const rail = showRail && !compactLayout;
    const totalW = playfieldW + (rail ? RAIL_W : 0);
    const padX = compactLayout ? 12 : 24;
    const padY = compactLayout ? 12 : 32;
    const headerH = compactLayout ? 52 : 60;
    const footerH = compactLayout ? 28 : 36;

    const availW = stage.clientWidth - padX * 2;
    const availH = stage.clientHeight - headerH - footerH - padY * 2;

    if (availW <= 0 || availH <= 0) return;

    const next = Math.min(availW / totalW, availH / gameH, 4);
    setScale(Math.max(0.35, next));
  }, [playfieldW, playfieldH, showRail]);

  useLayoutEffect(() => {
    if (!open) return;
    updateScale();
    const stage = stageRef.current;
    if (!stage) return;

    const ro = new ResizeObserver(updateScale);
    ro.observe(stage);
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, [open, updateScale]);

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
          aria-label="AI Bubble Shooter"
          className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-zinc-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <Image
            src="/assets/dotted.svg"
            alt="Decorative dotted background pattern"
            title="Decorative dotted background pattern"
            fill
            className="pointer-events-none object-cover object-center"
            priority
          />
          <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

          <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-zinc-950/40 px-3 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3">
            <div className="min-w-0">
              <p className={cn("truncate text-xs font-black uppercase tracking-[0.14em] sm:text-sm", gameTheme.accentStrong)}>
                AI Bubble Shooter
              </p>
              <p className="hidden text-[10px] text-zinc-500 sm:block">Click to shoot · Space to swap</p>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {combo > 1 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase text-cyan-200">
                  <Zap className="h-3 w-3" aria-hidden />x{combo}
                </span>
              )}
              <span className="rounded-full border border-fuchsia-400/40 bg-violet-600/20 px-2.5 py-1 text-[10px] font-bold tabular-nums text-fuchsia-100 sm:text-xs">
                {score.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-200",
                  gameTheme.ring
                )}
                aria-label="Close game"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={stageRef} className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6">
            <div
              className="origin-center will-change-transform"
              style={{
                width: gameW,
                height: gameH,
                transform: `scale(${scale})`,
              }}
            >
              {children}
            </div>
          </div>

          <p className="relative z-10 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-center text-[9px] font-semibold uppercase tracking-wider text-zinc-600 sm:pb-3 sm:text-[10px]">
            Tap to aim · release to shoot · Space swap · Esc exit
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export { RAIL_W };
