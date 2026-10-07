"use client";

import { useEffect, useRef, useState } from "react";

/** True once the element has scrolled into view (never resets). */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Runs t from 0 to 1 once over `duration` ms with an ease in and out, then stops.
 * Waits for `start`; changing `run` replays it. Jumps straight to 1 for reduced motion.
 */
export function useMorph(duration: number, run: number, start: boolean, delay = 300) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!start) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let begin = 0;
    const tick = (now: number) => {
      if (!begin) begin = now + (reduced ? 0 : delay);
      const p = reduced ? 1 : Math.min(Math.max((now - begin) / duration, 0), 1);
      setT(ease(p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, run, start, delay]);
  return t;
}
