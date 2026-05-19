"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLenisScrollLock } from "@/components/SmoothScrollProvider";
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

function normalizeVideoUrl(url: string) {
  try {
    return new URL(url, window.location.href).href.split("?")[0];
  } catch {
    return url.split("?")[0];
  }
}

function videoMatchesUrl(video: HTMLVideoElement, url: string) {
  const target = normalizeVideoUrl(url);
  const candidates = [
    video.src,
    video.currentSrc,
    ...Array.from(video.querySelectorAll("source")).map((s) => s.src),
  ];
  return candidates.some((src) => src && normalizeVideoUrl(src) === target);
}

/** Preview card/grid video already playing the same file (skip modal loader). */
function findBufferedPreviewVideo(url: string, exclude?: HTMLVideoElement | null) {
  if (typeof document === "undefined") return null;

  for (const el of document.querySelectorAll("video")) {
    if (el === exclude) continue;
    if (!videoMatchesUrl(el, url)) continue;
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return el;
  }
  return null;
}

export function ReelModal({ reel, onClose }: ReelModalProps) {
  useLenisScrollLock(!!reel);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
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

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch(() => {
      video.muted = true;
      void video.play();
    });
  }, []);

  const markReadyAndPlay = useCallback(() => {
    setIsVideoReady(true);
    tryPlay();
  }, [tryPlay]);

  useEffect(() => {
    if (!reel) {
      setIsVideoReady(false);
      return;
    }

    setProgress(0);
    setIsMuted(true);

    // Same URL is often already playing in a card preview — don’t flash “Loading reel…”
    const preview = findBufferedPreviewVideo(reel.video);
    setIsVideoReady(preview != null);
  }, [reel]);

  useEffect(() => {
    if (!reel) return;

    let cancelled = false;
    let detach: (() => void) | undefined;

    const attach = () => {
      const video = videoRef.current;
      if (!video || cancelled) return false;

      const preview = findBufferedPreviewVideo(reel.video, video);
      if (preview) {
        try {
          video.currentTime = preview.currentTime;
        } catch {
          /* ignore seek errors */
        }
      }

      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ||
        preview != null
      ) {
        markReadyAndPlay();
      }

      const onReady = () => {
        if (!cancelled) markReadyAndPlay();
      };

      const onTimeUpdate = () => {
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      };

      video.addEventListener("loadeddata", onReady);
      video.addEventListener("canplay", onReady);
      video.addEventListener("timeupdate", onTimeUpdate);

      detach = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("timeupdate", onTimeUpdate);
      };
      return true;
    };

    const frame = requestAnimationFrame(() => {
      if (!attach() && !cancelled) {
        requestAnimationFrame(() => {
          if (!cancelled) attach();
        });
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      detach?.();
    };
  }, [reel, markReadyAndPlay]);

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
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-xl sm:bg-black/80 sm:backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="absolute left-1/4 top-1/4 h-[200px] w-[200px] rounded-full bg-[#AE8C20]/15 blur-[80px] sm:h-[300px] sm:w-[300px] sm:blur-[100px] md:top-1/3 md:h-[400px] md:w-[400px] md:bg-[#AE8C20]/20 md:blur-[120px]"
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -20, 30, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 h-[180px] w-[180px] rounded-full bg-[#C9A730]/10 blur-[70px] sm:h-[260px] sm:w-[260px] sm:blur-[90px] md:bottom-1/3 md:h-[350px] md:w-[350px] md:bg-[#C9A730]/15 md:blur-[100px]"
              animate={{
                x: [0, -25, 20, 0],
                y: [0, 25, -15, 0],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <motion.div
            className="relative z-10 flex max-h-[95vh] w-full max-w-[1100px] flex-col items-center gap-4 overflow-y-auto px-4 py-10 sm:gap-6 sm:px-6 md:max-h-none md:flex-row md:items-stretch md:gap-10 md:overflow-visible md:py-0 lg:gap-12 lg:px-8"
            initial={{ scale: 0.6, opacity: 0, rotateY: 25, y: 60 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            style={{ transformPerspective: 1500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className="relative w-full max-w-[280px] shrink-0 sm:max-w-[320px] md:max-w-none md:w-auto">
              <div className="relative aspect-[9/16] h-auto w-full overflow-hidden rounded-2xl border border-[#AE8C20]/45 bg-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_-8px_rgba(174,140,32,0.3)] sm:rounded-[1.5rem] md:h-[60vh] md:min-h-[400px] md:max-h-[680px] md:w-auto lg:h-[68vh] lg:min-h-[480px] lg:max-h-[760px] lg:rounded-[2rem] lg:shadow-[0_32px_90px_-22px_rgba(0,0,0,0.9),0_0_56px_-8px_rgba(174,140,32,0.35)]">
                {!isVideoReady && (
                  <motion.div
                    className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 bg-zinc-950"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="h-10 w-10 rounded-full border-2 border-[#AE8C20]/30 border-t-[#D4AF37]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/80">
                      Loading reel…
                    </p>
                  </motion.div>
                )}

                <video
                  key={reel.video}
                  ref={videoRef}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    isVideoReady ? "opacity-100" : "opacity-0"
                  }`}
                  src={reel.video}
                  autoPlay
                  loop
                  muted={isMuted}
                />

                <motion.div
                  className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent sm:h-24 md:h-32"
                  initial={false}
                  animate={{ opacity: isVideoReady ? 1 : 0 }}
                />
                <motion.div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent sm:h-32 md:h-40"
                  initial={false}
                  animate={{ opacity: isVideoReady ? 1 : 0 }}
                />

                <div className="absolute inset-x-3 top-3 h-0.5 overflow-hidden rounded-full bg-white/20 sm:inset-x-4 sm:top-4">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] transition-all duration-100"
                    style={{ width: `${progress}%` }}
                    initial={false}
                    animate={{ opacity: isVideoReady ? 1 : 0 }}
                  />
                </div>

                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="absolute right-3 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/20 sm:right-4 sm:top-8 sm:h-10 sm:w-10"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                  )}
                </button>

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] sm:text-[10px] sm:tracking-[0.25em]">
                    Now Playing
                  </p>
                  <h3 className="mt-0.5 text-lg font-bold text-white drop-shadow-lg sm:mt-1 sm:text-xl md:text-2xl">
                    {reel.title}
                  </h3>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex max-w-md flex-col justify-center px-2 text-center sm:px-0 md:text-left"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 self-center rounded-full border border-[#AE8C20]/40 bg-[#AE8C20]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4AF37] sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.2em] md:self-start">
                <span className="h-1 w-1 animate-pulse rounded-full bg-[#D4AF37] sm:h-1.5 sm:w-1.5" />
                Featured Reel
              </span>

              <h2 className="mt-3 bg-gradient-to-r from-white via-white to-[#D4AF37] bg-clip-text text-2xl font-bold leading-[1.1] tracking-tight text-transparent sm:mt-4 sm:text-3xl md:mt-5 md:text-4xl lg:text-5xl xl:text-6xl">
                {reel.title}
              </h2>

              <p className="mt-2 text-sm text-zinc-300 sm:mt-3 sm:text-base md:mt-4 md:text-lg">
                {reel.subtitle}
              </p>

              <p className="mt-3 hidden text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:block md:mt-6">
                Crafted with cinematic precision. Every frame engineered to captivate, every cut designed to convert. This is storytelling reimagined for the AI era.
              </p>

              <motion.div className="mt-4 flex flex-col items-center gap-2.5 sm:mt-6 sm:flex-row sm:gap-3 md:mt-8 md:items-start">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#AE8C20] to-[#D4AF37] px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 shadow-lg shadow-[#AE8C20]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#AE8C20]/50 sm:gap-3 sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3"
                >
                  Watch Full Reel
                  <svg className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>

                <button
                  onClick={handleShare}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:border-[#AE8C20]/60 hover:bg-white/5 sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3"
                >
                  {shareStatus === "copied" ? "Link copied" : shareStatus === "failed" ? "Copy failed" : "Share"}
                  {shareStatus === "copied" ? (
                    <svg className="h-3 w-3 text-[#D4AF37] sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  )}
                </button>
              </motion.div>
            </motion.div>

            <motion.button
              onClick={onClose}
              className="fixed right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:border-[#AE8C20] hover:bg-[#AE8C20]/20 sm:right-4 sm:top-4 sm:h-11 sm:w-11 md:absolute md:-right-4 md:-top-4 md:h-12 md:w-12 md:bg-black/60"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", damping: 15 }}
              aria-label="Close"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>

          <motion.div
            className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 text-[11px] uppercase tracking-[0.25em] text-white/40 sm:bottom-6 md:block"
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
