"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CTAFooter } from "@/components/home/CTAFooter";
import { HamburgerMenu } from "@/components/home/HamburgerMenu";

export default function NotFound() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white flex flex-col justify-between overflow-x-hidden selection:bg-[#AE8C20] selection:text-white">
      {/* Top Header */}
      <header className="relative z-40 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 md:px-12">
        <Link href="/" title="Contenaissance Home" className="relative z-50">
          <Image
            src="/assets/favicon.png"
            alt="Contenaissance"
            title="Contenaissance"
            width={220}
            height={66}
            className="h-9 w-auto sm:h-11 md:h-14"
            priority
          />
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className="group relative z-50 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/90 text-white shadow-md backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] sm:h-12 sm:w-12 md:h-14 md:w-14"
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
      </header>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main 404 Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          {/* Subtle 404 Text */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight text-white/10 select-none">
            404
          </h1>

          <div className="-mt-6 sm:-mt-8">
            {/* <span className="inline-block rounded-full border border-[#AE8C20]/30 bg-[#AE8C20]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
              Error 404
            </span> */}

            <h2 className="mt-4 md:mt-12 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Page Not Found
            </h2>

            <p className="mt-3 text-base sm:text-lg text-zinc-400 leading-relaxed">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                title="Back to Home"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#AE8C20] px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#C9A730]"
              >
                <span>Back to Home</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-zinc-500 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <CTAFooter showBrandHeading={false} />
    </div>
  );
}
