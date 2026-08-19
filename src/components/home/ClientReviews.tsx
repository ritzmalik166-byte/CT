"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import VantaBackground from "../animated-bg/VantaBackground";

export interface ReviewItem {
  id: number;
  quote: string;
  extendedQuote?: string;
  author: string;
  title: string;
  avatarLabel: string;
  style: "gold" | "white" | "light" | "dark";
  tilt: number;
}

export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 1,
    quote:
      "Fast, creative, and incredibly consistent their AI content workflow completely changed how we scale campaigns.",
    extendedQuote:
      "Fast, creative, and incredibly consistent their AI content workflow completely changed how we scale campaigns.",
    author: "FAIRFOX IT INFRA",
    title: "Marketing Head, Ritz Media World",
    avatarLabel: "AS",
    style: "dark",
    tilt: -6,
  },

  {
    id: 2,
    quote:
      "The quality felt premium from day one. Their AI-powered creatives gave our brand a much stronger digital identity.",
    extendedQuote:
      "The quality felt premium from day one. Their AI-powered creatives gave our brand a much stronger digital identity.",
    author: "ELDECO GROUP",
    title: "Managing Director, Creative Thinks Media",
    avatarLabel: "AV",
    style: "light",
    tilt: -4,
  },

  {
    id: 3,
    quote:
      "What impressed us most was how quickly they turned ideas into high-performing digital campaigns.",
    extendedQuote:
      "What impressed us most was how quickly they turned ideas into high-performing digital campaigns.",
    author: "MADHUSUDHAN GHEE",
    title: "Managing Director, Northline AI",
    avatarLabel: "RM",
    style: "gold",
    tilt: -8,
  },

  {
    id: 4,
    quote:
      "Their AI-driven approach helped us create engaging content for social media, ads, and brand launches effortlessly.",
    extendedQuote:
      "Their AI-driven approach helped us create engaging content for social media, ads, and brand launches effortlessly.",
    author: "ESCORTS TRACTOR",
    title: "Chief Communication Officer, BrightForge",
    avatarLabel: "IK",
    style: "white",
    tilt: -3.5,
  },

  {
    id: 5,
    quote:
      "The team understood both creativity and performance marketing, which made every campaign more effective.",
    extendedQuote:
      "The team understood both creativity and performance marketing, which made every campaign more effective.",
    author: "SAYA GROUP",
    title: "Director, GreenByte",
    avatarLabel: "VM",
    style: "gold",
    tilt: 4,
  },
  {
    id: 6,
    quote:
      "Fast, creative, and incredibly consistent their AI content workflow completely changed how we scale campaigns.",
    extendedQuote:
      "Fast, creative, and incredibly consistent their AI content workflow completely changed how we scale campaigns.",
    author: "FAIRFOX IT INFRA",
    title: "Marketing Head, Ritz Media World",
    avatarLabel: "AS",
    style: "dark",
    tilt: -6,
  },

  {
    id: 7,
    quote:
      "The quality felt premium from day one. Their AI-powered creatives gave our brand a much stronger digital identity.",
    extendedQuote:
      "The quality felt premium from day one. Their AI-powered creatives gave our brand a much stronger digital identity.",
    author: "ELDECO GROUP",
    title: "Managing Director, Creative Thinks Media",
    avatarLabel: "AV",
    style: "light",
    tilt: -4,
  },

  {
    id: 8,
    quote:
      "What impressed us most was how quickly they turned ideas into high-performing digital campaigns.",
    extendedQuote:
      "What impressed us most was how quickly they turned ideas into high-performing digital campaigns.",
    author: "MADHUSUDHAN GHEE",
    title: "Managing Director, Northline AI",
    avatarLabel: "RM",
    style: "gold",
    tilt: -8,
  },

  {
    id: 9,
    quote:
      "Their AI-driven approach helped us create engaging content for social media, ads, and brand launches effortlessly.",
    extendedQuote:
      "Their AI-driven approach helped us create engaging content for social media, ads, and brand launches effortlessly.",
    author: "ESCORTS TRACTOR",
    title: "Chief Communication Officer, BrightForge",
    avatarLabel: "IK",
    style: "white",
    tilt: -3.5,
  },
];

export function ClientReviews() {
  const [activeIndex, setActiveIndex] = useState(3); // Start centered around item index 3 (4/7)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hiddenCardId, setHiddenCardId] = useState<number | null>(null);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isWheelCoolingDown = useRef(false);

  const totalReviews = REVIEWS_DATA.length;

  const handlePrev = useCallback(() => {
    if (isTeleporting) return;

    const previousIndex = activeIndex - 1;

    // Card that will jump from right edge to left edge
    const cardToHide =
      REVIEWS_DATA.find((_, index) => {
        const raw =
          ((index - activeIndex) % totalReviews + totalReviews) %
          totalReviews;

        const currentOffset =
          raw > Math.floor(totalReviews / 2)
            ? raw - totalReviews
            : raw;

        return currentOffset === 3;
      })?.id;

    setIsTeleporting(true);
    setHiddenCardId(cardToHide ?? null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setActiveIndex(previousIndex);

        setTimeout(() => {
          setHiddenCardId(null);
          setIsTeleporting(false);
        }, 400);
      });
    });
  }, [activeIndex, totalReviews, isTeleporting]);

  const handleNext = useCallback(() => {
    if (isTeleporting) return;

    const nextIndex = activeIndex + 1;
    const wrappedIndex = nextIndex % totalReviews;

    // Card that will jump from left edge to right edge
    const cardToHide =
      REVIEWS_DATA.find((_, index) => {
        const raw =
          ((index - activeIndex) % totalReviews + totalReviews) %
          totalReviews;

        const currentOffset =
          raw > Math.floor(totalReviews / 2)
            ? raw - totalReviews
            : raw;

        return currentOffset === -3;
      })?.id;

    setIsTeleporting(true);
    setHiddenCardId(cardToHide ?? null);

    // Give React a frame to completely hide the card
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setActiveIndex(nextIndex);

        setTimeout(() => {
          setHiddenCardId(null);
          setIsTeleporting(false);
        }, 400);
      });
    });
  }, [activeIndex, totalReviews, isTeleporting]);

  // Wheel horizontal scroll interaction without changing page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if horizontal scroll or predominant scroll is happening over deck
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        if (isWheelCoolingDown.current) return;

        if (e.deltaX > 20 || (e.shiftKey && e.deltaY > 20)) {
          handleNext();
          isWheelCoolingDown.current = true;
          setTimeout(() => (isWheelCoolingDown.current = false), 300);
        } else if (e.deltaX < -20 || (e.shiftKey && e.deltaY < -20)) {
          handlePrev();
          isWheelCoolingDown.current = true;
          setTimeout(() => (isWheelCoolingDown.current = false), 300);
        }
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleNext, handlePrev]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#fafafa] py-16 md:py-24 text-zinc-900 select-none">
      {/* Subtle Dotted Background Grid matching reference UI */}
      <VantaBackground />

      {/* Header Container */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center">
        {/* Large Bold Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl md:text-6xl uppercase"
        >
          CLIENT REVIEWS
        </motion.h2>

        {/* Rating Pill (Trustpilot Style) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-zinc-200/80 bg-white/90 px-5 py-2.5 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
        >
          {/* Red Indicator Dot */}
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D69917]" />
          </div>

          <div className="flex flex-col text-left text-xs leading-tight">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
              <span>4.9/5</span>
              <div className="flex items-center text-[#D69917]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              Based on 23 reviews on Trustpilot
            </span>
          </div>
        </motion.div>
      </div>

      {/* Cards Deck Stage */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 mt-12 md:mt-10 flex h-[380px] sm:h-[420px] md:h-[460px] w-full items-center justify-center overflow-visible"
      >
        <div className="relative flex h-full w-full max-w-[1400px] items-center justify-center">
          {REVIEWS_DATA.map((review, index) => {
            const rawOffset =
              ((index - activeIndex) % totalReviews + totalReviews) %
              totalReviews;

            const offset =
              rawOffset > Math.floor(totalReviews / 2)
                ? rawOffset - totalReviews
                : rawOffset;

            const isHovered = hoveredIndex === index;
            const isCenter = offset === 0;

            const CARD_GAP = 260;
            const baseTranslateX = offset * CARD_GAP;

            const baseTranslateY = index % 2 === 0 ? -55 : 55;

            const baseRotate = isHovered ? 0 : review.tilt;

            const baseScale = isCenter
              ? 1
              : isHovered
                ? 1.04
                : Math.max(0.85, 1 - Math.abs(offset) * 0.05);

            const zIndex = isHovered
              ? 50
              : 30 - offset;

            // Card Style Variant Classes
            const getCardStyle = () => {
              switch (review.style) {
                case "gold":
                  return "bg-gradient-to-b from-[#d6951e] via-[#b37717] to-[#734c11] text-white border border-[#f5c663]/30 shadow-[0_20px_50px_rgba(160,105,15,0.25)]";
                case "white":
                  return "bg-white text-zinc-900 border border-zinc-200/90 shadow-[0_20px_45px_rgba(0,0,0,0.07)]";
                case "dark":
                  return "bg-[#1c1c1f] text-white border border-zinc-800 shadow-[0_25px_50px_rgba(0,0,0,0.3)]";
                case "light":
                default:
                  return "bg-[#efede6] text-zinc-800 border border-zinc-300/70 shadow-[0_20px_45px_rgba(0,0,0,0.06)]";
              }
            };

            const getAvatarBg = () => {
              switch (review.style) {
                case "gold":
                  return "bg-white/20 text-white border border-white/20";
                case "dark":
                  return "bg-white/10 text-white border border-white/15";
                case "white":
                case "light":
                default:
                  return "bg-zinc-200/70 text-zinc-700 border border-zinc-300/50";
              }
            };

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{
                  opacity: Math.abs(offset) > 3 ? 0 : 1,
                  x: baseTranslateX,
                  y: baseTranslateY,
                  scale: isHovered ? baseScale * 1.05 : baseScale,
                  rotate: baseRotate,
                  zIndex: zIndex,
                }}
                transition={{
                  x: {
                    duration: hiddenCardId === review.id ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  y: {
                    duration: hiddenCardId === review.id ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  scale: {
                    duration: hiddenCardId === review.id ? 0 : 0.25,
                  },
                  rotate: {
                    duration: hiddenCardId === review.id ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: {
                    duration: 0,
                  },
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setActiveIndex(index)}
                style={{
                  position: "absolute",
                  transformOrigin: "center center",
                  visibility: hiddenCardId === review.id ? "hidden" : "visible",
                  pointerEvents: hiddenCardId === review.id ? "none" : "auto",
                }}
                className={`group cursor-pointer p-6 sm:p-7 md:p-8 w-[280px] sm:w-[320px] md:w-[360px] transition-all duration-300 ${getCardStyle()}`}
              >
                {/* Review Text */}
                <div className="relative min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-between">
                  <p
                    className={`text-sm sm:text-base leading-relaxed tracking-normal transition-all duration-300 line-clamp-10`}
                  >
                    {isHovered && review.extendedQuote ? review.extendedQuote : review.extendedQuote}
                  </p>

                  {/* Author Meta Info */}
                  <div className="mt-6 flex items-center gap-3.5 pt-2">
                    {/* Avatar Badge (matching 150x150 / 51X51 pills in screenshot) */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-wider ${getAvatarBg()}`}
                    >
                      {review.avatarLabel}
                    </div>

                    <div className="flex flex-col text-left">
                      <h4 className="font-bold text-sm sm:text-base leading-tight tracking-tight">
                        {review.author}
                      </h4>
                      <p
                        className={`text-xs mt-0.5 ${review.style === "gold" || review.style === "dark"
                          ? "text-white/75"
                          : "text-zinc-500"
                          }`}
                      >
                        {review.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtle Hover Glow Highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
