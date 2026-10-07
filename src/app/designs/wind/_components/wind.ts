// The rule behind every drawing on the page: a seeded value-noise flow field blowing across a
// field of stems. Content decides how many stems there are, which crop they belong to and how
// hard the wind blows in each section.

import { crops, dataReleases, news, tools, totalAccessions, type Crop } from "@/content";

/** One stem per this many genotyped accessions. */
export const ACCESSIONS_PER_STEM = 100;

/** FNV-1a string hash, used to seed the PRNG from content. */
export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small, fast seeded PRNG returning [0, 1). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 2D value noise in [0, 1]: random values on an integer lattice, blended with a smoothstep.
 * The lattice is a 256-entry table shuffled by the seed, so the same seed always gives the same weather.
 */
export function valueNoise(seed: number) {
  const rand = mulberry32(seed);
  const values = Float32Array.from({ length: 256 }, rand);
  const perm = Uint8Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const lattice = (x: number, y: number) => values[perm[(perm[x & 255] + y) & 255]];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const top = lattice(xi, yi) + (lattice(xi + 1, yi) - lattice(xi, yi)) * u;
    const bottom = lattice(xi, yi + 1) + (lattice(xi + 1, yi + 1) - lattice(xi, yi + 1)) * u;
    return top + (bottom - top) * v;
  };
}

/** Length scale of the weather, in CSS pixels: one noise cell is this wide. */
export const WAVELENGTH = 260;
/** How far the wind may veer from due east, in radians. */
export const VEER = 0.85;

/**
 * The flow field: θ(x, y) = VEER · (2·n₁(x/λ, y/λ) − 1), |w| = 0.55 + 0.9·n₂.
 * Two octaves of value noise for the direction, one more for the strength.
 */
export function windField(seed: string) {
  const s = hashSeed(seed);
  const n1 = valueNoise(s);
  const n2 = valueNoise(s ^ 0x9e3779b9);
  const n3 = valueNoise(s ^ 0x85ebca6b);
  return (x: number, y: number) => {
    const fx = x / WAVELENGTH;
    const fy = y / WAVELENGTH;
    const turn = n1(fx, fy) * 0.7 + n2(fx * 2.3 + 17, fy * 2.3 + 5) * 0.3;
    return { angle: VEER * (2 * turn - 1), strength: 0.55 + 0.9 * n3(fx * 0.6 + 40, fy * 0.6 + 40) };
  };
}

export type WindField = ReturnType<typeof windField>;

/**
 * Wind speed for a section, from its real data value on a log scale so 4 tools and 84,725
 * accessions can share one dial: 0.2 is a breath, 1 is the hero's gale.
 */
export const windSpeed = (value: number) => 0.2 + (0.8 * Math.log(value)) / Math.log(totalAccessions);

/**
 * Ink slots: 0 to 3 are the palette ordered by contrast against the page (strongest first),
 * 4 is the page ink. Crops take slots by size, so the largest crops get the clearest inks.
 */
export type Slot = 0 | 1 | 2 | 3 | 4;

/** A stem in unit coordinates: x across the field, depth 0 at the back row to 1 at the front. */
export type Stem = { x: number; depth: number; h: number; slot: Slot; head: "ear" | "pod" };

/** A streamline seed in unit coordinates, traced through the field for `length` CSS pixels. */
export type Streamline = { x: number; y: number; length: number; slot: Slot };

const cereals: readonly Crop[] = ["Wheat", "Barley"];

/** Accessions per crop, skipping superseded releases, largest first. */
export const cropTotals = crops
  .map((crop) => ({
    crop,
    accessions: dataReleases.reduce((sum, r) => (r.crop === crop && !("superseded" in r) ? sum + r.accessions : sum), 0),
  }))
  .toSorted((a, b) => b.accessions - a.accessions)
  .map((t, rank) => ({ ...t, stems: Math.round(t.accessions / ACCESSIONS_PER_STEM), slot: ([0, 1, 2, 4, 3] as const)[rank] }));

export const totalStems = cropTotals.reduce((sum, t) => sum + t.stems, 0);

export const slotOfCrop = (crop: Crop) => cropTotals.find((t) => t.crop === crop)?.slot ?? 4;

/** CSS colour for a slot, for HTML marks beside the canvas. Uses the same contrast order as the canvas. */
export const slotVar = (slot: Slot) => (slot === 4 ? "var(--foreground)" : `var(--wind-ink${slot})`);

const headOf = (crop: Crop) => (cereals.includes(crop) ? "ear" : "pod");

/** Scatters `count` stems evenly across [from, to) with seeded jitter, depth and height. */
function sow(count: number, from: number, to: number, slot: Slot, head: Stem["head"], rand: () => number): Stem[] {
  return Array.from({ length: count }, (_, i) => ({
    x: from + ((to - from) * (i + 0.15 + rand() * 0.7)) / count,
    depth: rand(),
    h: 0.7 + rand() * 0.3,
    slot,
    head,
  }));
}

/** The hero: every current accession, one stem per hundred, crops sown in strips by size. */
export const heroStems: Stem[] = (() => {
  const rand = mulberry32(hashSeed("hero-field"));
  let x = 0;
  return cropTotals.flatMap((t) => {
    const from = x;
    x += t.stems / totalStems;
    // The wind leans every stem east, so the field is sown a little west of centre to stay in frame.
    return sow(t.stems, from * 0.93 - 0.01, x * 0.93 - 0.01, t.slot, headOf(t.crop), rand);
  });
})();

/** Streamlines across the hero sky and through the crop. */
export const heroLines: Streamline[] = (() => {
  const rand = mulberry32(hashSeed("hero-wind"));
  return Array.from({ length: 70 }, (_, i) => ({
    x: -0.15 + rand() * 0.9,
    y: 0.04 + (0.9 * (i + rand())) / 70,
    length: 260 + rand() * 520,
    slot: 0 as Slot,
  }));
})();

/** A drill row per release: same width for every row, so stem density is accessions. */
export const releaseRows = dataReleases.map((r) => {
  const rand = mulberry32(hashSeed(r.doi));
  const count = Math.round(r.accessions / ACCESSIONS_PER_STEM);
  return { release: r, stems: sow(count, 0, 1, slotOfCrop(r.crop), headOf(r.crop), rand) };
});

/** One gust of streamlines per tool, one line per capability, leaving from that tool's column. */
export const toolLines: Streamline[] = tools.flatMap((tool, i) => {
  const rand = mulberry32(hashSeed(tool.slug));
  return tool.capabilities.map((_, j) => ({
    x: i / tools.length + rand() * 0.06,
    y: 0.15 + (0.7 * (j + rand() * 0.6)) / tool.capabilities.length,
    length: 260 + rand() * 200,
    slot: (i % 4) as Slot,
  }));
});

const newsTimes = news.map((n) => Date.parse(n.date));
const newsFirst = Math.min(...newsTimes);
const newsSpan = Math.max(...newsTimes) - newsFirst;

/** Position of a news item on the timeline, oldest left, newest right. */
export const newsX = (date: string) => 0.04 + (0.92 * (Date.parse(date) - newsFirst)) / newsSpan;

/** One tall stem per news item, placed by date: data releases carry an ear, tool releases a pod. */
export const newsStems: Stem[] = news.map((n, i) => ({
  x: newsX(n.date),
  depth: 1,
  h: 0.78 + mulberry32(hashSeed(n.title))() * 0.22 - (i % 2) * 0.1,
  slot: n.kind === "data" ? 0 : 4,
  head: n.kind === "data" ? "ear" : "pod",
}));

/** Light breeze lines over the news stems, so the timeline sits in the same weather. */
export const newsLines: Streamline[] = (() => {
  const rand = mulberry32(hashSeed("news-wind"));
  return Array.from({ length: 14 }, (_, i) => ({
    x: -0.1 + rand() * 0.8,
    y: 0.05 + (0.55 * (i + rand())) / 14,
    length: 300 + rand() * 400,
    slot: 2 as Slot,
  }));
})();
