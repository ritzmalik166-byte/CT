"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { GAME_CONFETTI } from "./game-theme";

export function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 280,
        y: (Math.random() - 0.5) * 200 - 40,
        rotate: Math.random() * 360,
        color: GAME_CONFETTI[i % GAME_CONFETTI.length],
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.15,
      })),
    []
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            rotate: p.rotate,
            scale: [0, 1, 0.6],
          }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
