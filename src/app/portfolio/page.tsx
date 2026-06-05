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

type ActiveReelState = {
  reel: Reel;
  preview: HTMLVideoElement | null;
} | null;

const AI_REELS: Reel[] = [
  {
    id: 1,
    title: "Brand Films",
    subtitle: "Cinematic storytelling",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/01.mp4",
  },
  {
    id: 2,
    title: "Commercials",
    subtitle: "Ad campaigns that convert",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/02.MP4",
  },
  {
    id: 3,
    title: "Social Content",
    subtitle: "Viral-worthy reels",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/03.mp4",
  },
  {
    id: 4,
    title: "Music Videos",
    subtitle: "Visual rhythms",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/05.MP4",
  },
  {
    id: 5,
    title: "Documentary",
    subtitle: "Stories that matter",
    video: "https://contenaissance.blob.core.windows.net/ct-assets/09.mp4",
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
  const [activeReel, setActiveReel] = useState<ActiveReelState>(null);
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

      <Link
        href="/"
        title="Home"
        onClick={() => setMenuOpen(false)}
        className="fixed left-4 top-4 z-[var(--z-chrome)] sm:left-5 sm:top-5 md:left-9 md:top-6"
      >
        <Image
          src="/assets/favicon.png"
          alt="Contenaissance"
          title="Contenaissance"
          width={220}
          height={66}
          className="h-10 w-auto sm:h-12 md:h-16"
          priority
        />
      </Link>

      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((value) => !value)}
        className="group fixed right-4 top-4 z-[var(--z-chrome)] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)] sm:right-5 sm:top-5 sm:h-12 sm:w-12 md:right-9 md:top-6 md:h-14 md:w-14"
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

      <section className="portfolio-hero relative overflow-hidden bg-zinc-950 px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 md:px-12 md:pb-36 md:pt-44 xl:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(174,140,32,0.20),transparent_30%),linear-gradient(135deg,#5A3917_0%,#09090b_38%,#09090b_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.55)_75%,#09090b)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          {/* Heading row */}
          <div className="grid gap-6 text-center sm:gap-8 md:grid-cols-[1fr_340px] md:items-start md:gap-8 md:text-left lg:grid-cols-[1fr_480px] lg:gap-10">
            <div>
              <h1 className="portfolio-hero-title mb-3 text-[2.75rem] font-normal leading-[0.9] tracking-[-0.06em] text-white sm:mb-4 sm:text-[3.5rem] md:mb-6 md:text-[4.5rem] lg:text-[6rem] xl:text-[8rem]">
                AI Creative
                <br />
                Experiences
              </h1>
            </div>

            <p className="portfolio-hero-copy mx-auto max-w-md text-sm leading-loose text-zinc-300 sm:max-w-lg md:mx-0 md:mt-16 md:text-[15px] lg:mt-24 lg:max-w-xl lg:text-base">
            Explore AI-generated campaigns, digital content, visual storytelling, and creative experiences built for modern brands.
            </p>
          </div>

          {/* Image row - sits below the text */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 md:mt-20 md:grid-cols-4 md:gap-6">
            {HERO_IMAGES.map((image) => (
              <div
                key={image.src}
                className={`hero-art-card relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-2 hover:rotate-0 sm:rounded-[1.75rem] ${image.rotate} ${image.translate}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  title={image.alt}
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

      <section className="relative overflow-hidden bg-black px-4 py-20 text-white sm:px-6 sm:py-24 md:px-12 md:py-36 xl:px-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/10 blur-[160px]" />

        <div className="relative mx-auto max-w-[1400px]">
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#AE8C20] sm:mb-4 sm:text-xs">
              Featured Productions
            </p>
            <h2 className="animated-section-title bg-white text-white bg-clip-text text-[clamp(2.5rem,8vw,8rem)] font-bold uppercase leading-[0.92] tracking-[-0.07em] text-transparent">
              Brand Films
            </h2>
            <p className="mt-4 text-sm leading-loose text-zinc-400 sm:mt-6 md:text-base">
              Hover any card to preview the reel. Click to open the cinematic player.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
            {AI_REELS.map((reel, index) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => {
                  const preview = reelVideoRefs.current[index] ?? null;
                  void preview?.play().catch(() => undefined);
                  setActiveReel({ reel, preview });
                }}
                onMouseEnter={() => handleReelHover(index, true)}
                onMouseLeave={() => handleReelHover(index, false)}
                onFocus={() => handleReelHover(index, true)}
                onBlur={() => handleReelHover(index, false)}
                className="reel-card group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900 text-left shadow-[0_24px_70px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-2 hover:border-[#AE8C20]/45 hover:shadow-[0_32px_90px_rgba(174,140,32,0.35)] sm:rounded-[1.75rem]"
              >
                <video
                  ref={(el) => {
                    reelVideoRefs.current[index] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={reel.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                />

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

                <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] sm:text-[10px] sm:tracking-[0.25em]">
                    {reel.subtitle}
                  </p>
                  <h3 className="mt-1 text-sm font-bold leading-tight text-white drop-shadow-md sm:mt-1.5 sm:text-lg md:text-xl">
                    {reel.title}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-all duration-300 group-hover:gap-2 group-hover:text-[#D4AF37] sm:mt-3 sm:text-[10px] sm:tracking-[0.2em]">
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

      <ReelModal
        reel={activeReel?.reel ?? null}
        previewVideo={activeReel?.preview}
        onClose={() => setActiveReel(null)}
      />

      <section className="relative overflow-hidden bg-zinc-950 px-4 py-20 text-white sm:px-6 sm:py-24 md:px-12 md:py-36 xl:px-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto mb-10 max-w-5xl text-center sm:mb-14">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#AE8C20] sm:mb-4 sm:text-xs">
              Visual Systems
            </p>
            <h2 className="animated-section-title text-[clamp(2.5rem,8vw,6rem)] font-bold leading-[0.9] tracking-[-0.07em]">
             AI Creative Experiences
            </h2>
            <p className="mt-4 text-sm leading-loose text-zinc-400 sm:mt-6 md:text-base">
            A Selection of AI-powered visuals, campaigns, and digital experiences crafted for modern brands.
            </p>
          </div>

          <div className="grid grid-cols-12 auto-rows-[110px] gap-2.5 sm:auto-rows-[140px] sm:gap-3 md:auto-rows-[180px] md:gap-4 lg:auto-rows-[200px]">
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.src}
                className={`gallery-tile group col-span-6 overflow-hidden border border-white/10 bg-zinc-900 ${image.span}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  title={image.alt}
                  width={900}
                  height={700}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-125"
                />
              </div>
            ))}

            {/* Stats Card - spans 2 rows on mobile for enough height */}
            <div className="gallery-tile col-span-6 row-span-2 flex flex-col justify-center border border-white/10 bg-white p-4 text-center text-zinc-950 sm:col-span-6 sm:p-5 md:col-span-4 md:row-span-1 md:p-6 md:text-left lg:p-7">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6 md:flex-col md:items-start md:justify-start md:gap-4">
                <div>
                  <p className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">100+</p>
                  <p className="mt-0.5 text-[9px] text-zinc-500 sm:mt-1 sm:text-[10px] md:text-xs lg:text-sm">Satisfied Clients</p>
                </div>
                <div className="h-px w-10 shrink-0 bg-zinc-200 sm:h-8 sm:w-px md:hidden" />
                <div>
                  <p className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">500+</p>
                  <p className="mt-0.5 text-[9px] text-zinc-500 sm:mt-1 sm:text-[10px] md:text-xs lg:text-sm">Projects Delivered</p>
                </div>
              </div>
            </div>

            {/* CTA Card - spans 2 rows on mobile for enough height */}
            <div className="gallery-tile col-span-6 row-span-2 flex flex-col justify-center border border-white/10 bg-[#AE8C20] p-4 text-center text-zinc-950 sm:col-span-6 sm:p-5 md:col-span-5 md:row-span-1 md:p-6 md:text-left lg:p-7">
              <p className="text-xs font-bold leading-snug tracking-tight sm:text-sm md:text-base lg:text-xl xl:text-2xl">
                Built to perform.<br />Designed to impress.
              </p>
              <p className="mt-2 text-[9px] leading-relaxed text-zinc-900/70 sm:mt-2.5 sm:text-[10px] md:mt-3 md:text-xs lg:text-sm">
                We craft refined digital experiences where creative vision meets strategic execution.
              </p>
              <Link
                href="/services"
                title="Services"
                className="mx-auto mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 text-[9px] font-bold text-white transition-all duration-300 hover:bg-white hover:text-zinc-950 sm:mt-3 sm:gap-2 sm:px-4 sm:py-2 sm:text-[10px] md:mx-0 md:mt-4 md:px-5 md:py-2.5 md:text-xs lg:text-sm"
              >
                Explore Services
                <svg className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTAFooter showBrandHeading={false} />
    </div>
  );
}
