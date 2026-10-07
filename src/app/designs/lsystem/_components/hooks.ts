"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { usePalette } from "@/components/palette";
import type { Hex } from "@/content";

const STEP_MS = 280;

/**
 * Steps from generation 0 to `steps`, one generation every STEP_MS, then stops.
 * Restarts whenever `runKey` changes. Jumps straight to the end for reduced motion.
 */
export function useGrowth(steps: number, runKey: string | number, start = true) {
  const [state, setState] = useState({ runKey, gen: 0 });
  const gen = state.runKey === runKey ? state.gen : 0;

  useEffect(() => {
    if (!start) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let g = reduced ? steps - 1 : 0;
    let timer = 0;
    const tick = () => {
      g++;
      setState({ runKey, gen: g });
      if (g < steps) timer = window.setTimeout(tick, STEP_MS);
    };
    timer = window.setTimeout(tick, reduced ? 0 : STEP_MS / 2);
    return () => window.clearTimeout(timer);
  }, [runKey, steps, start]);

  return gen;
}

/** Tracks an element's CSS pixel size. */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** True once the element has scrolled into view (never resets). */
export function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

const luminance = (hex: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Palette colours ordered from most to least contrast against the page background. */
export const byContrast = (colors: readonly Hex[], dark: boolean) =>
  [...colors].sort((a, b) => (dark ? luminance(b) - luminance(a) : luminance(a) - luminance(b)));

/** Palette inks for canvas code, ordered by contrast for the resolved theme, plus the combination id. */
export function useInks() {
  const { colors, combination } = usePalette();
  const dark = useTheme().resolvedTheme === "dark";
  const inks = useMemo(() => byContrast(colors, dark), [colors, dark]);
  return { inks, dark, paletteId: combination.id };
}
