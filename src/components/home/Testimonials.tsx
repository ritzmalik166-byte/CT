"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SHOWCASE_VIDEOS = [
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/10.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/12.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/13.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/14.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/15.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/auto.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/09.mp4",
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

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

      const cards = gsap.utils.toArray<HTMLElement>(".deck-card");
      const n = cards.length;
      const center = (n - 1) / 2;

      // Fan positions: spread from center, each card gets a position in the arc
      // Card 0 = far left, Card center = middle, Card n-1 = far right
      const fanSpread = 160; // px between each card in fully fanned state
      const rotationSpread = 12; // degrees rotation per card from center

      // Initial: all cards stacked at center, no rotation, full opacity
      cards.forEach((card) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          rotationY: 0,
          rotationZ: 0,
          opacity: 1,
          zIndex: 1,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top top",
          end: "+=3500",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Phase 1: Fan out from center (0% -> 35%)
      cards.forEach((card, i) => {
        const offset = i - center; // -3, -2, -1, 0, 1, 2, 3 for 7 cards
        const targetX = offset * fanSpread;
        const targetRotY = offset * rotationSpread; // left cards rotate positive, right cards rotate negative
        const targetRotZ = offset * -2; // subtle Z rotation for arc effect

        tl.to(
          card,
          {
            x: targetX,
            rotationY: targetRotY,
            rotationZ: targetRotZ,
            zIndex: n - Math.abs(offset), // center cards on top
            duration: 0.35,
            ease: "power2.out",
          },
          0
        );
      });

      // Phase 2: Hold the fan visible (35% -> 50%)
      tl.to({}, { duration: 0.15 });

      // Phase 3: Sweep entire fan to the left and exit (50% -> 100%)
      cards.forEach((card, i) => {
        const offset = i - center;
        const currentX = offset * fanSpread;
        const exitX = currentX - 1200; // move everything 1200px to the left
        const delay = (n - 1 - i) * 0.03; // rightmost cards exit slightly later

        tl.to(
          card,
          {
            x: exitX,
            rotationY: 45, // tilt more as they exit left
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
          },
          0.5 + delay
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="dark-pin-section relative bg-zinc-950">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative mx-auto max-w-[1400px] px-6 pt-24 md:pt-32">
        <div className="testimonials-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#AE8C20]/20 bg-[#AE8C20]/10 px-4 py-1.5 text-sm font-medium text-[#AE8C20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Customer Love
          </span>
          <h2 className="mt-6 text-display-lg font-bold text-white">
           Visually Stunning 3D{" "}
            <span className="text-[#AE8C20]">Websites</span>
          </h2>
          {/* <p className="mt-4 text-lg text-zinc-400">
            Join thousands of teams building the future with Contenaissance.
          </p> */}
        </div>
      </div>

      {/* 3D card showcase (scroll-driven, GSAP-pinned) */}
      <div ref={showcaseRef} className="deck-showcase relative h-screen">
        <div className="flex h-screen items-center justify-center overflow-hidden">
          {/* Subtle floor glow */}
          <div className="pointer-events-none absolute bottom-1/4 left-1/2 h-40 w-[60%] -translate-x-1/2 rounded-full bg-[#AE8C20]/10 blur-[80px]" />

          {/* Hint text */}
          <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Scroll to explore
            </span>
          </div>

          {/* Perspective stage */}
          <div
            className="relative h-full w-full"
            style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
          >
            {SHOWCASE_VIDEOS.map((video, i) => (
              <div
                key={video}
                className="deck-card absolute left-1/2 top-1/2 h-[420px] w-[240px] md:h-[500px] md:w-[280px]"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border-2 border-[#AE8C20]/40 bg-zinc-900 shadow-[0_40px_90px_-25px_rgba(0,0,0,0.95),0_0_70px_-12px_rgba(174,140,32,0.4)]">
                  <video
                    src={video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />

                  {/* Inner ring for premium feel */}
                  <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15" />

                  {/* Top sheen */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/15 to-transparent" />

                  {/* Bottom vignette */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Card label */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-md">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                          Reel
                        </div>
                        <div className="text-[11px] font-semibold text-white">
                          {String(i + 1).padStart(2, "0")} / {String(SHOWCASE_VIDEOS.length).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AE8C20]/20">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative mx-auto max-w-[1400px] px-6 pb-24 md:pb-32">
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {["G2 Leader 2024", "Product Hunt #1", "TrustRadius Top Rated", "Gartner Cool Vendor"].map((badge) => (
            <div key={badge} className="text-sm font-medium text-zinc-500">
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
