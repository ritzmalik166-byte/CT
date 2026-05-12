"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TABS = [
  {
    id: "api",
    label: "API Access",
    title: "Simple, powerful API",
    description: "Integrate AI capabilities into any application with our REST and GraphQL APIs. Full TypeScript support with auto-generated types.",
    code: `import { CT } from '@contenaissance/sdk';

const ai = new CT({ apiKey: 'your-key' });

const response = await ai.chat.complete({
  model: 'neo-4',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(response.message);`,
  },
  {
    id: "sdk",
    label: "SDK Libraries",
    title: "Native SDK support",
    description: "Official SDKs for Python, JavaScript, Go, Rust, and more. Type-safe, well-documented, and optimized for performance.",
    code: `from contenaissance import CT

client = CT(api_key="your-key")

response = client.chat.complete(
    model="neo-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.message)`,
  },
  {
    id: "playground",
    label: "Playground",
    title: "Interactive playground",
    description: "Test and iterate on prompts in real-time. Compare models, tune parameters, and export production-ready code.",
    code: `// Playground Configuration
{
  "model": "neo-4",
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": true,
  "tools": ["code_execution", "web_search"]
}`,
  },
];

export function ProductExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  useGSAP(
    () => {
      gsap.from(".product-header", {
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

      gsap.from(".product-content", {
        scrollTrigger: {
          trigger: ".product-content",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  const activeTabData = TABS.find((tab) => tab.id === activeTab)!;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-zinc-950 py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <div className="product-header mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#AE8C20]/20 bg-[#AE8C20]/10 px-4 py-1.5 text-sm font-medium text-[#AE8C20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AE8C20]" />
            Developer Experience
          </span>
          <h2 className="mt-6 text-display-lg font-bold text-white">
            Build with <span className="text-[#AE8C20]">confidence</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            From quick prototypes to production systems, our tools adapt to your workflow.
          </p>
        </div>

        {/* Content */}
        <div className="product-content mt-16">
          {/* Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-zinc-900"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full bg-[#AE8C20]"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-center"
              >
                <h3 className="text-display-sm font-bold text-white">
                  {activeTabData.title}
                </h3>
                <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
                  {activeTabData.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#docs"
                    className="inline-flex items-center gap-2 rounded-full bg-[#AE8C20] px-6 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-[#D4B340]"
                  >
                    Read Documentation
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  <a
                    href="#quickstart"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/5"
                  >
                    Quickstart Guide
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Code preview */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm"
              >
                {/* Code header */}
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-zinc-500">{activeTabData.id}.ts</span>
                  <button className="text-xs text-zinc-500 hover:text-white">
                    Copy
                  </button>
                </div>
                {/* Code content */}
                <pre className="overflow-x-auto p-6 text-sm leading-relaxed">
                  <code className="text-zinc-300">
                    {activeTabData.code.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="mr-6 select-none text-zinc-600">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
