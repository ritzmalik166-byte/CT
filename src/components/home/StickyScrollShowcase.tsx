"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SHOWCASE_ITEMS = [
  {
    title: "Intelligent Code Generation",
    description: "Transform natural language into production-ready code. Our AI understands context, follows best practices, and generates secure, scalable solutions.",
    features: ["Multi-language support", "Context-aware suggestions", "Security scanning", "Auto-documentation"],
    color: "#AE8C20",
  },
  {
    title: "Visual Understanding",
    description: "Process and analyze images with human-level comprehension. Extract insights, detect objects, and understand complex visual scenarios.",
    features: ["Object detection", "Scene analysis", "OCR extraction", "Visual Q&A"],
    color: "#60a5fa",
  },
  {
    title: "Conversational AI",
    description: "Build natural, engaging conversations that understand intent and context. Create chatbots that feel genuinely helpful.",
    features: ["Intent recognition", "Sentiment analysis", "Multi-turn conversations", "Personality customization"],
    color: "#f472b6",
  },
  {
    title: "Data Intelligence",
    description: "Transform raw data into actionable insights. Our AI finds patterns, predicts trends, and surfaces opportunities hidden in your data.",
    features: ["Predictive analytics", "Anomaly detection", "Trend forecasting", "Automated reporting"],
    color: "#a78bfa",
  },
];

export function StickyScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".showcase-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      const items = gsap.utils.toArray<HTMLElement>(".showcase-item");
      
      items.forEach((item, index) => {
        const image = item.querySelector(".showcase-image");
        const content = item.querySelector(".showcase-content");

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 60%",
            end: "bottom 40%",
            toggleActions: "play reverse play reverse",
          },
        })
          .from(image, {
            x: index % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          })
          .from(
            content,
            {
              x: index % 2 === 0 ? 60 : -60,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
            },
            "-=0.6"
          );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <div className="showcase-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Use Cases
          </span>
          <h2 className="mt-6 text-display-lg font-bold text-zinc-900">
            What you can build with <span className="text-[#AE8C20]">Contenaissance</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            From code generation to visual understanding, discover the possibilities
            of our comprehensive AI platform.
          </p>
        </div>

        {/* Showcase items */}
        <div ref={containerRef} className="mt-20 space-y-32">
          {SHOWCASE_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className={`showcase-item flex flex-col items-center gap-12 lg:flex-row ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image/Visual */}
              <div className="showcase-image w-full lg:w-1/2">
                <div
                  className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-zinc-100 p-8"
                  style={{
                    boxShadow: `0 20px 60px -20px ${item.color}30`,
                  }}
                >
                  {/* Decorative elements */}
                  <div
                    className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
                    style={{ backgroundColor: item.color }}
                  />
                  
                  {/* Mock interface */}
                  <div className="relative h-full w-full rounded-2xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="h-4 w-3/4 rounded-full bg-zinc-200" />
                      <div className="h-4 w-1/2 rounded-full bg-zinc-200" />
                      <div className="h-4 w-2/3 rounded-full bg-zinc-200" />
                      <div className="mt-6 h-20 w-full rounded-xl" style={{ backgroundColor: `${item.color}20` }} />
                    </div>
                  </div>

                  {/* Floating accent */}
                  <div
                    className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="showcase-content w-full lg:w-1/2 lg:px-8">
                <h3 className="text-display-sm font-bold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-4 text-lg text-zinc-600 leading-relaxed">
                  {item.description}
                </p>
                <ul className="mt-8 grid grid-cols-2 gap-4">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={item.color}
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-zinc-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: item.color }}
                >
                  Learn More
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
