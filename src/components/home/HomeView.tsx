"use client";

import React from "react";
import { AiLogoMarquee } from "./AiLogoMarquee";
// import { CursorFollower } from "./CursorFollower";
import { HeroWithAnimation } from "./HeroWithAnimation";

export default function HomeView() {
  return (
    <main className="bg-white">
      <HeroWithAnimation />
      <AiLogoMarquee />
      {/* <CursorFollower /> */}
    </main>
  );
}
