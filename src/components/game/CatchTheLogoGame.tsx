"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";

/**
 * Above page chrome + site modals, below the custom cursor.
 * globals.css: --z-modal: 10100 · --z-cursor-ring: 10200 · --z-cursor-dot: 10201
 */
const GAME_Z_INDEX = 10150;

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

export interface CatchTheLogoGameProps {
  open: boolean;
  onClose: () => void;
  logoSrc?: string;
}

type Phase = "playing" | "paused" | "gameover";

/** Falling collectibles — logos + unique power / hazard objects. */
type ItemKind = "logo" | "heart" | "poison" | "expand" | "shrink" | "star";

type FallingItem = {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  scale: number;
  opacity: number;
  size: number;
  bounce: number;
  z: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  kind: "spark" | "star" | "dust" | "confetti";
};

type WeatherFx = {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  opacity: number;
  phase: number;
};

type ThemeId =
  | "neon-night"
  | "snowfall"
  | "rainstorm"
  | "heatwave"
  | "aurora"
  | "cosmic"
  | "magma"
  | "crystal";

type LevelTheme = {
  id: ThemeId;
  label: string;
  sky: [string, string, string];
  orbA: string;
  orbB: string;
  orbC: string;
  fog: string;
  floor: string;
  accent: string;
  glow: string;
  rim: string;
  wall: string;
  weather: "none" | "snow" | "rain" | "heat" | "stars" | "embers" | "sparkle";
  weatherDensity: number;
};

type GameHud = {
  score: number;
  bestScore: number;
  lives: number;
  level: number;
  timeLeft: number;
  catches: number;
  misses: number;
  phase: Phase;
  levelUpFlash: number;
  muted: boolean;
  accuracy: number;
  elapsed: number;
  themeLabel: string;
  toast: string;
};

const BEST_KEY = "catch-the-logo-best";
const MUTE_KEY = "catch-the-logo-mute";
const MAX_LIVES = 5;
const ROUND_SECONDS = 60;
const BASE_FALL = 140;
const BASE_SPAWN = 1.15;
const BASKET_MUL_MIN = 0.62;
const BASKET_MUL_MAX = 1.55;

const SITE_URL = "https://www.contenaissance.com/";
const SITE_NAME = "Contenaissance";
const SITE_TAGLINE = "AI Creative Agency for Video Production & Storytelling";

type SharePlatform =
  | "facebook"
  | "instagram"
  | "telegram"
  | "linkedin"
  | "whatsapp"
  | "snapchat"
  | "copy"
  | "native";

type SharePayload = {
  title: string;
  text: string;
  url: string;
};

const COLORS = {
  primary: "#4F46E5",
  secondary: "#7C3AED",
  accent: "#06B6D4",
  bg: "#0F172A",
  card: "#1E293B",
  white: "#FFFFFF",
};

const LEVEL_THEMES: LevelTheme[] = [
  {
    id: "neon-night",
    label: "Neon Night",
    sky: ["#050816", "#0B1224", "#1E1040"],
    orbA: "rgba(99,102,241,0.55)",
    orbB: "rgba(6,182,212,0.4)",
    orbC: "rgba(236,72,153,0.25)",
    fog: "rgba(15,23,42,0.28)",
    floor: "rgba(79,70,229,0.28)",
    accent: "#22D3EE",
    glow: "#818CF8",
    rim: "#E879F9",
    wall: "rgba(49,46,129,0.45)",
    weather: "sparkle",
    weatherDensity: 28,
  },
  {
    id: "snowfall",
    label: "Snowfall",
    sky: ["#0B1526", "#1E293B", "#475569"],
    orbA: "rgba(186,230,253,0.4)",
    orbB: "rgba(241,245,249,0.28)",
    orbC: "rgba(125,211,252,0.2)",
    fog: "rgba(241,245,249,0.14)",
    floor: "rgba(186,230,253,0.26)",
    accent: "#E0F2FE",
    glow: "#7DD3FC",
    rim: "#F8FAFC",
    wall: "rgba(51,65,85,0.5)",
    weather: "snow",
    weatherDensity: 85,
  },
  {
    id: "rainstorm",
    label: "Rainstorm",
    sky: ["#01060F", "#0B1C2C", "#0E4D64"],
    orbA: "rgba(14,165,233,0.45)",
    orbB: "rgba(56,189,248,0.28)",
    orbC: "rgba(15,118,110,0.22)",
    fog: "rgba(8,47,73,0.42)",
    floor: "rgba(6,182,212,0.24)",
    accent: "#38BDF8",
    glow: "#0EA5E9",
    rim: "#67E8F9",
    wall: "rgba(12,74,110,0.5)",
    weather: "rain",
    weatherDensity: 110,
  },
  {
    id: "heatwave",
    label: "Heatwave",
    sky: ["#1A0800", "#4C1D05", "#9A3412"],
    orbA: "rgba(249,115,22,0.5)",
    orbB: "rgba(250,204,21,0.35)",
    orbC: "rgba(239,68,68,0.25)",
    fog: "rgba(120,53,15,0.32)",
    floor: "rgba(251,146,60,0.28)",
    accent: "#FB923C",
    glow: "#F59E0B",
    rim: "#FDE68A",
    wall: "rgba(124,45,18,0.5)",
    weather: "heat",
    weatherDensity: 48,
  },
  {
    id: "aurora",
    label: "Aurora",
    sky: ["#011912", "#053F35", "#1E1B4B"],
    orbA: "rgba(52,211,153,0.48)",
    orbB: "rgba(167,139,250,0.4)",
    orbC: "rgba(34,211,238,0.28)",
    fog: "rgba(6,78,59,0.28)",
    floor: "rgba(110,231,183,0.24)",
    accent: "#34D399",
    glow: "#A78BFA",
    rim: "#5EEAD4",
    wall: "rgba(6,78,59,0.48)",
    weather: "sparkle",
    weatherDensity: 55,
  },
  {
    id: "cosmic",
    label: "Cosmic Drift",
    sky: ["#020617", "#1E1B4B", "#4C1D95"],
    orbA: "rgba(129,140,248,0.5)",
    orbB: "rgba(244,114,182,0.35)",
    orbC: "rgba(56,189,248,0.22)",
    fog: "rgba(30,27,75,0.38)",
    floor: "rgba(129,140,248,0.26)",
    accent: "#A78BFA",
    glow: "#F472B6",
    rim: "#C4B5FD",
    wall: "rgba(49,46,129,0.52)",
    weather: "stars",
    weatherDensity: 68,
  },
  {
    id: "magma",
    label: "Magma Core",
    sky: ["#140303", "#450A0A", "#991B1B"],
    orbA: "rgba(239,68,68,0.5)",
    orbB: "rgba(250,204,21,0.35)",
    orbC: "rgba(249,115,22,0.28)",
    fog: "rgba(69,10,10,0.38)",
    floor: "rgba(248,113,113,0.26)",
    accent: "#F87171",
    glow: "#FBBF24",
    rim: "#FDBA74",
    wall: "rgba(127,29,29,0.52)",
    weather: "embers",
    weatherDensity: 60,
  },
  {
    id: "crystal",
    label: "Crystal Cave",
    sky: ["#041E2A", "#0E7490", "#155E75"],
    orbA: "rgba(34,211,238,0.48)",
    orbB: "rgba(255,255,255,0.28)",
    orbC: "rgba(103,232,249,0.22)",
    fog: "rgba(8,47,73,0.32)",
    floor: "rgba(103,232,249,0.26)",
    accent: "#67E8F9",
    glow: "#22D3EE",
    rim: "#ECFEFF",
    wall: "rgba(14,116,144,0.5)",
    weather: "sparkle",
    weatherDensity: 58,
  },
];

function themeForLevel(level: number): LevelTheme {
  return LEVEL_THEMES[(Math.max(1, level) - 1) % LEVEL_THEMES.length]!;
}

const PLACEHOLDER_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#g)"/>
  <circle cx="64" cy="52" r="22" fill="none" stroke="#fff" stroke-width="8"/>
  <path d="M40 92c8-16 40-16 48 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
  <circle cx="96" cy="28" r="8" fill="#06B6D4"/>
</svg>`);

/* -------------------------------------------------------------------------- */
/* Zustand store                                                              */
/* -------------------------------------------------------------------------- */

type Store = GameHud & {
  setHud: (patch: Partial<GameHud>) => void;
  resetHud: (best: number, muted: boolean) => void;
};

const useCatchStore = create<Store>((set) => ({
  score: 0,
  bestScore: 0,
  lives: MAX_LIVES,
  level: 1,
  timeLeft: ROUND_SECONDS,
  catches: 0,
  misses: 0,
  phase: "playing",
  levelUpFlash: 0,
  muted: false,
  accuracy: 100,
  elapsed: 0,
  themeLabel: LEVEL_THEMES[0]!.label,
  toast: "",
  setHud: (patch) => set(patch),
  resetHud: (best, muted) =>
    set({
      score: 0,
      bestScore: best,
      lives: MAX_LIVES,
      level: 1,
      timeLeft: ROUND_SECONDS,
      catches: 0,
      misses: 0,
      phase: "playing",
      levelUpFlash: 0,
      muted,
      accuracy: 100,
      elapsed: 0,
      themeLabel: LEVEL_THEMES[0]!.label,
      toast: "",
    }),
}));

/* -------------------------------------------------------------------------- */
/* Audio                                                                      */
/* -------------------------------------------------------------------------- */

let audioCtx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function beep(
  muted: boolean,
  freq: number,
  dur = 0.12,
  type: OscillatorType = "sine",
  vol = 0.06
) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.stop(t + dur);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function readBest() {
  try {
    return Math.max(0, Number(localStorage.getItem(BEST_KEY) || 0));
  } catch {
    return 0;
  }
}

function writeBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* ignore */
  }
}

function readMute() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMute(m: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function buildSharePayload(stats: {
  score: number;
  level: number;
  catches: number;
  misses: number;
  accuracy: number;
}): SharePayload {
  const accuracy =
    stats.accuracy ||
    (stats.catches + stats.misses === 0
      ? 100
      : Math.round((stats.catches / (stats.catches + stats.misses)) * 100));

  const text = [
    `I scored ${stats.score} in Catch the Logo on ${SITE_NAME}!`,
    `Level ${stats.level} · ${accuracy}% accuracy`,
    "",
    SITE_TAGLINE,
    `Play the game & explore our work: ${SITE_URL}`,
  ].join("\n");

  return {
    title: `${stats.score} pts in Catch the Logo | ${SITE_NAME}`,
    text,
    url: SITE_URL,
  };
}

function openShareWindow(href: string) {
  window.open(href, "_blank", "noopener,noreferrer,width=640,height=720");
}

async function shareToPlatform(
  platform: SharePlatform,
  payload: SharePayload
): Promise<string> {
  const { title, text, url } = payload;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  switch (platform) {
    case "facebook":
      openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
      );
      return "Opening Facebook…";
    case "telegram":
      openShareWindow(
        `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
      );
      return "Opening Telegram…";
    case "linkedin":
      openShareWindow(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      );
      try {
        await navigator.clipboard.writeText(text);
        return "LinkedIn opened · caption copied — paste into your post";
      } catch {
        return "Opening LinkedIn…";
      }
    case "whatsapp":
      openShareWindow(`https://wa.me/?text=${encodedText}`);
      return "Opening WhatsApp…";
    case "instagram":
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* ignore */
      }
      openShareWindow("https://www.instagram.com/");
      return "Caption copied · paste it into your Instagram post or story";
    case "snapchat":
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* ignore */
      }
      openShareWindow(
        `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`
      );
      return "Caption copied · Snapchat opened with Contenaissance link";
    case "copy":
      await navigator.clipboard.writeText(text);
      return "Score + website info copied";
    case "native":
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        return "Shared";
      }
      await navigator.clipboard.writeText(text);
      return "Score + website info copied";
    default:
      return "";
  }
}

const SHARE_OPTIONS: {
  id: SharePlatform;
  label: string;
  color: string;
}[] = [
  { id: "facebook", label: "Facebook", color: "#1877F2" },
  { id: "instagram", label: "Instagram", color: "#E4405F" },
  { id: "telegram", label: "Telegram", color: "#26A5E4" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
  { id: "snapchat", label: "Snapchat", color: "#FFFC00" },
];

function isTouchUi() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 1024px)").matches
  );
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  good: boolean,
  nextId: () => number,
  colors?: string[]
) {
  const n = good ? 22 : 10;
  const palette =
    colors ??
    (good
      ? [COLORS.accent, COLORS.primary, COLORS.secondary, "#FBBF24", "#FFFFFF"]
      : ["#94A3B8", "#64748B", "#475569"]);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = good ? 80 + Math.random() * 220 : 40 + Math.random() * 100;
    particles.push({
      id: nextId(),
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - (good ? 40 : 0),
      life: 1,
      maxLife: good ? 0.55 + Math.random() * 0.45 : 0.35 + Math.random() * 0.25,
      color: palette[i % palette.length]!,
      size: good ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3,
      kind: good
        ? (["spark", "star", "confetti"] as const)[i % 3]!
        : "dust",
    });
  }
}

function rollItemKind(level: number): ItemKind {
  const r = Math.random();
  // Special chance rises slightly with level
  const specialChance = Math.min(0.34, 0.16 + level * 0.02);
  if (r > specialChance) return "logo";
  const s = Math.random();
  if (s < 0.22) return "heart";
  if (s < 0.4) return "poison";
  if (s < 0.58) return "expand";
  if (s < 0.76) return "shrink";
  return "star";
}

function toastFor(kind: ItemKind): string {
  switch (kind) {
    case "heart":
      return "+1 Heart";
    case "poison":
      return "Toxic hit −1 Heart";
    case "expand":
      return "Basket Expanded!";
    case "shrink":
      return "Basket Shrunk!";
    case "star":
      return "Bonus +25";
    default:
      return "";
  }
}

function drawSpecialItem(
  ctx: CanvasRenderingContext2D,
  kind: Exclude<ItemKind, "logo">,
  size: number,
  time: number
) {
  const s = size;
  ctx.save();

  // Soft contact shadow (grounds the object in 3D space)
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(2, s * 0.42, s * 0.38, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (kind === "heart") {
    const pulse = 1 + Math.sin(time * 6) * 0.04;
    ctx.scale(pulse, pulse);
    const g = ctx.createRadialGradient(-s * 0.15, -s * 0.15, 2, 0, 0, s * 0.7);
    g.addColorStop(0, "#FDA4AF");
    g.addColorStop(0.45, "#F43F5E");
    g.addColorStop(1, "#9F1239");
    ctx.fillStyle = g;
    ctx.shadowColor = "#FB7185";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.18);
    ctx.bezierCurveTo(0, -s * 0.05, -s * 0.55, -s * 0.05, -s * 0.55, s * 0.22);
    ctx.bezierCurveTo(-s * 0.55, s * 0.52, 0, s * 0.72, 0, s * 0.88);
    ctx.bezierCurveTo(0, s * 0.72, s * 0.55, s * 0.52, s * 0.55, s * 0.22);
    ctx.bezierCurveTo(s * 0.55, -s * 0.05, 0, -s * 0.05, 0, s * 0.18);
    ctx.fill();
    // Specular
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(-s * 0.16, s * 0.08, s * 0.1, s * 0.06, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "poison") {
    ctx.shadowColor = "#C084FC";
    ctx.shadowBlur = 18;
    const g = ctx.createRadialGradient(-s * 0.15, -s * 0.2, 2, 0, 0, s * 0.5);
    g.addColorStop(0, "#E9D5FF");
    g.addColorStop(0.4, "#A855F7");
    g.addColorStop(1, "#581C87");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2);
    ctx.fill();
    // Glass rim
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Bubbles
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(-s * 0.14, -s * 0.12, s * 0.09, 0, Math.PI * 2);
    ctx.arc(s * 0.12, -s * 0.06, s * 0.06, 0, Math.PI * 2);
    ctx.arc(0, s * 0.14, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    // Skull hint
    ctx.fillStyle = "rgba(15,23,42,0.55)";
    ctx.beginPath();
    ctx.arc(-s * 0.1, 0, s * 0.05, 0, Math.PI * 2);
    ctx.arc(s * 0.1, 0, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "expand" || kind === "shrink") {
    const grow = kind === "expand";
    ctx.shadowColor = grow ? "#34D399" : "#FBBF24";
    ctx.shadowBlur = 16;
    // 3D pill / capsule
    const g = ctx.createLinearGradient(0, -s * 0.35, 0, s * 0.35);
    if (grow) {
      g.addColorStop(0, "#6EE7B7");
      g.addColorStop(0.5, "#059669");
      g.addColorStop(1, "#064E3B");
    } else {
      g.addColorStop(0, "#FDE68A");
      g.addColorStop(0.5, "#D97706");
      g.addColorStop(1, "#78350F");
    }
    ctx.fillStyle = g;
    drawRoundedRect(ctx, -s * 0.48, -s * 0.3, s * 0.96, s * 0.6, 14);
    ctx.fill();
    // Top highlight bevel
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    drawRoundedRect(ctx, -s * 0.4, -s * 0.26, s * 0.8, s * 0.16, 8);
    ctx.fill();
    ctx.strokeStyle = grow ? "#A7F3D0" : "#FEF3C7";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (grow) {
      ctx.moveTo(-s * 0.22, 0);
      ctx.lineTo(s * 0.22, 0);
      ctx.moveTo(0, -s * 0.2);
      ctx.lineTo(0, s * 0.2);
    } else {
      ctx.moveTo(-s * 0.24, 0);
      ctx.lineTo(s * 0.24, 0);
    }
    ctx.stroke();
  } else {
    // Faceted gem star
    const spin = time * 2;
    ctx.rotate(spin * 0.15);
    ctx.shadowColor = "#FDE047";
    ctx.shadowBlur = 22;
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, s * 0.55);
    g.addColorStop(0, "#FEF9C3");
    g.addColorStop(0.45, "#FACC15");
    g.addColorStop(1, "#A16207");
    ctx.fillStyle = g;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? s * 0.5 : s * 0.22;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(-s * 0.08, -s * 0.12, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLogoItem(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  size: number,
  accent: string,
  time: number
) {
  const s = size;
  ctx.save();
  // Contact shadow
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(3, s * 0.4, s * 0.4, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Outer glow disc
  const glow = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 0.7);
  glow.addColorStop(0, `${accent}55`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // 3D platform / medallion
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  drawRoundedRect(ctx, -s / 2, -s / 2, s, s, s * 0.22);
  const plate = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  plate.addColorStop(0, "#1E293B");
  plate.addColorStop(0.5, "#0F172A");
  plate.addColorStop(1, "#312E81");
  ctx.fillStyle = plate;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner bevel ring
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, -s / 2 + 4, -s / 2 + 4, s - 8, s - 8, s * 0.18);
  ctx.stroke();

  const pad = s * 0.16;
  if (img && img.complete && img.naturalWidth > 0) {
    const ar = img.naturalWidth / img.naturalHeight;
    let dw = s - pad * 2;
    let dh = s - pad * 2;
    if (ar > 1) dh = dw / ar;
    else dw = dh * ar;
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, -dw / 2, -dh / 2, dw, dh, 8);
    ctx.clip();
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  } else {
    drawRoundedRect(ctx, -s * 0.28, -s * 0.28, s * 0.56, s * 0.56, 10);
    const lg = ctx.createLinearGradient(-s * 0.3, -s * 0.3, s * 0.3, s * 0.3);
    lg.addColorStop(0, COLORS.primary);
    lg.addColorStop(1, accent);
    ctx.fillStyle = lg;
    ctx.fill();
  }

  // Specular sweep
  ctx.globalAlpha = 0.18 + Math.sin(time * 3) * 0.06;
  const shine = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  shine.addColorStop(0, "rgba(255,255,255,0.7)");
  shine.addColorStop(0.35, "transparent");
  ctx.fillStyle = shine;
  drawRoundedRect(ctx, -s / 2, -s / 2, s, s, s * 0.22);
  ctx.fill();
  ctx.restore();
}

function drawBasket3D(
  ctx: CanvasRenderingContext2D,
  bw: number,
  bh: number,
  mul: number,
  bounce: number,
  theme: LevelTheme,
  time: number
) {
  const by = Math.sin(bounce * Math.PI) * -8;
  ctx.save();
  ctx.translate(0, by);

  // Stage spotlight under basket
  const ground = ctx.createRadialGradient(0, bh / 2 + 10, 2, 0, bh / 2 + 10, bw * 0.75);
  ground.addColorStop(0, `${theme.accent}88`);
  ground.addColorStop(0.55, `${theme.glow}33`);
  ground.addColorStop(1, "transparent");
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(0, bh / 2 + 14, bw * 0.58, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rear lip (depth)
  ctx.fillStyle = "#2A1A10";
  ctx.beginPath();
  ctx.moveTo(-bw / 2 + 4, -bh / 2);
  ctx.lineTo(-bw / 2 + 12, -bh / 2 - 12);
  ctx.lineTo(bw / 2 - 12, -bh / 2 - 12);
  ctx.lineTo(bw / 2 - 4, -bh / 2);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 28;
  drawRoundedRect(ctx, -bw / 2, -bh / 2, bw, bh, 14);
  const wood = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
  wood.addColorStop(0, "#E8C9A8");
  wood.addColorStop(0.35, "#C4A484");
  wood.addColorStop(0.7, "#8B5E3C");
  wood.addColorStop(1, "#4A2C17");
  ctx.fillStyle = wood;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wood grain
  ctx.strokeStyle = "rgba(74,44,23,0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const yy = -bh / 2 + 8 + i * (bh / 4.5);
    ctx.beginPath();
    ctx.moveTo(-bw / 2 + 10, yy);
    ctx.quadraticCurveTo(0, yy + 2, bw / 2 - 10, yy);
    ctx.stroke();
  }

  // Bevel rim
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Chrome band
  const chrome = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  chrome.addColorStop(0, "rgba(255,255,255,0.15)");
  chrome.addColorStop(0.5, "rgba(255,255,255,0.65)");
  chrome.addColorStop(1, "rgba(255,255,255,0.15)");
  ctx.fillStyle = chrome;
  ctx.fillRect(-bw / 2 + 10, -5, bw - 20, 6);

  // Inner cavity
  ctx.fillStyle = "rgba(15,23,42,0.45)";
  drawRoundedRect(ctx, -bw / 2 + 10, -bh / 2 + 8, bw - 20, bh * 0.42, 10);
  ctx.fill();
  ctx.strokeStyle = `${theme.accent}88`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Neon underglow pulse
  ctx.globalAlpha = 0.45 + Math.sin(time * 4) * 0.15;
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.ellipse(0, bh / 2 + 6, bw * 0.4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (mul !== 1) {
    ctx.strokeStyle = mul > 1 ? "#34D399" : "#FBBF24";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    drawRoundedRect(ctx, -bw / 2 - 5, -bh / 2 - 5, bw + 10, bh + 10, 16);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function ensureWeather(
  fx: WeatherFx[],
  theme: LevelTheme,
  w: number,
  h: number,
  nextId: () => number
) {
  const target = theme.weatherDensity;
  while (fx.length < target) {
    fx.push({
      id: nextId(),
      x: Math.random() * w,
      y: Math.random() * h,
      z: 0.4 + Math.random() * 1.4,
      vx: 0,
      vy: 0,
      size: 1,
      rot: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    });
  }
  if (fx.length > target) fx.length = target;
}

function updateWeather(
  fx: WeatherFx[],
  theme: LevelTheme,
  dt: number,
  w: number,
  h: number,
  time: number
) {
  for (const p of fx) {
    p.phase += dt;
    if (theme.weather === "snow") {
      p.vy = 35 + p.z * 40;
      p.vx = Math.sin(time * 1.2 + p.phase) * 18 * p.z;
      p.size = 1.5 + p.z * 2.2;
      p.rot += dt * 1.5;
    } else if (theme.weather === "rain") {
      p.vy = 520 + p.z * 280;
      p.vx = -40 - p.z * 20;
      p.size = 1 + p.z * 1.2;
    } else if (theme.weather === "heat") {
      p.vy = -20 - p.z * 30;
      p.vx = Math.sin(time * 2 + p.phase) * 40;
      p.size = 8 + p.z * 18;
      p.opacity = 0.08 + Math.sin(p.phase) * 0.06;
    } else if (theme.weather === "embers") {
      p.vy = -30 - p.z * 50;
      p.vx = Math.sin(time * 3 + p.phase) * 25;
      p.size = 1.5 + p.z * 2;
    } else if (theme.weather === "stars" || theme.weather === "sparkle") {
      p.vy = Math.sin(time + p.phase) * 8;
      p.vx = Math.cos(time * 0.5 + p.phase) * 6;
      p.size = 1 + p.z * 1.8;
      p.opacity = 0.35 + Math.sin(p.phase * 3) * 0.35;
    } else {
      p.vy = 20;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y > h + 10) {
      p.y = -10;
      p.x = Math.random() * w;
    }
    if (p.y < -20) {
      p.y = h + 10;
      p.x = Math.random() * w;
    }
    if (p.x < -20) p.x = w + 10;
    if (p.x > w + 20) p.x = -10;
  }
}

function drawWeather(
  ctx: CanvasRenderingContext2D,
  fx: WeatherFx[],
  theme: LevelTheme
) {
  if (theme.weather === "none") return;
  for (const p of fx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(0.9, p.opacity));
    if (theme.weather === "snow") {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#E0F2FE";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
      }
      ctx.closePath();
      ctx.fill();
    } else if (theme.weather === "rain") {
      const g = ctx.createLinearGradient(p.x, p.y, p.x + p.vx * 0.02, p.y + 16);
      g.addColorStop(0, "rgba(186,230,253,0.95)");
      g.addColorStop(1, "rgba(56,189,248,0.1)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4 * p.z;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 0.03, p.y + 14 + p.z * 8);
      ctx.stroke();
    } else if (theme.weather === "heat") {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      g.addColorStop(0, "rgba(251,146,60,0.3)");
      g.addColorStop(0.5, "rgba(250,204,21,0.12)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme.weather === "embers") {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      g.addColorStop(0, "#FEF3C7");
      g.addColorStop(0.4, "#FB923C");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = theme.accent;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      // Cross sparkle
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x - p.size * 1.6, p.y);
      ctx.lineTo(p.x + p.size * 1.6, p.y);
      ctx.moveTo(p.x, p.y - p.size * 1.6);
      ctx.lineTo(p.x, p.y + p.size * 1.6);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawThemedBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: LevelTheme,
  basketY: number,
  time: number
) {
  // Sky dome
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, theme.sky[0]);
  grad.addColorStop(0.45, theme.sky[1]);
  grad.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(-40, -40, w + 80, h + 80);

  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h * 0.4, h * 0.15, w / 2, h * 0.45, h * 0.85);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Floating volumetric orbs (parallax layers)
  const drift = Math.sin(time * 0.35) * 28;
  const drift2 = Math.cos(time * 0.28) * 22;
  const layers: Array<{
    x: number;
    y: number;
    r: number;
    c: string;
    a: number;
  }> = [
    { x: w * 0.18 + drift, y: h * 0.16, r: w * 0.34, c: theme.orbA, a: 0.5 },
    { x: w * 0.85 - drift, y: h * 0.28, r: w * 0.28, c: theme.orbB, a: 0.4 },
    { x: w * 0.55 + drift2, y: h * 0.08, r: w * 0.22, c: theme.orbC, a: 0.35 },
    { x: w * 0.72, y: h * 0.55 + drift2 * 0.5, r: w * 0.18, c: theme.orbA, a: 0.22 },
  ];
  for (const L of layers) {
    ctx.globalAlpha = L.a;
    const orb = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    orb.addColorStop(0, L.c);
    orb.addColorStop(0.55, `${theme.accent}22`);
    orb.addColorStop(1, "transparent");
    ctx.fillStyle = orb;
    ctx.beginPath();
    ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Aurora ribbons
  if (theme.id === "aurora" || theme.id === "cosmic") {
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const y0 = h * (0.12 + i * 0.08);
      ctx.moveTo(0, y0);
      for (let x = 0; x <= w; x += 20) {
        const yy =
          y0 +
          Math.sin(x * 0.012 + time * (0.8 + i * 0.2) + i) * (18 + i * 8);
        ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = i % 2 === 0 ? theme.accent : theme.glow;
      ctx.lineWidth = 18 - i * 4;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Side walls for theatre / stage depth
  const horizon = Math.max(h * 0.42, basketY - 110);
  ctx.fillStyle = theme.wall;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w * 0.12, horizon + 20);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w, horizon);
  ctx.lineTo(w * 0.88, horizon + 20);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Neon wall edge lines
  ctx.strokeStyle = theme.rim;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w * 0.12, horizon + 20);
  ctx.moveTo(w, horizon);
  ctx.lineTo(w * 0.88, horizon + 20);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Perspective floor + runway
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizon, w, h - horizon + 50);
  ctx.clip();

  const floorGrad = ctx.createLinearGradient(0, horizon, 0, h);
  floorGrad.addColorStop(0, "rgba(0,0,0,0)");
  floorGrad.addColorStop(0.35, theme.floor);
  floorGrad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizon, w, h - horizon + 50);

  // Reflective sheen
  const sheen = ctx.createLinearGradient(0, horizon, 0, h);
  sheen.addColorStop(0, "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.4, "transparent");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, horizon, w, h - horizon);

  const vanishingX = w / 2 + Math.sin(time * 0.2) * 24;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  for (let i = -10; i <= 10; i++) {
    const t = Math.abs(i) / 10;
    ctx.globalAlpha = 0.06 + (1 - t) * 0.12;
    ctx.beginPath();
    ctx.moveTo(vanishingX, horizon);
    ctx.lineTo(vanishingX + i * (w * 0.16), h + 50);
    ctx.stroke();
  }
  for (let r = 1; r <= 9; r++) {
    const tt = r / 9;
    const y = horizon + (h - horizon) * (tt * tt);
    ctx.globalAlpha = 0.06 + tt * 0.14;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Center neon runway
  ctx.globalAlpha = 0.35;
  const run = ctx.createLinearGradient(w * 0.5 - 40, horizon, w * 0.5 + 40, h);
  run.addColorStop(0, "transparent");
  run.addColorStop(0.4, theme.accent);
  run.addColorStop(1, theme.glow);
  ctx.fillStyle = run;
  ctx.beginPath();
  ctx.moveTo(vanishingX - 6, horizon);
  ctx.lineTo(w * 0.5 - 55, h);
  ctx.lineTo(w * 0.5 + 55, h);
  ctx.lineTo(vanishingX + 6, horizon);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Floating ring portals (premium 3D accents)
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = theme.rim;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.glow;
  ctx.shadowBlur = 16;
  const rx = w * 0.78 + Math.cos(time * 0.4) * 10;
  const ry = h * 0.22;
  ctx.beginPath();
  ctx.ellipse(rx, ry, 42, 18, Math.sin(time * 0.3) * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(w * 0.2, h * 0.3, 28, 12, -0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Atmospheric fog bands
  ctx.fillStyle = theme.fog;
  ctx.globalAlpha = 0.28 + Math.sin(time * 0.6) * 0.08;
  ctx.fillRect(0, 0, w, h * 0.38);
  ctx.globalAlpha = 0.15;
  ctx.fillRect(0, h * 0.55, w, h * 0.2);
  ctx.globalAlpha = 1;

  if (theme.weather === "heat") {
    for (let i = 0; i < 8; i++) {
      const yy = ((time * 50 + i * 60) % (h + 40)) - 20;
      ctx.fillStyle = "rgba(251,146,60,0.035)";
      ctx.fillRect(0, yy, w, 16);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CatchTheLogoGame({
  open,
  onClose,
  logoSrc,
}: CatchTheLogoGameProps) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const idRef = useRef(1);
  const nextId = () => idRef.current++;
  const timeRef = useRef(0);

  const itemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const weatherRef = useRef<WeatherFx[]>([]);
  const basketRef = useRef({
    x: 0,
    targetX: 0,
    y: 0,
    baseW: 120,
    mul: 1,
    mulTimer: 0,
    h: 36,
    bounce: 0,
  });
  const keysRef = useRef({ left: false, right: false });
  const holdRef = useRef<"left" | "right" | null>(null);
  const mouseActiveRef = useRef(false);
  const flashRef = useRef(0);
  const flashColorRef = useRef(COLORS.accent);
  const shakeRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const runningRef = useRef(false);
  const spawnAccRef = useRef(0);
  const hiddenRef = useRef(false);
  const touchUiRef = useRef(false);
  const toastTimerRef = useRef(0);

  const hud = useCatchStore();
  const phaseRef = useRef<Phase>("playing");
  const mutedRef = useRef(false);
  const statsRef = useRef({
    score: 0,
    lives: MAX_LIVES,
    level: 1,
    timeLeft: ROUND_SECONDS,
    catches: 0,
    misses: 0,
    elapsed: 0,
  });

  const [touchUi, setTouchUi] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const applyBasketWidth = useCallback(() => {
    const { w, h } = sizeRef.current;
    const b = basketRef.current;
    b.baseW = Math.max(90, Math.min(160, w * 0.22));
    b.h = Math.max(28, b.baseW * 0.3);
    b.y = h - Math.max(70, h * 0.12);
    const half = (b.baseW * b.mul) / 2;
    b.x = Math.min(Math.max(b.x, half + 8), w - half - 8);
    b.targetX = b.x;
  }, []);

  const showToast = useCallback((msg: string) => {
    useCatchStore.getState().setHud({ toast: msg });
    toastTimerRef.current = 1.8;
  }, []);

  const syncHud = useCallback(() => {
    const s = statsRef.current;
    const total = s.catches + s.misses;
    const theme = themeForLevel(s.level);
    useCatchStore.getState().setHud({
      score: s.score,
      lives: s.lives,
      level: s.level,
      timeLeft: Math.max(0, s.timeLeft),
      catches: s.catches,
      misses: s.misses,
      phase: phaseRef.current,
      elapsed: s.elapsed,
      accuracy: total === 0 ? 100 : Math.round((s.catches / total) * 100),
      levelUpFlash: useCatchStore.getState().levelUpFlash,
      themeLabel: theme.label,
    });
  }, []);

  const endGame = useCallback(() => {
    phaseRef.current = "gameover";
    const s = statsRef.current;
    const best = Math.max(s.score, readBest());
    writeBest(best);
    useCatchStore.getState().setHud({
      phase: "gameover",
      bestScore: best,
      score: s.score,
      accuracy:
        s.catches + s.misses === 0
          ? 100
          : Math.round((s.catches / (s.catches + s.misses)) * 100),
      elapsed: s.elapsed,
    });
    beep(mutedRef.current, 140, 0.35, "triangle", 0.07);
    setTimeout(() => beep(mutedRef.current, 90, 0.4, "sawtooth", 0.05), 80);
  }, []);

  const resetGame = useCallback(() => {
    const best = readBest();
    const muted = readMute();
    mutedRef.current = muted;
    phaseRef.current = "playing";
    itemsRef.current = [];
    particlesRef.current = [];
    weatherRef.current = [];
    flashRef.current = 0;
    shakeRef.current = 0;
    spawnAccRef.current = 0;
    lastTsRef.current = 0;
    timeRef.current = 0;
    toastTimerRef.current = 0;
    statsRef.current = {
      score: 0,
      lives: MAX_LIVES,
      level: 1,
      timeLeft: ROUND_SECONDS,
      catches: 0,
      misses: 0,
      elapsed: 0,
    };
    const { w, h } = sizeRef.current;
    basketRef.current.x = w / 2;
    basketRef.current.targetX = w / 2;
    basketRef.current.mul = 1;
    basketRef.current.mulTimer = 0;
    basketRef.current.bounce = 0;
    applyBasketWidth();
    void h;
    useCatchStore.getState().resetHud(best, muted);
  }, [applyBasketWidth]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    sizeRef.current = { w, h, dpr };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    applyBasketWidth();
    touchUiRef.current = isTouchUi();
    setTouchUi(touchUiRef.current);
  }, [applyBasketWidth]);

  const spawnItem = useCallback(() => {
    const { w } = sizeRef.current;
    const level = statsRef.current.level;
    const kind = rollItemKind(level);
    const size =
      kind === "logo" ? 36 + Math.random() * 22 : 30 + Math.random() * 16;
    const margin = size;
    itemsRef.current.push({
      id: nextId(),
      kind,
      x: margin + Math.random() * Math.max(1, w - margin * 2),
      y: -size - Math.random() * 40,
      vx: (Math.random() - 0.5) * (20 + level * 4),
      vy: BASE_FALL + level * 28 + Math.random() * 40,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2.8,
      scale: 0.85 + Math.random() * 0.35,
      opacity: 0.9 + Math.random() * 0.1,
      size,
      bounce: Math.random() * Math.PI * 2,
      z: 0.7 + Math.random() * 0.6,
    });
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (!runningRef.current) return;
      rafRef.current = requestAnimationFrame(tick);

      if (hiddenRef.current || document.hidden) {
        lastTsRef.current = ts;
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      if (!lastTsRef.current) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      dt = Math.min(0.05, Math.max(0, dt));
      timeRef.current += dt;

      const { w, h } = sizeRef.current;
      const phase = phaseRef.current;
      const b = basketRef.current;
      const theme = themeForLevel(statsRef.current.level);

      ensureWeather(weatherRef.current, theme, w, h, nextId);
      updateWeather(weatherRef.current, theme, dt, w, h, timeRef.current);

      if (toastTimerRef.current > 0) {
        toastTimerRef.current -= dt;
        if (toastTimerRef.current <= 0) {
          useCatchStore.getState().setHud({ toast: "" });
        }
      }

      if (phase === "playing") {
        const speed = Math.max(420, w * 0.7);
        if (keysRef.current.left || holdRef.current === "left") {
          b.targetX -= speed * dt;
          mouseActiveRef.current = false;
        }
        if (keysRef.current.right || holdRef.current === "right") {
          b.targetX += speed * dt;
          mouseActiveRef.current = false;
        }

        if (b.mulTimer > 0) {
          b.mulTimer -= dt;
          if (b.mulTimer <= 0) {
            b.mul = 1;
            b.mulTimer = 0;
            showToast("Basket size reset");
          }
        }

        const halfW = (b.baseW * b.mul) / 2;
        b.targetX = Math.min(Math.max(b.targetX, halfW + 8), w - halfW - 8);
        const lerp = 1 - Math.pow(0.001, dt);
        b.x += (b.targetX - b.x) * Math.min(1, lerp * 14);
        b.bounce *= Math.pow(0.05, dt);

        statsRef.current.timeLeft -= dt;
        statsRef.current.elapsed += dt;
        if (statsRef.current.timeLeft <= 0) {
          statsRef.current.timeLeft = 0;
          endGame();
        }

        const spawnRate = Math.max(
          0.32,
          BASE_SPAWN - (statsRef.current.level - 1) * 0.08
        );
        spawnAccRef.current += dt;
        while (spawnAccRef.current >= spawnRate) {
          spawnAccRef.current -= spawnRate;
          if (itemsRef.current.length < 12) spawnItem();
        }

        const still: FallingItem[] = [];
        for (const item of itemsRef.current) {
          item.vy += 18 * dt;
          item.x += item.vx * dt;
          item.y += item.vy * dt;
          item.rot += item.rotSpeed * dt;
          item.bounce += dt * 6;
          if (item.x < item.size / 2 || item.x > w - item.size / 2) {
            item.vx *= -0.85;
            item.x = Math.min(
              Math.max(item.x, item.size / 2),
              w - item.size / 2
            );
          }

          const half = (item.size * item.scale) / 2;
          const bw = b.baseW * b.mul;
          const caught =
            item.y + half >= b.y - b.h * 0.35 &&
            item.y - half <= b.y + b.h * 0.55 &&
            item.x > b.x - bw / 2 + 6 &&
            item.x < b.x + bw / 2 - 6;

          if (caught) {
            b.bounce = 1;
            if (item.kind === "logo") {
              statsRef.current.score += 10;
              statsRef.current.catches += 1;
              flashRef.current = 0.25;
              flashColorRef.current = theme.accent;
              spawnBurst(particlesRef.current, item.x, b.y, true, nextId, [
                theme.accent,
                COLORS.primary,
                "#fff",
              ]);
              beep(mutedRef.current, 520 + Math.random() * 80, 0.1, "sine", 0.07);

              if (statsRef.current.catches % 10 === 0) {
                statsRef.current.level += 1;
                const nextTheme = themeForLevel(statsRef.current.level);
                weatherRef.current = [];
                useCatchStore.getState().setHud({
                  levelUpFlash: 1.8,
                  level: statsRef.current.level,
                  themeLabel: nextTheme.label,
                });
                showToast(`Theme: ${nextTheme.label}`);
                beep(mutedRef.current, 660, 0.12, "square", 0.05);
              }
            } else if (item.kind === "heart") {
              statsRef.current.lives = Math.min(
                MAX_LIVES,
                statsRef.current.lives + 1
              );
              flashRef.current = 0.35;
              flashColorRef.current = "#F43F5E";
              spawnBurst(particlesRef.current, item.x, b.y, true, nextId, [
                "#F43F5E",
                "#FB7185",
                "#fff",
              ]);
              showToast(toastFor("heart"));
              beep(mutedRef.current, 720, 0.12, "sine", 0.07);
            } else if (item.kind === "poison") {
              statsRef.current.lives -= 1;
              shakeRef.current = 1;
              flashRef.current = 0.5;
              flashColorRef.current = "#A855F7";
              spawnBurst(particlesRef.current, item.x, b.y, false, nextId, [
                "#A855F7",
                "#7E22CE",
              ]);
              showToast(toastFor("poison"));
              beep(mutedRef.current, 120, 0.2, "sawtooth", 0.07);
              if (statsRef.current.lives <= 0) {
                statsRef.current.lives = 0;
                endGame();
              }
            } else if (item.kind === "expand") {
              b.mul = Math.min(BASKET_MUL_MAX, b.mul + 0.35);
              b.mulTimer = Math.max(b.mulTimer, 8);
              flashRef.current = 0.3;
              flashColorRef.current = "#34D399";
              spawnBurst(particlesRef.current, item.x, b.y, true, nextId, [
                "#34D399",
                "#A7F3D0",
              ]);
              showToast(toastFor("expand"));
              beep(mutedRef.current, 480, 0.1, "triangle", 0.06);
            } else if (item.kind === "shrink") {
              b.mul = Math.max(BASKET_MUL_MIN, b.mul - 0.28);
              b.mulTimer = Math.max(b.mulTimer, 7);
              flashRef.current = 0.3;
              flashColorRef.current = "#FBBF24";
              spawnBurst(particlesRef.current, item.x, b.y, false, nextId, [
                "#FBBF24",
                "#D97706",
              ]);
              showToast(toastFor("shrink"));
              beep(mutedRef.current, 220, 0.12, "square", 0.05);
            } else if (item.kind === "star") {
              statsRef.current.score += 25;
              flashRef.current = 0.3;
              flashColorRef.current = "#FACC15";
              spawnBurst(particlesRef.current, item.x, b.y, true, nextId, [
                "#FACC15",
                "#FDE047",
                "#fff",
              ]);
              showToast(toastFor("star"));
              beep(mutedRef.current, 880, 0.1, "sine", 0.06);
            }

            if (statsRef.current.score > useCatchStore.getState().bestScore) {
              writeBest(statsRef.current.score);
              useCatchStore
                .getState()
                .setHud({ bestScore: statsRef.current.score });
            }
            continue;
          }

          if (item.y - half > h + 20) {
            // Only missed logos cost a life
            if (item.kind === "logo") {
              statsRef.current.lives -= 1;
              statsRef.current.misses += 1;
              shakeRef.current = 1;
              flashRef.current = 0.45;
              flashColorRef.current = "#EF4444";
              spawnBurst(particlesRef.current, item.x, h - 40, false, nextId);
              beep(mutedRef.current, 160, 0.18, "sawtooth", 0.06);
              if (statsRef.current.lives <= 0) {
                statsRef.current.lives = 0;
                endGame();
              }
            }
            continue;
          }
          still.push(item);
        }
        itemsRef.current = still;

        particlesRef.current = particlesRef.current.filter((p) => {
          p.life -= dt / p.maxLife;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 220 * dt;
          p.vx *= 0.99;
          return p.life > 0;
        });

        if (Math.floor(ts / 100) !== Math.floor((ts - dt * 1000) / 100)) {
          const flash = useCatchStore.getState().levelUpFlash;
          if (flash > 0) {
            useCatchStore
              .getState()
              .setHud({ levelUpFlash: Math.max(0, flash - dt * 2.2) });
          }
          syncHud();
        }
      } else {
        particlesRef.current = particlesRef.current.filter((p) => {
          p.life -= dt / p.maxLife;
          p.x += p.vx * dt * 0.3;
          p.y += p.vy * dt * 0.3;
          return p.life > 0;
        });
      }

      flashRef.current = Math.max(0, flashRef.current - dt * 2.2);
      shakeRef.current = Math.max(0, shakeRef.current - dt * 3.5);

      const sx = shakeRef.current * (Math.random() - 0.5) * 10;
      const sy = shakeRef.current * (Math.random() - 0.5) * 8;
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.translate(sx, sy);

      drawThemedBackground(ctx, w, h, theme, b.y, timeRef.current);
      drawWeather(ctx, weatherRef.current, theme);

      // Depth-sort falling items
      const sorted = [...itemsRef.current].sort((a, c) => a.z - c.z);
      const img = logoImgRef.current;
      const t = timeRef.current;
      for (const item of sorted) {
        const bob = Math.sin(item.bounce) * 3;
        const depthScale = 0.82 + item.z * 0.22;
        const perspectiveY = 1 + (item.y / h) * 0.08;
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        ctx.rotate(item.rot);
        ctx.scale(depthScale * perspectiveY, depthScale * perspectiveY);
        ctx.globalAlpha = item.opacity;
        const s = item.size * item.scale;
        if (item.kind === "logo") {
          drawLogoItem(ctx, img, s, theme.accent, t);
        } else {
          drawSpecialItem(ctx, item.kind, s, t);
        }
        ctx.restore();
      }

      // Basket
      const bw = b.baseW * b.mul;
      const bh = b.h;
      ctx.save();
      ctx.translate(b.x, b.y);
      drawBasket3D(ctx, bw, bh, b.mul, b.bounce, theme, t);
      ctx.restore();

      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        if (p.kind === "star") {
          ctx.rotate(p.life * 6);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? p.size * 2 : p.size;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.kind === "confetti") {
          ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (flashRef.current > 0) {
        ctx.globalAlpha = flashRef.current * 0.35;
        ctx.fillStyle = flashColorRef.current;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    },
    [endGame, showToast, spawnItem, syncHud]
  );

  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = logoSrc || PLACEHOLDER_LOGO;
    img.onload = () => {
      logoImgRef.current = img;
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.src = PLACEHOLDER_LOGO;
      fallback.onload = () => {
        logoImgRef.current = fallback;
      };
    };
    return () => {
      logoImgRef.current = null;
    };
  }, [logoSrc]);

  useEffect(() => {
    if (!open) {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      keysRef.current = { left: false, right: false };
      holdRef.current = null;
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    resetGame();
    const id = requestAnimationFrame(() => {
      resize();
      spawnItem();
      spawnItem();
      runningRef.current = true;
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(id);
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [open, resetGame, resize, spawnItem, tick]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => resize();
    const onVis = () => {
      hiddenRef.current = document.hidden;
      if (!document.hidden) lastTsRef.current = 0;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    document.addEventListener("visibilitychange", onVis);

    const ro =
      typeof ResizeObserver !== "undefined" && wrapRef.current
        ? new ResizeObserver(() => resize())
        : null;
    if (wrapRef.current && ro) ro.observe(wrapRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onVis);
      ro?.disconnect();
    };
  }, [open, resize]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (k === "enter") {
        e.preventDefault();
        beep(mutedRef.current, 400, 0.08, "sine", 0.05);
        resetGame();
        spawnItem();
        return;
      }
      if (k === " " || k === "spacebar") {
        e.preventDefault();
        if (phaseRef.current === "gameover") return;
        phaseRef.current =
          phaseRef.current === "paused" ? "playing" : "paused";
        useCatchStore.getState().setHud({ phase: phaseRef.current });
        beep(mutedRef.current, 300, 0.07, "triangle", 0.05);
        return;
      }
      if (phaseRef.current !== "playing") return;
      if (k === "arrowleft" || k === "a") {
        keysRef.current.left = true;
        e.preventDefault();
      }
      if (k === "arrowright" || k === "d") {
        keysRef.current.right = true;
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keysRef.current.left = false;
      if (k === "arrowright" || k === "d") keysRef.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [open, onClose, resetGame, spawnItem]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "playing") return;
    if (touchUiRef.current) return;
    if (holdRef.current) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseActiveRef.current = true;
    basketRef.current.targetX = e.clientX - rect.left;
  }, []);

  const holdStart = useCallback((dir: "left" | "right") => {
    holdRef.current = dir;
    mouseActiveRef.current = false;
  }, []);

  const holdEnd = useCallback((dir: "left" | "right") => {
    if (holdRef.current === dir) holdRef.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    writeMute(mutedRef.current);
    useCatchStore.getState().setHud({ muted: mutedRef.current });
    beep(mutedRef.current, 440, 0.06, "sine", 0.05);
  }, []);

  const getSharePayload = useCallback((): SharePayload => {
    const s = statsRef.current;
    const total = s.catches + s.misses;
    return buildSharePayload({
      score: s.score,
      level: s.level,
      catches: s.catches,
      misses: s.misses,
      accuracy: total === 0 ? 100 : Math.round((s.catches / total) * 100),
    });
  }, []);

  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      beep(mutedRef.current, 480, 0.08, "sine", 0.05);
      try {
        const msg = await shareToPlatform(platform, getSharePayload());
        if (msg) {
          setShareMsg(msg);
          setTimeout(() => setShareMsg(null), 2800);
        }
      } catch {
        setShareMsg("Share cancelled");
        setTimeout(() => setShareMsg(null), 1600);
      }
    },
    [getSharePayload]
  );

  const timerPct = useMemo(
    () => Math.max(0, Math.min(1, hud.timeLeft / ROUND_SECONDS)),
    [hud.timeLeft]
  );

  const hearts = useMemo(
    () =>
      Array.from({ length: MAX_LIVES }, (_, i) => (i < hud.lives ? "❤️" : "🖤")),
    [hud.lives]
  );

  const themeAccent = themeForLevel(hud.level).accent;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="catch-the-logo"
          role="dialog"
          aria-modal="true"
          aria-label="Catch the Logo game"
          className="fixed top-0 left-0 h-screen w-screen"
          style={{
            width: "100vw",
            height: "100vh",
            zIndex: GAME_Z_INDEX,
            isolation: "isolate",
          }}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            className="absolute inset-0 flex flex-col"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              paddingLeft: "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
            }}
            initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none relative z-20 flex items-start justify-between gap-3 px-3 pb-2 pt-3 sm:px-5">
              <div className="pointer-events-auto flex flex-col gap-2">
                <div
                  className="rounded-2xl border border-white/10 px-3 py-2 text-base tracking-wide text-white shadow-lg backdrop-blur-xl sm:text-lg"
                  style={{ background: "rgba(30,41,59,0.72)" }}
                  aria-label={`${hud.lives} lives remaining`}
                >
                  {hearts.join("")}
                </div>
                <div
                  className="inline-flex flex-col gap-0.5 rounded-2xl border border-white/10 px-3 py-1.5 backdrop-blur-xl"
                  style={{ background: "rgba(30,41,59,0.72)" }}
                >
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        background: themeAccent,
                        boxShadow: `0 0 10px ${themeAccent}`,
                      }}
                    />
                    Level {hud.level}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">
                    {hud.themeLabel}
                  </span>
                </div>
              </div>

              <div className="pointer-events-auto flex flex-col items-center gap-2">
                <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke={themeAccent}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${timerPct * 97.4} 97.4`}
                      style={{ filter: `drop-shadow(0 0 6px ${themeAccent})` }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                    {Math.ceil(hud.timeLeft)}
                  </span>
                </div>
              </div>

              <div className="pointer-events-auto flex flex-col items-end gap-2">
                <div
                  className="min-w-[7.5rem] rounded-2xl border border-white/10 px-3 py-2 text-right text-white shadow-lg backdrop-blur-xl"
                  style={{ background: "rgba(30,41,59,0.72)" }}
                >
                  <motion.div
                    key={hud.score}
                    initial={reduceMotion ? false : { scale: 1.2, y: -4 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-xl font-bold tabular-nums sm:text-2xl"
                    style={{
                      background: `linear-gradient(90deg,${themeAccent},${COLORS.secondary})`,
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {hud.score}
                  </motion.div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">
                    Best {hud.bestScore}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={hud.muted ? "Unmute" : "Mute"}
                    className="rounded-full border border-white/15 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:border-cyan-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                  >
                    {hud.muted ? "Unmute" : "Mute"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close game"
                    className="rounded-full border border-white/15 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:border-violet-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {hud.levelUpFlash > 0.2 && hud.phase === "playing" ? (
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-[20%] z-30 -translate-x-1/2 text-center"
                  initial={{ opacity: 0, scale: 0.7, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                >
                  <div
                    className="rounded-full px-6 py-2 text-sm font-extrabold tracking-[0.2em] text-white shadow-2xl"
                    style={{
                      background: `linear-gradient(90deg,${COLORS.primary},${COLORS.secondary},${themeAccent})`,
                      boxShadow: `0 0 40px ${themeAccent}88`,
                    }}
                  >
                    LEVEL UP
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    {hud.themeLabel}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {hud.toast ? (
                <motion.div
                  key={hud.toast}
                  className="pointer-events-none absolute left-1/2 top-[32%] z-30 -translate-x-1/2"
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <div
                    className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md"
                    style={{ background: "rgba(15,23,42,0.75)" }}
                  >
                    {hud.toast}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div
              ref={wrapRef}
              className="relative z-10 mx-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-3xl border border-white/10 shadow-2xl sm:mx-5 sm:mb-4"
              style={{
                background: COLORS.bg,
                boxShadow: `0 25px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)`,
              }}
              onPointerMove={onPointerMove}
            >
              <canvas
                ref={canvasRef}
                className="block h-full w-full touch-none"
                aria-label="Catch the logo playfield"
              />

              {/* Legend */}
              <div className="pointer-events-none absolute left-3 top-3 z-20 hidden rounded-xl border border-white/10 bg-slate-950/45 px-2.5 py-2 text-[10px] text-slate-200 backdrop-blur-md sm:block">
                <p className="mb-1 font-semibold uppercase tracking-wider text-slate-400">
                  Catch these
                </p>
                <p>❤️ +Heart · ⭐ Bonus</p>
                <p>🟩 Grow desk · 🟧 Shrink</p>
                <p className="text-rose-300">☠️ Toxic −Heart</p>
              </div>

              {touchUi ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-5 pb-5">
                  <HoldButton
                    label="Move left"
                    icon="◀"
                    onDown={() => holdStart("left")}
                    onUp={() => holdEnd("left")}
                  />
                  <HoldButton
                    label="Move right"
                    icon="▶"
                    onDown={() => holdStart("right")}
                    onUp={() => holdEnd("right")}
                  />
                </div>
              ) : (
                <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-900/50 px-3 py-1 text-[10px] text-slate-300 backdrop-blur-md">
                  ← → / A D · Mouse · Space pause · Enter restart · Esc close
                </p>
              )}
            </div>

            <AnimatePresence>
              {hud.phase === "paused" ? (
                <OverlayCard
                  title="Paused"
                  subtitle="Weather waits — your logos don’t forever."
                >
                  <ActionButton
                    label="Resume"
                    primary
                    onClick={() => {
                      phaseRef.current = "playing";
                      useCatchStore.getState().setHud({ phase: "playing" });
                      beep(mutedRef.current, 420, 0.08, "sine", 0.05);
                    }}
                  />
                  <ActionButton
                    label="Restart"
                    onClick={() => {
                      beep(mutedRef.current, 380, 0.08, "sine", 0.05);
                      resetGame();
                      spawnItem();
                    }}
                  />
                  <ActionButton label="Exit" onClick={onClose} />
                </OverlayCard>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {hud.phase === "gameover" ? (
                <OverlayCard
                  title="Game Over"
                  subtitle="Survived the weather — climb higher next run."
                >
                  <div className="mb-4 grid grid-cols-2 gap-2 text-center text-sm text-slate-200">
                    <Stat label="Score" value={String(hud.score)} />
                    <Stat label="Best" value={String(hud.bestScore)} />
                    <Stat label="Accuracy" value={`${hud.accuracy}%`} />
                    <Stat label="Time" value={`${Math.round(hud.elapsed)}s`} />
                  </div>
                  <ActionButton
                    label="Play Again"
                    primary
                    onClick={() => {
                      beep(mutedRef.current, 500, 0.1, "sine", 0.06);
                      resetGame();
                      spawnItem();
                      spawnItem();
                    }}
                  />
                  <SharePanel
                    onShare={handleShare}
                    status={shareMsg}
                    supportsNative={
                      typeof navigator !== "undefined" &&
                      typeof navigator.share === "function"
                    }
                  />
                  <ActionButton label="Close" onClick={onClose} />
                </OverlayCard>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/* UI bits                                                                    */
/* -------------------------------------------------------------------------- */

function HoldButton({
  label,
  icon,
  onDown,
  onUp,
}: {
  label: string;
  icon: string;
  onDown: () => void;
  onUp: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="pointer-events-auto select-none rounded-full text-2xl text-white"
      style={{
        width: 72,
        height: 72,
        background: "rgba(30,41,59,0.45)",
        border: "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), 0 0 24px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onUp();
      }}
      onPointerCancel={(e) => {
        e.preventDefault();
        onUp();
      }}
      onPointerLeave={(e) => {
        if (e.buttons === 0) onUp();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {icon}
    </button>
  );
}

function OverlayCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="document"
        className="max-h-[min(92vh,720px)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/15 p-6 text-white shadow-2xl"
        style={{
          background: "rgba(30,41,59,0.92)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), 0 0 40px rgba(79,70,229,0.25)",
        }}
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <h2
          className="text-center text-2xl font-bold"
          style={{
            background: `linear-gradient(90deg,${COLORS.accent},${COLORS.secondary})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">{subtitle}</p>
        <div className="mt-5 flex flex-col gap-2">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function ActionButton({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      style={
        primary
          ? {
              background: `linear-gradient(90deg,${COLORS.primary},${COLORS.secondary})`,
              boxShadow: `0 10px 28px ${COLORS.primary}66`,
            }
          : {
              background: "rgba(15,23,42,0.65)",
              border: "1px solid rgba(255,255,255,0.14)",
            }
      }
    >
      {label}
    </motion.button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums text-white">{value}</div>
    </div>
  );
}

function SharePanel({
  onShare,
  status,
  supportsNative,
}: {
  onShare: (platform: SharePlatform) => void;
  status: string | null;
  supportsNative: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Share your score
      </p>
      <p className="mt-1 text-center text-[11px] leading-snug text-slate-400">
        Includes your score + {SITE_NAME} ({SITE_URL.replace(/^https?:\/\//, "")}
        )
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {SHARE_OPTIONS.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onShare(opt.id)}
            aria-label={`Share on ${opt.label}`}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/10 px-1.5 py-2.5 text-[10px] font-semibold text-white transition hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            style={{
              background: `linear-gradient(160deg, ${opt.color}33, rgba(15,23,42,0.85))`,
            }}
          >
            <ShareIcon platform={opt.id} />
            <span
              className={
                opt.id === "snapchat" ? "text-slate-900 drop-shadow-sm" : ""
              }
              style={opt.id === "snapchat" ? { color: "#FACC15" } : undefined}
            >
              {opt.label}
            </span>
          </motion.button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onShare("copy")}
          className="rounded-full border border-white/15 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-white transition hover:border-cyan-400/40"
        >
          Copy text
        </button>
        <button
          type="button"
          onClick={() => onShare(supportsNative ? "native" : "copy")}
          className="rounded-full border border-white/15 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-white transition hover:border-violet-400/40"
        >
          {supportsNative ? "More…" : "Copy link"}
        </button>
      </div>
      {status ? (
        <p className="mt-2 text-center text-[11px] text-cyan-300" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}

function ShareIcon({ platform }: { platform: SharePlatform }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
  };

  switch (platform) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm5.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 9.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5z" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common}>
          <path d="M9.5 15.3 9.3 19c.4 0 .6-.2.8-.4l1.9-1.8 4 2.9c.7.4 1.2.2 1.4-.7l2.5-11.8c.2-.9-.3-1.3-1-.9L4.2 10.6c-.9.3-.9.8-.2 1l3.9 1.2 9-5.7c.4-.3.8-.1.5.2l-7.9 7.9z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M6.5 9H3v12h3.5V9zM4.7 3A2.1 2.1 0 1 0 4.8 7.2 2.1 2.1 0 0 0 4.7 3zM21 13.4c0-3.2-1.7-4.7-4-4.7a3.4 3.4 0 0 0-3.1 1.7V9H10.5v12H14v-6.5c0-1.7.3-3.4 2.5-3.4s2.2 2 2.2 3.5V21H22v-7.6z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm0 1.8a7.2 7.2 0 0 1 6.1 10.9l-.3.5.7 2.6-2.7-.7-.5.3A7.2 7.2 0 1 1 12 4.8zm4.1 9.3c-.2-.1-1.3-.6-1.5-.7s-.3-.1-.5.1-.6.7-.7.9-.3.2-.5.1a5.9 5.9 0 0 1-1.7-1 6.5 6.5 0 0 1-1.2-1.5c-.1-.2 0-.4.1-.5l.4-.4.1-.3c0-.1 0-.3-.1-.4s-.5-1.1-.6-1.5-.4-.3-.5-.3h-.4a.8.8 0 0 0-.6.3 2.4 2.4 0 0 0-.7 1.8 4.1 4.1 0 0 0 .9 2.2 9.4 9.4 0 0 0 3.6 3.2 12 12 0 0 0 1.3.5 3.1 3.1 0 0 0 1.4.1 2.3 2.3 0 0 0 1.5-1.1 1.9 1.9 0 0 0 .1-1.1c-.1 0-.2-.1-.4-.2z" />
        </svg>
      );
    case "snapchat":
      return (
        <svg {...common} fill="#FACC15">
          <path d="M12 3c-2.8 0-4.7 2.1-4.7 5.2 0 1.1-.1 2.1-.8 2.7-.3.3-.2.6.1.7.7.2 1.3.5 1.3 1.1 0 .5-.5.8-1 .9-.2 0-.3.2-.2.4.4.9 1.9 1.5 2.8 1.7-.3.5-.8 1.3-.9 1.7 0 .2.1.3.3.3 1.1-.2 2-.9 2.5-1.1.2 1.1.8 2.4 2.6 2.4s2.4-1.3 2.6-2.4c.5.2 1.4.9 2.5 1.1.2 0 .3-.1.3-.3-.1-.4-.6-1.2-.9-1.7.9-.2 2.4-.8 2.8-1.7.1-.2 0-.4-.2-.4-.5-.1-1-.4-1-.9 0-.6.6-.9 1.3-1.1.3-.1.4-.4.1-.7-.7-.6-.8-1.6-.8-2.7C16.7 5.1 14.8 3 12 3z" />
        </svg>
      );
    default:
      return null;
  }
}
