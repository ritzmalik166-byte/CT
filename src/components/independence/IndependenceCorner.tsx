"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function IndependenceCorner() {
  return (
    <motion.div
      className="
        pointer-events-none
        fixed
        bottom-0
        right-0
        z-[45]
        w-[120px]
        sm:w-[145px]
        md:w-[165px]
        lg:w-[185px]
      "
      aria-hidden="true"
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{
        opacity: 1,
        x: 0,
        y: [0, -5, 0],
      }}
      transition={{
        opacity: {
          duration: 0.8,
          ease: "easeOut",
        },
        x: {
          duration: 0.8,
          ease: "easeOut",
        },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <Image
        src="/independence/independence-corner.webp"
        alt=""
        width={600}
        height={600}
        sizes="(min-width: 1024px) 185px, (min-width: 768px) 165px, (min-width: 640px) 145px, 120px"
        priority
        className="h-auto w-full object-contain"
      />
    </motion.div>
  );
}