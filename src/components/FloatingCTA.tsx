"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./FloatingCTA.css";

export default function FloatingCTA() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hero = document.getElementById("cinematic-hero");

        if (!hero) {
            setShow(true);
            return;
        }

        const handleScroll = () => {
            const rect = hero.getBoundingClientRect();

            // Show as soon as the bottom of the hero reaches the top of the viewport
            setShow(rect.bottom < 100);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-4 md:bottom-4 left-4 z-[9999] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${show
                ? "translate-x-0 opacity-100 scale-100"
                : "-translate-x-32 opacity-0 scale-95 pointer-events-none"
                }`}
        >
            <div className="relative h-[180px] w-[250px] sm:h-[220px] sm:w-[300px] lg:h-[260px] lg:w-[360px] xl:h-[300px] xl:w-[420px]">
                <Image
                    src="/boy.png"
                    alt="AI Guide"
                    width={180}
                    height={290}
                    priority
                    className="boy absolute bottom-0 left-0 h-[150px] w-auto sm:h-[180px] lg:h-[220px] xl:h-[290px] select-none"
                />

                <Link
                    href="https://ritzmediaworld.com/portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group absolute left-[90px] top-2 sm:left-[110px] lg:left-[125px] xl:left-[150px]"
                >
                    <div
                        className="
    relative
    overflow-hidden
    rounded-full
    border
    border-[#5A4B1C]
    bg-[#1B1A19]
    transition-all
    duration-500
    ease-out
    group-hover:-translate-y-1
    group-hover:scale-[1.03]
    group-hover:border-[#8A742C]
    group-hover:shadow-[0_0_25px_rgba(212,175,55,0.18)]
  "
                    >
                        {/* Animated Shine */}
                        <span
                            className="
      absolute
      inset-0
      -translate-x-[150%]
      bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)]
      transition-transform
      duration-1000
      ease-out
      group-hover:translate-x-[150%]
    "
                        />

                        {/* Inner Glow */}
                        <span
                            className="
      absolute
      inset-0
      rounded-full
      bg-gradient-to-b
      from-white/[0.04]
      to-transparent
      pointer-events-none
    "
                        />

                        <div
                            className="
      relative
      inline-flex
      items-center
      justify-center
      gap-[10px]
      px-[36px]
      py-[16px]
    "
                        >
                            <h3
                                className="
        text-[16px]
        font-semibold
        leading-none
        text-white
        transition-colors
        duration-300
        group-hover:text-[#FFF7DA]
      "
                            >
                                Explore Our Work
                            </h3>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}