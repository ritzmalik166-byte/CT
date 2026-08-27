"use client";

import { useEffect, useState } from "react";
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
            className={`fixed bottom-4 md:bottom-4 left-4 z-[9999] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${show ? "translate-x-0 opacity-100 scale-100" : "-translate-x-32 opacity-0 scale-95 pointer-events-none"}`}
        >
            <div className="relative h-[130px] w-[168px] sm:h-[220px] sm:w-[300px] lg:h-[260px] lg:w-[360px] xl:h-[300px] xl:w-[420px]">
                <div className="boy pointer-events-none absolute bottom-0 left-0 h-[118px] aspect-[180/290] sm:h-[180px] lg:h-[220px] xl:h-[290px]">
                    <Image
                        src="/boy.png"
                        alt="AI Guide"
                        fill
                        sizes="(min-width: 1280px) 180px, (min-width: 1024px) 137px, (min-width: 640px) 112px, 73px"
                        priority
                        className="select-none object-contain object-left object-bottom"
                    />
                </div>

                <Link
                    href="https://ritzmediaworld.com/portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group absolute left-[58px] top-1 sm:left-[110px] sm:top-2 lg:left-[125px] xl:left-[150px]"
                >
                    <div className="relative overflow-hidden rounded-full border border-[#5A4B1C] bg-[#1B1A19] transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:border-[#8A742C] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.18)]">
                        {/* Animated Shine */}
                        <span className="absolute inset-0 -translate-x-[150%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-1000 ease-out group-hover:translate-x-[150%]" />

                        {/* Inner Glow */}
                        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent" />

                        <div className="relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:gap-[10px] sm:px-[36px] sm:py-[16px]">
                            <h3 className="whitespace-nowrap text-[10px] font-semibold leading-none text-white transition-colors duration-300 group-hover:text-[#FFF7DA] sm:text-[16px]">
                                Explore Our Work
                            </h3>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}