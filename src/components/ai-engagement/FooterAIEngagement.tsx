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

export function FooterAIEngagement() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-full">
      <div className="relative mx-auto h-full max-w-[1440px] px-3 sm:px-6 lg:px-8">
        {/* Boy + floating CTA — left */}
        <motion.div
          className={`absolute left-0 sm:left-2 md:left-6 lg:left-10 ${BOY_BOTTOM}`}
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
              className="h-[clamp(160px,34vw,300px)] w-auto max-w-[min(44vw,230px)] object-contain object-bottom sm:max-w-[280px] sm:h-[clamp(210px,30vw,340px)] md:max-w-[320px] md:h-[clamp(250px,26vw,380px)] lg:max-w-[360px]"
              priority={false}
            />

            <div className="absolute top-[5%] left-[58%] translate-x-[6%] sm:top-[6%] sm:left-[59%] sm:translate-x-[8%] md:top-[6%] md:left-[60%] md:translate-x-[10%] lg:top-[8%] lg:left-[61%] lg:translate-x-[22%]">
              <AIEngagementWidget />
            </div>
          </div>
        </motion.div>

        {/* Compact game — right end, widened slightly toward center */}
        <motion.div
          className={`pointer-events-auto absolute right-0 z-20 w-[min(98vw,760px)] sm:right-2 sm:w-[740px] md:right-6 md:w-[744px] lg:right-10 lg:w-[760px] ${GAME_BOTTOM}`}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <AIBubbleShooterPanel />
        </motion.div>
      </div>
    </div>
  );
}
