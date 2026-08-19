"use client";

import { useEffect, useRef } from "react";

type VantaEffect = {
  destroy: () => void;
  resize?: () => void;
};

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadVanta = async () => {
      if (!vantaRef.current) return;

      try {
        // IMPORTANT:
        // Vanta Birds needs a compatible Three.js version.
        const THREE = await import("three");
        const { default: BIRDS } = await import(
          "vanta/dist/vanta.birds.min"
        );

        if (cancelled || !vantaRef.current) return;

        vantaEffect.current = BIRDS({
          el: vantaRef.current,

          THREE,

          mouseControls: true,
          touchControls: true,
          gyroControls: false,

          minHeight: 200,
          minWidth: 200,

          scale: 1,
          scaleMobile: 1,

          // Screenshot settings
          backgroundColor: 0xffffff,

          color1: 0xc0de22,
          color2: 0xd0e32e,

          colorMode: "varianceGradient",

          quantity: 5,
          birdSize: 1,
          wingSpan: 30,

          speedLimit: 5,

          separation: 20,
          alignment: 20,
          cohesion: 20,
        });
      } catch (error) {
        console.error("Vanta Birds failed to initialize:", error);
      }
    };

    loadVanta();

    return () => {
      cancelled = true;

      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}