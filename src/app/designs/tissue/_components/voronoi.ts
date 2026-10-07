// Voronoi tessellation by half-plane clipping, plus Lloyd relaxation. Plain TypeScript, no packages.
// Every cell starts as the convex boundary and is cut by the bisector with each nearby site;
// a grid of buckets visits sites nearest first and stops once no further site can reach the cell.

export type Point = readonly [number, number];
export type Polygon = Point[];

export type Cell = {
  /** Generating site. */
  site: Point;
  poly: Polygon;
  centroid: Point;
  area: number;
};

/** Small fast seeded PRNG: the same seed always gives the same tissue. */
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

/** FNV-1a hash of a string, for seeding from content. */
export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Regular polygon standing in for a circle, used as a convex clip boundary. */
export const circlePolygon = (cx: number, cy: number, r: number, sides = 96): Polygon =>
  Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });

export const rectPolygon = (x: number, y: number, w: number, h: number): Polygon => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** Keep the part of `poly` on the side of the bisector nearer `a` than `b`. */
function clipBisector(poly: Polygon, a: Point, b: Point): Polygon {
  const nx = b[0] - a[0];
  const ny = b[1] - a[1];
  const c = (nx * (a[0] + b[0])) / 2 + (ny * (a[1] + b[1])) / 2;
  const out: Polygon = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const dp = nx * p[0] + ny * p[1] - c;
    const dq = nx * q[0] + ny * q[1] - c;
    if (dp <= 0) out.push(p);
    if (dp < 0 !== dq < 0 && dp !== dq) {
      const t = dp / (dp - dq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

export function polygonCentroid(poly: Polygon): { centroid: Point; area: number } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    const cross = x0 * y1 - x1 * y0;
    a += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  a /= 2;
  if (Math.abs(a) < 1e-9) return { centroid: poly[0] ?? [0, 0], area: 0 };
  return { centroid: [cx / (6 * a), cy / (6 * a)], area: Math.abs(a) };
}

function bounds(poly: Polygon) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of poly) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}

/** Voronoi cells of `sites`, clipped to the convex polygon `clip`. Output order matches `sites`. */
export function voronoi(sites: readonly Point[], clip: Polygon): Cell[] {
  const { x0, y0, x1, y1 } = bounds(clip);
  const n = sites.length;
  const cs = Math.max(1e-6, Math.sqrt(((x1 - x0) * (y1 - y0)) / Math.max(1, n)) * 1.2);
  const cols = Math.max(1, Math.ceil((x1 - x0) / cs));
  const rows = Math.max(1, Math.ceil((y1 - y0) / cs));
  const buckets: number[][] = Array.from({ length: cols * rows }, () => []);
  const gx = (x: number) => Math.min(cols - 1, Math.max(0, Math.floor((x - x0) / cs)));
  const gy = (y: number) => Math.min(rows - 1, Math.max(0, Math.floor((y - y0) / cs)));
  sites.forEach(([x, y], i) => buckets[gy(y) * cols + gx(x)].push(i));

  return sites.map((site, i) => {
    let poly = clip;
    const cx = gx(site[0]);
    const cy = gy(site[1]);
    const maxRing = Math.max(cols, rows);
    for (let r = 0; r <= maxRing; r++) {
      // Any site in ring r + 1 or beyond is at least r·cs away; it can only cut the cell if
      // that is less than twice the cell's furthest vertex.
      let reach = 0;
      for (const [px, py] of poly) reach = Math.max(reach, Math.hypot(px - site[0], py - site[1]));
      if ((r - 1) * cs > 2 * reach) break;
      for (let yy = cy - r; yy <= cy + r; yy++) {
        if (yy < 0 || yy >= rows) continue;
        for (let xx = cx - r; xx <= cx + r; xx++) {
          if (xx < 0 || xx >= cols) continue;
          if (Math.max(Math.abs(xx - cx), Math.abs(yy - cy)) !== r) continue;
          for (const j of buckets[yy * cols + xx]) {
            if (j === i) continue;
            const other = sites[j];
            if (other[0] === site[0] && other[1] === site[1]) continue;
            poly = clipBisector(poly, site, other);
            if (poly.length < 3) break;
          }
        }
      }
      if (poly.length < 3) break;
    }
    const { centroid, area } = poly.length >= 3 ? polygonCentroid(poly) : { centroid: site, area: 0 };
    return { site, poly, centroid, area };
  });
}

/**
 * Lloyd relaxation: move every site to the centroid of its cell and tessellate again.
 * Returns every iteration from the raw scatter (index 0) to the relaxed tissue (index `iterations`).
 */
export function relax(sites: readonly Point[], clip: Polygon, iterations: number): Cell[][] {
  const steps: Cell[][] = [];
  let current = sites;
  for (let k = 0; k <= iterations; k++) {
    const cells = voronoi(current, clip);
    steps.push(cells);
    current = cells.map((c) => c.centroid);
  }
  return steps;
}

/** Uniform random points inside a convex polygon (rejection sampled from its bounds). */
export function scatter(count: number, clip: Polygon, rand: () => number, inside: (p: Point) => boolean): Point[] {
  const { x0, y0, x1, y1 } = bounds(clip);
  const pts: Point[] = [];
  while (pts.length < count) {
    const p: Point = [x0 + rand() * (x1 - x0), y0 + rand() * (y1 - y0)];
    if (inside(p)) pts.push(p);
  }
  return pts;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** SVG path data, rounded so server and client markup agree. */
export const pathOf = (poly: Polygon) =>
  poly.length < 3 ? "" : `M${poly.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}Z`;

/** The polygon shrunk toward a point by factor t (0 to 1): used for wall thickenings and nuclei. */
export const shrink = (poly: Polygon, to: Point, t: number): Polygon =>
  poly.map(([x, y]) => [to[0] + (x - to[0]) * t, to[1] + (y - to[1]) * t] as const);
