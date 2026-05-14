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

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const VIDEOS = [
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/home.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/Mzha%20Nhi%20Aaya-02.1.mp4",
  "https://lfnxmldvqzqsgjigzibk.supabase.co/storage/v1/object/public/Contenaisaance/website_popup%20to%20view.mp4",
];

const VIDEO_SHOWCASES = [
  {
    video: VIDEOS[1],
    title: "Cinematic Excellence",
    subtitle: "Experience the future of storytelling",
  },
  {
    video: VIDEOS[2],
    title: "Digital Innovation",
    subtitle: "Where Creativity Meets Technology",
  },
];

type ServiceParagraphSegment = string | { h: string; em?: boolean };

type ServiceDefinition = {
  id: string;
  title: string;
  video: string;
  theme: "dark" | "light";
  features: string[];
  paragraphs: ServiceParagraphSegment[][];
};

function ServiceParagraphBody({
  segments,
  isDark,
}: {
  segments: ServiceParagraphSegment[];
  isDark: boolean;
}) {
  const highlightClass = isDark
    ? "font-bold text-[#AE8C20]"
    : "font-bold text-zinc-950";
  return segments.map((seg, i) =>
    typeof seg === "string" ? (
      <span key={i}>{seg}</span>
    ) : (
      <strong
        key={i}
        className={`${highlightClass}${seg.em ? " italic" : ""}`}
      >
        {seg.h}
      </strong>
    )
  );
}

const SERVICES: ServiceDefinition[] = [
  {
    id: "ai-brand-films",
    title: "AI Brand Films",
    video: VIDEOS[1],
    theme: "dark",
    features: [
      "AI-POWERED BRAND FILMS",
      "GENERATIVE AI STORYTELLING",
      "INTERACTIVE BRAND EXPERIENCES",
      "AI CINEMATIC MARKETING",
    ],
    paragraphs: [
      [
        "Find out how ",
        { h: "3D technology powered by AI", em: true },
        " can change the story of your brand into the cinema. Our group employs the use of ",
        { h: "generative AI" },
        " to produce amazing brand videos that mesh live-action with virtual environments to ensure a built-up visual experience. Our brand films powered by AI enhance your company's story engaging viewers with captivating visuals and creative narrative.",
      ],
      [
        "Through our AI brand films, the audience can become emotionally attached to your brand and be more aware of it. We combine the latest ",
        { h: "AI technology" },
        " with traditional storytelling to create a brand film that is better than the competition. A unique audiovisual and interactive experience leaves a lasting impression and significantly enhances your brand value.",
      ],
      [
        { h: "AI brand films" },
        " are the marketing of the future whether you need a corporate presentation, a digital ad, or something for social media. With our creative approach, we'll ensure that your brand stands apart from the competition and is an experience to remember. ",
        { h: "AI filmmaking" },
        " tells the story of your brand in the most futuristic and attention-grabbing way possible.",
      ],
    ],
  },
  {
    id: "digital-first-content",
    title: "Digital-First Content",
    video: VIDEOS[0],
    theme: "light",
    features: [
      "PLATFORM-SPECIFIC CONTENT",
      "AI-DRIVEN CONTENT CREATION",
      "CONTEXTUALLY RELEVANT CONTENT",
      "PERFORMANCE OPTIMIZATION WITH AI ANALYTICS",
    ],
    paragraphs: [
      [
        "In today’s digital-first world, audiences consume content faster than ever, making ",
        { h: "high-quality AI-generated content" },
        " and ",
        { h: "digital storytelling" },
        " essential for modern brands. Using advanced ",
        { h: "AI-powered creative services," },
        " we create engaging visual content, social media creatives, website content, digital campaigns, branded visuals, and performance-driven marketing assets that instantly connect with your audience across every platform.",
      ],
      [
        "From social media marketing and ",
        { h: "AI-powered advertising campaigns" },
        " to website visuals, e-commerce creatives, and mobile-first digital experiences, our AI creative studio develops platform-specific content tailored to audience behavior, engagement trends, and brand identity. Every visual and campaign is strategically designed to improve audience engagement, brand visibility, and digital performance.",
      ],
      [
        "Using ",
        { h: "AI content optimization," },
        " ",
        { h: "creative automation," },
        " and ",
        { h: "audience analytics," },
        " we continuously refine campaigns for maximum reach, engagement, and conversion rates. Whether you're launching a product, building ",
        { h: "brand awareness," },
        " scaling an e-commerce ",
        { h: "business," },
        " or running a ",
        { h: "digital marketing campaign," },
        " our ",
        { h: "AI-powered content solutions" },
        " deliver impactful experiences across modern digital platforms.",
      ],
    ],
  },
  {
    id: "ai-powered-campaigns",
    title: "AI Powered Campaigns",
    video: VIDEOS[2],
    theme: "dark",
    features: [
      "MAXIMIZE MARKETING IMPACT",
      "DATA-DRIVEN DECISIONS",
      "MARKET ANALYSIS & OPTIMIZATION",
      "SCALABLE AI CAMPAIGNS",
    ],
    paragraphs: [
      [
        "Make full use of the potential of your ",
        { h: "AI-powered marketing campaigns" },
        " to drive better results, improve audience engagement, and increase profits. We use advanced AI marketing technology and data-driven marketing strategies to help brands reach their target audience with maximum precision and performance. By analyzing user behavior, campaign performance, and audience insights, we ensure your advertising budget is optimized for the highest possible ROI.",
      ],
      [
        "Our AI-powered campaign management enhances every aspect of modern digital marketing. Using predictive analytics, performance marketing, and AI audience targeting, we analyze large-scale data to optimize campaigns across multiple digital platforms. This intelligent approach helps improve conversion rates, strengthen brand visibility, and maximize returns on ad spend.",
      ],
      [
        "Integrating AI-driven marketing solutions into your campaigns allows businesses to scale faster and adapt to changing market trends and consumer behavior. From social media marketing and ",
        { h: "AI advertising campaigns" },
        " to ",
        { h: "email marketing, digital branding, and performance-driven content strategies," },
        " our AI-powered services are designed to deliver measurable, result-oriented growth across every digital channel.",
      ],
    ],
  },
  {
    id: "visual-identity",
    title: "Visual Identity System",
    video: VIDEOS[1],
    theme: "light",
    features: [
      "AI-DRIVEN BRANDING FRAMEWORKS",
      "CUSTOM DESIGN SYSTEMS",
      "VISUAL IDENTITY SOLUTIONS",
      "UI/UX DESIGN & INTERACTIVE ASSETS",
    ],
    paragraphs: [
      [
        "Coin a powerful ",
        { h: "AI-driven visual identity system" },
        " which can precisely and strategically define your brand and its behavior in the long-term. We develop scalable branding frameworks to ensure visual consistency at all touchpoints, including the digital world, print and social media, packaging, advertising, and experiences. Each element is made so that its message is recognisable, strengthened by the brand identity selected that will operate firmly on the market.",
      ],
      [
        "We will establish the suitable visual language, brand aesthetic, and intelligent design systems within today's AI-enabled ecosystem, in keeping with your organizational values, industry practices, and competitive landscape. All the elements, from detailed brand guidelines and visual governance frameworks to logo architecture, colour psychology, typography systems and iconography, is created to ensure consistency and adaptability as your brand evolves.",
      ],
      [
        "We offer comprehensive visual identity solutions including ",
        { h: "logotypes, colour palettes, typographic hierarchies, digital assets, UI/UX components, packaging imagery, brand collateral, motion graphics" },
        " and ",
        { h: "interactive design systems" },
        ". We provide long-term brand value, connection, and recall by creating a pleasing identity through effective design that speaks to your audience and differentiates you in a crowded online and offline marketplace.",
      ],
    ],
  },
];

export default function ServicesPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      // Hero title split text animation
      const heroTitle = document.querySelector(".hero-title");
      if (heroTitle) {
        const split = SplitText.create(heroTitle, { type: "chars, words" });
        gsap.fromTo(
          split.chars,
          {
            opacity: 0,
            y: 80,
            rotateX: -90,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: { each: 0.03, from: "start" },
            ease: "back.out(1.7)",
            delay: 0.5,
          }
        );
      }

      // Each service section animations
      const sections = gsap.utils.toArray<HTMLElement>(".service-section");
      sections.forEach((section, sectionIndex) => {
        const title = section.querySelector(".service-title");
        const features = section.querySelectorAll(".service-feature");
        const paragraphs = section.querySelectorAll(".service-paragraph");
        const video = section.querySelector(".service-video");

        // Video parallax
        if (video) {
          gsap.fromTo(
            video,
            { scale: 1.3, y: -50 },
            {
              scale: 1,
              y: 50,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5,
              },
            }
          );
        }

        // Title split text animation
        if (title) {
          const titleSplit = SplitText.create(title, { type: "chars, words" });
          gsap.fromTo(
            titleSplit.chars,
            {
              opacity: 0,
              y: 60,
              rotateY: -45,
              scale: 0.8,
            },
            {
              opacity: 1,
              y: 0,
              rotateY: 0,
              scale: 1,
              duration: 0.8,
              stagger: { each: 0.02, from: "start" },
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Features — word-level reveal (keeps words like "AI" intact; outer tag stays <p>)
        if (features.length) {
          features.forEach((feature, i) => {
            const featureText = (feature.textContent || "").trim();
            const words = featureText.split(/\s+/).filter(Boolean);
            feature.innerHTML = words
              .map(
                (word) =>
                  `<span class="service-feature-word inline-block max-w-full break-words md:whitespace-nowrap">${word}</span>`
              )
              .join(" ");

            gsap.fromTo(
              feature.querySelectorAll(".service-feature-word"),
              { opacity: 0, y: 8 },
              {
                opacity: 1,
                y: 0,
                duration: 0.12,
                stagger: 0.05,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: `top ${70 - i * 5}%`,
                  toggleActions: "play none none reverse",
                },
              }
            );
          });
        }

        // Paragraphs - smooth fade with blur
        if (paragraphs.length) {
          gsap.fromTo(
            paragraphs,
            { 
              y: 40, 
              opacity: 0,
              filter: "blur(8px)",
            },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1,
              stagger: 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 55%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // Video showcase zoom animations
      const videoShowcases = gsap.utils.toArray<HTMLElement>(".video-showcase");
      videoShowcases.forEach((showcase) => {
        const video = showcase.querySelector(".showcase-video");
        const overlay = showcase.querySelector(".showcase-overlay");
        const title = showcase.querySelector(".showcase-title");
        const subtitle = showcase.querySelector(".showcase-subtitle");

        // Video zoom out on scroll
        if (video) {
          gsap.fromTo(
            video,
            { scale: 1.5 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: showcase,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        }

        // Overlay fade
        if (overlay) {
          gsap.fromTo(
            overlay,
            { opacity: 0.8 },
            {
              opacity: 0.4,
              ease: "none",
              scrollTrigger: {
                trigger: showcase,
                start: "top center",
                end: "bottom center",
                scrub: 1,
              },
            }
          );
        }

        // Title animation
        if (title) {
          const titleSplit = SplitText.create(title, { type: "chars" });
          gsap.fromTo(
            titleSplit.chars,
            { opacity: 0, y: 50, rotateX: -90 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.03,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: showcase,
                start: "top 60%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Subtitle animation
        if (subtitle) {
          gsap.fromTo(
            subtitle,
            { opacity: 0, y: 30, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: showcase,
                start: "top 55%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // Scroll to top button
      gsap.to(".scroll-top-btn", {
        opacity: 1,
        pointerEvents: "auto",
        scrollTrigger: {
          trigger: pageRef.current,
          start: "top -500",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: pageRef }
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={pageRef} className="relative">
      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} currentPage="services" />

      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className="fixed left-4 top-4 z-[120] sm:left-5 sm:top-5 md:left-9 md:top-6"
      >
        <Image
          src="/assets/favicon.png"
          alt="Contenaissance"
          width={220}
          height={66}
          className="h-10 w-auto sm:h-12 md:h-16"
          priority
        />
      </Link>

      {/* Fixed Hamburger Button */}
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((v) => !v)}
        className="group fixed right-4 top-4 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)] sm:right-5 sm:top-5 sm:h-12 sm:w-12 md:right-9 md:top-6 md:h-14 md:w-14"
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

      {/* Hero Section - Dark */}
      <section className="relative flex h-[60vh] min-h-[420px] items-end justify-center overflow-hidden bg-zinc-950 px-4 pb-12 sm:h-[70vh] sm:px-6 sm:pb-16 md:h-[80vh] md:pb-20">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover opacity-50"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={VIDEOS[0]} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/50 to-zinc-950" />
        </div>

        <h1 className="hero-title relative z-10 text-center text-[clamp(2.75rem,12vw,9rem)] font-bold leading-[0.95] tracking-tight text-white">
          AI Services
        </h1>
      </section>

      {/* Services Sections - Alternating Black/White with Video Showcases */}
      {SERVICES.map((service, index) => {
        const isDark = service.theme === "dark";
        const showVideoShowcase = index === 1 || index === 3;
        const showcaseIndex = index === 1 ? 0 : 1;
        
        return (
          <div key={service.id}>
            {/* Service Section */}
            <section
              id={service.id}
              className={`service-section relative min-h-screen overflow-hidden ${
                isDark ? "bg-zinc-950 text-white" : "bg-white text-zinc-950"
              }`}
            >
              {/* Video Background */}
              <div className="absolute inset-0 overflow-hidden">
                <video
                  className={`service-video h-full w-full object-cover ${
                    isDark ? "opacity-30" : "opacity-20"
                  }`}
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={service.video} type="video/mp4" />
                </video>
                <div
                  className={`absolute inset-0 ${
                    isDark
                      ? "bg-gradient-to-b from-zinc-950 via-zinc-950/85 to-zinc-950"
                      : "bg-gradient-to-b from-white via-white/90 to-white"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24 md:px-10 md:py-32 lg:py-40">
                {/* Service Title - centered on mobile/tablet */}
                <h2
                  className={`service-title mb-10 text-center text-[clamp(2.25rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight sm:mb-14 md:mb-20 lg:text-left ${
                    isDark ? "text-white" : "text-zinc-950"
                  }`}
                  style={{ perspective: "1000px" }}
                >
                  {service.title}
                </h2>

                {/* Content Grid */}
                <div className="grid gap-[20px] md:grid-cols-[minmax(280px,30%)_1fr] md:items-start md:gap-10 lg:grid-cols-[minmax(320px,32%)_1fr] lg:gap-16">
                  {/* Golden feature lines — stacked tight, aligned to top */}
                  <div className="flex flex-col gap-[20px] text-center sm:gap-1.5 md:gap-2 md:text-left lg:gap-2.5">
                    {service.features.map((feature, i) => (
                      <p
                        key={i}
                        className="service-feature m-0 text-[18px] font-bold uppercase leading-none tracking-[0.04em] text-[#AE8C20] sm:text-[11px] sm:tracking-[0.05em] md:text-[18px] md:tracking-[0.06em] lg:text-[18px]"
                      >
                        {feature}
                      </p>
                    ))}
                  </div>

                  {/* Paragraphs - centered on mobile, left on larger */}
                  <div className=" text-center  md:text-left">
                    {service.paragraphs.map((segments, i) => (
                      <p
                        key={i}
                        className={`service-paragraph text-sm leading-relaxed md:text-base md:leading-loose ${
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        <ServiceParagraphBody segments={segments} isDark={isDark} />
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              {isDark && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute right-0 top-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-[#AE8C20]/5 blur-[150px]" />
                </div>
              )}
              {!isDark && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#AE8C20]/10 blur-[150px]" />
                </div>
              )}
            </section>

            {/* Video Showcase - appears after certain sections */}
            {showVideoShowcase && VIDEO_SHOWCASES[showcaseIndex] && (
              <section className="video-showcase relative h-[55vh] min-h-[380px] overflow-hidden sm:h-[70vh] md:h-[80vh]">
                {/* Full-screen video with zoom */}
                <div className="absolute inset-0 overflow-hidden">
                  <video
                    className="showcase-video h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src={VIDEO_SHOWCASES[showcaseIndex].video} type="video/mp4" />
                  </video>
                  <div className="showcase-overlay absolute inset-0 bg-zinc-950/60" />
                </div>

                {/* Centered text overlay */}
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6">
                  <h3
                    className="showcase-title text-[clamp(2rem,7vw,5rem)] font-bold leading-[1.05] tracking-tight text-white"
                    style={{ perspective: "1000px" }}
                  >
                    {VIDEO_SHOWCASES[showcaseIndex].title}
                  </h3>
                  <p className="showcase-subtitle mt-3 text-sm text-white/70 sm:mt-4 sm:text-base md:mt-6 md:text-xl">
                    {VIDEO_SHOWCASES[showcaseIndex].subtitle}
                  </p>
                </div>

                {/* Corner accent lines */}
                <div className="pointer-events-none absolute left-4 top-4 h-12 w-12 border-l-2 border-t-2 border-[#AE8C20]/40 sm:left-8 sm:top-8 sm:h-20 sm:w-20 md:left-12 md:top-12" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-[#AE8C20]/40 sm:bottom-8 sm:right-8 sm:h-20 sm:w-20 md:bottom-12 md:right-12" />
              </section>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <CTAFooter />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="scroll-top-btn fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#AE8C20]/50 bg-zinc-900/90 text-white opacity-0 backdrop-blur-md transition-all hover:border-[#AE8C20] hover:bg-[#AE8C20] hover:text-zinc-950 sm:bottom-8 sm:right-8 sm:h-12 sm:w-12"
        style={{ pointerEvents: "none" }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}
