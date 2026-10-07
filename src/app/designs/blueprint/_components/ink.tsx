"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Hex } from "@/content";
import { usePalette } from "@/components/palette";

const luminance = (hex: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: Hex, b: Hex) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The palette colour that stands out most on `ground`, or the plain ink when none reaches `min`. */
const strongest = (candidates: readonly Hex[], ground: Hex, fallback: string, min: number) => {
  const best = [...candidates].sort((a, b) => contrast(b, ground) - contrast(a, ground))[0];
  return best && contrast(best, ground) >= min ? best : fallback;
};

/**
 * Sets the print-process colours for the sheets. Light: the sheet ground is --p1 and the
 * linework is --p1-fg (white lines on blue is a blueprint, black on brown a sepia print).
 * Dark: true black ground and white lines. The accent (dimension lines, callouts) is the
 * palette colour that reads best on that ground.
 */
export function BlueprintInk({ children }: { children: ReactNode }) {
  const { colors } = usePalette();
  const unique = [...new Set(colors)];
  const style = {
    "--bp-accent-light": strongest(unique.slice(1), colors[0], "var(--p1-fg)", 2.6),
    "--bp-accent-dark": strongest(unique, "#000000", "#ffffff", 4),
  } as CSSProperties;

  return (
    <div
      style={style}
      className="flex min-h-full flex-1 flex-col bg-(--bp-ground) text-(--bp-ink) [--bp-accent:var(--bp-accent-light)] [--bp-ground:var(--p1)] [--bp-ink:var(--p1-fg)] [--bp-soft:color-mix(in_oklab,var(--bp-ink)_74%,var(--bp-ground))] [--bp-faint:color-mix(in_oklab,var(--bp-ink)_14%,transparent)] selection:bg-(--bp-ink) selection:text-(--bp-ground) dark:[--bp-accent:var(--bp-accent-dark)] dark:[--bp-ground:#000] dark:[--bp-ink:#fff] [--hairline-edge:var(--bp-ink)] [--hairline-hi:var(--bp-accent)] [--hairline-lo:color-mix(in_oklab,var(--bp-ink)_32%,var(--bp-ground))] [--hairline-mid:color-mix(in_oklab,var(--bp-ink)_66%,var(--bp-ground))] [--hairline-plate:var(--bp-ground)] [--hairline-stroke:1.1]"
    >
      {children}
    </div>
  );
}
