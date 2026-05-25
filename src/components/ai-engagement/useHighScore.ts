"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ct-ai-wheel-high-score";

export function useHighScore() {
  const [highScore, setHighScoreState] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHighScoreState(Number.parseInt(raw, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const updateHighScore = useCallback((score: number) => {
    setHighScoreState((prev) => {
      if (score <= prev) return prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
      } catch {
        /* ignore */
      }
      return score;
    });
  }, []);

  return { highScore, updateHighScore };
}
