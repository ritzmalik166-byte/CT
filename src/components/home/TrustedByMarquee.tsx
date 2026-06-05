"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const GEMINI_LOGO_URL =
  "https://contenaissance.blob.core.windows.net/ct-assets/gemini.png";

const COMPANIES = [
  { 
    name: "Pika", 
    logo: "/assets/Pika.png",
    description: "AI-powered video generation platform that creates stunning videos from text and images."
  },
  { 
    name: "Claude", 
    logo: "/assets/claude.png",
    description: "Anthropic's AI assistant focused on being helpful, harmless, and honest."
  },
  { 
    name: "ChatGPT", 
    logo: "/assets/chatgpt.png",
    description: "OpenAI's conversational AI that understands context and generates human-like responses."
  },
  { 
    name: "Copilot", 
    logo: "/assets/Copilot.png",
    description: "Microsoft's AI coding assistant that helps developers write better code faster."
  },
  { 
    name: "Grok", 
    logo: "/assets/Grok.png",
    description: "xAI's witty AI assistant with real-time knowledge and a rebellious streak."
  },
  { 
    name: "Gemini", 
    logo: GEMINI_LOGO_URL,
    description: "Google's multimodal AI model capable of understanding text, images, and code."
  },
];

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface TooltipProps {
  text: string;
  isVisible: boolean;
  position: "top" | "bottom";
  logoName: string;
  anchorRect: DOMRect | null;
}

function TypewriterTooltip({ text, isVisible, position, logoName, anchorRect }: TooltipProps) {
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
        zIndex: "var(--z-tooltip)",
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

function LogoWithTooltip({ company }: { company: typeof COMPANIES[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">("bottom");
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      setAnchorRect(rect);
      const viewportHeight = window.innerHeight;
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      setTooltipPosition(spaceBelow > spaceAbove ? "bottom" : "top");
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
      className="group relative flex items-center px-6 py-3 transition-transform duration-300 hover:scale-110"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={company.logo}
        alt={`${company.name} logo`}
        title={`${company.name} logo`}
        width={260}
        height={90}
        className="h-8 w-auto object-contain transition-all duration-300 sm:h-9 md:h-10 lg:h-12"
      />
      <TypewriterTooltip
        text={company.description}
        isVisible={isHovered}
        position={tooltipPosition}
        logoName={company.name}
        anchorRect={anchorRect}
      />
    </div>
  );
}

export function TrustedByMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useGSAP(
    () => {
      gsap.from(".marquee-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".marquee-container", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });
    },
    { scope: sectionRef }
  );

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20 md:py-28"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-white" />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <p className="marquee-title text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          Trusted by innovative teams worldwide
        </p>
      </div>

      <div 
        ref={marqueeRef} 
        className="marquee-container relative z-10 mt-12 md:mt-16"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* First marquee - moving left */}
        <div className="marquee-container mb-8">
          <div 
            className="marquee-track"
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {[...COMPANIES, ...COMPANIES].map((company, i) => (
              <LogoWithTooltip key={`${company.name}-${i}`} company={company} />
            ))}
          </div>
        </div>

        {/* Second marquee - moving right */}
        <div className="marquee-container">
          <div
            className="marquee-track"
            style={{ 
              animationDirection: "reverse", 
              animationDuration: "35s",
              animationPlayState: isPaused ? "paused" : "running"
            }}
          >
            {[...COMPANIES.slice().reverse(), ...COMPANIES.slice().reverse()].map(
              (company, i) => (
                <LogoWithTooltip key={`${company.name}-rev-${i}`} company={company} />
              )
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      {/* <div className="relative mx-auto mt-16 grid max-w-[1200px] grid-cols-2 gap-8 px-6 md:mt-20 md:grid-cols-4">
        {[
          { value: "10M+", label: "API Requests Daily" },
          { value: "99.99%", label: "Uptime SLA" },
          { value: "500+", label: "Enterprise Clients" },
          { value: "<50ms", label: "Average Latency" },
        ].map((stat, i) => (
          <div key={stat.label} className="text-center">
            <div className="text-display-sm font-bold text-zinc-900">{stat.value}</div>
            <div className="mt-2 text-sm text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div> */}
    </section>
  );
}
