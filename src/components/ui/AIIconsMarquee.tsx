"use client";

// AI-themed SVG icons — all white strokes, no external files
const AI_ICONS = [
  // Brain / neural
  {
    id: "brain",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2a2.5 2.5 0 0 1 5 0v1M9.5 3A5.5 5.5 0 0 0 4 8.5c0 1.4.5 2.7 1.4 3.7L4 14v2l2-1a5.5 5.5 0 0 0 7.5 1.8" />
        <path d="M14.5 3A5.5 5.5 0 0 1 20 8.5c0 1.4-.5 2.7-1.4 3.7L20 14v2l-2-1a5.5 5.5 0 0 1-4.5 2.3" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <path d="M9 12h1m4 0h1M12 9v1m0 4v1" />
      </svg>
    ),
  },
  // Microchip / CPU
  {
    id: "chip",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3" />
        <path d="M10 10h4v4h-4z" fill="currentColor" fillOpacity="0.25" stroke="none" />
      </svg>
    ),
  },
  // Neural network nodes
  {
    id: "neural",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="4" cy="6" r="1.5" />
        <circle cx="4" cy="12" r="1.5" />
        <circle cx="4" cy="18" r="1.5" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="20" r="1.5" />
        <circle cx="20" cy="8" r="1.5" />
        <circle cx="20" cy="16" r="1.5" />
        <path d="M5.5 6l5 -2M5.5 6l5 6M5.5 12l5-8M5.5 12l5 0M5.5 12l5 8M5.5 18l5-6M5.5 18l5 2M13.5 4l5 4M13.5 12l5-4M13.5 12l5 4M13.5 20l5-4" />
      </svg>
    ),
  },
  // Robot / AI face
  {
    id: "robot",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="9" width="16" height="12" rx="2" />
        <path d="M12 9V5m-3 0h6" />
        <circle cx="9" cy="14" r="1.5" />
        <circle cx="15" cy="14" r="1.5" />
        <path d="M9 18h6" />
        <path d="M2 13h2m18 0h-2" />
      </svg>
    ),
  },
  // Code / AI programming
  {
    id: "code-ai",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 8l-4 4 4 4M17 8l4 4-4 4" />
        <path d="M14 4l-4 16" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  // Sparkle / AI magic
  {
    id: "sparkle",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 8v2m0 4v2m-2-4h-2m8 0h-2" strokeWidth={0.8} />
      </svg>
    ),
  },
  // Data / layers
  {
    id: "data",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v4c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
        <path d="M4 10v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
        <path d="M4 14v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
      </svg>
    ),
  },
  // Eye / computer vision
  {
    id: "vision",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <path d="M12 5v2M12 17v2M5 12H3M21 12h-2" strokeWidth={0.8} />
      </svg>
    ),
  },
  // Waveform / voice AI
  {
    id: "waveform",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h2M4 8v8M8 6v12M12 4v16M16 7v10M20 9v6M22 12h-2" />
      </svg>
    ),
  },
  // Network / connection
  {
    id: "network",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M12 7v4l-5.3 6.3M12 7v4l5.3 6.3M7 19h10" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
  },
  // Atom
  {
    id: "atom",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeDasharray="3 3" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" />
      </svg>
    ),
  },
  // Infinity loop
  {
    id: "infinity",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z" />
        <path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" />
      </svg>
    ),
  },
];

// Duplicate for seamless loop
const ICONS_LOOP = [...AI_ICONS, ...AI_ICONS, ...AI_ICONS];

export function AIIconsMarquee() {
  // Each icon gets a unique wave delay so the float phases are staggered across the row
  const WAVE_PERIOD = 2.6; // seconds for one full bob cycle
  const WAVE_SPREAD = AI_ICONS.length; // spread delays across one set

  return (
    <div className="relative w-full overflow-hidden py-10">
      <style>{`
        @keyframes marquee-icons {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes icon-wave {
          0%   { transform: translateY(0px) scale(1) rotate(0deg); }
          25%  { transform: translateY(-22px) scale(1.1) rotate(-3deg); }
          50%  { transform: translateY(-30px) scale(1.14) rotate(0deg); }
          75%  { transform: translateY(-22px) scale(1.1) rotate(3deg); }
          100% { transform: translateY(0px) scale(1) rotate(0deg); }
        }
        .icons-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marquee-icons 36s linear infinite;
        }
        .icons-marquee-track:hover {
          animation-play-state: paused;
        }
        .icon-bob {
          animation: icon-wave var(--wave-dur) ease-in-out infinite;
          animation-delay: var(--wave-delay);
        }
        .icon-bob:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Left / right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div className="icons-marquee-track">
        {ICONS_LOOP.map((icon, i) => {
          // Phase offset: cycle through one full wave per set of AI_ICONS
          const phaseIndex = i % WAVE_SPREAD;
          const delayS = -((phaseIndex / WAVE_SPREAD) * WAVE_PERIOD).toFixed(2);
          return (
            <div
              key={`${icon.id}-${i}`}
              className="icon-bob mx-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition-colors duration-300 hover:border-[#AE8C20]/60 hover:bg-[#AE8C20]/15 hover:text-[#AE8C20] sm:mx-5 sm:h-24 sm:w-24"
              style={
                {
                  "--wave-dur": `${WAVE_PERIOD + (phaseIndex % 5) * 0.3}s`,
                  "--wave-delay": `${delayS}s`,
                } as React.CSSProperties
              }
            >
              <span className="h-9 w-9 sm:h-11 sm:w-11">{icon.svg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
