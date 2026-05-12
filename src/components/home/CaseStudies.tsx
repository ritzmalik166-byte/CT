"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CASE_STUDIES = [
  {
    company: "TechCorp",
    logo: "◆",
    industry: "Financial Services",
    title: "Reduced fraud detection time by 94%",
    description: "TechCorp implemented our real-time AI analysis to revolutionize their fraud detection system, processing millions of transactions daily.",
    stats: [
      { label: "Faster Detection", value: "94%" },
      { label: "Cost Savings", value: "$12M" },
      { label: "Accuracy", value: "99.7%" },
    ],
    image: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    company: "HealthAI",
    logo: "●",
    industry: "Healthcare",
    title: "Accelerated diagnosis accuracy by 40%",
    description: "HealthAI leveraged our multi-modal AI to assist physicians with faster, more accurate diagnostic recommendations.",
    stats: [
      { label: "Accuracy Boost", value: "40%" },
      { label: "Time Saved", value: "60%" },
      { label: "Patients Helped", value: "2M+" },
    ],
    image: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    company: "RetailMax",
    logo: "■",
    industry: "E-Commerce",
    title: "Increased conversion rates by 32%",
    description: "RetailMax deployed our conversational AI to create personalized shopping experiences that customers love.",
    stats: [
      { label: "Conversion", value: "+32%" },
      { label: "Customer Satisfaction", value: "96%" },
      { label: "Revenue Growth", value: "$45M" },
    ],
    image: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

export function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      gsap.from(".case-header", {
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

      gsap.from(".case-card", {
        scrollTrigger: {
          trigger: ".case-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-zinc-950 py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute -right-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-[#AE8C20]/5 blur-[120px]" />
        <div className="absolute -left-1/4 bottom-1/4 h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <div className="case-header flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#AE8C20]/20 bg-[#AE8C20]/10 px-4 py-1.5 text-sm font-medium text-[#AE8C20]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
              Customer Stories
            </span>
            <h2 className="mt-6 text-display-lg font-bold text-white">
              Real results from{" "}
              <span className="text-[#AE8C20]">real companies</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              See how industry leaders are transforming their businesses with our AI platform.
            </p>
          </div>
          <a
            href="#all-stories"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/5"
          >
            View All Stories
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Case studies grid */}
        <div className="case-grid mt-16 grid gap-6 lg:grid-cols-3">
          {CASE_STUDIES.map((study, index) => (
            <motion.div
              key={study.company}
              className="case-card group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500"
              whileHover={{ y: -8 }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {/* Image/gradient header */}
              <div
                className="relative h-48 overflow-hidden"
                style={{ background: study.image }}
              >
                <div className="absolute inset-0 bg-black/20" />
                {/* Company badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                  <span className="text-2xl">{study.logo}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{study.company}</div>
                    <div className="text-xs text-white/70">{study.industry}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white leading-tight">
                  {study.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {study.description}
                </p>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {study.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-xl font-bold text-[#AE8C20]">{stat.value}</div>
                      <div className="text-xs text-zinc-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Read more */}
                <a
                  href={`#case-${study.company.toLowerCase()}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#AE8C20]"
                >
                  Read full story
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              {/* Hover glow */}
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-[#AE8C20]/0 via-[#AE8C20]/10 to-[#AE8C20]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
