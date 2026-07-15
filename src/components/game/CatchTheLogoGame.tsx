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

type FallingLogo = {
  id: number;
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
};

const BEST_KEY = "catch-the-logo-best";
const MUTE_KEY = "catch-the-logo-mute";
const MAX_LIVES = 3;
const ROUND_SECONDS = 60;
const BASE_FALL = 140;
const BASE_SPAWN = 1.15;

const COLORS = {
  primary: "#4F46E5",
  secondary: "#7C3AED",
  accent: "#06B6D4",
  bg: "#0F172A",
  card: "#1E293B",
  white: "#FFFFFF",
};

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
/* Zustand store (internal only)                                              */
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
    }),
}));

/* -------------------------------------------------------------------------- */
/* Audio (Web Audio API, optional)                                            */
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
  nextId: () => number
) {
  const n = good ? 22 : 10;
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
      color: good
        ? [COLORS.accent, COLORS.primary, COLORS.secondary, "#FBBF24", "#FFFFFF"][
            i % 5
          ]!
        : ["#94A3B8", "#64748B", "#475569"][i % 3]!,
      size: good ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3,
      kind: good
        ? (["spark", "star", "confetti"] as const)[i % 3]!
        : "dust",
    });
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

  const logosRef = useRef<FallingLogo[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const basketRef = useRef({ x: 0, targetX: 0, y: 0, w: 120, h: 36, bounce: 0 });
  const keysRef = useRef({ left: false, right: false });
  const holdRef = useRef<"left" | "right" | null>(null);
  const mouseActiveRef = useRef(false);
  const flashRef = useRef(0);
  const shakeRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const runningRef = useRef(false);
  const spawnAccRef = useRef(0);
  const hiddenRef = useRef(false);
  const touchUiRef = useRef(false);

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

  const syncHud = useCallback(() => {
    const s = statsRef.current;
    const total = s.catches + s.misses;
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
    logosRef.current = [];
    particlesRef.current = [];
    flashRef.current = 0;
    shakeRef.current = 0;
    spawnAccRef.current = 0;
    lastTsRef.current = 0;
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
    const bw = Math.max(90, Math.min(160, w * 0.22));
    basketRef.current = {
      x: w / 2,
      targetX: w / 2,
      y: h - Math.max(70, h * 0.12),
      w: bw,
      h: Math.max(28, bw * 0.3),
      bounce: 0,
    };
    useCatchStore.getState().resetHud(best, muted);
  }, []);

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

    const b = basketRef.current;
    const bw = Math.max(90, Math.min(160, w * 0.22));
    b.w = bw;
    b.h = Math.max(28, bw * 0.3);
    b.y = h - Math.max(70, h * 0.12);
    b.x = Math.min(Math.max(b.x, b.w / 2 + 8), w - b.w / 2 - 8);
    b.targetX = b.x;

    touchUiRef.current = isTouchUi();
    setTouchUi(touchUiRef.current);
  }, []);

  const spawnLogo = useCallback(() => {
    const { w } = sizeRef.current;
    const level = statsRef.current.level;
    const size = 36 + Math.random() * 22;
    const margin = size;
    logosRef.current.push({
      id: nextId(),
      x: margin + Math.random() * Math.max(1, w - margin * 2),
      y: -size - Math.random() * 40,
      vx: (Math.random() - 0.5) * (20 + level * 4),
      vy: BASE_FALL + level * 28 + Math.random() * 40,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2.8,
      scale: 0.85 + Math.random() * 0.35,
      opacity: 0.88 + Math.random() * 0.12,
      size,
      bounce: Math.random() * Math.PI * 2,
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

      const { w, h } = sizeRef.current;
      const phase = phaseRef.current;
      const b = basketRef.current;

      // Input → basket target
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
        b.targetX = Math.min(Math.max(b.targetX, b.w / 2 + 8), w - b.w / 2 - 8);

        const lerp = 1 - Math.pow(0.001, dt);
        b.x += (b.targetX - b.x) * Math.min(1, lerp * 14);
        b.bounce *= Math.pow(0.05, dt);

        // Timer & stats
        statsRef.current.timeLeft -= dt;
        statsRef.current.elapsed += dt;
        if (statsRef.current.timeLeft <= 0) {
          statsRef.current.timeLeft = 0;
          endGame();
        }

        // Spawn
        const spawnRate = Math.max(0.35, BASE_SPAWN - (statsRef.current.level - 1) * 0.08);
        spawnAccRef.current += dt;
        while (spawnAccRef.current >= spawnRate) {
          spawnAccRef.current -= spawnRate;
          if (logosRef.current.length < 10) spawnLogo();
        }

        // Logos
        const still: FallingLogo[] = [];
        for (const logo of logosRef.current) {
          logo.vy += 18 * dt;
          logo.x += logo.vx * dt;
          logo.y += logo.vy * dt;
          logo.rot += logo.rotSpeed * dt;
          logo.bounce += dt * 6;
          if (logo.x < logo.size / 2 || logo.x > w - logo.size / 2) {
            logo.vx *= -0.85;
            logo.x = Math.min(Math.max(logo.x, logo.size / 2), w - logo.size / 2);
          }

          const half = (logo.size * logo.scale) / 2;
          const caught =
            logo.y + half >= b.y - b.h * 0.35 &&
            logo.y - half <= b.y + b.h * 0.55 &&
            logo.x > b.x - b.w / 2 + 6 &&
            logo.x < b.x + b.w / 2 - 6;

          if (caught) {
            statsRef.current.score += 10;
            statsRef.current.catches += 1;
            b.bounce = 1;
            flashRef.current = 0.25;
            spawnBurst(particlesRef.current, logo.x, b.y, true, nextId);
            beep(mutedRef.current, 520 + Math.random() * 80, 0.1, "sine", 0.07);
            beep(mutedRef.current, 780, 0.08, "triangle", 0.04);

            if (statsRef.current.catches % 10 === 0) {
              statsRef.current.level += 1;
              useCatchStore.getState().setHud({ levelUpFlash: 1.6, level: statsRef.current.level });
              beep(mutedRef.current, 660, 0.12, "square", 0.05);
            }

            if (statsRef.current.score > useCatchStore.getState().bestScore) {
              writeBest(statsRef.current.score);
              useCatchStore.getState().setHud({ bestScore: statsRef.current.score });
            }
            continue;
          }

          if (logo.y - half > h + 20) {
            statsRef.current.lives -= 1;
            statsRef.current.misses += 1;
            shakeRef.current = 1;
            flashRef.current = 0.45;
            spawnBurst(particlesRef.current, logo.x, h - 40, false, nextId);
            beep(mutedRef.current, 160, 0.18, "sawtooth", 0.06);
            if (statsRef.current.lives <= 0) {
              statsRef.current.lives = 0;
              endGame();
            }
            continue;
          }
          still.push(logo);
        }
        logosRef.current = still;

        // Particles
        particlesRef.current = particlesRef.current.filter((p) => {
          p.life -= dt / p.maxLife;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 220 * dt;
          p.vx *= 0.99;
          return p.life > 0;
        });

        // HUD throttle ~10fps
        if (Math.floor(ts / 100) !== Math.floor((ts - dt * 1000) / 100)) {
          const flash = useCatchStore.getState().levelUpFlash;
          if (flash > 0) {
            useCatchStore.getState().setHud({ levelUpFlash: Math.max(0, flash - dt * 2.2) });
          }
          syncHud();
        }
      } else {
        // Still animate particles gently when paused/over
        particlesRef.current = particlesRef.current.filter((p) => {
          p.life -= dt / p.maxLife;
          p.x += p.vx * dt * 0.3;
          p.y += p.vy * dt * 0.3;
          return p.life > 0;
        });
      }

      flashRef.current = Math.max(0, flashRef.current - dt * 2.2);
      shakeRef.current = Math.max(0, shakeRef.current - dt * 3.5);

      // Draw
      const sx = shakeRef.current * (Math.random() - 0.5) * 10;
      const sy = shakeRef.current * (Math.random() - 0.5) * 8;
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.translate(sx, sy);

      // Background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0B1224");
      grad.addColorStop(0.45, COLORS.bg);
      grad.addColorStop(1, "#1A1035");
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      // Soft orbs
      ctx.globalAlpha = 0.35;
      const orb = ctx.createRadialGradient(w * 0.2, h * 0.15, 0, w * 0.2, h * 0.15, w * 0.35);
      orb.addColorStop(0, "rgba(79,70,229,0.55)");
      orb.addColorStop(1, "transparent");
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, w, h);
      const orb2 = ctx.createRadialGradient(w * 0.85, h * 0.7, 0, w * 0.85, h * 0.7, w * 0.4);
      orb2.addColorStop(0, "rgba(6,182,212,0.35)");
      orb2.addColorStop(1, "transparent");
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // Floor glow
      const floor = ctx.createLinearGradient(0, b.y - 40, 0, h);
      floor.addColorStop(0, "transparent");
      floor.addColorStop(1, "rgba(79,70,229,0.18)");
      ctx.fillStyle = floor;
      ctx.fillRect(0, b.y - 40, w, h - b.y + 40);

      // Logos
      const img = logoImgRef.current;
      for (const logo of logosRef.current) {
        const bob = Math.sin(logo.bounce) * 3;
        ctx.save();
        ctx.translate(logo.x, logo.y + bob);
        ctx.rotate(logo.rot);
        ctx.globalAlpha = logo.opacity;
        ctx.shadowColor = "rgba(6,182,212,0.55)";
        ctx.shadowBlur = 18;
        const s = logo.size * logo.scale;
        if (img && img.complete && img.naturalWidth > 0) {
          const ar = img.naturalWidth / img.naturalHeight;
          let dw = s;
          let dh = s;
          if (ar > 1) dh = s / ar;
          else dw = s * ar;
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        } else {
          drawRoundedRect(ctx, -s / 2, -s / 2, s, s, s * 0.22);
          const lg = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
          lg.addColorStop(0, COLORS.primary);
          lg.addColorStop(1, COLORS.accent);
          ctx.fillStyle = lg;
          ctx.fill();
        }
        ctx.restore();
      }

      // Basket
      const by = b.y + Math.sin(b.bounce * Math.PI) * -8;
      ctx.save();
      ctx.translate(b.x, by);
      ctx.shadowColor = "rgba(124,58,237,0.65)";
      ctx.shadowBlur = 22;
      // body
      const bw = b.w;
      const bh = b.h;
      drawRoundedRect(ctx, -bw / 2, -bh / 2, bw, bh, 12);
      const wood = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
      wood.addColorStop(0, "#C4A484");
      wood.addColorStop(0.5, "#8B5E3C");
      wood.addColorStop(1, "#5C3A21");
      ctx.fillStyle = wood;
      ctx.fill();
      // rim
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      // metal band
      ctx.fillStyle = "rgba(226,232,240,0.55)";
      ctx.fillRect(-bw / 2 + 8, -4, bw - 16, 5);
      // inner
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(15,23,42,0.35)";
      drawRoundedRect(ctx, -bw / 2 + 8, -bh / 2 + 6, bw - 16, bh * 0.45, 8);
      ctx.fill();
      // neon underglow
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = COLORS.accent;
      ctx.beginPath();
      ctx.ellipse(0, bh / 2 + 6, bw * 0.38, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Particles
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

      // Flash overlays
      if (flashRef.current > 0) {
        ctx.globalAlpha = flashRef.current * 0.35;
        ctx.fillStyle =
          phase === "gameover" || statsRef.current.lives === 0
            ? "#EF4444"
            : COLORS.accent;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    },
    [endGame, spawnLogo, syncHud]
  );

  // Load logo image
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

  // Open / close lifecycle
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
    // Wait a frame for layout
    const id = requestAnimationFrame(() => {
      resize();
      spawnLogo();
      spawnLogo();
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
  }, [open, resetGame, resize, spawnLogo, tick]);

  // Resize / orientation / visibility
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

  // Keyboard
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
        spawnLogo();
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
  }, [open, onClose, resetGame, spawnLogo]);

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

  const shareScore = useCallback(async () => {
    const s = statsRef.current;
    const text = `I scored ${s.score} in Catch the Logo! Level ${s.level} · ${Math.round(
      (s.catches / Math.max(1, s.catches + s.misses)) * 100
    )}% accuracy`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Catch the Logo", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg("Copied to clipboard");
        setTimeout(() => setShareMsg(null), 1800);
      }
    } catch {
      setShareMsg("Share cancelled");
      setTimeout(() => setShareMsg(null), 1400);
    }
    beep(mutedRef.current, 480, 0.08, "sine", 0.05);
  }, []);

  const timerPct = useMemo(
    () => Math.max(0, Math.min(1, hud.timeLeft / ROUND_SECONDS)),
    [hud.timeLeft]
  );

  const hearts = useMemo(
    () =>
      Array.from({ length: MAX_LIVES }, (_, i) => (i < hud.lives ? "❤️" : "🖤")),
    [hud.lives]
  );

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
          {/* Backdrop */}
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
            {/* HUD */}
            <div className="pointer-events-none relative z-20 flex items-start justify-between gap-3 px-3 pb-2 pt-3 sm:px-5">
              <div className="pointer-events-auto flex flex-col gap-2">
                <div
                  className="rounded-2xl border border-white/10 px-3 py-2 text-lg tracking-wide text-white shadow-lg backdrop-blur-xl sm:text-xl"
                  style={{ background: "rgba(30,41,59,0.72)" }}
                  aria-label={`${hud.lives} lives remaining`}
                >
                  {hearts.join(" ")}
                </div>
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-xl"
                  style={{ background: "rgba(30,41,59,0.72)" }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: COLORS.accent, boxShadow: `0 0 10px ${COLORS.accent}` }}
                  />
                  Level {hud.level}
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
                      stroke={COLORS.accent}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${timerPct * 97.4} 97.4`}
                      style={{ filter: `drop-shadow(0 0 6px ${COLORS.accent})` }}
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
                      background: `linear-gradient(90deg,${COLORS.accent},${COLORS.secondary})`,
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

            {/* Level up banner */}
            <AnimatePresence>
              {hud.levelUpFlash > 0.2 && hud.phase === "playing" ? (
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-[22%] z-30 -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0.7, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                >
                  <div
                    className="rounded-full px-6 py-2 text-sm font-extrabold tracking-[0.2em] text-white shadow-2xl"
                    style={{
                      background: `linear-gradient(90deg,${COLORS.primary},${COLORS.secondary},${COLORS.accent})`,
                      boxShadow: `0 0 40px ${COLORS.secondary}88`,
                    }}
                  >
                    LEVEL UP
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Canvas */}
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

              {/* Mobile controls */}
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

            {/* Pause overlay */}
            <AnimatePresence>
              {hud.phase === "paused" ? (
                <OverlayCard
                  title="Paused"
                  subtitle="Take a breath — logos wait for no one."
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
                      spawnLogo();
                    }}
                  />
                  <ActionButton label="Exit" onClick={onClose} />
                </OverlayCard>
              ) : null}
            </AnimatePresence>

            {/* Game over */}
            <AnimatePresence>
              {hud.phase === "gameover" ? (
                <OverlayCard
                  title="Game Over"
                  subtitle="Nice catch streak — try again for a new best."
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
                      spawnLogo();
                      spawnLogo();
                    }}
                  />
                  <ActionButton label="Share Score" onClick={shareScore} />
                  <ActionButton label="Close" onClick={onClose} />
                  {shareMsg ? (
                    <p className="mt-2 text-center text-xs text-cyan-300">{shareMsg}</p>
                  ) : null}
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
/* Small UI bits (same file, no exports)                                      */
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
        className="w-full max-w-sm rounded-3xl border border-white/15 p-6 text-white shadow-2xl"
        style={{
          background: "rgba(30,41,59,0.92)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 40px rgba(79,70,229,0.25)",
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
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-lg font-bold tabular-nums text-white">{value}</div>
    </div>
  );
}
