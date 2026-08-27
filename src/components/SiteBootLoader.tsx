"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import Image from "next/image";
import { getBootMediaUrlsForPathname } from "@/lib/critical-assets";
import { findPageVideoByUrl } from "@/lib/video-playback";
import { cn } from "@/lib/utils";

type Stage = "booting" | "fade" | "off";

function formatLoadSeconds(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function waitForDOMContentLoaded(): Promise<void> {
  if (document.readyState !== "loading") return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Wait for the in-page hero <video> to reach `canplay` instead of creating a
 * second decoder. Falls back to a timeout so the overlay never stalls.
 */
function preloadVideoBootSignal(url: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    let finished = false;
    let raf = 0;
    const listeners: Array<{ el: HTMLVideoElement; type: string; fn: () => void }> = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(t);
      window.cancelAnimationFrame(raf);
      listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      resolve();
    };

    const t = window.setTimeout(finish, timeoutMs);

    const bind = (video: HTMLVideoElement) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        finish();
        return;
      }
      const onReady = () => finish();
      video.addEventListener("canplay", onReady);
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", onReady);
      listeners.push(
        { el: video, type: "canplay", fn: onReady },
        { el: video, type: "loadeddata", fn: onReady },
        { el: video, type: "error", fn: onReady }
      );
    };

    const poll = () => {
      if (finished) return;
      const existing = findPageVideoByUrl(url);
      if (existing) {
        bind(existing);
        return;
      }
      raf = window.requestAnimationFrame(poll);
    };

    poll();
  });
}

export function SiteBootLoader({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [stage, setStage] = useState<Stage>("booting");
  const [loadMs, setLoadMs] = useState(0);
  const reducedMotionRef = useRef(false);
  const bootStartedRef = useRef(performance.now());

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (stage !== "booting") return;

    const tick = () => {
      setLoadMs(Math.round(performance.now() - bootStartedRef.current));
    };

    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [stage]);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    bootStartedRef.current = started;
    const minVisibleMs = 220;

    async function boot() {
      const path = window.location.pathname;
      const mediaUrls = getBootMediaUrlsForPathname(path);

      /** Hard ceiling so overlay never stalls on hero MP4 / slow networks */
      const hardCapMs = mediaUrls.length > 0 ? 3200 : 900;

      const readiness = Promise.all([
        document.fonts.ready,
        waitForDOMContentLoaded(),
        ...mediaUrls.map((url) => preloadVideoBootSignal(url, 2800)),
      ]);

      try {
        await Promise.race([readiness, delay(hardCapMs)]);
      } catch {
        /* reveal anyway */
      }

      const elapsed = performance.now() - started;
      const remaining = Math.max(0, minVisibleMs - elapsed);
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }

      if (cancelled) return;

      const totalMs = Math.round(performance.now() - started);
      setLoadMs(totalMs);

      if (reducedMotionRef.current) {
        setStage("off");
      } else {
        setStage("fade");
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (stage === "off") return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [stage]);

  const handleOverlayTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.propertyName !== "opacity") return;
      if (stage !== "fade") return;
      setStage("off");
    },
    [stage],
  );

  return (
    <>
      {stage !== "off" ? (
        <div
          className={cn(
            "fixed inset-0 z-[10500] flex flex-col items-center justify-center gap-4 bg-[var(--background-dark)] transition-opacity duration-700 ease-[var(--ease-out-expo)]",
            stage === "fade" ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
          onTransitionEnd={handleOverlayTransitionEnd}
          aria-busy
          aria-live="polite"
        >
          <div className="flex max-w-[min(92vw,280px)] flex-col items-center gap-6 select-none">
            <div className="flex max-h-[min(42vh,240px)] w-full items-center justify-center">
              <Image
                src="/assets/favicon.png"
                alt="Contenaissance"
                title="Contenaissance"
                width={274}
                height={133}
                sizes="280px"
                style={{ width: "auto", height: "auto" }}
                className="max-h-[min(42vh,240px)] w-auto max-w-full object-contain"
                priority
              />
            </div>
            <div
              className="windows-boot-dots relative z-[1] mt-1 shrink-0 justify-center"
              aria-hidden
            >
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <p className="mt-2 font-mono text-[11px] tabular-nums tracking-wider text-zinc-500">
              {stage === "fade" ? "Loaded in " : "Loading… "}
              {formatLoadSeconds(loadMs)}
            </p>
          </div>
        </div>
      ) : null}

      {children}
    </>
  );
}
