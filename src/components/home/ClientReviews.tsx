"use client";

import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ReviewCard {
  id: string;
  quote: string;
  author: string;
  role: string;
  type: "beige" | "gold" | "white" | "gold2" | "dark";
  avatarText: string;
  zIndex: number;
}

const reviewsData: ReviewCard[] = [
  {
    id: "review-1",
    quote:
      "“Fast, creative, and incredibly consistent their AI content workflow completely changed how we scale campaigns.”",
    author: "FAIRFOX IT INFRA",
    role: "Marketing Head",
    type: "beige",
    avatarText: "AS",
    zIndex: 10,
  },
  {
    id: "review-2",
    quote:
      "“The quality felt premium from day one. Their AI-powered creatives gave our brand a much stronger digital identity.”",
    author: "ELDECO GROUP",
    role: "Managing Director",
    type: "gold",
    avatarText: "AV",
    zIndex: 15,
  },
  {
    id: "review-3",
    quote:
      "“What impressed us most was how quickly they turned ideas into high-performing digital campaigns.”",
    author: "MADHUSUDHAN GHEE",
    role: "Managing Director",
    type: "white",
    avatarText: "RM",
    zIndex: 20,
  },
  {
    id: "review-4",
    quote:
      "“Their AI-driven approach helped us create engaging content for social media, ads, and brand launches effortlessly.”",
    author: "ESCORTS TRACTOR",
    role: "Chief Communication Officer",
    type: "gold2",
    avatarText: "IK",
    zIndex: 25,
  },
  {
    id: "review-5",
    quote:
      "“The team understood both creativity and performance marketing, which made every campaign more effective.”",
    author: "SAYA GROUP",
    role: "Director",
    type: "dark",
    avatarText: "VM",
    zIndex: 30,
  },
];

const cardStyles = {
  beige: {
    card:
      "w-[calc(100vw-80px)] max-w-[330px] sm:w-[310px] h-[230px] sm:h-auto flex flex-col justify-between bg-[#eae7df] text-[#333333] p-6 text-[13px] leading-relaxed font-sans opacity-95",
    position:
      "translate-y-0 rotate-0 mx-0 sm:mx-0 sm:-rotate-[6deg] sm:translate-y-6 sm:-ml-10",
  },

  gold: {
    card:
      "w-[calc(100vw-80px)] max-w-[330px] sm:w-[340px] h-[230px] sm:h-auto flex flex-col justify-between bg-gradient-to-b from-[#a6741b] via-[#7d530e] to-[#452d06] text-white p-7 text-sm font-sans leading-relaxed tracking-wide",
    position:
      "translate-y-0 rotate-0 mx-0 sm:mx-0 sm:rotate-[3deg] sm:translate-y-[120px] sm:-ml-20",
  },

  white: {
    card:
      "w-[calc(100vw-80px)] max-w-[330px] sm:w-[330px] h-[230px] sm:h-auto flex flex-col justify-between bg-[#fafafa] border border-gray-100 text-[#1a1a1a] p-7 text-sm font-sans leading-relaxed tracking-wide",
    position:
      "translate-y-0 rotate-0 mx-0 sm:mx-0 sm:rotate-[5deg] sm:-translate-y-6 sm:-ml-14",
  },

  gold2: {
    card:
      "w-[calc(100vw-80px)] max-w-[330px] sm:w-[340px] h-[230px] sm:h-auto flex flex-col justify-between bg-gradient-to-b from-[#b87d18] via-[#875508] to-[#4c3003] text-white p-7 text-sm font-sans leading-relaxed tracking-wide",
    position:
      "translate-y-0 rotate-0 mx-0 sm:mx-0 sm:-rotate-[3deg] sm:translate-y-12 sm:-ml-12",
  },

  dark: {
    card:
      "w-[calc(100vw-80px)] max-w-[330px] sm:w-[340px] h-[230px] sm:h-auto flex flex-col justify-between bg-[#1d2127] text-white p-7 sm:p-8 text-xs sm:text-sm font-sans tracking-wide leading-relaxed",
    position:
      "translate-y-0 rotate-0 mx-0 sm:mx-0 sm:rotate-[3deg] sm:-translate-y-12 sm:-ml-10",
  },
};

export default function ClientReviewsSection() {
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const singleSetRef = useRef<HTMLDivElement>(null);
  const singleSetWidthRef = useRef<number>(0);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [marqueeHeight, setMarqueeHeight] = useState<number>(0);
  const isAnimatingRef = useRef(false);

  const SPEED = 45;
  const reviewCount = reviewsData.length;
  const activeCard = reviewsData[activeIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncViewport = () => {
      setIsMobile(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!singleSetRef.current) return;

    const updateWidth = () => {
      if (singleSetRef.current) {
        const width = singleSetRef.current.getBoundingClientRect().width;
        if (width > 0) {
          singleSetWidthRef.current = width;
        }
      }
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(singleSetRef.current);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [isMobile]);

  useEffect(() => {
    const updateHeight = () => {
      if (!marqueeRef.current || !cardsRef.current) return;

      const viewportRect = marqueeRef.current.getBoundingClientRect();
      const cards = cardsRef.current.querySelectorAll<HTMLElement>(
        "[data-review-card]"
      );

      if (!cards.length) return;

      let minTop = Infinity;
      let maxBottom = -Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();

        minTop = Math.min(minTop, rect.top);
        maxBottom = Math.max(maxBottom, rect.bottom);
      });

      const topOffset = Math.max(0, viewportRect.top - minTop);
      const bottomOffset = Math.max(0, maxBottom - viewportRect.bottom);

      const requiredHeight = viewportRect.height + topOffset + bottomOffset;

      if (requiredHeight > 0) {
        setMarqueeHeight(requiredHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);

    if (marqueeRef.current) {
      resizeObserver.observe(marqueeRef.current);
    }

    if (cardsRef.current) {
      resizeObserver.observe(cardsRef.current);

      cardsRef.current
        .querySelectorAll<HTMLElement>("[data-review-card]")
        .forEach((card) => resizeObserver.observe(card));
    }

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isMobile]);

  useAnimationFrame((_, delta) => {
    if (isPaused || isMobile || isAnimatingRef.current) return;

    let singleSetWidth = singleSetWidthRef.current;
    if (!singleSetWidth && singleSetRef.current) {
      singleSetWidth = singleSetRef.current.getBoundingClientRect().width;
      if (singleSetWidth > 0) {
        singleSetWidthRef.current = singleSetWidth;
      }
    }

    if (!singleSetWidth) return;

    const movement = (SPEED * delta) / 1000;
    let nextX = x.get() - movement;

    if (nextX <= -singleSetWidth) {
      nextX += singleSetWidth;
    }

    x.set(nextX);
  });

  const wrapXPosition = (val: number) => {
    const singleSetWidth = singleSetWidthRef.current;
    if (!singleSetWidth) return val;

    let next = val;
    while (next <= -singleSetWidth) {
      next += singleSetWidth;
    }
    while (next > 0) {
      next -= singleSetWidth;
    }
    return next;
  };

  const handleScroll = (direction: "left" | "right") => {
    const singleSetWidth = singleSetWidthRef.current || 320;
    const step = Math.min(320, singleSetWidth / 5);
    const currentX = x.get();
    const targetDelta = direction === "left" ? step : -step;
    const targetX = currentX + targetDelta;

    isAnimatingRef.current = true;

    animate(x, targetX, {
      duration: 0.45,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (latest) => {
        const wrapped = wrapXPosition(latest);
        if (wrapped !== latest) {
          x.set(wrapped);
        }
      },
      onComplete: () => {
        x.set(wrapXPosition(x.get()));
        isAnimatingRef.current = false;
      },
    });
  };

  const handleMobileNav = (direction: "left" | "right") => {
    const delta = direction === "right" ? 1 : -1;

    setActiveIndex(
      (current) =>
        (current + delta + reviewCount) % reviewCount
    );
  };

  const renderCardContent = (card: ReviewCard) => (
    <>
      <p className="font-normal leading-relaxed">{card.quote}</p>

      {card.author && (
        <div className="mt-6 sm:mt-8 flex items-center gap-3.5">
          <div
            className={`
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full text-[12px] font-bold
              ${card.type === "white" || card.type === "beige"
                ? "border border-gray-300 bg-gray-200 text-gray-700"
                : "border border-white/20 bg-white/20 text-white/90"
              }
            `}
          >
            {card.avatarText}
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase leading-snug tracking-wide">
              {card.author}
            </h4>

            <p className="mt-0.5 text-[11px] font-medium opacity-75">
              {card.role}
            </p>
          </div>
        </div>
      )}
    </>
  );

  const renderCardSet = (setIndex: number) => (
    <div
      ref={setIndex === 0 ? singleSetRef : undefined}
      className="flex items-start"
    >
      {reviewsData.map((card, idx) => {
        const style = cardStyles[card.type];

        return (
          <motion.div
            data-review-card
            key={`${card.id}-set-${setIndex}-${idx}`}
            onMouseEnter={() => {
              setIsPaused(true);
            }}
            onMouseLeave={() => {
              setIsPaused(false);
            }}
            whileHover={{
              zIndex: 60,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            style={{
              zIndex: card.zIndex,
            }}
            className={`
              relative shrink-0 rounded-sm
              shadow-[0_20px_40px_rgba(0,0,0,0.18)]
              transition-shadow duration-300
              select-none
              ${style.card}
              ${style.position}
            `}
          >
            {renderCardContent(card)}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section className="relative overflow-x-clip overflow-y-visible bg-white py-10 md:py-15 text-gray-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(#666 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          <div className="w-full text-center sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <span className="h-px w-8 bg-[#AE8C20] sm:w-10" aria-hidden />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#AE8C20] sm:text-xs">
                Client Stories
              </p>
            </div>
            <h2
              className="mt-3 font-bold tracking-tight text-zinc-900"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1.1 }}
            >
              AI Driven Creative Excellence
            </h2>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => handleScroll("left")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-800 transition-all duration-200 hover:scale-105 hover:border-[#AE8C20] hover:text-[#AE8C20] active:scale-95"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={() => handleScroll("right")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-800  transition-all duration-200 hover:scale-105 hover:border-[#AE8C20] hover:text-[#AE8C20] active:scale-95"
              aria-label="Next Reviews"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile: exactly ONE card at a time */}
        <div className="relative mt-4 w-full md:hidden">
          {/* Left Arrow */}
          <button
            onClick={() => handleMobileNav("left")}
            className="absolute left-2 top-1/2 z-[60] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => handleMobileNav("right")}
            className="absolute right-2 top-1/2 z-[60] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 "
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Mobile Card Viewport */}
          <div className="relative flex w-full items-center justify-center overflow-hidden px-0 py-8">
            <motion.div
              key={activeCard.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className={`
        relative
        mx-auto
        flex
        w-[calc(100vw-80px)]
        max-w-[330px]
        shrink-0
        rounded-sm
        select-none
        ${cardStyles[activeCard.type].card}
      `}
            >
              {renderCardContent(activeCard)}
            </motion.div>
          </div>
        </div>

        {/* Desktop/tablet: existing overlapping marquee (≥768px) */}
        {!isMobile && (
          <div
            ref={marqueeRef}
            className="relative mt-4 w-full overflow-x-clip overflow-y-visible sm:mt-8 hidden md:block"
            style={{
              height: marqueeHeight > 0 ? `${marqueeHeight}px` : "auto",
            }}
          >
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-40 w-4 md:w-4 bg-gradient-to-r from-white to-transparent sm:w-6" />

            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-40 w-4 md:w-4 bg-gradient-to-l from-white to-transparent sm:w-6" />

            <motion.div
              ref={cardsRef}
              drag="x"
              dragConstraints={{ left: -10000, right: 10000 }}
              dragElastic={0.05}
              onDrag={() => {
                x.set(wrapXPosition(x.get()));
              }}
              className="flex w-max items-start px-[calc(50vw-140px)] pt-8 pb-8 sm:px-8 sm:pt-20 sm:pb-20 cursor-grab active:cursor-grabbing"
              style={{ x }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {renderCardSet(0)}
              {renderCardSet(1)}
              {renderCardSet(2)}
              {renderCardSet(3)}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}