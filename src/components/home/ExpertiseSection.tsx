"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ExpertiseBadge = "films" | "digital" | "campaigns" | "identity";

const USE_CASES: Array<{
  title: string;
  description: string;
  badge: ExpertiseBadge;
}> = [
  {
    badge: "films",
    title: "AI Brand Films",
    description:
      "Discover how to turn your brand story into a cinematic experience via AI-driven 3D technology. We use generative AI to make brand films with dynamic live action in a synthetic environment that boosts your brand and captures imagination!",
  },
  {
    badge: "digital",
    title: "Digital-First Content",
    description:
      "Create high-performing AI-generated content for social media, advertising, reels, digital campaigns, branded storytelling, audience engagement, and multi-platform brand experiences across modern digital ecosystems.",
  },
  {
    badge: "campaigns",
    title: "AI-Powered Campaigns",
    description:
      "Enhance marketing campaigns with AI-driven creative strategy, automated content production, audience targeting, and performance-focused digital advertising.",
  },
  {
    badge: "identity",
    title: "Visual Identity Systems",
    description:
      "Create your brand's AI-driven visual identity system. We design brand frameworks that are memorable and scalable and apply the necessary look and feel to brand touchpoints in an AI-enabled world.",
  },
];

function ExpertiseGifBadge({ src }: Readonly<{ src: string }>) {
  return (
    <span className="relative flex h-12 w-fit max-w-[9rem] items-center justify-start sm:h-14 sm:max-w-[11rem] lg:h-16 lg:max-w-[13rem]">
      <Image
        src={src}
        alt=""
        width={160}
        height={76}
        unoptimized
        className="expert-badge-gif-golden h-12 w-auto max-h-full max-w-none object-contain object-left sm:h-14 lg:h-16"
        aria-hidden
      />
    </span>
  );
}

function ExpertiseBadgeIcon({ badge }: Readonly<{ badge: ExpertiseBadge }>) {
  switch (badge) {
    case "films":
      return <ExpertiseGifBadge src="/assets/film-shooting.gif" />;
    case "digital":
      return <ExpertiseGifBadge src="/assets/content-marketing.gif" />;
    case "campaigns":
      return <ExpertiseGifBadge src="/assets/copywriting.gif" />;
    case "identity":
      return <ExpertiseGifBadge src="/assets/visualization.gif" />;
  }
}

export function ExpertiseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const pin = pinRef.current;
      if (!section || !pin) return;

      const mm = gsap.matchMedia();

      /** Desktop lg+ (≥1024px): pin heading + scrubbed horizontal row */
      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll(".use-case-card"),
        );
        if (cards.length === 0) return;

        cards.forEach((card, i) => {
          card.style.zIndex = String(10 + i);
        });

        const lead = cards[0];
        const rest = cards.slice(1);

        gsap.set(lead, { scaleX: 0.9, transformOrigin: "50% 50%" });
        gsap.set(rest, { yPercent: 108, opacity: 0.25, force3D: true });

        const track = section.querySelector<HTMLElement>(".expertise-track");

        /** Pin + scrub can confuse flex/stretch; normalize row height once layout is stable. */
        let equalizeRaf = 0;
        const syncEqualCardRowHeight = () => {
          cancelAnimationFrame(equalizeRaf);
          equalizeRaf = requestAnimationFrame(() => {
            equalizeRaf = 0;
            if (!window.matchMedia("(min-width: 1024px)").matches) {
              cards.forEach((c) => c.style.removeProperty("min-height"));
              return;
            }
            cards.forEach((c) => {
              c.style.removeProperty("min-height");
            });
            void track?.offsetHeight;
            const mh = Math.max(0, ...cards.map((c) => Math.ceil(c.offsetHeight)));
            if (mh <= 1) return;
            cards.forEach((c) => {
              c.style.minHeight = `${mh}px`;
            });
          });
        };

        let roCleanup: () => void = () => {};

        if (typeof ResizeObserver !== "undefined" && track) {
          let roScheduled = false;
          const scheduleFromRo = (): void => {
            if (roScheduled) return;
            roScheduled = true;
            requestAnimationFrame(() => {
              roScheduled = false;
              syncEqualCardRowHeight();
            });
          };

          const ro = new ResizeObserver(scheduleFromRo);
          ro.observe(track);
          roCleanup = () => {
            ro.disconnect();
          };
        }

        const segment = 0.95;
        const introPad = 0.12;
        const scrollMultiplier = 0.4;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () =>
              `+=${Math.max(
                window.innerHeight * scrollMultiplier * (cards.length + introPad * 1.35),
                1,
              )}`,
            scrub: 0.55,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: syncEqualCardRowHeight,
            onLeaveBack: syncEqualCardRowHeight,
            onEnterBack: syncEqualCardRowHeight,
          },
        });

        tl.to(
          lead,
          { scaleX: 1, duration: segment * 0.55, ease: "none" },
          introPad,
        );

        rest.forEach((card, i) => {
          const start = introPad + segment * 0.45 + i * segment;
          tl.to(
            card,
            { yPercent: 0, opacity: 1, duration: segment * 0.92, ease: "none" },
            start,
          );
        });

        const onWinResize = () => syncEqualCardRowHeight();
        window.addEventListener("resize", onWinResize);
        const onStRefreshComplete = () => syncEqualCardRowHeight();
        ScrollTrigger.addEventListener("refresh", onStRefreshComplete);
        syncEqualCardRowHeight();

        return () => {
          ScrollTrigger.removeEventListener("refresh", onStRefreshComplete);
          window.removeEventListener("resize", onWinResize);
          cancelAnimationFrame(equalizeRaf);
          roCleanup();
          tl.scrollTrigger?.kill();
          tl.kill();
          cards.forEach((c) => {
            c.style.removeProperty("z-index");
            c.style.removeProperty("min-height");
          });
          gsap.set(cards, { clearProps: "transform,opacity" });
        };
      });

      /** Tablet only 768–1023px: 2×2 layout via CSS — no scrub / pin */
      mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
        const header = section.querySelector(".expertise-header");
        const cards = section.querySelectorAll(".use-case-card");

        const headerTween = header
          ? gsap.fromTo(
              header,
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: header,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              },
            )
          : null;

        const cardCleanups: Array<() => void> = [];
        cards.forEach((card) => {
          const tween = gsap.fromTo(
            card,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.52,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 93%",
                toggleActions: "play none none none",
              },
            },
          );
          cardCleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });

        return () => {
          if (headerTween) {
            headerTween.scrollTrigger?.kill();
            headerTween.kill();
          }
          cardCleanups.forEach((fn) => fn());
        };
      });

      /** Mobile &lt;768px: header + simple card fades (no pin stack). */
      mm.add("(max-width: 767px)", () => {
        const header = section.querySelector(".expertise-header");
        const cards = section.querySelectorAll(".use-case-card");

        const headerTween = header
          ? gsap.fromTo(
              header,
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: header,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              },
            )
          : null;

        const cardCleanups: Array<() => void> = [];
        cards.forEach((card) => {
          const tween = gsap.fromTo(
            card,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.55,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
          cardCleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });

        return () => {
          if (headerTween) {
            headerTween.scrollTrigger?.kill();
            headerTween.kill();
          }
          cardCleanups.forEach((fn) => fn());
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-white pb-6 md:pb-10 lg:pb-12 xl:pb-14 min-[1920px]:pb-16 min-[2560px]:pb-[4.25rem]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[320px] w-[320px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[color:color-mix(in_srgb,var(--gold-favicon-base)_6%,transparent)] blur-[72px] md:h-[600px] md:w-[600px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] translate-y-1/2 -translate-x-1/2 rounded-full bg-[color:color-mix(in_srgb,var(--gold-favicon-base)_6%,transparent)] blur-[72px] md:h-[600px] md:w-[600px] md:blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,92rem)] px-4 pt-14 pb-6 sm:px-6 md:px-8 md:pt-12 md:pb-8 lg:max-w-[100rem] lg:px-10 lg:pb-0 xl:max-w-[110rem] xl:px-12 2xl:max-w-[120rem] 2xl:px-16 min-[1920px]:max-w-[130rem] min-[1920px]:px-20 min-[2560px]:max-w-[148rem] min-[2560px]:px-28">
        <div
          ref={pinRef}
          className="expertise-pin flex w-full flex-col gap-7 sm:gap-8 md:gap-8 lg:gap-12 xl:gap-14 min-[1920px]:gap-16 min-[2560px]:gap-[4.25rem]"
        >
          <div className="expertise-header mx-auto w-full max-w-3xl text-center xl:max-w-4xl min-[1920px]:max-w-5xl min-[2560px]:max-w-6xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--gold-favicon-base)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--gold-favicon-base)_5%,transparent)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-favicon-base)] sm:text-xs 2xl:px-5 2xl:py-2 2xl:text-sm min-[2560px]:text-base">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold-favicon-base)]" />
              Expertise
            </span>
            <h2 className="mt-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-[color:var(--gold-favicon-mid)] bg-clip-text text-2xl font-bold leading-[1.05] tracking-tight text-transparent sm:mt-5 sm:text-5xl md:text-6xl lg:mt-5 lg:text-7xl xl:text-8xl xl:leading-[1.02] 2xl:text-[5.75rem] 2xl:leading-none min-[1920px]:text-[6.5rem] min-[2560px]:mt-6 min-[2560px]:text-[clamp(7rem,5.25vw,8.5rem)]">
              AI Creative Services
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 sm:mt-4 sm:text-base md:text-lg xl:max-w-3xl xl:text-xl xl:leading-relaxed 2xl:mt-5 2xl:text-2xl 2xl:leading-snug min-[2560px]:mt-6 min-[2560px]:max-w-4xl min-[2560px]:text-[1.625rem]">
              AI-powered creative solutions for campaigns, content, branding, &
              digital experiences.
            </p>
          </div>

          <div className="relative w-full overflow-visible pb-8 sm:pb-10 md:pb-8 lg:pb-0 min-[2560px]:pb-0">
            <div className="expertise-track flex w-full flex-col gap-6 md:mx-auto md:grid md:max-w-4xl md:grid-cols-2 md:items-stretch md:gap-x-6 md:gap-y-7 md:py-2 lg:grid lg:h-auto lg:max-h-none lg:w-full lg:max-w-[1680px] lg:grid-cols-4 lg:gap-5 lg:py-0 xl:gap-7 2xl:max-w-[90rem] 2xl:gap-8 min-[1920px]:max-w-[100rem] min-[1920px]:gap-9 min-[2560px]:max-w-[118rem] min-[2560px]:gap-10 min-[2560px]:py-2">
          {USE_CASES.map((useCase) => (
            <article
              key={useCase.title}
              className="use-case-card group relative mx-auto flex h-full w-full max-w-xl min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-5 md:h-full md:mx-auto md:max-lg:mx-auto md:max-lg:max-h-none md:max-lg:w-full md:max-lg:shadow-none md:max-lg:flex-none md:rounded-2xl md:p-6 lg:mx-0 lg:max-w-none lg:h-full lg:min-h-0 lg:rounded-3xl lg:shadow-[0_20px_50px_-15px_rgba(24,24,27,0.12)] lg:p-6 2xl:p-7 2xl:shadow-[0_24px_55px_-18px_rgba(24,24,27,0.14)] min-[1920px]:p-8 min-[2560px]:rounded-[1.75rem] min-[2560px]:p-10"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-full group-hover:opacity-100"
                style={{ mixBlendMode: "soft-light" }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[color:color-mix(in_srgb,var(--gold-favicon-mid)_50%,transparent)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[color:color-mix(in_srgb,var(--gold-favicon-base)_0%,transparent)] blur-3xl transition-all duration-700 group-hover:bg-[color:color-mix(in_srgb,var(--gold-favicon-base)_15%,transparent)]"
              />

              <div className="relative flex min-h-[220px] flex-1 flex-col sm:min-h-[240px] md:min-h-0 lg:min-h-0">
                <div
                  className="expertise-card-icon mb-1 flex min-h-[3rem] w-fit shrink-0 items-center sm:mb-2 sm:min-h-[3.5rem] lg:min-h-16 [&_img]:max-w-none [&_svg]:h-9 [&_svg]:max-w-none [&_svg]:w-auto lg:[&_svg]:h-11"
                  aria-hidden
                >
                  <ExpertiseBadgeIcon badge={useCase.badge} />
                </div>
                <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-zinc-900 sm:mt-3 md:max-lg:text-lg lg:text-xl xl:text-[1.35rem] 2xl:text-2xl min-[1920px]:text-[1.65rem] min-[2560px]:text-[clamp(1.5rem,1.1vw,2rem)]">
                  {useCase.title}
                </h3>
                <p className="mt-1.5 text-sm leading-snug text-zinc-600 md:mt-2 md:max-lg:text-[0.9375rem] md:max-lg:leading-snug lg:text-[15px] lg:leading-snug xl:text-base 2xl:text-[1.0625rem] min-[1920px]:text-lg min-[2560px]:text-[clamp(1.05rem,0.95vw,1.25rem)] min-[2560px]:leading-relaxed">
                  {useCase.description}
                </p>
                <a
                  href="/contact"
                  className="mt-auto inline-flex items-center gap-2 self-start pt-4 text-sm font-semibold text-[color:var(--gold-favicon-mid)] transition-all duration-300 group-hover:gap-3 md:pt-5 xl:text-base 2xl:text-lg min-[1920px]:pt-6 min-[2560px]:text-xl min-[2560px]:gap-3"
                >
                  Explore Now
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            </article>
          ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
