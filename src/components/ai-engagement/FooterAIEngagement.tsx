"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AIEngagementWidget } from "./AIEngagementWidget";
import { AIBubbleShooterPanel } from "./bubble-shooter/AIBubbleShooterPanel";

/** Feet sit on the dotted baseline; legs tuck under the footer via layer z-index. */
const BOY_BOTTOM = "bottom-50";

/** Game sits centered, just above the Contenaissance footer curve. */
const GAME_BOTTOM =
  "bottom-[8.75rem] sm:bottom-[10.25rem] md:bottom-[11.75rem] lg:bottom-[13.25rem] xl:bottom-[14rem]";

/** Mobile + tablet: boy centered above card, lower body tucked behind the white HELLO card. */
function StackedBoyAboveCard() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="flex flex-col items-center">
        <span
          className="h-2 w-2 rounded-full bg-cyan-300/80 shadow-[0_0_10px_rgba(34,211,238,0.55)] ring-2 ring-cyan-400/25"
          aria-hidden
        />
        <span
          className="h-7 w-px bg-gradient-to-b from-white/30 via-white/15 to-transparent sm:h-9 md:h-10"
          aria-hidden
        />
      </div>

      <div className="relative -mt-0.5">
        <Image
          src="/assets/boy.png"
          alt=""
          width={440}
          height={540}
          className="pointer-events-none h-[clamp(118px,32vw,158px)] w-auto object-contain object-bottom sm:h-[clamp(132px,28vw,172px)] md:h-[clamp(150px,22vw,190px)]"
          priority={false}
        />

        <div className="pointer-events-auto absolute top-[4%] left-[56%] z-40 max-w-[min(10.5rem,calc(100vw-3rem))] -translate-y-full sm:left-[58%] md:left-[57%]">
          <AIEngagementWidget />
        </div>
      </div>
    </div>
  );
}

export function FooterAIEngagement() {
  return (
    <>
      {/* Mobile + tablet only — stacked layout, above footer */}
      <div className="pointer-events-none absolute inset-0 lg:hidden">
        <div className="relative z-[11] flex h-full flex-col items-center justify-end pb-[7.25rem] sm:pb-[8.25rem] md:pb-[10.5rem]">
          <div className="relative flex w-full max-w-[647px] flex-col items-center px-4">
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <StackedBoyAboveCard />
            </motion.div>

            <motion.div
              className="pointer-events-auto relative z-30 -mt-16 w-full sm:-mt-[4.5rem] md:-mt-[7rem] md:-translate-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              <AIBubbleShooterPanel />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Desktop — original side-by-side absolute layout (unchanged) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 hidden h-full lg:block">
        <div className="relative mx-auto h-full max-w-[1440px] px-3 sm:px-6 lg:px-8">
          <motion.div
            className={`pointer-events-auto absolute left-0 z-30 sm:left-2 md:left-6 lg:left-10 ${BOY_BOTTOM}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <Image
                src="/assets/boy.png"
                alt=""
                width={440}
                height={540}
                className="pointer-events-none h-[clamp(160px,34vw,300px)] w-auto max-w-[min(44vw,230px)] object-contain object-bottom sm:max-w-[280px] sm:h-[clamp(210px,30vw,340px)] md:max-w-[320px] md:h-[clamp(250px,26vw,380px)] lg:max-w-[360px]"
                priority={false}
              />

              <div className="pointer-events-auto absolute top-[5%] left-[58%] z-40 translate-x-[6%] sm:top-[6%] sm:left-[59%] sm:translate-x-[8%] md:top-[6%] md:left-[60%] md:translate-x-[10%] lg:top-[8%] lg:left-[61%] lg:translate-x-[22%]">
                <AIEngagementWidget />
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`pointer-events-none absolute right-0 z-20 flex justify-end w-full max-w-[647px] sm:right-2 md:right-6 lg:right-10 ${GAME_BOTTOM}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            <AIBubbleShooterPanel />
          </motion.div>
        </div>
      </div>
    </>
  );
}
