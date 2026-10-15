"use client";

import {
  MotionConfig,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ContentImage } from "./content";

export const EASE_OUT_EXPO = [0.19, 1, 0.22, 1] as const;
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Hydration-safe: `false` on the server and during hydration, then the real preference. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** Honors the OS reduced-motion setting for every Framer Motion animation below it. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  amount = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.95, ease: EASE_OUT_QUINT, delay }}
    >
      {children}
    </motion.div>
  );
}

const revealWord: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
};

/** Masked word-by-word reveal; screen readers get the plain sentence. */
export function TextReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.6 }}
        variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom"
          >
            <motion.span className="inline-block will-change-transform" variants={revealWord}>
              {word}
            </motion.span>
            {i < words.length - 1 ? "\u00a0" : null}
          </span>
        ))}
      </motion.span>
    </>
  );
}

/** Renders `**word**` as a highlighted phrase. */
function HighlightedText({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong
        key={i}
        className="box-decoration-clone bg-[linear-gradient(transparent_58%,rgb(177_173_74/0.32)_58%)] px-0.5 font-semibold text-(--ais-ink)"
      >
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * Collapsed: the first paragraph clamped to 3 lines with an ellipsis. Expanded: every paragraph.
 * The toggle only appears when there is more to show. All text stays in the HTML for SEO.
 */
export function ExpandableText({
  paragraphs,
  className = "",
}: {
  paragraphs: string[];
  className?: string;
}) {
  const firstRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [firstClamped, setFirstClamped] = useState(false);
  const textId = useId();

  useEffect(() => {
    const el = firstRef.current;
    if (!el || expanded) return;
    const observer = new ResizeObserver(() => {
      setFirstClamped(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, paragraphs]);

  const hasMore = paragraphs.length > 1 || firstClamped;

  return (
    <div className={className}>
      <div id={textId} className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            ref={index === 0 ? firstRef : undefined}
            hidden={!expanded && index > 0}
            className={!expanded && index === 0 ? "line-clamp-3" : undefined}
          >
            <HighlightedText text={paragraph} />
          </p>
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-[13px] font-medium text-(--ais-ink) underline decoration-(--ais-line) underline-offset-4 transition-colors duration-300 hover:decoration-(--ais-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--ais-ink)"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

export function DrawLine() {
  return (
    <motion.div
      aria-hidden
      className="h-px origin-left bg-(--ais-line)"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
    />
  );
}

const TILT_SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

/** Pointer-driven 3D tilt with a moving highlight (mouse only). */
export function TiltCard({
  children,
  className = "",
  surfaceClassName = "",
  maxTilt = 7,
}: {
  children: React.ReactNode;
  className?: string;
  surfaceClassName?: string;
  maxTilt?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useSpring(0, TILT_SPRING);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), TILT_SPRING);
  const scale = useTransform(hover, [0, 1], [1, 1.015]);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`;

  const isActive = (e: React.PointerEvent) => !reduceMotion && e.pointerType === "mouse";

  const reset = () => {
    rectRef.current = null;
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  return (
    <div
      ref={boxRef}
      className={`[perspective:1200px] ${className}`}
      onPointerEnter={(e) => {
        if (!isActive(e)) return;
        rectRef.current = boxRef.current?.getBoundingClientRect() ?? null;
        hover.set(1);
      }}
      onPointerMove={(e) => {
        const rect = rectRef.current;
        if (!rect || !isActive(e)) return;
        px.set((e.clientX - rect.left) / rect.width);
        py.set((e.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={reset}
    >
      <motion.div
        className={`relative h-full w-full transform-gpu ${surfaceClassName}`}
        style={{ rotateX, rotateY, scale }}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: glare, opacity: hover }}
        />
      </motion.div>
    </div>
  );
}

/** Image that drifts inside its frame as the frame crosses the viewport. */
export function ParallaxImage({
  src,
  alt,
  sizes,
  className = "",
  imageClassName = "",
  distance = 8,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  /** Vertical travel in % of the frame height, in each direction. */
  distance?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${distance}%`, `${distance}%`]);
  const overscan = 1 + (distance * 2.2) / 100;

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduceMotion ? undefined : { y, scale: overscan }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${imageClassName}`} />
      </motion.div>
    </div>
  );
}

const MAGNET_SPRING = { stiffness: 220, damping: 15, mass: 0.4 };

/** Link that leans toward the cursor while hovered (mouse only). */
export function MagneticLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const x = useSpring(0, MAGNET_SPRING);
  const y = useSpring(0, MAGNET_SPRING);

  return (
    <motion.span
      className="inline-block"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduceMotion || e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
        y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.span>
  );
}

/** Per-tile vertical drift (px) across the section's scroll range. */
const TILE_DRIFT = [36, -24, 44, -30, 28];

function CtaTile({
  tile,
  index,
  progress,
  reduceMotion,
}: {
  tile: ContentImage;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const drift = TILE_DRIFT[index % TILE_DRIFT.length];
  const y = useTransform(progress, [0, 1], [drift, -drift]);

  return (
    <motion.li className="[perspective:900px]" style={reduceMotion ? undefined : { y }}>
      <motion.div
        className="group relative aspect-[120/134] overflow-hidden rounded-[6px] bg-zinc-900 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 sm:rounded-[8px]"
        initial={{ opacity: 0, y: 60, rotateX: -35 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.15 + index * 0.08 }}
        whileHover={{ y: -10, rotateZ: index % 2 === 0 ? -2 : 2, scale: 1.05 }}
      >
        <Image
          src={tile.src}
          alt={tile.alt}
          fill
          sizes="(min-width: 768px) 140px, 19vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
      </motion.div>
    </motion.li>
  );
}

export function CtaTiles({ tiles }: { tiles: ContentImage[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start end", "end start"] });

  return (
    <ul
      ref={listRef}
      aria-label="Selected AI artwork"
      className="relative mx-auto mt-10 grid max-w-[720px] grid-cols-5 gap-2 sm:mt-12 sm:gap-4"
    >
      {tiles.map((tile, index) => (
        <CtaTile
          key={tile.src}
          tile={tile}
          index={index}
          progress={scrollYProgress}
          reduceMotion={reduceMotion}
        />
      ))}
    </ul>
  );
}
