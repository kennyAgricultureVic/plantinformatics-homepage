"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePalette } from "@/components/palette";
import type { Hex } from "@/content";

const luminance = (hex: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Palette colours ordered from most to least contrast against the page ground. */
const byContrast = (colors: readonly Hex[], dark: boolean) =>
  [...colors].sort((a, b) =>
    dark ? luminance(b) - luminance(a) : luminance(a) - luminance(b),
  );

/**
 * Exposes the palette as contrast-ordered CSS variables (--ink0 strongest .. --ink3 faintest)
 * for both themes. Blades take the middle inks, so the theme-ink veins stay legible on them.
 */
export function Inks({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { colors } = usePalette();
  const vars = Object.fromEntries([
    ...byContrast(colors, false).map((hex, i) => [`--l${i}`, hex]),
    ...byContrast(colors, true).map((hex, i) => [`--d${i}`, hex]),
  ]) as CSSProperties;
  return (
    <div style={vars} className={className}>
      {children}
    </div>
  );
}
