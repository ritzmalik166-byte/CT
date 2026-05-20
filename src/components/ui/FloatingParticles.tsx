"use client";

import { useEffect, useRef, type RefObject } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  opacity: number;
  color: string;
}

interface FloatingParticlesProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  mouseRadius?: number;
  attractStrength?: number;
  speed?: number;
  /** Stop RAF when the root leaves the viewport (saves CPU during long desktop scroll). */
  pauseWhenOffscreen?: boolean;
  visibilityRoot?: RefObject<Element | null>;
}

export function FloatingParticles({
  className = "",
  particleCount = 260,
  colors = ["#AE8C20"],
  mouseRadius = 200,
  attractStrength = 1.2,
  speed = 0.4,
  pauseWhenOffscreen = false,
  visibilityRoot,
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const makeVelocity = () => {
      const angle = Math.random() * Math.PI * 2;
      const mag = (Math.random() * 0.6 + 0.4) * speed;
      return { vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag };
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        const { vx, vy } = makeVelocity();
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          size: Math.random() * 1.8 + 0.8,
          opacity: Math.random() * 0.5 + 0.35,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const animate = () => {
      if (pauseWhenOffscreen && !isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (const p of particlesRef.current) {
        // Mouse attraction — particles drift toward the cursor
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouseRadius * mouseRadius;

          if (distSq < radiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / mouseRadius;
            const force = falloff * falloff * attractStrength;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Gently steer velocity back toward its base direction so particles keep flowing
        p.vx += (p.baseVx - p.vx) * 0.015;
        p.vy += (p.baseVy - p.vy) * 0.015;

        // Soft cap on velocity to avoid runaway speed near cursor
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        const maxSpeed = speed * 4;
        if (speedSq > maxSpeed * maxSpeed) {
          const s = maxSpeed / Math.sqrt(speedSq);
          p.vx *= s;
          p.vy *= s;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges so particles continually stream
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    let visibilityObserver: IntersectionObserver | undefined;

    resizeCanvas();
    initParticles();
    animationFrameRef.current = requestAnimationFrame(animate);

    if (pauseWhenOffscreen && visibilityRoot?.current) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
        },
        { root: null, rootMargin: "120px 0px", threshold: 0 }
      );
      visibilityObserver.observe(visibilityRoot.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      visibilityObserver?.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount, colors, mouseRadius, attractStrength, speed, pauseWhenOffscreen, visibilityRoot]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ display: "block" }}
    />
  );
}
