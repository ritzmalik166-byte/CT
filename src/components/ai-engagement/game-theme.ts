/** Neon AI game palette — distinct from site gold to draw attention to the mini-game. */
export const GAME_COLORS = {
  cyan: "#22D3EE",
  cyanDeep: "#06B6D4",
  violet: "#A855F7",
  violetDeep: "#7C3AED",
  fuchsia: "#E879F9",
  pink: "#F472B6",
  indigo: "#818CF8",
} as const;

export const GAME_WHEEL_COLORS = [
  "#22D3EE",
  "#06B6D4",
  "#A855F7",
  "#7C3AED",
  "#E879F9",
] as const;

export const GAME_CONFETTI = [
  "#22D3EE",
  "#A855F7",
  "#E879F9",
  "#818CF8",
  "#ffffff",
] as const;

export const gameTheme = {
  accentText: "text-cyan-300",
  accentTextAlt: "text-fuchsia-300",
  accentStrong: "text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text",

  border: "border-cyan-400/35",
  borderHover: "hover:border-violet-400/70",
  ring: "focus-visible:ring-cyan-400",

  glow: "shadow-[0_0_40px_rgba(34,211,238,0.28)]",
  glowViolet: "shadow-[0_0_40px_rgba(168,85,247,0.35)]",
  glowBtn: "shadow-[0_8px_28px_rgba(139,92,246,0.45)]",

  primaryBtn:
    "rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50",
  primaryBtnLg:
    "rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50",

  secondaryBtn:
    "rounded-full border border-cyan-400/35 bg-zinc-900/50 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-violet-400/60 hover:text-cyan-200",

  ghostBtn:
    "rounded-full border border-violet-400/40 px-6 py-2.5 text-sm font-semibold text-fuchsia-300 transition hover:bg-violet-500/10",

  chip:
    "rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-200",

  lifeActive: "bg-gradient-to-r from-cyan-400 to-violet-500",
  timerBar: "bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-400",

  modalBorder: "border-cyan-400/20",
  modalShadow:
    "shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_60px_rgba(139,92,246,0.18)]",

  widgetBorder: "border-cyan-400/40",
  widgetHover:
    "hover:border-fuchsia-400 hover:shadow-[0_12px_32px_rgba(168,85,247,0.35)]",
  widgetIcon:
    "bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 text-white shadow-[0_0_18px_rgba(34,211,238,0.45)]",
  widgetPulse: "bg-cyan-400/10",
} as const;
