// The content mapped onto tissue: which releases become which zones, and how many cells each gets.

import { crops, dataReleases, type Crop } from "@/content";
import { mulberry32, type Cell, type Point } from "./voronoi";

/** One cell stands for this many genotyped accessions, everywhere on the page. */
export const ACCESSIONS_PER_CELL = 100;

/** Lloyd iterations from the raw scatter to the relaxed tissue. */
export const LLOYD_STEPS = 6;

export type Release = (typeof dataReleases)[number];

export type Zone = {
  key: string;
  release: Release;
  cells: number;
  slot: number;
};

/** Stain slot for a crop: 0 to 3 are --p1..--p4, slot 4 (the fifth crop) is the page ink at low strength. */
export const slotOf = (crop: Crop) => crops.indexOf(crop);
export const stain = (slot: number) => (slot < 4 ? `var(--p${slot + 1})` : "var(--foreground)");

/** How strongly a slot takes the stain: the ink slot is kept pale so it reads as unstained tissue. */
export const stainStrength = (slot: number, jitter: number) => (slot < 4 ? 0.62 + jitter * 0.33 : 0.1 + jitter * 0.16);

export const cellsFor = (accessions: number) => Math.round(accessions / ACCESSIONS_PER_CELL);

const toZone = (r: Release): Zone => ({ key: r.doi, release: r, cells: cellsFor(r.accessions), slot: slotOf(r.crop) });

/** Current releases, oldest first: the oldest is the pith at the centre of the stem. */
export const stemZones = dataReleases
  .filter((r) => !("superseded" in r))
  .toSorted((a, b) => a.released.localeCompare(b.released))
  .map(toZone);

/** Every release including superseded ones, newest first (top of the slice), as the table reads. */
export const sliceZones = dataReleases.toSorted((a, b) => b.released.localeCompare(a.released)).map(toZone);

export const totalCells = (zones: readonly Zone[]) => zones.reduce((s, z) => s + z.cells, 0);

/**
 * Hand cells to zones in order of `key` (distance from the centre, or x along the slice), so each
 * zone gets exactly its count and the zones come out as rings or bands.
 */
export function assignZones(cells: readonly Cell[], zones: readonly Zone[], key: (c: Cell) => number) {
  const order = cells.map((_, i) => i).sort((a, b) => key(cells[a]) - key(cells[b]));
  const owner = new Uint8Array(cells.length);
  let z = 0;
  let left = zones[0]?.cells ?? 0;
  for (const i of order) {
    while (left <= 0 && z < zones.length - 1) left = zones[++z].cells;
    owner[i] = z;
    left--;
  }
  return owner;
}

/** Per-cell look that must not change between Lloyd steps: stain strength and nucleus offset. */
export function cellLooks(count: number, seed: number) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    jitter: rand(),
    nucleus: [rand() - 0.5, rand() - 0.5] as Point,
    hasNucleus: rand() < 0.8,
  }));
}

/** Flat swatch colour for legends and tables, matching how the slot reads in the drawings. */
export const swatch = (slot: number) =>
  slot < 4 ? `var(--p${slot + 1})` : "color-mix(in srgb, var(--foreground) 22%, transparent)";
