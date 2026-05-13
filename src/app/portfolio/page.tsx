"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { CTAFooter } from "@/components/home/CTAFooter";
import { HamburgerMenu } from "@/components/home/HamburgerMenu";
import { ReelModal } from "@/components/ui/ReelModal";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

interface Reel {
  id: number;
  title: string;
  subtitle: string;
  video: string;
}

const AI_REELS: Reel[] = [
  {
    id: 1,
    title: "Brand Films",
    subtitle: "Cinematic storytelling",
    video: "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/01.mp4",
  },
  {
    id: 2,
    title: "Commercials",
    subtitle: "Ad campaigns that convert",
    video: "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/02.MP4",
  },
  {
    id: 3,
    title: "Social Content",
    subtitle: "Viral-worthy reels",
    video: "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/03.mp4",
  },
  {
    id: 4,
    title: "Music Videos",
    subtitle: "Visual rhythms",
    video: "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/05.MP4",
  },
  {
    id: 5,
    title: "Documentary",
    subtitle: "Stories that matter",
    video: "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/09.mp4",
  },
];

const HERO_IMAGES = [
  {
    src: "/assets/portfolio1.png",
    alt: "AI cinema frontier artwork",
    rotate: "rotate-[-6deg]",
    translate: "md:translate-y-4",
  },
  {
    src: "/assets/portfolio2.png",
    alt: "AI robot content creator",
    rotate: "rotate-[4deg]",
    translate: "md:-translate-y-6",
  },
  {
    src: "/assets/portfolio3.png",
    alt: "AI face scan visual",
    rotate: "rotate-[-3deg]",
    translate: "md:translate-y-2",
  },
  {
    src: "/assets/portfolio4.png",
    alt: "Human and AI collaboration",
    rotate: "rotate-[5deg]",
    translate: "md:-translate-y-8",
  },
];

const GALLERY_IMAGES = [
  { src: "/assets/G1.jpg", alt: "Gallery visual one", span: "md:col-span-5" },
  { src: "/assets/G2.jpg", alt: "Gallery visual two", span: "md:col-span-4" },
  { src: "/assets/G3.jpg", alt: "Gallery visual three", span: "md:col-span-3 md:row-span-2" },
  { src: "/assets/G4.jpg", alt: "Gallery visual four", span: "md:col-span-4" },
  { src: "/assets/G5.jpg", alt: "Gallery visual five", span: "md:col-span-5" },
  { src: "/assets/G6.jpg", alt: "Gallery visual six", span: "md:col-span-4" },
  { src: "/assets/G7.png", alt: "Gallery visual seven", span: "md:col-span-3 md:row-span-2" },
  { src: "/assets/G8.jpg", alt: "Gallery visual eight", span: "md:col-span-5" },
];

export default function PortfolioPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);
  const reelVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const handleReelHover = (index: number, hover: boolean) => {
    const video = reelVideoRefs.current[index];
    if (!video) return;
    if (hover) {
      video.currentTime = 0;
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  useGSAP(
    () => {
      const heroTitle = pageRef.current?.querySelector(".portfolio-hero-title");
      if (heroTitle) {
        const split = SplitText.create(heroTitle, { type: "chars,words" });
        gsap.fromTo(
          split.chars,
          { y: 90, opacity: 0, rotateX: -70, filter: "blur(10px)" },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: { each: 0.025, from: "start" },
            ease: "back.out(1.5)",
            delay: 0.25,
          }
        );
      }

      gsap.fromTo(
        ".portfolio-hero-copy",
        { y: 35, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, delay: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(
        ".hero-art-card",
        { y: 90, opacity: 0, rotate: 0, scale: 0.82 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          stagger: 0.12,
          ease: "back.out(1.4)",
          delay: 0.45,
        }
      );

      gsap.to(".hero-art-card", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".portfolio-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      const sectionTitles = gsap.utils.toArray<HTMLElement>(".animated-section-title");
      sectionTitles.forEach((title) => {
        const split = SplitText.create(title, { type: "words,chars" });
        gsap.fromTo(
          split.chars,
          { y: 55, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.018,
            ease: "power3.out",
            scrollTrigger: {
              trigger: title,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".reel-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 90, opacity: 0, scale: 0.9, rotateX: 12 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1,
            delay: index * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".gallery-tile").forEach((tile) => {
        const image = tile.querySelector("img");
        gsap.fromTo(
          tile,
          { y: 70, opacity: 0, clipPath: "inset(18% 0% 18% 0%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: tile,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.18 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: tile,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="relative overflow-hidden bg-zinc-950 text-white">
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage="portfolio" />

      <header className="fixed left-0 right-0 top-0 z-50 px-6 py-5 md:px-10 md:py-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/assets/favicon.png"
              alt="Contenaissance"
              width={220}
              height={66}
              className="h-14 w-auto md:h-16"
              priority
            />
          </Link>
        </div>
      </header>

      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((value) => !value)}
        className="group fixed right-5 top-5 z-[110] flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)] md:right-9 md:top-6 md:h-14 md:w-14"
      >
        {menuOpen ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <span className="flex h-5 items-end gap-[3px]">
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-5" />
            <span className="h-5 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-3" />
            <span className="h-3 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-5" />
            <span className="h-4 w-[2.5px] rounded-full bg-current transition-all duration-300 group-hover:h-3" />
          </span>
        )}
      </button>

      <section className="portfolio-hero relative overflow-hidden bg-zinc-950 px-6 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(174,140,32,0.20),transparent_30%),linear-gradient(135deg,#5A3917_0%,#09090b_38%,#09090b_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.55)_75%,#09090b)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          {/* Heading row */}
          <div className="grid gap-10 md:grid-cols-[1fr_420px] md:items-start lg:grid-cols-[1fr_520px]">
            <div>
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.35em] text-[#AE8C20]">
                Curated Portfolio
              </p>
              <h1 className="portfolio-hero-title max-w-4xl text-[clamp(4rem,12vw,10rem)] font-normal leading-[0.82] tracking-[-0.08em] text-white">
                Creative
                <br />
                Portraits
              </h1>
            </div>

            <p className="portfolio-hero-copy max-w-xl text-sm leading-loose text-zinc-300 md:mt-24 md:text-base">
              We bring together elite creators, advanced AI, and strategic direction to craft visual experiences that position brands at the top, not just in the market, but in perception.
            </p>
          </div>

          {/* Image row - sits below the text */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 md:mt-20 md:grid-cols-4 md:gap-6">
            {HERO_IMAGES.map((image) => (
              <div
                key={image.src}
                className={`hero-art-card relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-2 hover:rotate-0 ${image.rotate} ${image.translate}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black px-6 py-24 text-white md:px-10 md:py-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/10 blur-[160px]" />

        <div className="relative mx-auto max-w-[1400px]">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#AE8C20]">
              Featured Productions
            </p>
            <h2 className="animated-section-title bg-white text-white bg-clip-text text-[clamp(3rem,8vw,8rem)] font-bold uppercase leading-[0.82] tracking-[-0.07em] text-transparent">
              Brand Films
            </h2>
            <p className="mt-6 text-sm leading-loose text-zinc-400 md:text-base">
              Hover any card to preview the reel. Click to open the cinematic player.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {AI_REELS.map((reel, index) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => setActiveReel(reel)}
                onMouseEnter={() => handleReelHover(index, true)}
                onMouseLeave={() => handleReelHover(index, false)}
                onFocus={() => handleReelHover(index, true)}
                onBlur={() => handleReelHover(index, false)}
                className="reel-card group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900 text-left shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-2 hover:border-[#AE8C20]/45 hover:shadow-[0_32px_90px_rgba(174,140,32,0.35)]"
              >
                <video
                  ref={(el) => {
                    reelVideoRefs.current[index] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={reel.video} type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10 transition-opacity duration-500 group-hover:from-black/85" />

                {/* <span className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xs font-bold text-white backdrop-blur-md">
                  0{index + 1}
                </span> */}

                {/* <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#AE8C20]/40 bg-[#AE8C20]/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
                  Reel
                </span> */}

                {/* <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                    <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  </span>
                </div> */}

                <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    {reel.subtitle}
                  </p>
                  <h3 className="mt-1.5 text-lg font-bold leading-tight text-white drop-shadow-md md:text-xl">
                    {reel.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-all duration-300 group-hover:gap-2 group-hover:text-[#D4AF37]">
                    Watch
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ReelModal reel={activeReel} onClose={() => setActiveReel(null)} />

      <section className="relative overflow-hidden bg-zinc-950 px-4 py-24 text-white sm:px-6 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-14 max-w-4xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#AE8C20]">
              Visual Systems
            </p>
            <h2 className="animated-section-title text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.85] tracking-[-0.07em]">
              Curated Portfolio
            </h2>
            <p className="mt-6 text-sm leading-loose text-zinc-400 md:text-base">
              A selection of high-impact visual experiences designed to elevate brands and create lasting impressions.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-3 auto-rows-[130px] sm:auto-rows-[160px] md:auto-rows-[200px] md:gap-4">
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.src}
                className={`gallery-tile group col-span-12 overflow-hidden border border-white/10 bg-zinc-900 sm:col-span-6 ${image.span}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={900}
                  height={700}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-125"
                />
              </div>
            ))}

            <div className="gallery-tile col-span-12 flex flex-col justify-center border border-white/10 bg-white p-5 text-zinc-950 md:col-span-4 md:p-7">
              <div className="flex flex-row items-center gap-8 md:flex-col md:items-start md:gap-5">
                <div>
                  <h3 className="text-4xl font-bold tracking-tight md:text-5xl">100+</h3>
                  <p className="mt-1 text-xs text-zinc-500 md:text-sm">Satisfied Clients</p>
                </div>
                <div className="h-8 w-px shrink-0 bg-zinc-200 md:hidden" />
                <div>
                  <h3 className="text-4xl font-bold tracking-tight md:text-5xl">500+</h3>
                  <p className="mt-1 text-xs text-zinc-500 md:text-sm">Projects Delivered</p>
                </div>
              </div>
            </div>

            <div className="gallery-tile col-span-12 flex flex-col justify-center border border-white/10 bg-[#AE8C20] p-5 text-zinc-950 md:col-span-5 md:p-7">
              <h3 className="text-lg font-bold leading-snug tracking-tight md:text-2xl">
                Built to perform.<br />Designed to impress.
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-zinc-900/70 md:text-sm">
                We craft refined digital experiences where creative vision meets strategic execution.
              </p>
              <Link
                href="/services"
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-white hover:text-zinc-950 md:mt-5 md:text-sm"
              >
                Explore Services
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTAFooter />
    </div>
  );
}
