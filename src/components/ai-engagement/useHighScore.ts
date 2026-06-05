"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_STORAGE_KEY = "ct-ai-wheel-high-score";

export function useHighScore(storageKey = DEFAULT_STORAGE_KEY) {
  const [highScore, setHighScoreState] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setHighScoreState(Number.parseInt(raw, 10) || 0);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const updateHighScore = useCallback(
    (score: number) => {
      setHighScoreState((prev) => {
        if (score <= prev) return prev;
        try {
          localStorage.setItem(storageKey, String(score));
        } catch {
          /* ignore */
        }
        return score;
      });
    },
    [storageKey]
  );

  return { highScore, updateHighScore };
}
