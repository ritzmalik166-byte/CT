import {
  AI_BUBBLE_LOGOS,
  isDrawableImage,
  type AIBubbleLogo,
} from "./ai-bubble-logos";
import { cellCenter, type BubbleShooterState, type LayoutMetrics } from "./bubble-shooter-engine";

function drawLogoFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  logo: AIBubbleLogo
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.max(7, r * 0.36)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(logo.shortLabel, x, y + 0.5);
  ctx.restore();
}

export function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  type: number,
  logos: Map<string, HTMLImageElement>,
  alpha = 1,
  scale = 1
) {
  const logo = AI_BUBBLE_LOGOS[type];
  if (!logo) return;

  const r = radius * scale;
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.shadowColor = logo.glow;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(x, y, r + 2, 0, Math.PI * 2);
  ctx.strokeStyle = logo.ring;
  ctx.lineWidth = 1;
  ctx.globalAlpha = alpha * 0.45;
  ctx.stroke();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0;

  const grad = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.05, x, y, r);
  grad.addColorStop(0, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.35, logo.fill);
  grad.addColorStop(0.85, logo.fill);
  grad.addColorStop(1, "rgba(0,0,0,0.65)");

  ctx.shadowColor = logo.glow;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = logo.ring;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, r - 2.5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const img = logos.get(logo.src);
  if (isDrawableImage(img)) {
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.58, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x - r * 0.52, y - r * 0.52, r * 1.04, r * 1.04);
      ctx.restore();
    } catch {
      drawLogoFallback(ctx, x, y, r, logo);
    }
  } else {
    drawLogoFallback(ctx, x, y, r, logo);
  }

  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.34, r * 0.26, r * 0.15, -0.55, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + r * 0.22, y + r * 0.28, r * 0.12, r * 0.07, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();

  ctx.restore();
}

function drawAmbient(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  for (let i = 0; i < 18; i++) {
    const px = ((i * 97 + 13) % w);
    const py = ((i * 53 + 31) % (h * 0.75));
    const twinkle = 0.15 + Math.sin(time * 0.002 + i * 1.7) * 0.12;
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#a855f7" : "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, 0.6 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawArcadeInset(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = 6;
  const r = 14;
  ctx.save();
  ctx.strokeStyle = "rgba(34, 211, 238, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
  ctx.stroke();

  const inset = ctx.createLinearGradient(0, 0, 0, h);
  inset.addColorStop(0, "rgba(34, 211, 238, 0.04)");
  inset.addColorStop(0.5, "transparent");
  inset.addColorStop(1, "rgba(168, 85, 247, 0.05)");
  ctx.fillStyle = inset;
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
  ctx.fill();
  ctx.restore();
}

function drawDangerZone(
  ctx: CanvasRenderingContext2D,
  layout: LayoutMetrics,
  width: number,
  time: number
) {
  const pulse = 0.04 + Math.sin(time * 0.004) * 0.025;
  const zoneGrad = ctx.createLinearGradient(0, layout.dangerY, 0, layout.shooterY);
  zoneGrad.addColorStop(0, `rgba(248, 113, 113, ${pulse})`);
  zoneGrad.addColorStop(1, "rgba(248, 113, 113, 0)");
  ctx.fillStyle = zoneGrad;
  ctx.fillRect(8, layout.dangerY, width - 16, layout.shooterY - layout.dangerY + 8);

  ctx.strokeStyle = "rgba(248, 113, 113, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(10, layout.dangerY);
  ctx.lineTo(width - 10, layout.dangerY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(248, 113, 113, 0.85)";
  ctx.font = "700 7px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("DANGER", width - 14, layout.dangerY - 5);
}

function drawAimBeam(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  angle: number,
  width: number,
  height: number,
  time: number,
  shooting: boolean
) {
  if (shooting) return;

  const maxLen = Math.min(220, sy - 20);
  const ex = sx + Math.cos(angle) * maxLen;
  const ey = sy + Math.sin(angle) * maxLen;

  const beam = ctx.createLinearGradient(sx, sy, ex, ey);
  beam.addColorStop(0, "rgba(34, 211, 238, 0.65)");
  beam.addColorStop(0.5, "rgba(168, 85, 247, 0.35)");
  beam.addColorStop(1, "rgba(34, 211, 238, 0)");

  ctx.strokeStyle = beam;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 8]);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);

  const dotCount = 5;
  for (let i = 1; i <= dotCount; i++) {
    const t = i / (dotCount + 1);
    const phase = (time * 0.003 + i * 0.4) % 1;
    const px = sx + Math.cos(angle) * maxLen * t;
    const py = sy + Math.sin(angle) * maxLen * t;
    ctx.globalAlpha = 0.25 + phase * 0.45;
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(ex, ey, 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(34, 211, 238, 0.35)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex, ey, 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fill();
}

function drawShooterDock(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  layout: LayoutMetrics,
  width: number,
  time: number
) {
  const baseW = layout.radius * 3.2;
  const pulse = 0.5 + Math.sin(time * 0.003) * 0.15;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(sx, sy + layout.radius * 0.55, baseW, layout.radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(34, 211, 238, 0.06)";
  ctx.fill();
  ctx.strokeStyle = "rgba(34, 211, 238, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.shadowColor = "rgba(34, 211, 238, 0.5)";
  ctx.shadowBlur = 12 * pulse;
  ctx.beginPath();
  ctx.arc(sx, sy, layout.radius + 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "600 6px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AIM · CLICK", sx, sy + layout.radius * 1.55);
  ctx.restore();
}

function drawNextDock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  type: number,
  logos: Map<string, HTMLImageElement>,
  time: number
) {
  const pulse = 0.6 + Math.sin(time * 0.004 + 1) * 0.2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 + pulse * 0.15})`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(168, 85, 247, 0.85)";
  ctx.font = "700 6px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NEXT", x, y - r - 7);
  ctx.restore();

  drawBubble(ctx, x, y, r, type, logos);
}

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  state: BubbleShooterState,
  layout: LayoutMetrics,
  logos: Map<string, HTMLImageElement>,
  time: number
) {
  const { width, height } = layout;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#12121a");
  bg.addColorStop(0.45, "#0d0d12");
  bg.addColorStop(1, "#08080c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawAmbient(ctx, width, height, time);
  drawArcadeInset(ctx, width, height);

  const topGlow = ctx.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.7);
  topGlow.addColorStop(0, "rgba(168, 85, 247, 0.08)");
  topGlow.addColorStop(1, "transparent");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, height * 0.5);

  const shooterGrad = ctx.createLinearGradient(0, layout.shooterY - 50, 0, height);
  shooterGrad.addColorStop(0, "rgba(34, 211, 238, 0)");
  shooterGrad.addColorStop(1, "rgba(34, 211, 238, 0.08)");
  ctx.fillStyle = shooterGrad;
  ctx.fillRect(0, layout.shooterY - 50, width, height - layout.shooterY + 50);

  drawDangerZone(ctx, layout, width, time);

  for (const [key, bubble] of state.grid) {
    const [row, col] = key.split(",").map(Number);
    const { x, y } = cellCenter(row, col, layout);
    const pulse =
      bubble.popT !== undefined
        ? 1 + bubble.popT * 0.35
        : 1 + Math.sin(time * 0.003 + row + col) * 0.025;
    const alpha = bubble.popT !== undefined ? 1 - bubble.popT : 1;
    drawBubble(ctx, x, y, layout.radius, bubble.type, logos, alpha, pulse);
  }

  if (state.projectile) {
    const logo = AI_BUBBLE_LOGOS[state.projectile.type];
    if (logo) {
      ctx.shadowColor = logo.glow;
      ctx.shadowBlur = 20;
    }
    drawBubble(
      ctx,
      state.projectile.x,
      state.projectile.y,
      layout.radius,
      state.projectile.type,
      logos
    );
    ctx.shadowBlur = 0;
  }

  const sx = width / 2;
  const sy = layout.shooterY;

  drawShooterDock(ctx, sx, sy, layout, width, time);
  drawAimBeam(ctx, sx, sy, state.angle, width, height, time, state.shooting);
  drawBubble(ctx, sx, sy, layout.radius, state.currentType, logos);

  const nextX = sx + layout.radius * 2.65;
  const nextY = sy + 4;
  drawNextDock(ctx, nextX, nextY, layout.radius * 0.5, state.nextType, logos, time);

  for (const p of state.particles) {
    ctx.globalAlpha = p.life;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

/** Plain dark backdrop for the start menu — no bubbles until START. */
export function renderStartBackdrop(
  ctx: CanvasRenderingContext2D,
  layout: LayoutMetrics,
  time: number
) {
  const { width, height } = layout;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#101015");
  bg.addColorStop(1, "#070709");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawAmbient(ctx, width, height, time);
  drawArcadeInset(ctx, width, height);
}

/** Decorative preview bubbles (unused in start flow). */
export function renderIdleBackdrop(
  ctx: CanvasRenderingContext2D,
  layout: LayoutMetrics,
  logos: Map<string, HTMLImageElement>,
  time: number
) {
  const { width, height } = layout;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#12121a");
  bg.addColorStop(1, "#08080c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawAmbient(ctx, width, height, time);
  drawArcadeInset(ctx, width, height);

  const previewCols = Math.min(layout.cols, 12);
  const preview: Array<[number, number]> = [];
  for (let row = 0; row < 3; row++) {
    const colsInRow = row % 2 === 0 ? previewCols : previewCols - 1;
    for (let col = 0; col < colsInRow; col++) {
      preview.push([row, col]);
    }
  }

  preview.forEach(([row, col], i) => {
    const { x, y } = cellCenter(row, col, layout);
    const type = (row + col + i) % AI_BUBBLE_LOGOS.length;
    const bob = Math.sin(time * 0.002 + i) * 2;
    drawBubble(ctx, x, y + bob, layout.radius * 0.92, type, logos, 0.55);
  });

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, width, height);
}
