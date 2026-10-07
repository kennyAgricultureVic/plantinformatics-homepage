// Iterated function systems: a handful of affine maps w(x, y) = (ax + by + e, cx + dy + f),
// one picked at random with probability p at every step (the chaos game). The points settle
// onto the attractor, which for the right maps is a fern.

import { dataReleases, totalAccessions } from "@/content";

export type AffineMap = { a: number; b: number; c: number; d: number; e: number; f: number; p: number };

export type Ifs = {
  id: string;
  name: string;
  /** Latin or common name of what the maps draw. */
  plant: string;
  maps: readonly AffineMap[];
  /** What each map draws, in map order. */
  roles: readonly string[];
};

const map = (a: number, b: number, c: number, d: number, e: number, f: number, p: number): AffineMap => ({ a, b, c, d, e, f, p });

/** Barnsley's black spleenwort, Asplenium adiantum-nigrum (Fractals Everywhere, 1988). */
export const barnsley: Ifs = {
  id: "barnsley",
  name: "Barnsley fern",
  plant: "Black spleenwort",
  maps: [
    map(0, 0, 0, 0.16, 0, 0, 0.01),
    map(0.85, 0.04, -0.04, 0.85, 0, 1.6, 0.85),
    map(0.2, -0.26, 0.23, 0.22, 0, 1.6, 0.07),
    map(-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.07),
  ],
  roles: ["Stem", "Smaller copy, up the rachis", "Left pinna", "Right pinna"],
};

/** One IFS per tool, in the order tools appear in `@/content`. */
export const toolIfs: readonly Ifs[] = [
  {
    id: "culcita",
    name: "Culcita fern",
    plant: "Culcita",
    maps: [
      map(0, 0, 0, 0.25, 0, -0.14, 0.02),
      map(0.85, 0.02, -0.02, 0.83, 0, 1, 0.84),
      map(0.09, -0.28, 0.3, 0.11, 0, 0.6, 0.07),
      map(-0.09, 0.28, 0.3, 0.09, 0, 0.7, 0.07),
    ],
    roles: ["Stem", "Smaller copy", "Left pinna", "Right pinna"],
  },
  {
    id: "tree",
    name: "Fractal tree",
    plant: "Branching crown",
    maps: [
      map(0, 0, 0, 0.5, 0, 0, 0.05),
      map(0.42, -0.42, 0.42, 0.42, 0, 0.2, 0.4),
      map(0.42, 0.42, -0.42, 0.42, 0, 0.2, 0.4),
      map(0.1, 0, 0, 0.1, 0, 0.2, 0.15),
    ],
    roles: ["Trunk", "Left branch", "Right branch", "Crown"],
  },
  {
    id: "thelypteris",
    name: "Mutant fern",
    plant: "Thelypteris",
    maps: [
      map(0, 0, 0, 0.25, 0, -0.4, 0.02),
      map(0.95, 0.005, -0.005, 0.93, -0.002, 0.5, 0.84),
      map(0.035, -0.2, 0.16, 0.04, -0.09, 0.02, 0.07),
      map(-0.04, 0.2, 0.16, 0.04, 0.083, 0.12, 0.07),
    ],
    roles: ["Stem", "Smaller copy", "Left pinna", "Right pinna"],
  },
  {
    id: "maple",
    name: "Maple leaf",
    plant: "Acer",
    maps: [
      map(0.14, 0.01, 0, 0.51, -0.08, -1.31, 0.1),
      map(0.43, 0.52, -0.45, 0.5, 1.49, -0.75, 0.35),
      map(0.45, -0.49, 0.47, 0.47, -1.62, -0.74, 0.35),
      map(0.49, 0, 0, 0.51, 0.02, 1.62, 0.2),
    ],
    roles: ["Petiole", "Right lobe", "Left lobe", "Top lobe"],
  },
];

export const ifsById = Object.fromEntries([barnsley, ...toolIfs].map((s) => [s.id, s])) as Record<string, Ifs>;

/** Points per tool drawing: the same for every tool, so only the maps differ. */
export const TOOL_POINTS = 24_000;

export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Plot = { xs: Float32Array; ys: Float32Array; by: Uint8Array; counts: number[] };

/** The chaos game: exactly `n` points, each tagged with the map that produced it. Same seed, same plot. */
export function chaosGame(ifs: Ifs, n: number, seed: string): Plot {
  const rand = mulberry32(hashSeed(`${ifs.id}:${seed}`));
  const cumulative = ifs.maps.map((_, i) => ifs.maps.slice(0, i + 1).reduce((s, m) => s + m.p, 0));
  const total = cumulative[cumulative.length - 1];
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const by = new Uint8Array(n);
  const counts = ifs.maps.map(() => 0);
  let x = 0;
  let y = 0;
  // A few silent steps first so the start point has landed on the attractor.
  for (let i = -24; i < n; i++) {
    const r = rand() * total;
    let k = 0;
    while (k < cumulative.length - 1 && r >= cumulative[k]) k++;
    const m = ifs.maps[k];
    const nx = m.a * x + m.b * y + m.e;
    y = m.c * x + m.d * y + m.f;
    x = nx;
    if (i < 0) continue;
    xs[i] = x;
    ys[i] = y;
    by[i] = k;
    counts[k]++;
  }
  return { xs, ys, by, counts };
}

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

const boundsCache = new Map<string, Bounds>();

/** Extent of the attractor from a fixed reference run, so every drawing of one IFS shares a scale. */
export function boundsOf(ifs: Ifs): Bounds {
  const cached = boundsCache.get(ifs.id);
  if (cached) return cached;
  const { xs, ys } = chaosGame(ifs, 60_000, "bounds");
  const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (let i = 0; i < xs.length; i++) {
    b.minX = Math.min(b.minX, xs[i]);
    b.maxX = Math.max(b.maxX, xs[i]);
    b.minY = Math.min(b.minY, ys[i]);
    b.maxY = Math.max(b.maxY, ys[i]);
  }
  boundsCache.set(ifs.id, b);
  return b;
}

/** Map indices ordered by probability, largest first: the busiest map gets the strongest ink. */
export const inkRank = (ifs: Ifs) => {
  const order = ifs.maps.map((m, i) => ({ p: m.p, i })).toSorted((a, b) => b.p - a.p || a.i - b.i);
  const rank = new Array<number>(ifs.maps.length);
  order.forEach((o, r) => (rank[o.i] = r));
  return rank;
};

/** The hero plots one point per genotyped accession. */
export const HERO_POINTS = totalAccessions;
export const HERO_SEED = "hero";

/** Releases newest first, as the data section lists them. */
export const releasesNewestFirst = dataReleases.toSorted((a, b) => b.released.localeCompare(a.released));

export const maxReleaseAccessions = Math.max(...dataReleases.map((r) => r.accessions));
