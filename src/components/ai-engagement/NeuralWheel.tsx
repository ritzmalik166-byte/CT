"use client";

import { motion } from "framer-motion";
import { WHEEL_SEGMENTS } from "./types";
import { cn } from "@/lib/utils";

const SEGMENT_DEG = 360 / WHEEL_SEGMENTS.length;
const COLORS = ["#AE8C20", "#C9A730", "#8B6914", "#D4AF37", "#6B5410"];

interface NeuralWheelProps {
  rotation: number;
  spinning: boolean;
  highlightIndex?: number;
}

export function NeuralWheel({ rotation, spinning, highlightIndex }: NeuralWheelProps) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px] sm:max-w-[260px]">
      <div className="absolute inset-0 rounded-full bg-[#AE8C20]/20 blur-xl" />

      <motion.div
        className="relative h-full w-full rounded-full border-2 border-[#AE8C20]/50 shadow-[0_0_40px_rgba(174,140,32,0.25)]"
        animate={{ rotate: rotation }}
        transition={
          spinning
            ? { duration: 3.2, ease: [0.12, 0.8, 0.2, 1] }
            : { duration: 0.3, ease: "easeOut" }
        }
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {WHEEL_SEGMENTS.map((seg, i) => {
            const start = i * SEGMENT_DEG - 90;
            const end = start + SEGMENT_DEG;
            const startRad = (start * Math.PI) / 180;
            const endRad = (end * Math.PI) / 180;
            const x1 = 100 + 92 * Math.cos(startRad);
            const y1 = 100 + 92 * Math.sin(startRad);
            const x2 = 100 + 92 * Math.cos(endRad);
            const y2 = 100 + 92 * Math.sin(endRad);
            const largeArc = SEGMENT_DEG > 180 ? 1 : 0;
            const mid = start + SEGMENT_DEG / 2;
            const midRad = (mid * Math.PI) / 180;
            const tx = 100 + 58 * Math.cos(midRad);
            const ty = 100 + 58 * Math.sin(midRad);

            return (
              <g key={seg.type}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 92 92 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={highlightIndex === i ? 1 : 0.85}
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#0a0a0a"
                  fontSize="9"
                  fontWeight="700"
                  transform={`rotate(${mid + 90}, ${tx}, ${ty})`}
                >
                  {seg.shortLabel}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="22" fill="#0a0a0a" stroke="#AE8C20" strokeWidth="2" />
          <circle cx="100" cy="100" r="8" fill="#AE8C20" />
        </svg>
      </motion.div>

      {/* Pointer */}
      <div
        className={cn(
          "absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1",
          "h-0 w-0 border-x-[10px] border-b-[18px] border-x-transparent border-b-[#D4AF37]",
          "drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        )}
        aria-hidden
      />
    </div>
  );
}

export function rotationForSegment(segmentIndex: number, extraSpins = 4) {
  const centerOffset = segmentIndex * SEGMENT_DEG + SEGMENT_DEG / 2;
  return extraSpins * 360 + (360 - centerOffset);
}
