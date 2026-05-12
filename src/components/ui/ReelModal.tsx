"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface Reel {
  id: number;
  title: string;
  subtitle: string;
  video: string;
}

interface ReelModalProps {
  reel: Reel | null;
  onClose: () => void;
}

const INSTAGRAM_URL = "https://www.instagram.com/contenaissance/";

export function ReelModal({ reel, onClose }: ReelModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reel) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [reel, onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [reel]);

  const handleShare = async () => {
    if (!reel) return;

    if (shareTimeoutRef.current) {
      clearTimeout(shareTimeoutRef.current);
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reel.video);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = reel.video;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }

    shareTimeoutRef.current = setTimeout(() => {
      setShareStatus("idle");
    }, 1800);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {reel && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Frosted backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Animated gold glow accents */}
            <motion.div
              className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-[#AE8C20]/20 blur-[120px]"
              animate={{
                x: [0, 50, -30, 0],
                y: [0, -30, 50, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-1/4 bottom-1/3 h-[350px] w-[350px] rounded-full bg-[#C9A730]/15 blur-[100px]"
              animate={{
                x: [0, -40, 30, 0],
                y: [0, 40, -20, 0],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Modal content */}
          <motion.div
            className="relative z-10 flex w-full max-w-[1100px] flex-col items-center gap-8 px-4 md:flex-row md:items-stretch md:gap-12 md:px-8"
            initial={{ scale: 0.6, opacity: 0, rotateY: 25, y: 60 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            style={{ transformPerspective: 1500 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video player */}
            <div className="relative">
              {/* Video container - vertical 9:16 aspect */}
              <div className="relative aspect-[9/16] h-[68vh] max-h-[760px] min-h-[480px] overflow-hidden rounded-[2rem] border border-[#AE8C20]/45 bg-black shadow-[0_32px_90px_-22px_rgba(0,0,0,0.9),0_0_56px_-8px_rgba(174,140,32,0.35)]">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  src={reel.video}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                />

                {/* Gradient overlays */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Progress bar (top) */}
                <div className="absolute inset-x-4 top-4 h-0.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Mute toggle */}
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="absolute right-4 top-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/20"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                  )}
                </button>

                {/* Bottom label inside player */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                    Now Playing
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-white drop-shadow-lg">
                    {reel.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Side info panel */}
            <motion.div
              className="flex max-w-md flex-col justify-center text-center md:text-left"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 self-center rounded-full border border-[#AE8C20]/40 bg-[#AE8C20]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] md:self-start">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
                Featured Reel
              </span>

              <h2 className="mt-5 bg-gradient-to-r from-white via-white to-[#D4AF37] bg-clip-text text-4xl font-bold leading-[1.05] tracking-tight text-transparent md:text-5xl lg:text-6xl">
                {reel.title}
              </h2>

              <p className="mt-4 text-base text-zinc-300 md:text-lg">
                {reel.subtitle}
              </p>

              <p className="mt-6 text-sm leading-relaxed text-zinc-400">
                Crafted with cinematic precision. Every frame engineered to captivate, every cut designed to convert. This is storytelling reimagined for the AI era.
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-[#AE8C20]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#AE8C20]/50"
                >
                  Watch Full Reel
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>

                <button
                  onClick={handleShare}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-white/5"
                >
                  {shareStatus === "copied" ? "Link copied" : shareStatus === "failed" ? "Copy failed" : "Share"}
                  {shareStatus === "copied" ? (
                    <svg className="h-4 w-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Close button - top right */}
            <motion.button
              onClick={onClose}
              className="absolute -top-2 right-2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:border-[#AE8C20] hover:bg-[#AE8C20]/20 md:-top-4 md:-right-4"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", damping: 15 }}
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>

          {/* Hint at bottom */}
          <motion.div
            className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.25em] text-white/40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Press <span className="rounded border border-white/20 px-1.5 py-0.5 text-white/70">ESC</span> to close
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
