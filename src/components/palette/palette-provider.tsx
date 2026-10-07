"use client";

import { createContext, useContext, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { getCombination, type Combination, type Hex } from "@/content";

type PaletteContextValue = {
  combination: Combination;
  /** Always four hex values: combinations with fewer colours repeat from the start. */
  colors: readonly [Hex, Hex, Hex, Hex];
  /** Combination ids this design recommends, shown first in the picker. */
  shortlist: readonly number[];
  setId: (id: number) => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

// Selected combination per design. Memory is the source of truth so the picker still
// works when localStorage is unavailable; localStorage only restores it across visits.
const memory = new Map<string, number>();
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const readStored = (key: string): number | null => {
  const remembered = memory.get(key);
  if (remembered !== undefined) return remembered;
  try {
    const stored = Number(localStorage.getItem(key));
    return Number.isInteger(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
};

const writeStored = (key: string, id: number) => {
  memory.set(key, id);
  try {
    localStorage.setItem(key, String(id));
  } catch {}
  listeners.forEach((l) => l());
};

/** Black or white, whichever reads better on `hex` (WCAG relative luminance). */
const foregroundFor = (hex: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Contrast vs black is (L + 0.05) / 0.05, vs white is 1.05 / (L + 0.05); they cross at L ≈ 0.179.
  return luminance > 0.179 ? "#000" : "#fff";
};

type PaletteProviderProps = {
  /** Unique per design, used as the storage key. */
  design: string;
  defaultId: number;
  shortlist: readonly number[];
  className?: string;
  children: ReactNode;
};

/**
 * Wraps a design and exposes the chosen Wada combination as CSS variables
 * `--p1`..`--p4` (colours) and `--p1-fg`..`--p4-fg` (black or white text for each).
 * Use them in Tailwind as `bg-(--p1) text-(--p1-fg)`, or read hex values with `usePalette()`.
 */
export function PaletteProvider({ design, defaultId, shortlist, className, children }: PaletteProviderProps) {
  const key = `palette:${design}`;
  const id = useSyncExternalStore(subscribe, () => readStored(key), () => null) ?? defaultId;
  const combination = getCombination(id);
  const slot = (i: number) => combination.colors[i % combination.colors.length].hex;
  const colors = [slot(0), slot(1), slot(2), slot(3)] as const;

  const style = Object.fromEntries(
    colors.flatMap((hex, i) => [
      [`--p${i + 1}`, hex],
      [`--p${i + 1}-fg`, foregroundFor(hex)],
    ]),
  ) as CSSProperties;

  return (
    <PaletteContext value={{ combination, colors, shortlist, setId: (next) => writeStored(key, next) }}>
      <div style={style} className={className}>
        {children}
      </div>
    </PaletteContext>
  );
}

/** Current palette as hex values, for canvas and SVG code. Must be used inside <PaletteProvider>. */
export function usePalette() {
  const value = useContext(PaletteContext);
  if (!value) throw new Error("usePalette must be used inside <PaletteProvider>");
  return value;
}
