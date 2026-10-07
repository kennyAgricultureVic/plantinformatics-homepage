"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePalette } from "@/components/palette";
import { byContrast } from "./hooks";

/**
 * Exposes the palette as contrast-ordered CSS variables (--ink0 strongest .. --ink3 faintest)
 * for both themes, so text and SVG marks stay legible whichever colour lands on which slot.
 */
export function Inks({ className, children }: { className?: string; children: ReactNode }) {
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
