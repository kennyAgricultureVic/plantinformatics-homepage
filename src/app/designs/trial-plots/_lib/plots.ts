import type { CSSProperties } from "react";
import { dataReleases, type Crop } from "@/content";

/** One of the four palette slots exposed by PaletteProvider. */
export type Slot = 1 | 2 | 3 | 4;

const slots = [1, 2, 3, 4] as const;

/** Palette slot for the i-th item in a repeating sequence. */
export const slotAt = (i: number): Slot => slots[i % slots.length];

/** Solid palette fill with its readable ink. */
export const solid = (slot: Slot): CSSProperties => ({
  backgroundColor: `var(--p${slot})`,
  color: `var(--p${slot}-fg)`,
});

/** Palette colour washed into the page background, for plots that carry body text in foreground ink. */
export const tint = (slot: Slot, percent = 22): CSSProperties => ({
  backgroundColor: `color-mix(in oklab, var(--p${slot}) ${percent}%, var(--background))`,
});

/** Drill rows seen from above: faint parallel lines at `angle`, layered over a plot's fill. */
export const drillRows = (angle: number): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(${angle}deg, transparent 0 7px, rgb(0 0 0 / 0.09) 7px 9px)`,
});

/**
 * How each crop looks from the air: a palette fill plus its own drill row angle.
 * Five crops share four slots, so lentil is sown as a blend of slots 1 and 3.
 */
export const cropLook = {
  Wheat: { fill: "var(--p1)", angle: 90 },
  Barley: { fill: "var(--p2)", angle: 0 },
  Chickpea: { fill: "var(--p3)", angle: 45 },
  "Field pea": { fill: "var(--p4)", angle: -45 },
  Lentil: { fill: "color-mix(in oklab, var(--p1) 50%, var(--p3))", angle: 60 },
} as const satisfies Record<Crop, { fill: string; angle: number }>;

export type Release = (typeof dataReleases)[number];

/** Data releases with stable plot ids (101, 102, ...) in content order, shared by the field map and the register. */
export const plots = dataReleases.map((release, i) => ({
  ...release,
  plot: 101 + i,
}));

export type Plot = (typeof plots)[number];

export const isSuperseded = (p: Plot) => "superseded" in p;

/** Crop fill for a plot. Superseded plots are drawn as hatched stubble over the page instead of a full canopy. */
export function plotStyle(p: Plot): CSSProperties {
  const { fill, angle } = cropLook[p.crop];
  if (isSuperseded(p)) {
    return {
      backgroundImage: `repeating-linear-gradient(${angle + 45}deg, ${fill} 0 2px, transparent 2px 10px)`,
      boxShadow: `inset 0 0 0 2px ${fill}`,
    };
  }
  return { backgroundColor: fill, ...drillRows(angle) };
}
