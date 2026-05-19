/** Smooth deceleration — feels natural for long scroll-to-top. */
export function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/** Duration scales with distance so short hops feel quick, long pages feel luxurious. */
export function scrollToTopDurationSec(distancePx: number) {
  return Math.min(2.75, Math.max(1.4, distancePx / 550));
}

export function smoothNativeScrollToTop(
  durationMs: number,
  easing: (t: number) => number = easeOutQuint
) {
  const startY = window.scrollY;
  if (startY <= 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const y = startY * (1 - easing(t));
      window.scrollTo(0, y);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, 0);
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}
