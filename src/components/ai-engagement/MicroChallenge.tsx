"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveChallenge } from "./types";
import type { GameAudioHandlers } from "./useGameAudio";
import { cn } from "@/lib/utils";

interface MicroChallengeProps {
  challenge: ActiveChallenge;
  onComplete: (success: boolean, bonus?: number) => void;
  audio?: GameAudioHandlers;
}

export function MicroChallenge({ challenge, onComplete, audio }: MicroChallengeProps) {
  switch (challenge.kind) {
    case "tap":
      return <TapRushChallenge onComplete={onComplete} audio={audio} />;
    case "reaction":
      return <ReactionBeatChallenge onComplete={onComplete} audio={audio} />;
    case "truefalse":
      return (
        <TrueFalseChallenge challenge={challenge} onComplete={onComplete} audio={audio} />
      );
    case "prompt":
      return <PromptChallenge challenge={challenge} onComplete={onComplete} audio={audio} />;
    case "aihuman":
      return <AiHumanChallenge challenge={challenge} onComplete={onComplete} audio={audio} />;
  }
}

function TrueFalseChallenge({
  challenge,
  onComplete,
  audio,
}: {
  challenge: Extract<ActiveChallenge, { kind: "truefalse" }>;
  onComplete: MicroChallengeProps["onComplete"];
  audio?: GameAudioHandlers;
}) {
  const [picked, setPicked] = useState<boolean | null>(null);

  const pick = (value: boolean) => {
    if (picked !== null) return;
    audio?.playTap();
    setPicked(value);
    window.setTimeout(() => onComplete(value === challenge.answer), 600);
  };

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#AE8C20]">
        True or False
      </p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-200">{challenge.statement}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[true, false].map((val) => (
          <button
            key={String(val)}
            type="button"
            disabled={picked !== null}
            onClick={() => pick(val)}
            className={cn(
              "rounded-xl border py-3 text-sm font-bold transition",
              picked === val &&
                val === challenge.answer &&
                "border-emerald-400/70 bg-emerald-500/15 text-emerald-200",
              picked === val &&
                val !== challenge.answer &&
                "border-red-400/70 bg-red-500/15 text-red-200",
              picked === null &&
                "border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:border-[#AE8C20]/50"
            )}
          >
            {val ? "True" : "False"}
          </button>
        ))}
      </div>
    </div>
  );
}

function PromptChallenge({
  challenge,
  onComplete,
  audio,
}: {
  challenge: Extract<ActiveChallenge, { kind: "prompt" }>;
  onComplete: MicroChallengeProps["onComplete"];
  audio?: GameAudioHandlers;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#AE8C20]">
        Best Prompt
      </p>
      <p className="mt-2 text-sm text-zinc-300">{challenge.scenario}</p>
      <div className="mt-4 space-y-2">
        {challenge.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={picked !== null}
            onClick={() => {
              if (picked !== null) return;
              audio?.playTap();
              setPicked(i);
              window.setTimeout(
                () => onComplete(i === challenge.answerIndex, i === challenge.answerIndex ? 30 : 0),
                700
              );
            }}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-relaxed transition sm:text-sm",
              picked === i &&
                i === challenge.answerIndex &&
                "border-emerald-400/70 bg-emerald-500/15 text-emerald-100",
              picked === i &&
                i !== challenge.answerIndex &&
                "border-red-400/70 bg-red-500/15 text-red-100",
              picked === null &&
                "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-[#AE8C20]/45"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function AiHumanChallenge({
  challenge,
  onComplete,
  audio,
}: {
  challenge: Extract<ActiveChallenge, { kind: "aihuman" }>;
  onComplete: MicroChallengeProps["onComplete"];
  audio?: GameAudioHandlers;
}) {
  const [picked, setPicked] = useState<"ai" | "human" | null>(null);

  const pick = (value: "ai" | "human") => {
    if (picked) return;
    audio?.playTap();
    setPicked(value);
    window.setTimeout(() => onComplete(value === challenge.answer, 20), 700);
  };

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#AE8C20]">
        AI or Human?
      </p>
      <blockquote className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm italic text-zinc-200">
        &ldquo;{challenge.text}&rdquo;
      </blockquote>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {(["ai", "human"] as const).map((val) => (
          <button
            key={val}
            type="button"
            disabled={picked !== null}
            onClick={() => pick(val)}
            className={cn(
              "rounded-xl border py-3 text-sm font-bold capitalize transition",
              picked === val &&
                val === challenge.answer &&
                "border-emerald-400/70 bg-emerald-500/15 text-emerald-200",
              picked === val &&
                val !== challenge.answer &&
                "border-red-400/70 bg-red-500/15 text-red-200",
              picked === null &&
                "border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:border-[#AE8C20]/50"
            )}
          >
            {val === "ai" ? "AI" : "Human"}
          </button>
        ))}
      </div>
    </div>
  );
}

function TapRushChallenge({
  onComplete,
  audio,
}: {
  onComplete: MicroChallengeProps["onComplete"];
  audio?: GameAudioHandlers;
}) {
  const [phase, setPhase] = useState<"wait" | "go" | "done">("wait");
  const goAt = useRef(0);

  useEffect(() => {
    const delay = 1200 + Math.random() * 2200;
    const t = window.setTimeout(() => {
      goAt.current = performance.now();
      audio?.playGo();
      setPhase("go");
    }, delay);
    return () => window.clearTimeout(t);
  }, [audio]);

  const tap = useCallback(() => {
    if (phase === "done") return;
    audio?.playTap();
    if (phase === "wait") {
      setPhase("done");
      onComplete(false);
      return;
    }
    setPhase("done");
    const ms = performance.now() - goAt.current;
    onComplete(ms <= 550, ms <= 300 ? 50 : ms <= 550 ? 20 : 0);
  }, [audio, onComplete, phase]);

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#AE8C20]">
        Tap Rush
      </p>
      <p className="mt-2 text-sm text-zinc-400">Wait for GO — then tap instantly.</p>
      <button
        type="button"
        onClick={tap}
        disabled={phase === "done"}
        className={cn(
          "mt-6 flex h-28 w-full flex-col items-center justify-center rounded-2xl border-2 text-lg font-bold transition",
          phase === "wait" && "border-zinc-700 bg-zinc-900/80 text-zinc-500",
          phase === "go" &&
            "border-[#AE8C20] bg-[#AE8C20]/20 text-[#D4AF37] shadow-[0_0_40px_rgba(174,140,32,0.35)] animate-pulse",
          phase === "done" && "border-zinc-800 bg-zinc-900/50 text-zinc-600"
        )}
      >
        {phase === "wait" ? "Wait…" : phase === "go" ? "GO! TAP!" : "Done"}
      </button>
    </div>
  );
}

function ReactionBeatChallenge({
  onComplete,
  audio,
}: {
  onComplete: MicroChallengeProps["onComplete"];
  audio?: GameAudioHandlers;
}) {
  const [phase, setPhase] = useState<"idle" | "gold" | "done">("idle");
  const goldAt = useRef(0);

  useEffect(() => {
    let missTimer: number | undefined;
    const delay = 1500 + Math.random() * 2500;
    const startTimer = window.setTimeout(() => {
      goldAt.current = performance.now();
      audio?.playGo();
      setPhase("gold");
      missTimer = window.setTimeout(() => {
        setPhase((current) => {
          if (current === "gold") {
            onComplete(false);
            return "done";
          }
          return current;
        });
      }, 900);
    }, delay);
    return () => {
      window.clearTimeout(startTimer);
      if (missTimer) window.clearTimeout(missTimer);
    };
  }, [audio, onComplete]);

  const tap = () => {
    if (phase === "done") return;
    audio?.playTap();
    if (phase === "idle") {
      setPhase("done");
      onComplete(false);
      return;
    }
    setPhase("done");
    const ms = performance.now() - goldAt.current;
    onComplete(ms <= 700, ms <= 350 ? 40 : 0);
  };

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#AE8C20]">
        Reaction Beat
      </p>
      <p className="mt-2 text-sm text-zinc-400">Tap when the core turns gold.</p>
      <button
        type="button"
        onClick={tap}
        disabled={phase === "done"}
        className="mt-6 flex w-full flex-col items-center gap-4"
      >
        <motion.div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full border-4",
            phase === "gold"
              ? "border-[#D4AF37] bg-[#AE8C20]/40 shadow-[0_0_50px_rgba(174,140,32,0.6)]"
              : "border-zinc-700 bg-zinc-900/80"
          )}
          animate={phase === "idle" ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.2, repeat: phase === "idle" ? Infinity : 0 }}
        >
          <span className="text-2xl">{phase === "gold" ? "⚡" : "◎"}</span>
        </motion.div>
        <span className="text-xs text-zinc-500">
          {phase === "done" ? "Round complete" : "Watch the signal…"}
        </span>
      </button>
    </div>
  );
}
