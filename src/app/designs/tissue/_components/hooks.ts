"use client";

import { useEffect, useRef, useState } from "react";

const STEP_MS = 260;

/**
 * Steps from 0 to `last`, one step every STEP_MS once `start` is true, then stops for good.
 * With prefers-reduced-motion it jumps straight to the last step.
 */
export function useSteps(last: number, start = true) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!start) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let k = reduced ? last - 1 : 0;
    let timer = 0;
    const tick = () => {
      k++;
      setStep(k);
      if (k < last) timer = window.setTimeout(tick, STEP_MS);
    };
    timer = window.setTimeout(tick, reduced ? 0 : STEP_MS);
    return () => window.clearTimeout(timer);
  }, [last, start]);
  return step;
}

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
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}
