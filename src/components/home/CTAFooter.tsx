"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import Link from "next/link";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "API", "Documentation", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press", "Partners"],
  Resources: ["Community", "Help Center", "Status", "Security", "Privacy"],
  Legal: ["Terms", "Privacy", "Cookies", "Licenses", "Contact"],
};

export function CTAFooter() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".footer-content", {
        scrollTrigger: {
          trigger: ".footer-content",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white">
      {/* CTA Section */}
      <div className="relative py-24 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#AE8C20]/5 to-white" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#AE8C20]/10 blur-[120px] animate-pulse-glow" />
          <div className="absolute -right-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#AE8C20]/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="cta-content relative mx-auto max-w-[1400px] px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-display-lg font-bold text-zinc-900">
              Ready to build the{" "}
              <span className="bg-gradient-to-r from-[#AE8C20] to-[#8A7019] bg-clip-text text-transparent">
                future
              </span>
              ?
            </h2>
            <p className="mt-6 text-xl text-zinc-600">
              Join thousands of developers and companies building intelligent
              applications with Contenaissance. Start free, scale infinitely.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#start"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-zinc-800"
              >
                <span>Get Started Free</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#AE8C20] text-zinc-900 transition-transform group-hover:translate-x-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-all hover:border-zinc-300 hover:bg-zinc-50"
              >
                Talk to Sales
              </Link>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              No credit card required • Free tier available • Enterprise plans available
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-content border-t border-zinc-100 bg-zinc-50 py-16">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/assets/favicon.png"
                  alt="Contenaissance"
                  className="h-12 w-auto"
                />
              </Link>
              <p className="mt-4 max-w-sm text-sm text-zinc-600">
                Building the most capable and accessible AI platform for developers
                and enterprises worldwide. Ritz GenAI Storytelling Studios.
              </p>
              <div className="mt-6 flex gap-4">
                {[
                  { name: "Twitter", icon: "𝕏" },
                  { name: "GitHub", icon: "◉" },
                  { name: "LinkedIn", icon: "in" },
                  { name: "Discord", icon: "◈" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={`#${social.name.toLowerCase()}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-all hover:border-[#AE8C20] hover:text-[#AE8C20]"
                    aria-label={social.name}
                  >
                    <span className="text-sm">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-zinc-900">{category}</h4>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link
                        href={`#${link.toLowerCase()}`}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 md:flex-row">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Contenaissance. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
