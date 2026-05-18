"use client";

import { useId } from "react";

const PHRASE =
  "Grow Brand Ritz Gen AI Storytelling Studio Grow Brand Ritz Gen AI Storytelling Studio • ";

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
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 100 100"
        className={
          reducedMotion ? "h-full w-full" : "h-full w-full animate-spin-slow"
        }
        fill="none"
        style={{ transformOrigin: "50% 50%" }}
      >
        <defs>
          <path
            id={pathId}
            fill="transparent"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text className="fill-[#333333] font-sans text-[10px] font-bold md:text-[8px]">
          <textPath href={`#${pathId}`} startOffset="0%">
            {PHRASE}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
