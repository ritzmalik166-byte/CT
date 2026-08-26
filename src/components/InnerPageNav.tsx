"use client";

import Image from "next/image";
import Link from "next/link";
import { HamburgerMenu } from "@/components/home/HamburgerMenu";
import { useHideOnScrollNav } from "@/hooks/useHideOnScrollNav";

type InnerPage = "studio" | "services" | "portfolio" | "blog" | "contact";

const DARK_BUTTON =
  "border-zinc-700 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)]";

const LIGHT_BUTTON =
  "border-zinc-300 bg-white/90 text-zinc-900 shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:border-[#AE8C20]/50 hover:bg-[#AE8C20] hover:text-white";

export function InnerPageNav({
  menuOpen,
  onMenuOpenChange,
  currentPage,
  variant = "dark",
}: {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  currentPage: InnerPage;
  variant?: "dark" | "light";
}) {
  const navVisible = useHideOnScrollNav(menuOpen);

  return (
    <>
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => onMenuOpenChange(false)}
        currentPage={currentPage}
      />

      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-[var(--z-chrome)] flex items-start justify-between px-4 pt-4 transition-transform duration-300 ease-[ease] will-change-transform sm:px-5 sm:pt-5 md:px-9 md:pt-6 ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link
          href="/"
          title="Home"
          onClick={() => onMenuOpenChange(false)}
          className="pointer-events-auto"
        >
          <Image
            src="/assets/favicon.png"
            alt="Contenaissance"
            title="Contenaissance"
            width={220}
            height={66}
            className="h-10 w-auto sm:h-12 md:h-16"
            priority
          />
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => onMenuOpenChange(!menuOpen)}
          className={`pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
            variant === "light" ? LIGHT_BUTTON : DARK_BUTTON
          }`}
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
    </>
  );
}
