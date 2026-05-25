"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { AIMascot } from "./AIMascot";
import { ConfettiBurst } from "./ConfettiBurst";
import { MicroChallenge } from "./MicroChallenge";
import { NeuralWheel, rotationForSegment } from "./NeuralWheel";
import {
  createChallenge,
  resetChallengePools,
  scoreForChallenge,
} from "./wheel-challenges";
import {
  MAX_LIVES,
  TOTAL_SPINS,
  WHEEL_SEGMENTS,
  type ActiveChallenge,
  type GamePhase,
  type RoundResult,
} from "./types";
import { useGameAudio } from "./useGameAudio";
import { useHighScore } from "./useHighScore";
import { cn } from "@/lib/utils";

export function NeuralWheelGame() {
  const { highScore, updateHighScore } = useHighScore();
  const {
    soundEnabled,
    toggleSound,
    playTap,
    playGo,
    startWheelSpin,
    endWheelSpin,
    playCorrect,
    playWrong,
    playWin,
  } = useGameAudio();

  const challengeAudio = useMemo(
    () => ({ playTap, playGo }),
    [playTap, playGo]
  );

  const [phase, setPhase] = useState<GamePhase>("start");
  const [spinIndex, setSpinIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [landedSegment, setLandedSegment] = useState<number | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(
    null
  );
  const [feedback, setFeedback] = useState<RoundResult | null>(null);

  const resetGame = useCallback(() => {
    resetChallengePools();
    setSpinIndex(0);
    setScore(0);
    setStreak(0);
    setLives(MAX_LIVES);
    setWheelRotation(0);
    setLandedSegment(null);
    setActiveChallenge(null);
    setFeedback(null);
    setPhase("spinning");
  }, []);

  const startSpin = useCallback(() => {
    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const baseRotation = wheelRotation % 360;
    const target = wheelRotation - baseRotation + rotationForSegment(segmentIndex, 4 + spinIndex);

    playTap();
    startWheelSpin();
    setLandedSegment(segmentIndex);
    setPhase("spinning");
    setWheelRotation(target);
    setFeedback(null);
    setActiveChallenge(null);

    window.setTimeout(() => {
      endWheelSpin();
      const type = WHEEL_SEGMENTS[segmentIndex].type;
      setActiveChallenge(createChallenge(type));
      setPhase("challenge");
    }, 3200);
  }, [
    endWheelSpin,
    playTap,
    spinIndex,
    startWheelSpin,
    wheelRotation,
  ]);

  const handleChallengeComplete = useCallback(
    (success: boolean, bonus = 0) => {
      let remainingLives = lives;

      if (success) {
        const gained = scoreForChallenge(spinIndex, streak, bonus);
        setScore((s) => {
          const next = s + gained;
          updateHighScore(next);
          return next;
        });
        setStreak((s) => s + 1);
        playCorrect();
      } else {
        remainingLives = lives - 1;
        setStreak(0);
        setLives(remainingLives);
        playWrong();
      }

      setFeedback(success ? "correct" : "wrong");
      setPhase("feedback");

      window.setTimeout(() => {
        if (!success && remainingLives <= 0) {
          setPhase("gameover");
          return;
        }

        const nextSpin = spinIndex + 1;
        if (nextSpin >= TOTAL_SPINS) {
          setScore((s) => {
            updateHighScore(s);
            return s;
          });
          playWin();
          setPhase("victory");
          return;
        }

        setSpinIndex(nextSpin);
        setFeedback(null);
        setActiveChallenge(null);
        setLandedSegment(null);
        setPhase("spinning");
      }, 1200);
    },
    [lives, playCorrect, playWrong, playWin, spinIndex, streak, updateHighScore]
  );

  const segmentLabel =
    landedSegment !== null ? WHEEL_SEGMENTS[landedSegment].label : null;

  return (
    <div className="relative flex min-h-[min(72vh,520px)] flex-col">
      <ConfettiBurst active={phase === "victory"} />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AIMascot size="sm" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#AE8C20]">
              Neural Wheel
            </p>
            <p className="text-[11px] text-zinc-400">High score: {highScore}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-[#AE8C20]/50 hover:text-[#D4AF37]"
          aria-pressed={soundEnabled}
        >
          Sound {soundEnabled ? "On" : "Off"}
        </button>
      </div>

      {(phase === "spinning" ||
        phase === "challenge" ||
        phase === "feedback") && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <span>
            Spin {Math.min(spinIndex + 1, TOTAL_SPINS)}/{TOTAL_SPINS}
          </span>
          <span>Score {score}</span>
          <span>Streak {streak}</span>
          <span className="flex gap-1" aria-label={`${lives} lives`}>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i < lives ? "bg-[#AE8C20]" : "bg-zinc-700"
                )}
              />
            ))}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <AIMascot size="lg" />
            <h3 className="mt-5 text-2xl font-bold text-white">Spin the Neural Wheel</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
              Complete {TOTAL_SPINS} spins to beat the AI. Each spin unlocks a
              random micro-challenge — tap tests, prompts, true/false, and more.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setPhase("instructions")}
                className="rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-400"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] px-6 py-2.5 text-sm font-bold text-zinc-950 shadow-[0_8px_28px_rgba(174,140,32,0.35)]"
              >
                Start spinning
              </button>
            </div>
          </motion.div>
        )}

        {phase === "instructions" && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col"
          >
            <h3 className="text-lg font-bold text-white">How to play</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              <li className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                Tap <strong className="text-[#D4AF37]">Spin</strong> to launch the
                neural wheel.
              </li>
              <li className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                Complete the mini-challenge that lands — each type tests a
                different AI skill.
              </li>
              <li className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                Finish all {TOTAL_SPINS} spins before you lose {MAX_LIVES} lives
                to beat the AI.
              </li>
            </ul>
            <button
              type="button"
              onClick={resetGame}
              className="mt-auto rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] px-6 py-3 text-sm font-bold text-zinc-950"
            >
              Spin now
            </button>
          </motion.div>
        )}

        {(phase === "spinning" || phase === "challenge" || phase === "feedback") && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col"
          >
            {phase === "spinning" && !activeChallenge && (
              <>
                <NeuralWheel
                  rotation={wheelRotation}
                  spinning={landedSegment !== null}
                  highlightIndex={landedSegment ?? undefined}
                />
                <p className="mt-4 text-center text-sm text-zinc-400">
                  {landedSegment !== null
                    ? `Challenge: ${segmentLabel}`
                    : "Spin to reveal your next AI challenge"}
                </p>
                <button
                  type="button"
                  onClick={startSpin}
                  disabled={landedSegment !== null}
                  className="mx-auto mt-5 rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] px-8 py-3 text-sm font-bold text-zinc-950 shadow-[0_8px_28px_rgba(174,140,32,0.35)] transition hover:brightness-110 disabled:opacity-50"
                >
                  {landedSegment !== null ? "Spinning…" : "Spin the wheel"}
                </button>
              </>
            )}

            {(phase === "challenge" || phase === "feedback") && activeChallenge && (
              <div className="flex flex-1 flex-col">
                {segmentLabel && (
                  <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-[#AE8C20]">
                    {segmentLabel}
                  </p>
                )}
                <MicroChallenge
                  challenge={activeChallenge}
                  onComplete={phase === "challenge" ? handleChallengeComplete : () => {}}
                  audio={challengeAudio}
                />
                {phase === "feedback" && feedback && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-4 text-center text-sm font-semibold",
                      feedback === "correct" ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {feedback === "correct"
                      ? "Challenge cleared — AI impressed!"
                      : "Missed — neural sync lost"}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {phase === "victory" && (
          <motion.div
            key="victory"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <div className="rounded-full bg-[#AE8C20]/20 p-4 shadow-[0_0_40px_rgba(174,140,32,0.35)]">
              <AIMascot size="lg" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">You beat the AI!</h3>
            <p className="mt-2 text-sm text-zinc-400">
              All {TOTAL_SPINS} spins complete · Score{" "}
              <span className="font-bold text-[#D4AF37]">{score}</span>
            </p>
            <button
              type="button"
              onClick={() => setPhase("start")}
              className="mt-6 rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] px-6 py-2.5 text-sm font-bold text-zinc-950"
            >
              Spin again
            </button>
          </motion.div>
        )}

        {phase === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <AIMascot size="lg" />
            <h3 className="mt-4 text-2xl font-bold text-white">AI wins this round</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Score {score} · Best {highScore}
            </p>
            <button
              type="button"
              onClick={() => setPhase("start")}
              className="mt-6 rounded-full border border-[#AE8C20]/50 px-6 py-2.5 text-sm font-semibold text-[#D4AF37]"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
