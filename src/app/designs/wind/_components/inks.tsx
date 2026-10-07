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

/** Palette colours from most to least contrast against the page (white in light mode, black in dark). */
const byContrast = (colors: readonly Hex[], dark: boolean) =>
  [...colors].sort((a, b) => (dark ? luminance(b) - luminance(a) : luminance(a) - luminance(b)));

/** Canvas inks for the resolved theme: slots 0 to 3 by contrast, slot 4 the page ink. */
export function useInks() {
  const { colors } = usePalette();
  const dark = useTheme().resolvedTheme === "dark";
  return useMemo(() => [...byContrast(colors, dark), dark ? "#ffffff" : "#000000"], [colors, dark]);
}

/**
 * Sets --wind-l0..3 (light order) and --wind-d0..3 (dark order) so HTML marks can use
 * --wind-ink0..3 from wind.css and match the canvas slot for slot in either theme.
 */
export function Inks({ children }: { children: ReactNode }) {
  const { colors } = usePalette();
  const vars = Object.fromEntries([
    ...byContrast(colors, false).map((hex, i) => [`--wind-l${i}`, hex]),
    ...byContrast(colors, true).map((hex, i) => [`--wind-d${i}`, hex]),
  ]) as CSSProperties;
  return (
    <div style={vars} className="wind-inks contents">
      {children}
    </div>
  );
}
