"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { ReelModal } from "@/components/ui/ReelModal";
import {
  pauseVideoSafe,
  playVideoSafe,
  releaseVideoSrc,
  warmVideoSrc,
} from "@/lib/video-playback";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type EnterDirection = "right" | "left" | "bottom" | "top";

interface Reel {
  id: number;
  title: string;
  subtitle: string;
  video: string;
  enterFrom: EnterDirection;
}

const REELS: Reel[] = [
  {
    id: 1,
    title: "Brand Films",
    subtitle: "Cinematic storytelling",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/01.mp4",
    enterFrom: "right",
  },
  {
    id: 2,
    title: "Commercials",
    subtitle: "Ad campaigns that convert",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/02.MP4",
    enterFrom: "right",
  },
  {
    id: 3,
    title: "Social Content",
    subtitle: "Viral-worthy reels",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/03.mp4",
    enterFrom: "bottom",
  },
  {
    id: 4,
    title: "Music Videos",
    subtitle: "Visual rhythms",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/05.MP4",
    enterFrom: "left",
  },
  {
    id: 5,
    title: "Documentary",
    subtitle: "Stories that matter",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/09.mp4",
    enterFrom: "top",
  },
];

const enterOffsets: Record<EnterDirection, { x: string; y: string }> = {
  right: { x: "120vw", y: "0" },
  left: { x: "-120vw", y: "0" },
  bottom: { x: "0", y: "110vh" },
  top: { x: "0", y: "-110vh" },
};

const exitOffsets: Record<EnterDirection, { x: string; y: string }> = {
  right: { x: "-120vw", y: "0" },
  left: { x: "120vw", y: "0" },
  bottom: { x: "0", y: "-110vh" },
  top: { x: "0", y: "110vh" },
};

export function AIFeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openReel, setOpenReel] = useState<Reel | null>(null);

  useGSAP(
    () => {
      gsap.from(".features-header", {
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

      const buildTimeline = (mobile: boolean) => {
        const reels = reelRefs.current.filter(Boolean) as HTMLDivElement[];
        if (reels.length === 0) return null;

        const use3d = !mobile;
        const segmentLength = mobile ? 0.68 : 1;
        const scrub = mobile ? 0.12 : 1;

        reels.forEach((reel, i) => {
          if (i === 0) {
            gsap.set(reel, { x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 });
          } else {
            const offset = enterOffsets[REELS[i].enterFrom];
            gsap.set(reel, {
              x: offset.x,
              y: offset.y,
              opacity: 0,
              scale: mobile ? 0.85 : 0.7,
              rotateY:
                use3d &&
                (REELS[i].enterFrom === "right" || REELS[i].enterFrom === "left")
                  ? 35
                  : 0,
            });
          }
        });

        const transitionsCount = reels.length - 1;

        const videos = reels.map(
          (reel) => reel.querySelector("video") as HTMLVideoElement | null
        );

        const syncReelPlayback = (progress: number) => {
          const max = Math.max(1, reels.length - 1);
          const cursor = progress * max;
          videos.forEach((video, i) => {
            if (!video) return;
            const near = Math.abs(i - cursor) <= 1.05;
            if (near) warmVideoSrc(video);
            if (Math.abs(i - cursor) < 0.9) playVideoSafe(video);
            else pauseVideoSafe(video);
          });
        };

        const tl = gsap.timeline({
          defaults: { duration: 0.85, ease: "power2.out" },
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top top",
            end: `+=${transitionsCount * segmentLength * 100}%`,
            pin: true,
            pinSpacing: true,
            scrub,
            anticipatePin: mobile ? 0.5 : 1,
            fastScrollEnd: mobile,
            invalidateOnRefresh: true,
            onUpdate: (self) => syncReelPlayback(self.progress),
            onEnter: (self) => syncReelPlayback(self.progress),
            onEnterBack: (self) => syncReelPlayback(self.progress),
            onLeave: () => videos.forEach((video) => video && pauseVideoSafe(video)),
            onLeaveBack: () => videos.forEach((video) => video && pauseVideoSafe(video)),
            ...(mobile ? { refreshPriority: -1 } : {}),
          },
        });

        reels.forEach((reel, i) => {
          if (i === 0) return;

          const prev = reels[i - 1];
          const incomingFrom = REELS[i].enterFrom;
          const exitOffset = exitOffsets[incomingFrom];
          const exitRotY =
            use3d && (incomingFrom === "right" || incomingFrom === "left")
              ? incomingFrom === "right"
                ? -35
                : 35
              : 0;

          tl.to(
            prev,
            {
              x: exitOffset.x,
              y: exitOffset.y,
              opacity: 0,
              scale: mobile ? 0.85 : 0.7,
              rotateY: exitRotY,
              ease: "power2.in",
            },
            i - 1
          );

          tl.to(
            reel,
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              rotateY: 0,
            },
            i - 1 + 0.08
          );
        });

        return tl;
      };

      mm.add("(min-width: 768px)", () => {
        const tl = buildTimeline(false);
        return () => {
          tl?.scrollTrigger?.kill();
          tl?.kill();
        };
      });

      mm.add("(max-width: 767px)", () => {
        const tl = buildTimeline(true);
        return () => {
          tl?.scrollTrigger?.kill();
          tl?.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const videosOf = () =>
      reelRefs.current.map(
        (reel) => reel?.querySelector("video") ?? null
      );

    const loadObs = new IntersectionObserver(
      ([entry]) => {
        const videos = videosOf();
        if (entry.isIntersecting) {
          videos.forEach((video) => video && warmVideoSrc(video));
          return;
        }
        videos.forEach((video) => {
          if (!video) return;
          pauseVideoSafe(video);
          releaseVideoSrc(video);
        });
      },
      { root: null, rootMargin: "80% 0px", threshold: 0 }
    );

    const playObs = new IntersectionObserver(
      ([entry]) => {
        reelRefs.current.forEach((reel) => {
          const video = reel?.querySelector("video");
          if (!reel || !video) return;
          if (!entry.isIntersecting) {
            pauseVideoSafe(video);
            return;
          }
          const opacity = Number.parseFloat(getComputedStyle(reel).opacity);
          if (opacity > 0.2) playVideoSafe(video);
          else pauseVideoSafe(video);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );

    loadObs.observe(section);
    playObs.observe(stage);
    return () => {
      loadObs.disconnect();
      playObs.disconnect();
      videosOf().forEach((video) => video && pauseVideoSafe(video));
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="features-section relative overflow-hidden bg-zinc-950"
    >
      {/* Pinned stage - keeps the dark bg locked through the entire scroll */}
      <div
        ref={stageRef}
        className="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden bg-zinc-950 pt-16 md:pt-20"
      >
        {/* Background gradient mesh — lighter blur on small screens to reduce scroll jank */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-[#AE8C20]/10 blur-[72px] md:h-[600px] md:w-[600px] md:blur-[120px]" />
          <div className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-[#AE8C20]/10 blur-[72px] md:h-[600px] md:w-[600px] md:blur-[120px]" />
        </div>

        {/* Header */}
        <div className="features-header relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="bg-gradient-to-r from-[#AE8C20] to-[#C9A730] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            AI Reels
          </h2>
          {/* <p className="mt-4 text-base text-zinc-400 md:text-lg">
            Everything you need to build, deploy, and scale intelligent applications.
            No infrastructure headaches. Just pure innovation.
          </p> */}
        </div>

        {/* Reels stage — no 3D perspective below md (avoids noisy GPU compositing with touch scroll) */}
        <div
          className="relative mt-4 flex w-full flex-1 items-center justify-center md:[perspective:1500px]"
        >
          {REELS.map((reel, i) => (
            <div
              key={reel.id}
              ref={(el) => {
                reelRefs.current[i] = el;
              }}
              className="reel-stage absolute max-md:transform-gpu md:[transform-style:preserve-3d]"
              style={{ willChange: "transform, opacity" }}
            >
              <button
                type="button"
                onClick={() => setOpenReel(reel)}
                className="reel-circle group relative cursor-pointer focus:outline-none"
                aria-label={`Open ${reel.title}`}
              >
                {/* Decorative ring */}
                <div className="reel-ring absolute -inset-4 rounded-full border border-[#AE8C20]/20 transition-colors duration-500 group-hover:border-[#AE8C20]/45 md:-inset-6" />

                {/* Video circle */}
                <div className="relative h-[220px] w-[220px] overflow-hidden rounded-full border-[3px] border-[#AE8C20]/35 bg-zinc-900 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.85),0_0_28px_-14px_rgba(174,140,32,0.55)] transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:border-[#AE8C20]/80 sm:h-[260px] sm:w-[260px] md:h-[360px] md:w-[360px] md:shadow-[0_28px_80px_-28px_rgba(0,0,0,0.95),0_0_42px_-18px_rgba(174,140,32,0.75)] md:group-hover:scale-[1.03] md:group-hover:shadow-[0_30px_90px_-28px_rgba(0,0,0,1),0_0_70px_-12px_rgba(174,140,32,0.65)] lg:h-[420px] lg:w-[420px]">
                  <video
                    className="pointer-events-none h-full w-full object-cover"
                    data-src={reel.video}
                    loop
                    muted
                    playsInline
                    preload="none"
                  />

                  {/* Soft vignette */}
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                  {/* Play icon overlay on hover */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#AE8C20]/90 shadow-lg shadow-[#AE8C20]/50 backdrop-blur-sm md:h-20 md:w-20">
                      <svg className="ml-1 h-7 w-7 text-zinc-950 md:h-9 md:w-9" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="absolute inset-x-0 bottom-6 flex flex-col items-center text-center md:bottom-10">
                    <h3 className="text-xl font-bold text-white drop-shadow-md md:text-2xl">
                      {reel.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-200/90 md:text-sm">
                      {reel.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="relative z-10 mb-8 flex items-center gap-2">
          {REELS.map((reel) => (
            <div
              key={reel.id}
              className="h-1.5 w-6 rounded-full bg-zinc-700/60 md:w-8"
            />
          ))}
        </div>
      </div>

      {/* Cinematic reel modal */}
      <ReelModal reel={openReel} onClose={() => setOpenReel(null)} />
    </section>
  );
}
