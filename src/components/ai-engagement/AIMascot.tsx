"use client";

import { motion } from "framer-motion";

export function AIMascot({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-20 w-20" : "h-14 w-14";

  return (
    <motion.div
      className={`relative ${dim}`}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#AE8C20]/30 to-[#D4AF37]/10 blur-md" />
      <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-[#AE8C20]/40 bg-zinc-900/80 shadow-[0_0_24px_rgba(174,140,32,0.25)] backdrop-blur-sm">
        <svg viewBox="0 0 48 48" className="h-[70%] w-[70%]" fill="none">
          <circle cx="24" cy="24" r="10" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="4" fill="#AE8C20" />
          <motion.circle
            cx="12"
            cy="14"
            r="3"
            fill="#AE8C20"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <motion.circle
            cx="36"
            cy="14"
            r="3"
            fill="#C9A730"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <motion.circle
            cx="12"
            cy="34"
            r="3"
            fill="#C9A730"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.circle
            cx="36"
            cy="34"
            r="3"
            fill="#AE8C20"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          />
          <path
            d="M15 14 L21 20 M33 14 L27 20 M15 34 L21 28 M33 34 L27 28"
            stroke="#AE8C20"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        </svg>
      </div>
    </motion.div>
  );
}
