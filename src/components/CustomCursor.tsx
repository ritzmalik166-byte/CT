"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const subscribeToPointerCapability = (callback: () => void) => {
  const mediaQuery = window.matchMedia("(pointer: coarse)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};

const getPointerCapability = () => window.matchMedia("(pointer: coarse)").matches;
const getServerPointerCapability = () => true;

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const isTouchDevice = useSyncExternalStore(
    subscribeToPointerCapability,
    getPointerCapability,
    getServerPointerCapability
  );

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (isTouchDevice) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(true);
        const text = target.closest("[data-cursor-text]")?.getAttribute("data-cursor-text");
        if (text) setCursorText(text);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(false);
        setCursorText("");
      }
    };

    const handleMouseOut = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseEnter);
    document.addEventListener("mouseout", handleMouseLeave);
    document.addEventListener("mouseleave", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
      document.removeEventListener("mouseleave", handleMouseOut);
    };
  }, [cursorX, cursorY, isVisible, isTouchDevice]);

  if (isTouchDevice) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[100000] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 2.5 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
        >
          <div
            className={`h-3 w-3 rounded-full bg-white transition-all duration-200 ${
              isHovering ? "bg-[#AE8C20]" : ""
            }`}
            style={{ transform: "translate(-50%, -50%)" }}
          />
          {cursorText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute whitespace-nowrap text-[10px] font-semibold text-white"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {cursorText}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Cursor ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[99999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="h-10 w-10 rounded-full border border-white/30 mix-blend-difference"
          style={{ transform: "translate(-50%, -50%)" }}
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
            opacity: isVisible ? 0.5 : 0,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        />
      </motion.div>

      {/* Hide default cursor */}
      <style jsx global>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
