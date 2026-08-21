"use client";

import { useState } from "react";
import CatchTheLogoGame from "@/components/game/CatchTheLogoGame";

export function CatchTheLogoSection() {
  const [open, setOpen] = useState(false);

  return (
    <section
      className="relative z-10 w-full overflow-hidden py-12 sm:py-16"
      style={{
        backgroundImage: "url('/game-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#AE8C20]">
          Mini game
        </p>

        <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
          Catch the Logo
        </h2>

        <p className="max-w-md text-sm text-stone-600">
          Catch falling Contenaissance logos before time runs out.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
          aria-label="Play Catch the Logo"
        >
          Play Catch the Logo
        </button>
      </div>

      <CatchTheLogoGame
        open={open}
        onClose={() => setOpen(false)}
        logoSrc="/assets/favicon.png"
      />
    </section>
  );
}