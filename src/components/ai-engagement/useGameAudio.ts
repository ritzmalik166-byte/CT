"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ct-ai-puzzle-sound";

let sharedCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

function playTone(
  freq: number,
  durationMs: number,
  volume = 0.08,
  type: OscillatorType = "sine"
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
    osc.stop(now + durationMs / 1000);
  } catch {
    /* ignore */
  }
}

export function useGameAudio() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const spinTimerRef = useRef<number | null>(null);
  const spinActiveRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) setSoundEnabled(raw === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const stopWheelSpin = useCallback(() => {
    spinActiveRef.current = false;
    if (spinTimerRef.current !== null) {
      window.clearTimeout(spinTimerRef.current);
      spinTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopWheelSpin(), [stopWheelSpin]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      if (!next) stopWheelSpin();
      return next;
    });
  }, [stopWheelSpin]);

  const playTap = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    playTone(920, 45, 0.09, "triangle");
    window.setTimeout(() => playTone(640, 35, 0.05, "triangle"), 30);
  }, [soundEnabled]);

  const playGo = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    playTone(523, 90, 0.1, "square");
    window.setTimeout(() => playTone(784, 120, 0.08, "square"), 85);
  }, [soundEnabled]);

  const playSpinTick = useCallback(
    (pitch = 440) => {
      if (!soundEnabled || !spinActiveRef.current) return;
      playTone(pitch, 55, 0.06, "triangle");
    },
    [soundEnabled]
  );

  const playSpinLand = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    playTone(330, 140, 0.1, "sine");
    window.setTimeout(() => playTone(660, 180, 0.08, "sine"), 100);
  }, [soundEnabled]);

  const startWheelSpin = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    stopWheelSpin();
    spinActiveRef.current = true;

    playTone(220, 160, 0.07, "sawtooth");
    playTone(180, 2800, 0.025, "sine");

    let tick = 0;
    const maxTicks = 22;
    const scheduleTick = () => {
      if (!spinActiveRef.current || tick >= maxTicks) return;
      const progress = tick / maxTicks;
      const pitch = 520 + progress * 280;
      playSpinTick(pitch);
      tick += 1;
      const delay = 90 + progress * 110;
      spinTimerRef.current = window.setTimeout(scheduleTick, delay);
    };
    scheduleTick();
  }, [playSpinTick, soundEnabled, stopWheelSpin]);

  const endWheelSpin = useCallback(() => {
    stopWheelSpin();
    playSpinLand();
  }, [playSpinLand, stopWheelSpin]);

  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    playTone(880, 120);
    window.setTimeout(() => playTone(1175, 140, 0.06), 90);
  }, [soundEnabled]);

  const playWrong = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    playTone(220, 180, 0.07);
  }, [soundEnabled]);

  const playWin = useCallback(() => {
    if (!soundEnabled) return;
    getAudioContext();
    playTone(660, 100);
    window.setTimeout(() => playTone(880, 100, 0.07), 100);
    window.setTimeout(() => playTone(1100, 160, 0.06), 200);
  }, [soundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    playTap,
    playGo,
    startWheelSpin,
    endWheelSpin,
    playCorrect,
    playWrong,
    playWin,
  };
}

export type GameAudioHandlers = Pick<
  ReturnType<typeof useGameAudio>,
  "playTap" | "playGo"
>;
