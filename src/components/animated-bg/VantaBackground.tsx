"use client";

import { useEffect, useRef } from "react";

type VantaEffect = {
  destroy: () => void;
  resize?: () => void;
};

declare global {
  interface Window {
    THREE?: any;
  }
}

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const loadScript = (
      src: string
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(
          `script[src="${src}"]`
        );

        if (existing) {
          if (window.THREE) {
            resolve();
          } else {
            existing.addEventListener(
              "load",
              () => resolve(),
              { once: true }
            );

            existing.addEventListener(
              "error",
              () =>
                reject(
                  new Error(`Failed to load ${src}`)
                ),
              { once: true }
            );
          }

          return;
        }

        script = document.createElement("script");
        script.src = src;
        script.async = true;

        script.onload = () => resolve();

        script.onerror = () =>
          reject(
            new Error(`Failed to load ${src}`)
          );

        document.head.appendChild(script);
      });
    };

    const loadVanta = async () => {
      if (!vantaRef.current) return;

      try {
        // Load Three.js r134 specifically for Vanta.
        await loadScript(
          "/vendor/three.r134.min.js"
        );

        if (cancelled || !vantaRef.current) {
          return;
        }

        if (!window.THREE) {
          throw new Error(
            "Three.js r134 failed to load."
          );
        }

        const module = await import(
          "vanta/dist/vanta.birds.min"
        );

        const BIRDS = module.default;

        if (!BIRDS) {
          throw new Error(
            "Vanta Birds module failed to load."
          );
        }

        if (cancelled || !vantaRef.current) {
          return;
        }

        vantaEffect.current = BIRDS({
          el: vantaRef.current,

          THREE: window.THREE,

          mouseControls: true,
          touchControls: true,
          gyroControls: false,

          minHeight: 200,
          minWidth: 200,

          scale: 1,
          scaleMobile: 1,

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
        console.error(
          "Vanta Birds failed to initialize:",
          error
        );
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