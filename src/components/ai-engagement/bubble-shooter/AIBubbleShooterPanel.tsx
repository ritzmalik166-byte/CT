"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, RotateCcw, Trophy, Zap } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { gameTheme } from "../game-theme";
import { loadAIBubbleImages } from "./ai-bubble-logos";
import { renderGameFrame, renderStartBackdrop } from "./bubble-canvas-render";
import {
  aimFromPointer,
  computeLayout,
  createInitialState,
  PLAYFIELD_H,
  PLAYFIELD_W,
  shoot,
  stepProjectile,
  swapBubbleTypes,
  updateParticles,
  type BubbleShooterState,
  type LayoutMetrics,
} from "./bubble-shooter-engine";
import { cn } from "@/lib/utils";

type GamePhase = "start" | "playing" | "ended";

const INSTRUCTIONS = [
  'LEFT CLICK TO SHOOT MARBLE',
  'PRESS "SPACE" TO SWITCH THE MARBLE COLOR',
  'PRESS "ESC" TO STOP',
] as const;

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="start-card w-full max-w-[min(320px,88%)] rounded-xl bg-[#d9d9d9] px-6 py-5 ">
        <h3 className="text-center text-lg font-black tracking-wide text-zinc-900">HELLO !</h3>

        <ul className="mt-4 space-y-2">
          {INSTRUCTIONS.map((line) => (
            <li
              key={line}
              className="text-[9px] font-bold uppercase leading-snug tracking-wide text-zinc-800 sm:text-[10px]"
            >
              • {line}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onStart}
          className="start-card-btn mt-5 w-full rounded-lg bg-[#1c2e2e] py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#243838] active:scale-[0.98]"
        >
          Start
        </button>
      </div>
    </motion.div>
  );
}

function ScoreBadge({ score, compact }: { score: number; compact?: boolean }) {
  return (
    <motion.span
      key={score}
      initial={{ scale: 1.12 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-violet-600/20 font-bold tabular-nums text-fuchsia-100",
        compact ? "flex-col px-1 py-1.5 text-[9px] leading-none" : "px-2.5 py-0.5 text-[10px]"
      )}
    >
      <Trophy className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")} aria-hidden />
      {score.toLocaleString()}
    </motion.span>
  );
}

export function AIBubbleShooterPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BubbleShooterState | null>(null);
  const logosRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const layoutRef = useRef<LayoutMetrics>(computeLayout(PLAYFIELD_W, PLAYFIELD_H));
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const phaseRef = useRef<GamePhase>("start");

  const [phase, setPhase] = useState<GamePhase>("start");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [won, setWon] = useState(false);
  const [ready, setReady] = useState(false);
  const uiRef = useRef({ score: 0, combo: 0, gameOver: false, won: false });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    loadAIBubbleImages().then((map) => {
      if (!cancelled) {
        logosRef.current = map;
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = PLAYFIELD_W * dpr;
    canvas.height = PLAYFIELD_H * dpr;
    canvas.style.width = `${PLAYFIELD_W}px`;
    canvas.style.height = `${PLAYFIELD_H}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutRef.current = computeLayout(PLAYFIELD_W, PLAYFIELD_H);
    return ctx;
  }, []);

  const ringColor = useCallback(
    (type: number) =>
      ["#10B981", "#F97316", "#818CF8", "#38BDF8", "#F472B6", "#A855F7"][type] ?? "#fff",
    []
  );

  const returnToStart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stateRef.current = null;
    uiRef.current = { score: 0, combo: 0, gameOver: false, won: false };
    setScore(0);
    setCombo(0);
    setWon(false);
    phaseRef.current = "start";
    setPhase("start");
    lastTimeRef.current = 0;
  }, []);

  const startGame = useCallback(() => {
    stateRef.current = createInitialState();
    uiRef.current = { score: 0, combo: 0, gameOver: false, won: false };
    setScore(0);
    setCombo(0);
    setWon(false);
    phaseRef.current = "playing";
    setPhase("playing");
    lastTimeRef.current = 0;
  }, []);

  const tick = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const currentPhase = phaseRef.current;
      const layout = layoutRef.current;

      if (currentPhase === "start") {
        renderStartBackdrop(ctx, layout, time);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (currentPhase === "ended") {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const state = stateRef.current;
      if (!state) return;

      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 16.67 : 1;
      lastTimeRef.current = time;

      if (state.projectile) {
        stepProjectile(state, layout, ringColor);
      }

      updateParticles(state, dt);

      if (state.score !== uiRef.current.score) {
        uiRef.current.score = state.score;
        setScore(state.score);
      }
      if (state.combo !== uiRef.current.combo) {
        uiRef.current.combo = state.combo;
        setCombo(state.combo);
      }
      if (state.gameOver && !uiRef.current.gameOver) {
        uiRef.current.gameOver = true;
        setWon(false);
        phaseRef.current = "ended";
        setPhase("ended");
      }
      if (state.won && !uiRef.current.won) {
        uiRef.current.won = true;
        setWon(true);
        phaseRef.current = "ended";
        setPhase("ended");
      }

      renderGameFrame(ctx, state, layout, logosRef.current, time);
      rafRef.current = requestAnimationFrame(tick);
    },
    [ringColor]
  );

  useEffect(() => {
    if (!ready) return;
    setupCanvas();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, tick, setupCanvas]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        swapBubbleTypes(stateRef.current!);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        returnToStart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [returnToStart]);

  const handlePointer = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (phase !== "playing" || !stateRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas || uiRef.current.gameOver || uiRef.current.won) return;

      const rect = canvas.getBoundingClientRect();
      aimFromPointer(stateRef.current, layoutRef.current, e.clientX, e.clientY, rect);
    },
    [phase]
  );

  const handlePointerUp = useCallback(() => {
    if (phase !== "playing" || !stateRef.current) return;
    shoot(stateRef.current, layoutRef.current);
  }, [phase]);

  const endedMessage = won ? "All cleared!" : "Bubbles reached the line!";

  return (
    <div className="bubble-game-shell relative w-full overflow-hidden rounded-2xl">
      <div className="bubble-game-border pointer-events-none absolute inset-0 rounded-2xl" aria-hidden />

      <div className="relative bg-zinc-950 p-2">
        <div
          className={cn(
            "bubble-game-frame relative mx-auto overflow-hidden rounded-xl",
            phase === "playing" &&
              "flex flex-row flex-nowrap items-stretch gap-0 overflow-visible border border-white/[0.06]"
          )}
          style={{
            width:
              phase === "playing"
                ? `min(100%, ${PLAYFIELD_W + 76}px)`
                : `min(100%, ${PLAYFIELD_W}px)`,
          }}
        >
          <div className="relative shrink-0 overflow-hidden" style={{ width: PLAYFIELD_W, minHeight: PLAYFIELD_H }}>
            <div className="bubble-game-dots pointer-events-none absolute inset-0" aria-hidden />
            <div className="bubble-game-vignette pointer-events-none absolute inset-0" aria-hidden />

            <canvas
              ref={canvasRef}
              width={PLAYFIELD_W}
              height={PLAYFIELD_H}
              className={cn(
                "relative z-[1] mx-auto block touch-none",
                phase === "playing" ? "cursor-crosshair" : "pointer-events-none"
              )}
              onPointerMove={handlePointer}
              onPointerDown={handlePointer}
              onPointerUp={handlePointerUp}
              aria-label="AI bubble shooter game"
            />

            {!ready && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950">
                <span className="text-xs text-zinc-500">Loading…</span>
              </div>
            )}

            {phase === "start" && ready && <StartScreen onStart={startGame} />}

            {phase === "ended" && (
              <motion.div
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="start-card w-full max-w-[min(320px,88%)] rounded-xl bg-[#d9d9d9] px-6 py-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
                    {won ? <Trophy className="h-4 w-4" /> : <Crosshair className="h-4 w-4" />}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-zinc-900">{endedMessage}</h3>
                  <p className="mt-1.5 text-[10px] font-bold uppercase text-zinc-600">Score · {score}</p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="start-card-btn mt-4 w-full rounded-lg bg-[#1c2e2e] py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white hover:bg-[#243838]"
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={returnToStart}
                    className="mt-2 w-full text-[9px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900"
                  >
                    Back to menu
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {phase === "playing" && (
            <aside className="play-rail pointer-events-auto flex w-[76px] shrink-0 flex-col items-center justify-between gap-3 border-l border-white/[0.08] bg-zinc-950/95 py-3 pl-1.5 pr-1">
              <div className="flex flex-col items-center gap-2">
                <AnimatePresence mode="popLayout">
                  {combo > 1 && (
                    <motion.span
                      key="combo"
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-1 py-0.5 text-[7px] font-bold uppercase leading-none text-cyan-200"
                    >
                      <Zap className="mr-0.5 h-2 w-2 shrink-0" aria-hidden />x{combo}
                    </motion.span>
                  )}
                </AnimatePresence>
                <p
                  className={cn(
                    "max-h-[min(200px,calc(100vh-200px))] py-1 text-center text-[8px] font-black uppercase leading-snug tracking-[0.14em] text-transparent [writing-mode:vertical-rl] [text-orientation:mixed]",
                    gameTheme.accentStrong
                  )}
                >
                  AI Bubble Shooter
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 pb-0.5">
                <ScoreBadge score={score} compact />
                <button
                  type="button"
                  onClick={returnToStart}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:text-red-300"
                  aria-label="Stop game"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            </aside>
          )}
        </div>

        {phase === "playing" && (
          <p className="mt-2 text-center text-[8px] font-semibold uppercase tracking-wider text-zinc-600">
            Click · shoot · Space swap · Esc stop
          </p>
        )}
      </div>

      <style jsx>{`
        .bubble-game-shell {

      
        }
        .bubble-game-border {
          padding: 1px;
          background: transparent;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .bubble-game-frame {
          margin-left: auto;
          margin-right: auto;
          min-height: ${PLAYFIELD_H}px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
          background: #070709;
        }
        .bubble-game-dots {
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 12px 12px;
          opacity: 0.45;
        }
        .bubble-game-vignette {
          background: radial-gradient(ellipse 80% 70% at 50% 45%, transparent 35%, rgba(0, 0, 0, 0.5) 100%);
        }
        .start-card {
          border: 2px solid #111;
          outline: 2px solid rgba(255, 255, 255, 0.85);
          outline-offset: -4px;
        }
      `}</style>
    </div>
  );
}
