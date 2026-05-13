"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const NAV_LINKS = [
  { label: "Studio", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Meta", href: "https://meta.com" },
  { label: "YouTube", href: "https://youtube.com" },
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
        <div className="fixed inset-0 z-[99] overflow-hidden">
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

          {/* MENU CONTENT - centered */}
          <motion.div
            key="menu-content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex h-full flex-col items-center justify-center px-6"
          >
            {/* Logo at top */}
            <motion.div
              variants={itemVariants}
              className="absolute left-6 top-6 md:left-10 md:top-8"
            >
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <Image
                  src="/assets/favicon.png"
                  alt="Contenaissance"
                  width={200}
                  height={60}
                  className="h-14 w-auto sm:h-16 md:h-20"
                  priority
                />
              </Link>
            </motion.div>

            {/* Centered navigation */}
            <nav className="flex flex-col items-center gap-4 md:gap-6">
              {NAV_LINKS.map((link, i) => {
                const linkPage = link.label.toLowerCase() as typeof currentPage;
                const isCurrentPage = linkPage === currentPage;
                const isHovered = hoveredNav === link.label;
                const showUnderline = isCurrentPage || isHovered;
                
                return (
                  <motion.div key={link.label} variants={navLinkVariants} custom={i}>
                    <Link
                      href={link.href}
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
                      <span
                        className={`absolute -bottom-2 left-1/2 h-[2px] -translate-x-1/2 bg-[#AE8C20] transition-all duration-300 ${
                          showUnderline ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Language selector - bottom left */}
            <motion.div
              variants={itemVariants}
              className="absolute bottom-8 left-6 md:bottom-10 md:left-10"
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

            {/* Social links - bottom center */}
            <motion.ul
              variants={itemVariants}
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-6 md:bottom-10 md:gap-10"
            >
              {SOCIAL_LINKS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 transition-colors duration-300 hover:text-[#AE8C20]"
                  >
                    {s.label}
                    <svg
                      className="h-2.5 w-2.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
                    </svg>
                  </a>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(menuContent, document.body);
}
