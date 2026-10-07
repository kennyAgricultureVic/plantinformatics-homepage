"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { usePalette } from "@/components/palette";
import type { Hex } from "@/content";

const luminance = (hex: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Palette colours from most to least contrast against the page ground (white, or black when dark). */
export const byContrast = (colors: readonly Hex[], dark: boolean) =>
  [...colors].sort((a, b) => (dark ? luminance(b) - luminance(a) : luminance(a) - luminance(b)));

const rgb = (hex: Hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * A second ink for marks that must read apart from --ink0: of the next two inks, the one furthest
 * from ink0 in colour, as long as it keeps a 1.8:1 contrast with the ground.
 */
const altInk = (ordered: readonly Hex[], dark: boolean) => {
  const ground = dark ? 0 : 1;
  const contrast = (hex: Hex) => {
    const [hi, lo] = [luminance(hex), ground].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  };
  const [r0, g0, b0] = rgb(ordered[0]);
  const distance = (hex: Hex) => {
    const [r, g, b] = rgb(hex);
    return Math.hypot(r - r0, g - g0, b - b0);
  };
  const candidates = ordered.slice(1, 3).filter((hex) => contrast(hex) >= 1.8);
  return candidates.toSorted((a, b) => distance(b) - distance(a))[0] ?? ordered[1];
};

/** Contrast-ordered palette hex values for canvas code, for the resolved theme. */
export function useInks() {
  const { colors, combination } = usePalette();
  const dark = useTheme().resolvedTheme === "dark";
  const inks = useMemo(() => byContrast(colors, dark), [colors, dark]);
  return { inks, dark, paletteId: combination.id };
}

/**
 * Sets --ink0 (strongest) .. --ink3 (faintest) from the palette for both themes, so HTML and SVG
 * marks follow the same map-to-colour rule as the canvases, plus --ink-alt for a second series.
 * See fern.css for the theme switch.
 */
export function Inks({ className, children }: { className?: string; children: ReactNode }) {
  const { colors } = usePalette();
  const light = byContrast(colors, false);
  const dark = byContrast(colors, true);
  const vars = Object.fromEntries([
    ...light.map((hex, i) => [`--fern-l${i}`, hex]),
    ...dark.map((hex, i) => [`--fern-d${i}`, hex]),
    ["--fern-lalt", altInk(light, false)],
    ["--fern-dalt", altInk(dark, true)],
  ]) as CSSProperties;
  return (
    <div style={vars} className={className}>
      {children}
    </div>
  );
}
