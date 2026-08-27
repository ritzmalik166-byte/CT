"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
  type Ref,
  type VideoHTMLAttributes,
} from "react";
import {
  pauseVideoSafe,
  playVideoSafe,
  releaseVideoSrc,
  warmVideoSrc,
} from "@/lib/video-playback";

export type ManagedVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "preload"
> & {
  /** Load immediately (above-the-fold hero). Default: lazy. */
  eager?: boolean;
  /** Play when visible and pause when not. Default true. */
  managePlayback?: boolean;
  /** Drop src when far from the viewport. Default: true for lazy videos. */
  unloadWhenHidden?: boolean;
  /** Start loading before the element is on screen. */
  loadRootMargin?: string;
  /** Minimum on-screen fraction required to play. */
  playThreshold?: number;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as MutableRefObject<T | null>).current = value;
}

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth)
  );
}

export const ManagedVideo = forwardRef<HTMLVideoElement, ManagedVideoProps>(
  function ManagedVideo(
    {
      eager = false,
      managePlayback = true,
      unloadWhenHidden,
      loadRootMargin = "70% 0px",
      playThreshold = 0.12,
      autoPlay,
      src,
      muted = true,
      loop,
      playsInline = true,
      className,
      children,
      onLoadedData,
      ...rest
    },
    forwardedRef
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const srcRef = useRef(src);
    const playVisibleRef = useRef(eager);
    const shouldUnload = unloadWhenHidden ?? !eager;

    srcRef.current = src;

    const setVideoRef = useCallback(
      (node: HTMLVideoElement | null) => {
        videoRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef]
    );

    const restoreSrc = useCallback(() => {
      const video = videoRef.current;
      if (!video || typeof srcRef.current !== "string") return;
      warmVideoSrc(video, srcRef.current);
    }, []);

    const tryPlay = useCallback(() => {
      const video = videoRef.current;
      if (!video || !autoPlay) return;
      restoreSrc();
      playVideoSafe(video);
    }, [autoPlay, restoreSrc]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (eager) {
        restoreSrc();
        video.preload = "auto";
        tryPlay();
      } else {
        video.preload = "none";
      }

      const loadObs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            restoreSrc();
            if (isInViewport(video)) playVisibleRef.current = true;
            if (eager || (managePlayback && playVisibleRef.current) || isInViewport(video)) {
              if (autoPlay) tryPlay();
            }
            return;
          }
          pauseVideoSafe(video);
          if (shouldUnload) releaseVideoSrc(video);
        },
        { root: null, rootMargin: loadRootMargin, threshold: 0 }
      );

      const playObs = new IntersectionObserver(
        ([entry]) => {
          const visible = entry.isIntersecting;
          playVisibleRef.current = visible;
          if (visible) restoreSrc();
          if (!managePlayback) return;
          if (visible) {
            if (autoPlay) tryPlay();
          } else {
            pauseVideoSafe(video);
          }
        },
        { root: null, rootMargin: "0px", threshold: [0, playThreshold, 1] }
      );

      loadObs.observe(video);
      playObs.observe(video);

      const onVisibility = () => {
        if (document.hidden) {
          pauseVideoSafe(video);
          return;
        }
        if (managePlayback && (playVisibleRef.current || isInViewport(video))) {
          restoreSrc();
          if (autoPlay) tryPlay();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        loadObs.disconnect();
        playObs.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        pauseVideoSafe(video);
      };
    }, [
      autoPlay,
      eager,
      loadRootMargin,
      managePlayback,
      playThreshold,
      restoreSrc,
      shouldUnload,
      tryPlay,
    ]);

    return (
      <video
        ref={setVideoRef}
        className={className}
        {...rest}
        src={eager && typeof src === "string" ? src : undefined}
        data-src={typeof src === "string" ? src : undefined}
        preload={eager ? "auto" : "none"}
        autoPlay={eager ? autoPlay : undefined}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        onLoadedData={(event) => {
          if (eager || (managePlayback && playVisibleRef.current)) tryPlay();
          onLoadedData?.(event);
        }}
      >
        {eager ? children : null}
      </video>
    );
  }
);

ManagedVideo.displayName = "ManagedVideo";
