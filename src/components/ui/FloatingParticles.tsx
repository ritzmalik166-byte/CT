"use client";

import { useEffect, useState, type RefObject } from "react";
import Antigravity from "./Antigravity";

interface FloatingParticlesProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  mouseRadius?: number;
  attractStrength?: number;
  speed?: number;
  /** Stop rendering when the root leaves the viewport (saves GPU during long desktop scroll). */
  pauseWhenOffscreen?: boolean;
  visibilityRoot?: RefObject<Element | null>;
}

const GOLD = "#AE8C20";

export function FloatingParticles({
  className = "",
  particleCount = 300,
  colors = [GOLD],
  mouseRadius = 200,
  attractStrength = 1.2,
  speed = 0.4,
  pauseWhenOffscreen = false,
  visibilityRoot,
}: FloatingParticlesProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!pauseWhenOffscreen || !visibilityRoot?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { root: null, rootMargin: "120px 0px", threshold: 0 }
    );

    observer.observe(visibilityRoot.current);

    return () => observer.disconnect();
  }, [pauseWhenOffscreen, visibilityRoot]);

  if (pauseWhenOffscreen && !isVisible) {
    return null;
  }

  const color = colors[0] ?? GOLD;
  const magnetRadius = Math.max(4, Math.min(12, mouseRadius / 30));
  const fieldStrength = Math.max(6, Math.min(14, attractStrength * 8));

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <Antigravity
        count={particleCount}
        magnetRadius={magnetRadius}
        ringRadius={7}
        waveSpeed={speed}
        waveAmplitude={1}
        particleSize={1.5}
        lerpSpeed={0.14}
        mouseFollowSpeed={0.14}
        color={color}
        autoAnimate
        particleVariance={1}
        rotationSpeed={0}
        depthFactor={1}
        pulseSpeed={3}
        particleShape="capsule"
        fieldStrength={fieldStrength}
      />
    </div>
  );
}
