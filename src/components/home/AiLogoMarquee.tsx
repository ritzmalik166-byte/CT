"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import React from "react";
import { createPortal } from "react-dom";

gsap.registerPlugin(useGSAP);

const GEMINI_LOGO_URL =
  "https://contenaissance.blob.core.windows.net/ct-assets/gemini.png";

const aiLogos = [
  {
    src: "/assets/chatgpt.png",
    alt: "ChatGPT",
    description: "OpenAI's conversational AI that understands context and generates human-like responses.",
  },
  {
    src: "/assets/claude.png",
    alt: "Claude",
    description: "Anthropic's AI assistant focused on being helpful, harmless, and honest.",
  },
  {
    src: GEMINI_LOGO_URL,
    alt: "Gemini",
    description: "Google's multimodal AI model capable of understanding text, images, and code.",
  },
];


interface FixedTooltipProps {
  text: string;
  isVisible: boolean;
  position: "top" | "bottom";
  logoName: string;
  anchorRect: DOMRect | null;
}

function TypewriterTooltip({ text, isVisible, position, logoName, anchorRect }: FixedTooltipProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setDisplayedText("");
      setIsTyping(true);
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedText("");
      setIsTyping(false);
    }
  }, [isVisible, text]);

  if (!isVisible || !anchorRect || !mounted) return null;

  const tooltipWidth = 240;
  const left = anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;
  const top = position === "top" ? anchorRect.top - 16 : anchorRect.bottom + 16;

  const tooltipContent = (
    <div
      className="pointer-events-none fixed"
      style={{
        width: tooltipWidth,
        left: `${Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12))}px`,
        top: position === "top" ? "auto" : `${top}px`,
        bottom: position === "top" ? `${window.innerHeight - anchorRect.top + 16}px` : "auto",
        zIndex: 99999,
      }}
    >
      <div 
        className="relative rounded-2xl px-4 py-3 text-center shadow-2xl"
        style={{
          backgroundColor: "#18181b",
          border: "1px solid #3f3f46",
        }}
      >
        <div
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
          style={{
            backgroundColor: "#18181b",
            borderColor: "#3f3f46",
            borderWidth: position === "top" ? "0 1px 1px 0" : "1px 0 0 1px",
            top: position === "top" ? "auto" : "-6px",
            bottom: position === "top" ? "-6px" : "auto",
          }}
        />
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "#AE8C20" }}>
          {logoName}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#e4e4e7" }}>
          {displayedText}
          {isTyping && (
            <span 
              className="ml-0.5 inline-block h-3 w-0.5 animate-pulse" 
              style={{ backgroundColor: "#AE8C20" }} 
            />
          )}
        </p>
      </div>
    </div>
  );

  return createPortal(tooltipContent, document.body);
}

function LogoWithTooltip({
  logo,
  index,
}: {
  logo: (typeof aiLogos)[0];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">("top");
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      setAnchorRect(rect);
      const viewportHeight = window.innerHeight;
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      setTooltipPosition(spaceAbove > spaceBelow ? "top" : "bottom");
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setAnchorRect(null);
  }, []);

  return (
    <div
      ref={logoRef}
      key={`${logo.alt}-${index}`}
      className="relative flex-shrink-0 transition-transform duration-300 hover:scale-110"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={180}
        height={60}
        className="h-8 w-auto object-contain grayscale transition-all duration-300 hover:grayscale-0 sm:h-10 md:h-12"
      />
      <TypewriterTooltip
        text={logo.description}
        isVisible={isHovered}
        position={tooltipPosition}
        logoName={logo.alt}
        anchorRect={anchorRect}
      />
    </div>
  );
}

export function AiLogoMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const totalWidth = track.scrollWidth / 2;

      tweenRef.current = gsap.to(track, {
        x: -totalWidth,
        duration: 25,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
        },
      });
    },
    { scope: containerRef }
  );

  const handleMouseEnter = useCallback(() => {
    tweenRef.current?.pause();
  }, []);

  const handleMouseLeave = useCallback(() => {
    tweenRef.current?.resume();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-20 w-full bg-white py-4 sm:py-5 md:py-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max items-center gap-16 sm:gap-20 md:gap-28"
        >
          {[...aiLogos, ...aiLogos, ...aiLogos, ...aiLogos, ...aiLogos, ...aiLogos, ...aiLogos, ...aiLogos].map(
            (logo, index) => (
              <LogoWithTooltip key={`${logo.alt}-${index}`} logo={logo} index={index} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
