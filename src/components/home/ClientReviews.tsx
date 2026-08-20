"use client";

import { animate, motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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

export default function ClientReviewsSection() {
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const singleSetRef = useRef<HTMLDivElement>(null);
  const singleSetWidthRef = useRef<number>(0);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [marqueeHeight, setMarqueeHeight] = useState<number>(0);
  const isAnimatingRef = useRef(false);

  /*
   * Speed of marquee.
   * Smaller number = faster.
   */

  const centerMobileCard = () => {
    if (!isMobile || !cardsRef.current || !marqueeRef.current) return;

    const firstCard = cardsRef.current.querySelector<HTMLElement>(
      "[data-review-card]"
    );

    if (!firstCard) return;

    const containerWidth = marqueeRef.current.clientWidth;
    const cardWidth = firstCard.getBoundingClientRect().width;

    const currentCardOffset = firstCard.offsetLeft;

    const centeredX =
      containerWidth / 2 -
      cardWidth / 2 -
      currentCardOffset;

    x.set(centeredX);
  };

  const SPEED = 45;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        requestAnimationFrame(() => {
          centerMobileCard();
        });
      }
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
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
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const centerCard = () => {
      if (!cardsRef.current || !marqueeRef.current) return;

      const firstCard = cardsRef.current.querySelector<HTMLElement>(
        "[data-review-card]"
      );

      if (!firstCard) return;

      const containerWidth = marqueeRef.current.clientWidth;
      const cardWidth = firstCard.getBoundingClientRect().width;

      const cardCenter = firstCard.offsetLeft + cardWidth / 2;

      const targetX = containerWidth / 2 - cardCenter;

      x.set(targetX);
    };

    const timer = requestAnimationFrame(centerCard);

    window.addEventListener("resize", centerCard);

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("resize", centerCard);
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

      const requiredHeight =
        viewportRect.height + topOffset + bottomOffset;

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
  }, []);

  /*
   * Move by pixels based on exact width of one complete card set.
   * On mobile, auto-scroll is disabled so users can manually swipe/navigate.
   */
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

  const cardStyles = {
    beige: {
      card:
        "w-[280px] sm:w-[310px] h-[230px] sm:h-auto flex flex-col justify-between bg-[#eae7df] text-[#333333] p-6 text-[13px] leading-relaxed font-sans opacity-95",
      position: "translate-y-0 rotate-0 mx-3 sm:mx-0 sm:-rotate-[6deg] sm:translate-y-6 sm:-ml-10",
    },

    gold: {
      card:
        "w-[280px] sm:w-[340px] h-[230px] sm:h-auto flex flex-col justify-between bg-gradient-to-b from-[#a6741b] via-[#7d530e] to-[#452d06] text-white p-7 text-sm font-sans leading-relaxed tracking-wide",
      position: "translate-y-0 rotate-0 mx-3 sm:mx-0 sm:rotate-[3deg] sm:translate-y-[120px] sm:-ml-20",
    },

    white: {
      card:
        "w-[280px] sm:w-[330px] h-[230px] sm:h-auto flex flex-col justify-between bg-[#fafafa] border border-gray-100 text-[#1a1a1a] p-7 text-sm font-sans leading-relaxed tracking-wide",
      position: "translate-y-0 rotate-0 mx-3 sm:mx-0 sm:rotate-[5deg] sm:-translate-y-6 sm:-ml-14",
    },

    gold2: {
      card:
        "w-[280px] sm:w-[340px] h-[230px] sm:h-auto flex flex-col justify-between bg-gradient-to-b from-[#b87d18] via-[#875508] to-[#4c3003] text-white p-7 text-sm font-sans leading-relaxed tracking-wide",
      position: "translate-y-0 rotate-0 mx-3 sm:mx-0 sm:-rotate-[3deg] sm:translate-y-12 sm:-ml-12",
    },

    dark: {
      card:
        "w-[280px] sm:w-[340px] h-[230px] sm:h-auto flex flex-col justify-between bg-[#1d2127] text-white p-7 sm:p-8 text-xs sm:text-sm font-sans tracking-wide leading-relaxed",
      position: "translate-y-0 rotate-0 mx-3 sm:mx-0 sm:rotate-[3deg] sm:-translate-y-12 sm:-ml-10",
    },
  };

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
            <p className="font-normal leading-relaxed">
              {card.quote}
            </p>

            {card.author && (
              <div className="mt-6 sm:mt-8 flex items-center gap-3.5">
                {/* Avatar */}
                <div
                  className={`
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-full text-[12px] font-bold
                    ${card.type === "white" ||
                      card.type === "beige"
                      ? "border border-gray-300 bg-gray-200 text-gray-700"
                      : "border border-white/20 bg-white/20 text-white/90"
                    }
                  `}
                >
                  {card.avatarText}
                </div>

                {/* Author */}
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
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section className="relative overflow-x-clip overflow-y-visible bg-white py-10 md:py-15 text-gray-900">
      {/* Background Dot Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(#666 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Title & Controls */}
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

          {/* Marquee Control Buttons (Desktop Header Only) */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => handleScroll("left")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-800 shadow-md transition-all duration-200 hover:scale-105 hover:border-[#AE8C20] hover:text-[#AE8C20] active:scale-95"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={() => handleScroll("right")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-800 shadow-md transition-all duration-200 hover:scale-105 hover:border-[#AE8C20] hover:text-[#AE8C20] active:scale-95"
              aria-label="Next Reviews"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Reviews Marquee */}
        <div
          ref={marqueeRef}
          className="relative mt-4 w-full overflow-x-clip overflow-y-visible sm:mt-8"
          style={{
            height: marqueeHeight > 0 ? `${marqueeHeight}px` : "auto",
          }}
        >
          {/* Floating Left Button beside cards (Mobile only) */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-2 top-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-lg backdrop-blur-md transition-all duration-200 -translate-y-1/2 hover:scale-105 hover:border-[#AE8C20] hover:text-[#AE8C20] active:scale-95 md:hidden"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Floating Right Button beside cards (Mobile only) */}
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-2 top-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-lg backdrop-blur-md transition-all duration-200 -translate-y-1/2 hover:scale-105 hover:border-[#AE8C20] hover:text-[#AE8C20] active:scale-95 md:hidden"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Left Fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-40 w-4 md:w-12 bg-gradient-to-r from-white to-transparent sm:w-16" />

          {/* Right Fade */}
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-40 w-4 md:w-12 bg-gradient-to-l from-white to-transparent sm:w-16" />

          {/* Marquee Track */}
          <motion.div
            ref={cardsRef}
            drag="x"
            dragConstraints={{ left: -10000, right: 10000 }}
            dragElastic={0.05}
            onDrag={() => {
              x.set(wrapXPosition(x.get()));
            }}
            className="flex w-max items-start px-[calc(50vw-140px)] pt-8 pb-8 sm:px-8 sm:pt-20 sm:pb-20 cursor-grab active:cursor-grabbing" style={{ x }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {renderCardSet(0)}
            {renderCardSet(1)}
            {renderCardSet(2)}
            {renderCardSet(3)}
          </motion.div>
        </div>
      </div>
    </section>
  );
}