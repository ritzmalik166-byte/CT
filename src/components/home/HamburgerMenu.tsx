"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";

const NAV_LINKS = [
  { label: "Studio", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: "studio" | "services" | "portfolio" | "contact";
}

const curtainEase = [0.22, 1, 0.36, 1] as const;
const curtainExitEase = [0.65, 0, 0.35, 1] as const;

// Left curtain - comes from left (SLOW)
const leftCurtainVariants: Variants = {
  hidden: { x: "-100%", skewX: -2 },
  visible: {
    x: 0,
    skewX: 0,
    transition: { duration: 1.4, ease: curtainEase },
  },
  exit: {
    x: "-100%",
    skewX: 2,
    transition: { duration: 1, ease: curtainExitEase, delay: 0.2 },
  },
};

// Right curtain - comes from right (SLOW)
const rightCurtainVariants: Variants = {
  hidden: { x: "100%", skewX: 2 },
  visible: {
    x: 0,
    skewX: 0,
    transition: { duration: 1.4, ease: curtainEase },
  },
  exit: {
    x: "100%",
    skewX: -2,
    transition: { duration: 1, ease: curtainExitEase, delay: 0.2 },
  },
};

// Content appears after curtains close (SLOW)
const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1.2,
      duration: 0.8,
      staggerChildren: 0.2,
      delayChildren: 1.4,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

// Individual item fade-in (SLOW)
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: curtainEase },
  },
};

// Nav link animation (SLOW)
const navLinkVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: curtainEase },
  },
};

export function HamburgerMenu({ isOpen, onClose, currentPage = "studio" }: HamburgerMenuProps) {
  useLenisScrollLock(isOpen);
  const [hoveredNav, setHoveredNav] = useState<string>("");
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const menuContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-menu-curtain)] overflow-hidden">
          {/* LEFT CURTAIN */}
          <motion.div
            key="left-curtain"
            variants={leftCurtainVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 top-0 h-full w-[52%] origin-left backdrop-blur-3xl"
            style={{
              background: "linear-gradient(90deg, rgba(8,8,8,0.98) 0%, rgba(12,12,12,0.96) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
            }}
          />

          {/* RIGHT CURTAIN */}
          <motion.div
            key="right-curtain"
            variants={rightCurtainVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 h-full w-[52%] origin-right backdrop-blur-3xl"
            style={{
              background: "linear-gradient(-90deg, rgba(8,8,8,0.98) 0%, rgba(12,12,12,0.96) 100%)",
              backdropFilter: "blur(40px) saturate(180%)",
            }}
          />

          {/* Subtle ambient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#AE8C20]/6 blur-[200px]" />
          </motion.div>

          {/* Close button — above curtains; site chrome sits under menu overlay */}
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            initial={{ opacity: 0, rotate: -90, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.85 }}
            transition={{ delay: 0.35, duration: 0.35, ease: curtainEase }}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-600/80 bg-zinc-900/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/20 hover:shadow-[0_16px_40px_rgba(174,140,32,0.35)] sm:right-5 sm:top-5 sm:h-12 sm:w-12 md:right-9 md:top-6 md:h-14 md:w-14"
          >
            <svg
              className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </motion.button>

          {/* MENU CONTENT - centered */}
          <motion.div
            key="menu-content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex h-full flex-col items-center justify-center px-6"
          >
            {/* Logo is the fixed site logo (see --z-chrome) so it is not duplicated here */}

            {/* Centered navigation */}
            <nav className="flex flex-col items-center gap-4 md:gap-6">
              {NAV_LINKS.map((link, i) => {
                const linkPage = link.label.toLowerCase() as typeof currentPage;
                const isCurrentPage = linkPage === currentPage;
                const isHovered = hoveredNav === link.label;

                return (
                  <motion.div key={link.label} variants={navLinkVariants} custom={i}>
                    <Link
                      href={link.href}
                      title={link.label}
                      onClick={onClose}
                      onMouseEnter={() => setHoveredNav(link.label)}
                      onMouseLeave={() => setHoveredNav("")}
                      className={`group relative text-4xl font-bold tracking-tight transition-all duration-300 sm:text-5xl md:text-6xl lg:text-7xl ${
                        isCurrentPage
                          ? "text-[#AE8C20]"
                          : isHovered
                          ? "text-[#AE8C20]"
                          : "text-white/90 hover:text-[#AE8C20]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Language selector - bottom left (hidden on mobile) */}
            <motion.div
              variants={itemVariants}
              className="absolute bottom-6 left-4 hidden sm:block sm:bottom-8 sm:left-6 md:bottom-10 md:left-10"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" strokeLinecap="round" />
                  </svg>
                  {currentLang.label}
                  <svg
                    className={`h-3 w-3 transition-transform duration-300 ${langOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <AnimatePresence mode="wait">
                  {langOpen && (
                    <motion.ul
                      key="lang-dropdown"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-0 mb-2 w-40 overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900/95 py-1 backdrop-blur-xl"
                    >
                      {LANGUAGES.map((lang) => (
                        <li key={lang.code}>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentLang(lang);
                              setLangOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                              currentLang.code === lang.code
                                ? "text-[#AE8C20]"
                                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                            }`}
                          >
                            {lang.label}
                            {currentLang.code === lang.code && (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Social links - bottom center with icons */}
            <motion.div
              variants={itemVariants}
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center gap-3 sm:bottom-8 sm:gap-4 md:bottom-10 md:gap-5"
            >
              {/* Instagram */}
              <a
                href="https://www.instagram.com/contenaissance/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-500 backdrop-blur-sm transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37] sm:h-11 sm:w-11"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/108385521/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-500 backdrop-blur-sm transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37] sm:h-11 sm:w-11"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@Contenaissance"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-500 backdrop-blur-sm transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37] sm:h-11 sm:w-11"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61579738437856"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-500 backdrop-blur-sm transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37] sm:h-11 sm:w-11"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/contenaissance"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="X"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-500 backdrop-blur-sm transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/10 hover:text-[#D4AF37] sm:h-11 sm:w-11"
              >
                <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
}
