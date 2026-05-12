"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect, useState } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STATS = [
  {
    value: 10,
    suffix: "M+",
    label: "API calls daily",
    description: "Processing millions of requests with sub-50ms latency",
  },
  {
    value: 99.99,
    suffix: "%",
    label: "Uptime guaranteed",
    description: "Enterprise-grade reliability backed by SLA",
  },
  {
    value: 500,
    suffix: "+",
    label: "Enterprise clients",
    description: "Trusted by Fortune 500 companies worldwide",
  },
  {
    value: 50,
    suffix: "ms",
    prefix: "<",
    label: "Average latency",
    description: "Lightning-fast inference at the edge",
  },
];

function AnimatedCounter({ 
  value, 
  suffix = "", 
  prefix = "",
  trigger 
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
  trigger: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (value - startValue) * easeOutExpo;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [trigger, value]);

  const formattedValue = value % 1 === 0 
    ? Math.round(displayValue).toLocaleString()
    : displayValue.toFixed(2);

  return (
    <span>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

export function AnimatedStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useGSAP(
    () => {
      gsap.from(".stats-header", {
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

      ScrollTrigger.create({
        trigger: ".stats-grid",
        start: "top 70%",
        onEnter: () => setIsInView(true),
      });

      gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-24 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#AE8C20]/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <div className="stats-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Platform Metrics
          </span>
          <h2 className="mt-6 text-display-lg font-bold text-zinc-900">
            Numbers that speak for themselves
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Our infrastructure powers AI applications at unprecedented scale,
            delivering consistent performance and reliability.
          </p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card group relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-500 hover:border-[#AE8C20]/30 hover:shadow-xl hover:shadow-[#AE8C20]/10"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#AE8C20]/0 to-[#AE8C20]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="text-display-md font-bold text-zinc-900">
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    trigger={isInView}
                  />
                </div>
                <div className="mt-2 text-lg font-semibold text-zinc-700">
                  {stat.label}
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {stat.description}
                </p>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[#AE8C20]/5 transition-transform duration-500 group-hover:scale-150" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
