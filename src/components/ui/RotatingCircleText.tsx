"use client";

import Image from "next/image";
import { useId } from "react";

const PHRASE = "Brand Films • AI Storytelling • AI Visuals •";

/** Circle path radius in SVG user units (viewBox 0–100). */
const PATH_RADIUS = 29;
const PATH_LENGTH = 2 * Math.PI * PATH_RADIUS;

type RotatingCircleTextProps = {
  className?: string;
  reducedMotion?: boolean | null;
};

export function RotatingCircleText({
  className,
  reducedMotion,
}: RotatingCircleTextProps) {
  const rawId = useId().replace(/:/g, "");
  const pathId = `circle-path-${rawId}`;

  return (
    <div
      className={[
        "reveal-circle-badge relative isolate aspect-square shrink-0 overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        className={[
          "absolute inset-0 size-full",
          reducedMotion ? "" : "animate-spin-slow",
        ]
          .filter(Boolean)
          .join(" ")}
        fill="none"
        aria-hidden
      >
        <defs>
          <path
            id={pathId}
            fill="none"
            d={`M 50,50 m -${PATH_RADIUS},0 a ${PATH_RADIUS},${PATH_RADIUS} 0 1,1 ${PATH_RADIUS * 2},0 a ${PATH_RADIUS},${PATH_RADIUS} 0 1,1 -${PATH_RADIUS * 2},0`}
          />
        </defs>
        <text
          fill="#333333"
          fontFamily="var(--font-satoshi), system-ui, sans-serif"
          fontSize="5.1"
          fontWeight="500"
          letterSpacing="0.32"
          textLength={PATH_LENGTH}
          lengthAdjust="spacing"
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            {PHRASE}
          </textPath>
        </text>
      </svg>

      <div className="pointer-events-none absolute inset-0 z-[1] grid place-items-center">
        <Image
          src="/assets/social-marketing.gif"
          alt=""
          width={44}
          height={44}
          unoptimized
          className="expert-badge-gif-golden size-[42%] min-h-0 min-w-0 object-contain"
        />
      </div>
    </div>
  );
}
