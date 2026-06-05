"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, RefreshCw, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfettiBurst } from "../ConfettiBurst";
import { gameTheme } from "../game-theme";
import { useHighScore } from "../useHighScore";
import { AI_PUZZLE_IMAGE, PUZZLE_GRID_SIZE } from "./puzzle-images";
import {
  EMPTY_TILE,
  isSolved,
  shuffleTiles,
  slideTile,
  tileBackgroundPosition,
} from "./puzzle-engine";
import { cn } from "@/lib/utils";

type PuzzlePhase = "start" | "playing" | "won";

export function AIPicturePuzzle() {
  const { highScore, updateHighScore } = useHighScore("ai-picture-puzzle");
  const [phase, setPhase] = useState<PuzzlePhase>("start");
  const [tiles, setTiles] = useState<number[]>(() => shuffleTiles());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [wonStats, setWonStats] = useState({ moves: 0, seconds: 0, score: 0 });

  const computeScore = (moveCount: number, timeSeconds: number) =>
    Math.max(100, 1200 - moveCount * 12 - timeSeconds * 4);

  const startGame = useCallback(() => {
    setTiles(shuffleTiles());
    setMoves(0);
    setSeconds(0);
    setShowPreview(false);
    setWonStats({ moves: 0, seconds: 0, score: 0 });
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const handleTileClick = useCallback(
    (index: number) => {
      if (phase !== "playing") return;

      setTiles((current) => {
        const next = slideTile(current, index);
        if (next === current) return current;

        setMoves((moveCount) => {
          const nextMoves = moveCount + 1;

          if (isSolved(next)) {
            setSeconds((timeSeconds) => {
              const score = computeScore(nextMoves, timeSeconds);
              updateHighScore(score);
              setWonStats({ moves: nextMoves, seconds: timeSeconds, score });
              window.setTimeout(() => setPhase("won"), 180);
              return timeSeconds;
            });
          }

          return nextMoves;
        });

        return next;
      });
    },
    [phase, updateHighScore]
  );

  const formatTime = (value: number) => {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <ConfettiBurst active={phase === "won"} />

      {phase === "start" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-4 overflow-hidden rounded-2xl border border-cyan-400/25 shadow-[0_0_32px_rgba(34,211,238,0.15)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AI_PUZZLE_IMAGE.src}
              alt={AI_PUZZLE_IMAGE.alt}
              className="h-36 w-36 object-cover sm:h-44 sm:w-44"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 rounded-full border border-cyan-400/30 bg-zinc-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
              {AI_PUZZLE_IMAGE.title}
            </span>
          </div>

          <h3 className={cn("text-lg font-bold sm:text-xl", gameTheme.accentStrong)}>
            AI Picture Puzzle
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
            Slide the tiles to rebuild the AI artwork. Tap pieces next to the empty slot to move
            them — beat your best time and score.
          </p>

          {highScore > 0 && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Best score · {highScore.toLocaleString()}
            </p>
          )}

          <button type="button" onClick={startGame} className={cn("mt-5", gameTheme.primaryBtnLg)}>
            Start puzzle
          </button>
        </motion.div>
      )}

      {phase === "playing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span>Moves · {moves}</span>
            <span>Time · {formatTime(seconds)}</span>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className={cn("rounded-full px-2.5 py-1 transition", gameTheme.chip)}
            >
              {showPreview ? "Hide" : "Preview"}
            </button>
          </div>

          <div className="relative mx-auto w-full max-w-[min(100%,340px)]">
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="absolute inset-0 z-20 overflow-hidden rounded-xl border border-cyan-400/40 bg-zinc-950/90 p-1 backdrop-blur-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={AI_PUZZLE_IMAGE.src}
                    alt="Puzzle preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="grid gap-1 rounded-xl border border-white/10 bg-zinc-900/50 p-1"
              style={{
                gridTemplateColumns: `repeat(${PUZZLE_GRID_SIZE}, minmax(0, 1fr))`,
                aspectRatio: "1 / 1",
              }}
            >
              {tiles.map((tileValue, index) => {
                const isEmpty = tileValue === EMPTY_TILE;

                return (
                  <button
                    key={`${index}-${tileValue}`}
                    type="button"
                    disabled={isEmpty}
                    onClick={() => handleTileClick(index)}
                    aria-label={isEmpty ? "Empty slot" : `Tile ${tileValue + 1}`}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-md transition-transform active:scale-[0.97]",
                      isEmpty
                        ? "cursor-default bg-zinc-950/40 ring-1 ring-inset ring-white/5"
                        : "cursor-pointer ring-1 ring-inset ring-white/15 hover:ring-cyan-400/50"
                    )}
                    style={
                      isEmpty
                        ? undefined
                        : {
                            backgroundImage: `url(${AI_PUZZLE_IMAGE.src})`,
                            backgroundSize: `${PUZZLE_GRID_SIZE * 100}% ${PUZZLE_GRID_SIZE * 100}%`,
                            backgroundPosition: tileBackgroundPosition(tileValue),
                          }
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button type="button" onClick={startGame} className={cn(gameTheme.secondaryBtn, "text-xs")}>
              <RefreshCw className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              Shuffle
            </button>
          </div>
        </motion.div>
      )}

      {phase === "won" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-4 text-center"
        >
          <div className={cn("mb-3 rounded-full p-3", gameTheme.glowViolet, "bg-violet-500/15")}>
            <Trophy className="h-6 w-6 text-fuchsia-300" aria-hidden />
          </div>
          <h3 className={cn("text-lg font-bold", gameTheme.accentStrong)}>Puzzle solved!</h3>
          <p className="mt-2 text-sm text-zinc-400">
            {wonStats.moves} moves in {formatTime(wonStats.seconds)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Score · {wonStats.score.toLocaleString()}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={startGame} className={gameTheme.primaryBtn}>
              Play again
            </button>
            <button
              type="button"
              onClick={() => setPhase("start")}
              className={gameTheme.ghostBtn}
            >
              Back
            </button>
          </div>
        </motion.div>
      )}

      {phase !== "start" && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
          <ImageIcon className="h-3 w-3" aria-hidden />
          {AI_PUZZLE_IMAGE.title}
        </p>
      )}
    </div>
  );
}
