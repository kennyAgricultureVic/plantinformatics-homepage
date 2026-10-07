// Vogel's sunflower model and the crop data it encodes, shared by every spiral on the page.

import { crops, dataReleases, type Crop } from "@/content";

/** 360° / φ², about 137.508°, in radians. */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const GOLDEN_ANGLE_DEGREES = (GOLDEN_ANGLE * 180) / Math.PI;
export const PHI = (1 + Math.sqrt(5)) / 2;

const round = (v: number) => Math.round(v * 1e4) / 1e4;

/**
 * Floret n (1-based) of a spiral with spacing c: r = c·√n, θ = n·137.508°. Rounded for SVG so
 * server and client trig agree during hydration; the canvas inlines the unrounded maths.
 */
export const vogel = (n: number, c: number) => {
  const r = c * Math.sqrt(n);
  const theta = n * GOLDEN_ANGLE;
  return { x: round(r * Math.cos(theta)), y: round(r * Math.sin(theta)) };
};

/**
 * A run of florets drawn in one colour. `slot` 0 to 3 are palette colours --p1..--p4,
 * slot 4 is the page ink (black in light mode, white in dark), so five crops fit a four colour palette.
 */
export type FloretGroup = { count: number; slot: number; label: string };

/** Rings fill florets in order, so each group is a ring whose area is its count. Sectors give a pie, see the maths note. */
export type SpiralLayout = "rings" | "sectors";

/** Palette slot for a crop, in the order crops first appear in the release list. */
export const slotOf = (crop: Crop) => crops.indexOf(crop);

/** CSS colour for a slot, for HTML and SVG marks that sit next to the canvas. */
export const slotColor = (slot: number) => (slot < 4 ? `var(--p${slot + 1})` : "var(--foreground)");

/** Releases still current (later releases include superseded ones), oldest first: the centre of the flower is the oldest. */
export const currentReleases = dataReleases
  .filter((r) => !("superseded" in r))
  .toSorted((a, b) => a.released.localeCompare(b.released));

/** Unique accessions per crop, largest first, with every release for that crop. */
export const cropTotals = crops
  .map((crop) => {
    const releases = dataReleases.filter((r) => r.crop === crop);
    const count = releases.reduce((sum, r) => ("superseded" in r ? sum : sum + r.accessions), 0);
    return { crop, slot: slotOf(crop), count, releases };
  })
  .toSorted((a, b) => b.count - a.count);

export const releaseGroups: FloretGroup[] = currentReleases.map((r) => ({
  count: r.accessions,
  slot: slotOf(r.crop),
  label: r.crop,
}));

export const cropGroups: FloretGroup[] = cropTotals.map((t) => ({ count: t.count, slot: t.slot, label: t.crop }));

/** Group index for every floret (index n - 1). */
export function assignGroups(groups: readonly FloretGroup[], layout: SpiralLayout) {
  const total = groups.reduce((sum, g) => sum + g.count, 0);
  const owner = new Uint8Array(total);

  if (layout === "rings") {
    let n = 0;
    groups.forEach((g, i) => owner.fill(i, n, (n += g.count)));
    return owner;
  }

  // Sectors: floret n sits at angle n·137.508°, which is fixed by frac(n·φ). Bucketing that
  // fraction by cumulative share turns the spiral into an exact pie chart.
  const bounds = groups.map((_, i) => groups.slice(0, i + 1).reduce((sum, g) => sum + g.count, 0) / total);
  for (let n = 1; n <= total; n++) {
    const f = (n * PHI) % 1;
    owner[n - 1] = bounds.findIndex((b) => f < b);
  }
  return owner;
}
