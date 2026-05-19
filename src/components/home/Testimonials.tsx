"use client";

import { useGSAP } from "@gsap/react";
import { ReelModal } from "@/components/ui/ReelModal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ShowcaseReel {
  id: number;
  title: string;
  subtitle: string;
  video: string;
}

const SHOWCASE_REELS: ShowcaseReel[] = [
  {
    id: 1,
    title: "3D Website Experience",
    subtitle: "Immersive hero motion",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/10.mp4",
  },
  {
    id: 2,
    title: "Interactive Product Flow",
    subtitle: "Scroll-driven visuals",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/12.mp4",
  },
  {
    id: 3,
    title: "Cinematic Landing Page",
    subtitle: "Premium web storytelling",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/13.mp4",
  },
  {
    id: 4,
    title: "WebGL Interface",
    subtitle: "Depth-rich interaction",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/14.mp4",
  },
  {
    id: 5,
    title: "Motion Website Reel",
    subtitle: "Animated brand systems",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/15.mp4",
  },
  {
    id: 6,
    title: "Automotive 3D Story",
    subtitle: "High-impact launch visuals",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/auto.mp4",
  },
  {
    id: 7,
    title: "AI Visual Showcase",
    subtitle: "Reel-ready web content",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/09.mp4",
  },
];

function ReelCard({
  reel,
  onOpen,
}: {
  reel: ShowcaseReel;
  onOpen: (r: ShowcaseReel) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(reel)}
      className="group relative h-full w-full cursor-pointer overflow-hidden rounded-[1.75rem] border-2 border-[#AE8C20]/40 bg-zinc-900 text-left shadow-[0_40px_90px_-25px_rgba(0,0,0,0.95),0_0_70px_-12px_rgba(174,140,32,0.4)] outline-none transition-colors duration-300 hover:border-[#AE8C20]/80 focus-visible:ring-2 focus-visible:ring-[#AE8C20]"
      aria-label={`Open ${reel.title}`}
    >
      <video
        src={reel.video}
        autoPlay
        muted
        loop
        className="h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#AE8C20]/90 shadow-lg shadow-[#AE8C20]/40 backdrop-blur-sm">
          <svg className="ml-1 h-6 w-6 text-zinc-950" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/** Mobile Swiper slides only: no <button> so horizontal drag + nested page scroll behave reliably. */
function ReelSwipeCard({
  reel,
  onOpen,
}: {
  reel: ShowcaseReel;
  onOpen: (r: ShowcaseReel) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(reel)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(reel);
        }
      }}
      className="group relative h-full w-full cursor-pointer touch-manipulation overflow-hidden rounded-[1.75rem] border-2 border-[#AE8C20]/40 bg-zinc-900 text-left shadow-[0_40px_90px_-25px_rgba(0,0,0,0.95),0_0_70px_-12px_rgba(174,140,32,0.4)] outline-none transition-colors duration-300 hover:border-[#AE8C20]/80 focus-visible:ring-2 focus-visible:ring-[#AE8C20]"
      aria-label={`Open ${reel.title}`}
    >
      <video
        src={reel.video}
        autoPlay
        muted
        loop
        className="pointer-events-none h-full w-full select-none object-cover [-webkit-touch-callout:none]"
      />

      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#AE8C20]/90 shadow-lg shadow-[#AE8C20]/40 backdrop-blur-sm">
          <svg className="ml-1 h-6 w-6 text-zinc-950" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const showcaseDesktopRef = useRef<HTMLDivElement>(null);
  const [openReel, setOpenReel] = useState<ShowcaseReel | null>(null);

  useGSAP(
    () => {
      gsap.from(".testimonials-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".deck-card");
        const el = showcaseDesktopRef.current;
        if (!cards.length || !el) return;

        const n = cards.length;
        const center = (n - 1) / 2;
        const fanSpread = 200;
        const rotationSpread = 18;
        const arcHeight = 25;

        cards.forEach((card) => {
          gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 0.9,
            opacity: 0,
            zIndex: 1,
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=4000",
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        cards.forEach((card, i) => {
          const offset = i - center;
          const normalizedOffset = offset / center;
          const targetX = offset * fanSpread;
          const targetRotY = -offset * rotationSpread;
          const targetY = Math.pow(normalizedOffset, 2) * arcHeight * 3;
          const targetRotZ = offset * -1.5;
          const targetScale = 1 - Math.abs(normalizedOffset) * 0.08;

          tl.to(
            card,
            {
              x: targetX,
              y: targetY,
              rotationY: targetRotY,
              rotationZ: targetRotZ,
              scale: targetScale,
              opacity: 1,
              zIndex: Math.round((1 - Math.abs(normalizedOffset)) * 10),
              duration: 0.4,
              ease: "power2.out",
            },
            0
          );
        });

        tl.to({}, { duration: 0.15 });

        cards.forEach((card, i) => {
          const offset = i - center;
          const currentX = offset * fanSpread;
          const exitX = currentX - 1400;
          const delay = (n - 1 - i) * 0.025;

          tl.to(
            card,
            {
              x: exitX,
              rotationY: 55,
              opacity: 0,
              duration: 0.45,
              ease: "power2.in",
            },
            0.55 + delay
          );
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="dark-pin-section relative overflow-x-hidden bg-zinc-950">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 sm:pt-20 lg:pt-32">
        <div className="testimonials-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#AE8C20]/20 bg-[#AE8C20]/10 px-4 py-1.5 text-sm font-medium text-[#AE8C20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Customer Love
          </span>
          <h2
            className="mt-5 font-bold tracking-tight text-white sm:mt-6"
            style={{ fontSize: "clamp(1.5rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Visually Stunning 3D <span className="text-[#AE8C20]">Websites</span>
          </h2>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DESKTOP (lg+): 3D pinned scroll deck with sweep exit
      ───────────────────────────────────────────────────────────────── */}
      <div ref={showcaseDesktopRef} className="relative hidden h-screen lg:block">
        <div className="flex h-screen items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute bottom-1/4 left-1/2 h-40 w-[60%] -translate-x-1/2 rounded-full bg-[#AE8C20]/10 blur-[80px]" />

          <div className="pointer-events-none absolute bottom-12 left-1/2 z-10 -translate-x-1/2 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Scroll to explore
            </span>
          </div>

          <div
            className="relative h-full w-full"
            style={{ perspective: "2000px", perspectiveOrigin: "50% 45%" }}
          >
            {SHOWCASE_REELS.map((reel) => (
              <div
                key={`d-${reel.id}`}
                className="deck-card absolute left-1/2 top-[45%] h-[520px] w-[280px]"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
              >
                <ReelCard reel={reel} onOpen={setOpenReel} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MOBILE / TABLET (< lg): Simple swipeable card slider
      ───────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:hidden">
        <p className="mb-5 text-center text-xs text-zinc-400 sm:mb-6 sm:text-sm">
          Swipe to browse — tap any card to view full screen
        </p>

        <div className="-mx-4 pb-4 sm:-mx-6" data-lenis-prevent-touch>
          <Swiper
            slidesPerView="auto"
            spaceBetween={16}
            nested
            slidesOffsetBefore={16}
            slidesOffsetAfter={16}
            threshold={12}
            className="testimonials-mobile-swiper !overflow-x-clip pb-1 sm:!px-[6px]"
            breakpoints={{
              640: { spaceBetween: 20 },
            }}
          >
            {SHOWCASE_REELS.map((reel) => (
              <SwiperSlide key={`m-${reel.id}`} className="!w-[72vw] !max-w-[260px] sm:!w-[56vw] sm:!max-w-[280px]">
                <article className="h-full">
                  <div className="relative aspect-[9/14] w-full overflow-hidden rounded-2xl border border-[#AE8C20]/35 bg-zinc-900 shadow-xl shadow-black/40">
                    <div className="absolute inset-0">
                      <ReelSwipeCard reel={reel} onOpen={setOpenReel} />
                    </div>
                  </div>
                  <div className="mt-3 px-0.5 text-center">
                    <p className="text-sm font-semibold text-white">{reel.title}</p>
                    <p className="mt-1 text-[11px] leading-snug text-zinc-400">{reel.subtitle}</p>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <ReelModal reel={openReel} onClose={() => setOpenReel(null)} />
    </section>
  );
}
