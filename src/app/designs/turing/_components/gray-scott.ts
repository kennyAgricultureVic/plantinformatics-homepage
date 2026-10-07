// Gray-Scott reaction-diffusion on a small wrapping grid, in plain typed arrays.
//
//   ∂u/∂t = Du∇²u − uv² + F(1 − u)
//   ∂v/∂t = Dv∇²v + uv² − (F + k)v
//
// u is the substrate, v the activator. Every canvas on the page runs this one rule. What changes
// is a map of (F, k) per cell: inside a shape the pair is a pattern-forming regime, outside it is
// barren, so the pattern only lives where the data says it should. Pure functions, no DOM, so the
// same plate always grows the same picture.

export type Regime = {
  /** Name of the pattern this (F, k) pair settles into. */
  name: string;
  F: number;
  k: number;
};

/** The (F, k) pairs used down the page, from labyrinth to spots to stripes. */
export const regimes = {
  labyrinth: { name: "Labyrinth", F: 0.029, k: 0.057 },
  spots: { name: "Spots", F: 0.0367, k: 0.0649 },
  stripes: { name: "Stripes", F: 0.042, k: 0.0603 },
  holes: { name: "Holes", F: 0.039, k: 0.058 },
  coral: { name: "Coral", F: 0.0545, k: 0.062 },
} as const satisfies Record<string, Regime>;

export type RegimeKey = keyof typeof regimes;

/** Outside every shape: so little feed that the activator dies back and nothing forms. */
export const BARREN: Regime = { name: "Barren", F: 0.01, k: 0.08 };

/** Diffusion rates. Dv = Du / 2 is what lets v form spots and stripes instead of spreading flat. */
export const DU = 0.5;
export const DV = 0.25;

export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
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

/** A region of the grid in grid cells. Later regions paint over earlier ones. */
export type Region =
  | { shape: "disc"; x: number; y: number; r: number; regime: RegimeKey }
  | { shape: "rect"; x: number; y: number; w: number; h: number; regime: RegimeKey };

/** Everything needed to grow one picture. Plain data, so a server component can hand it to the canvas. */
export type Plate = {
  /** Seeds the PRNG for the starting activator. */
  key: string;
  w: number;
  h: number;
  regions: readonly Region[];
  steps: number;
  /** Starting activator discs per 1,000 cells inside a region. */
  density?: number;
};

export type Field = {
  w: number;
  h: number;
  u: Float32Array;
  v: Float32Array;
  feed: Float32Array;
  kill: Float32Array;
  /** 1 inside any region, 0 on barren ground, so a renderer can show where pattern was allowed. */
  live: Float32Array;
};

const inside = (region: Region, x: number, y: number) =>
  region.shape === "disc"
    ? (x - region.x) ** 2 + (y - region.y) ** 2 <= region.r ** 2
    : x >= region.x && x < region.x + region.w && y >= region.y && y < region.y + region.h;

export function createField({ key, w, h, regions, density = 4 }: Plate): Field {
  const n = w * h;
  const u = new Float32Array(n).fill(1);
  const v = new Float32Array(n);
  const feed = new Float32Array(n).fill(BARREN.F);
  const kill = new Float32Array(n).fill(BARREN.k);
  const live = new Float32Array(n);

  const rand = mulberry32(hashSeed(key));
  for (const region of regions) {
    const { F, k } = regimes[region.regime];
    const cells: number[] = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!inside(region, x + 0.5, y + 0.5)) continue;
        feed[y * w + x] = F;
        kill[y * w + x] = k;
        live[y * w + x] = 1;
        cells.push(y * w + x);
      }
    }
    // Drop discs of activator (radius 3) at random cells of the region, at least two per region,
    // with a little noise so spots can divide.
    const patches = Math.max(2, Math.round((cells.length * density) / 1000));
    for (let p = 0; p < patches && cells.length; p++) {
      const c = cells[Math.floor(rand() * cells.length)];
      const cx = c % w;
      const cy = Math.floor(c / w);
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx * dx + dy * dy > 9) continue;
          const i = ((cy + dy + h) % h) * w + ((cx + dx + w) % w);
          u[i] = 0.5;
          v[i] = 0.25 + (rand() - 0.5) * 0.1;
        }
      }
    }
  }
  return { w, h, u, v, feed, kill, live };
}

/**
 * Advances the field `steps` explicit Euler steps (dt = 1) in place, using Karl Sims' 3 × 3
 * Laplacian (0.2 edges, 0.05 corners, −1 centre) with wrapping edges.
 */
export function step(field: Field, steps: number) {
  const { w, h, feed, kill } = field;
  let { u, v } = field;
  let nu: Float32Array = new Float32Array(u.length);
  let nv: Float32Array = new Float32Array(v.length);

  for (let s = 0; s < steps; s++) {
    for (let y = 0; y < h; y++) {
      const ym = (y === 0 ? h - 1 : y - 1) * w;
      const y0 = y * w;
      const yp = (y === h - 1 ? 0 : y + 1) * w;
      for (let x = 0; x < w; x++) {
        const xm = x === 0 ? w - 1 : x - 1;
        const xp = x === w - 1 ? 0 : x + 1;
        const i = y0 + x;
        const a = u[i];
        const b = v[i];
        const lapU =
          0.2 * (u[ym + x] + u[yp + x] + u[y0 + xm] + u[y0 + xp]) +
          0.05 * (u[ym + xm] + u[ym + xp] + u[yp + xm] + u[yp + xp]) -
          a;
        const lapV =
          0.2 * (v[ym + x] + v[yp + x] + v[y0 + xm] + v[y0 + xp]) +
          0.05 * (v[ym + xm] + v[ym + xp] + v[yp + xm] + v[yp + xp]) -
          b;
        const abb = a * b * b;
        const F = feed[i];
        nu[i] = a + DU * lapU - abb + F * (1 - a);
        nv[i] = b + DV * lapV + abb - (F + kill[i]) * b;
      }
    }
    const tu = u;
    u = nu;
    nu = tu;
    const tv = v;
    v = nv;
    nv = tv;
  }
  field.u = u;
  field.v = v;
}

/**
 * Packs discs of the given radii into a w × h grid, largest first, each at the free spot nearest
 * the centre. Deterministic and good enough for a handful of discs. Returns centres in input order.
 */
export function packDiscs(radii: readonly number[], w: number, h: number, gap: number) {
  const order = radii.map((r, i) => ({ r, i })).toSorted((a, b) => b.r - a.r);
  const placed: { x: number; y: number; r: number; i: number }[] = [];
  for (const { r, i } of order) {
    let best = { x: w / 2, y: h / 2, d: Infinity };
    for (let y = r + gap; y <= h - r - gap; y += 1) {
      for (let x = r + gap; x <= w - r - gap; x += 1) {
        if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < p.r + r + gap)) continue;
        // Weight horizontal distance less, so the discs spread along a wide plate.
        const d = ((x - w / 2) / w) ** 2 + ((y - h / 2) / h) ** 2 * 1.6;
        if (d < best.d) best = { x, y, d };
      }
    }
    placed.push({ x: best.x, y: best.y, r, i });
  }
  // Centre the cluster on the plate.
  const left = Math.min(...placed.map((p) => p.x - p.r));
  const right = Math.max(...placed.map((p) => p.x + p.r));
  const top = Math.min(...placed.map((p) => p.y - p.r));
  const bottom = Math.max(...placed.map((p) => p.y + p.r));
  const dx = (w - left - right) / 2;
  const dy = (h - top - bottom) / 2;
  return placed.toSorted((a, b) => a.i - b.i).map(({ x, y }) => ({ x: x + dx, y: y + dy }));
}
