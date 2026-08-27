"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";

export interface LogoItem {
  id: string;
  name: string;
  colorLogo: string;
  description?: string;
  simpleLogo?: string;
}

export interface LogosSectionProps {
  logos?: LogoItem[];
  speed?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}

const DEFAULT_LOGOS: LogoItem[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    colorLogo: "/logos/chatgpt-colors.png",
    description: "Advanced conversational AI assistant developed by OpenAI for text generation, coding, and reasoning.",
  },
  {
    id: "claude",
    name: "Claude",
    colorLogo: "/logos/claude-color.png",
    description: "Next-generation AI assistant built by Anthropic with powerful reasoning and deep analysis capabilities.",
  },
  {
    id: "copilot",
    name: "Copilot",
    colorLogo: "/logos/copilot-colors.png",
    description: "Microsoft's AI companion designed to boost productivity across coding, work, and creativity.",
  },
  {
    id: "gemini",
    name: "Gemini",
    colorLogo: "/logos/gemini-color.png",
    description: "Google's multimodal AI model capable of seamlessly understanding text, code, images, audio, and video.",
  },
  {
    id: "grok",
    name: "Grok",
    colorLogo: "/logos/grok-color.png",
    description: "Real-time AI assistant built by xAI with direct access to current global information and insights.",
  },
  {
    id: "pika",
    name: "Pika",
    colorLogo: "/logos/pika-colors.png",
    description: "AI-powered video generation platform that creates stunning videos from text and images.",
  },
];

export default function LogosSection({
  logos = DEFAULT_LOGOS,
  speed = 0.0025,
  className = "",
  title = "Trusted by innovative teams worldwide",
  subtitle,
}: LogosSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logoNormAngleRef = useRef<number[]>([]);
  const isHoveredRef = useRef(false);

  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [typewriterText, setTypewriterText] = useState<string>("");

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive item count to manage clean logo gaps specifically on mobile and tablet
  const displayLogos = useMemo(() => {
    if (!logos || logos.length === 0) return [];
    let minItems = 12;
    if (windowWidth < 1024) {
      minItems = 6; // 6 items for mobile and tablet guarantees zero logo overlap
    }
    const repeatCount = Math.max(1, Math.ceil(minItems / logos.length));
    const items: LogoItem[] = [];
    for (let i = 0; i < repeatCount; i++) {
      items.push(...logos);
    }
    return items;
  }, [logos, windowWidth]);

  // Typewriter effect when hovering over a logo
  useEffect(() => {
    if (!hoveredKey) {
      setTypewriterText("");
      return;
    }

    const logoIndex = displayLogos.findIndex((logo, idx) => `${logo.id}-${idx}` === hoveredKey);
    if (logoIndex === -1) return;

    const fullDescription = displayLogos[logoIndex]?.description || "";
    let charIndex = 0;
    setTypewriterText("");

    const timer = setInterval(() => {
      if (charIndex < fullDescription.length) {
        charIndex++;
        setTypewriterText(fullDescription.slice(0, charIndex));
      } else {
        clearInterval(timer);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [hoveredKey, displayLogos]);

  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      if (!isHoveredRef.current) {
        angle += speed;
      }

      const total = displayLogos.length;
      if (total === 0) return;

      const containerWidth = containerRef.current
        ? containerRef.current.clientWidth
        : typeof window !== "undefined"
          ? window.innerWidth
          : 1000;

      const isMobile = containerWidth < 640;
      const isTablet = containerWidth >= 640 && containerWidth < 1024;

      // Responsive orbital radii tailored to container width to guarantee wide span and clean logo spacing
const radiusX = isMobile
  ? Math.min(containerWidth * 0.34, 130)
  : isTablet
    ? Math.min(containerWidth * 0.44, 330)
    : Math.min(containerWidth * 0.44, 520);

      const radiusZ = isMobile ? 80 : isTablet ? 130 : 190;

      displayLogos.forEach((_, index) => {
        const logoEl = logoRefs.current[index];
        if (!logoEl) return;

        // Angle offset for each logo around the 3D cylindrical ring
        const itemAngle = angle + (index * 2 * Math.PI) / total;

        // Normalize angle to range [-PI, PI] relative to camera (0 = front center)
        const normAngle = Math.atan2(Math.sin(itemAngle), Math.cos(itemAngle));
        logoNormAngleRef.current[index] = normAngle;

        // 3D coordinates on cylindrical orbit
        const x = Math.sin(normAngle) * radiusX;
        const z = Math.cos(normAngle) * radiusZ; // +radiusZ (front) to -radiusZ (back)

        // Depth progress: 1.0 (front center) to 0.0 (back center)
        const frontProgress = (Math.cos(normAngle) + 1) / 2;

        // Strong 3D Y-axis rotation to wrap logos around the sides of the cylinder ring
        const rotateYFactor = 0.9;
        const rotateY = normAngle * (180 / Math.PI) * rotateYFactor;

        // Responsive scale range based on depth
const scaleBase = isMobile ? 0.50 : isTablet ? 0.46 : 0.50;
const scaleRange = isMobile ? 0.52 : isTablet ? 0.50 : 0.55;
        const scale = scaleBase + Math.pow(frontProgress, 1.2) * scaleRange;

        // Smooth opacity gradient: front = 1.0, back = 0.35 (keeps background logos visible)
        const opacity = 0.35 + Math.pow(frontProgress, 1.3) * 0.65;

        // Depth blur: front = 0px (crystal sharp), back = ~6px (blurred)
        const blurAmount = Math.pow(1 - frontProgress, 1.3) * 6.0;

        // Layering Z-Index: front elements appear visually on top of back elements
        const zIndex = Math.round(frontProgress * 100);

        // Apply true 3D transformations
        logoEl.style.transform = `translate3d(calc(-50% + ${x.toFixed(
          2
        )}px), -50%, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(
          2
        )}deg) scale(${scale.toFixed(3)})`;
        logoEl.style.opacity = opacity.toFixed(3);
        logoEl.style.filter = `blur(${blurAmount.toFixed(2)}px)`;
        logoEl.style.zIndex = zIndex.toString();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [displayLogos, speed]);

  return (
    <section className={`relative w-full overflow-hidden bg-white py-8 sm:py-16 md:py-24 ${className}`}>
      {/* Title / Subtitle Heading */}
      {(title || subtitle) && (
        <div className="mb-4 sm:mb-8 text-center px-4">
          {title && (
            <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">
              {title}
            </p>
          )}
          {subtitle && <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}

      {/* Soft gradient edge overlays for seamless fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-12 sm:w-20 md:w-28 bg-gradient-to-r from-white via-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-12 sm:w-20 md:w-28 bg-gradient-to-l from-white via-white/80 to-transparent" />

      {/* 3D Perspective Orbit Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          setHoveredKey(null);
        }}
className="relative flex h-28 w-screen max-w-none items-center justify-center"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
      >
        {displayLogos.map((logo, index) => {
          const uniqueKey = `${logo.id}-${index}`;
          const currentNormAngle = logoNormAngleRef.current[index] ?? 99;
          const normAngleDeg = Math.abs(currentNormAngle * (180 / Math.PI));
          const isFrontCenterLogo = normAngleDeg <= 32;
          const isHovered = hoveredKey === uniqueKey && isFrontCenterLogo;
          const counterRotateY = -currentNormAngle * (180 / Math.PI) * 0.9;

          return (
            <div
              key={uniqueKey}
              ref={(el) => {
                logoRefs.current[index] = el;
              }}
              onMouseEnter={() => {
                isHoveredRef.current = true;
                const angleDeg = Math.abs((logoNormAngleRef.current[index] ?? 99) * (180 / Math.PI));
                if (angleDeg <= 32) {
                  setHoveredKey(uniqueKey);
                }
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false;
                setHoveredKey(null);
              }}
              className="absolute left-1/2 top-1/2 flex items-center justify-center cursor-pointer will-change-transform group"
              style={{
                transformStyle: "preserve-3d",
                transform: "translate3d(-50%, -50%, 0px)",
                backfaceVisibility: "visible",
              }}
            >
              {/* Typewriter Tooltip Box */}
              {isHovered && logo.description && (
                <div
                  className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                  style={{
                    transform: `rotateY(${counterRotateY.toFixed(2)}deg)`,
                  }}
                >
                  <div className="relative bg-[#18181b] border border-zinc-800 text-white rounded-2xl p-3 sm:p-4 w-56 sm:w-64 md:w-72 shadow-2xl shadow-black/60 text-center transition-all duration-200 ease-out">
                    <h4 className="text-amber-400 font-bold tracking-wider uppercase text-[10px] sm:text-xs md:text-sm mb-1 sm:mb-2">
                      {logo.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-zinc-200 leading-relaxed">
                      {typewriterText}
                      <span className="inline-block w-1 h-3.5 ml-0.5 bg-amber-400 animate-pulse align-middle" />
                    </p>

                    {/* Downward Pointer / Arrow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#18181b] border-r border-b border-zinc-800 rotate-45" />
                  </div>
                </div>
              )}

<div className="relative flex h-14 w-32 items-center justify-center sm:h-12 sm:w-28 md:h-20 md:w-52">
                  {/* Color Logo */}
                <div className="logo-color absolute inset-0 flex items-center justify-center">
                  <Image
                    src={logo.colorLogo}
                    alt={logo.name}
                    width={200}
                    height={70}
                    sizes="208px"
                    style={{ width: "auto" }}
                    className="max-h-10 sm:max-h-9 md:max-h-16 w-auto object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
