import { contours } from "d3-contour";
import { dataReleases, tools } from "@/content";

// The survey sheet: a 1000 x 900 world sampled on a 5-unit grid.
export const W = 1000;
export const H = 900;
const CELL = 5;
const GX = W / CELL + 1;
const GY = H / CELL + 1;

/** Contour interval and index-contour interval, in accessions. */
export const INTERVAL = 1000;
export const INDEX_EVERY = 5;

const maxAccessions = Math.max(...dataReleases.map((r) => r.accessions));

/** One hill per data release, largest near the centre, the rest on a golden-angle spiral. */
export const hills = dataReleases.map((release, i) => {
  const n = dataReleases.length;
  const r = i === 0 ? 0 : 110 + 300 * Math.sqrt(i / (n - 1));
  const a = i * 2.4;
  const sigma = 38 + 48 * Math.sqrt(release.accessions / maxAccessions);
  return {
    release,
    x: 500 + r * Math.cos(a),
    y: 450 + r * Math.sin(a),
    // Slightly elongated and rotated so the hills don't read as perfect circles.
    sx: sigma * (1 + 0.25 * Math.sin(i * 1.7)),
    sy: sigma * (1 - 0.2 * Math.cos(i * 2.3)),
    rot: i * 1.3,
  };
});

export type Hill = (typeof hills)[number];

/** Elevation in accessions: the release hills over a gently rolling plain. */
export function elevation(x: number, y: number) {
  const base = 380 + 260 * Math.sin(x / 110 + 1.3) * Math.cos(y / 140) + 180 * Math.sin((x - y) / 75);
  // Hills combine as a soft maximum, so each summit stands at its own accession count.
  let sum = 0;
  for (const h of hills) {
    const dx = x - h.x;
    const dy = y - h.y;
    const c = Math.cos(h.rot);
    const s = Math.sin(h.rot);
    const u = (dx * c + dy * s) / h.sx;
    const v = (-dx * s + dy * c) / h.sy;
    sum += (h.release.accessions * Math.exp(-(u * u + v * v) / 2)) ** 3;
  }
  const hill = Math.cbrt(sum);
  return hill + base * Math.exp(-hill / 2500);
}

export function nearestHill(x: number, y: number) {
  let best = hills[0];
  let bestD = Infinity;
  for (const h of hills) {
    const d = Math.hypot(x - h.x, y - h.y);
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  }
  return best;
}

const values = new Float64Array(GX * GY);
for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) values[j * GX + i] = elevation(i * CELL, j * CELL);

const top = Math.max(...values);
const thresholds = Array.from({ length: Math.floor(top / INTERVAL) }, (_, k) => (k + 1) * INTERVAL);

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Filled contour bands, lowest first. `t` runs 0..1 from lowland to the highest summit. */
export const bands = contours()
  .size([GX, GY])
  .thresholds(thresholds)(Array.from(values))
  .map((mp) => ({
    value: mp.value,
    t: mp.value / thresholds[thresholds.length - 1],
    index: (mp.value / INTERVAL) % INDEX_EVERY === 0,
    d: mp.coordinates
      .flatMap((polygon) => polygon.map((ring) => "M" + ring.map(([x, y]) => `${r1(x * CELL)},${r1(y * CELL)}`).join("L") + "Z"))
      .join(""),
  }));

/** Hypsometric tint for a height fraction, blended across --p1..--p4 and softened into the ground. */
export function tint(t: number) {
  const seg = Math.min(2, Math.floor(t * 3));
  const local = Math.round((1 - (t * 3 - seg)) * 100);
  const mix = `color-mix(in oklab, var(--p${seg + 1}) ${local}%, var(--p${seg + 2}))`;
  return `color-mix(in oklab, ${mix} var(--contour-mix), var(--background))`;
}

export type Point = { x: number; y: number };

/** Survey stations for the tools, on the low ground west of the summits. */
const stationPoints: Point[] = [
  { x: 240, y: 720 },
  { x: 215, y: 560 },
  { x: 290, y: 330 },
  { x: 420, y: 250 },
];

export const stations = tools.map((tool, i) => ({ tool, ...stationPoints[i % stationPoints.length] }));

const summit = hills.reduce((a, b) => (b.release.accessions > a.release.accessions ? b : a));
const trailStart: Point = { x: 80, y: 850 };
const trailEnd: Point = { x: 870, y: 160 };

/** The route, in order: trailhead, survey stations, the shoulder of the highest summit, field camp. */
const routePoints: Point[] = [trailStart, ...stations, { x: summit.x + 50, y: summit.y + 15 }, trailEnd];

/** Smooth path through the route points (Catmull-Rom as cubic Beziers). */
export const routePath = routePoints
  .map((p, i, ps) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const p0 = ps[i - 2] ?? ps[i - 1];
    const p1 = ps[i - 1];
    const p3 = ps[i + 1] ?? p;
    const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 };
    const c2 = { x: p.x - (p3.x - p1.x) / 6, y: p.y - (p3.y - p1.y) / 6 };
    return `C${r1(c1.x)},${r1(c1.y)} ${r1(c2.x)},${r1(c2.y)} ${p.x},${p.y}`;
  })
  .join("");

export type Waypoint = Point & { zoom: number };

/** Where the map pans for each waypoint key used by `data-waypoint` on the page. */
export const waypoints: Record<string, Waypoint> = {
  about: { x: W / 2, y: H / 2, zoom: 1 },
  ...Object.fromEntries(stations.map((s) => [`station-${s.tool.slug}`, { x: s.x, y: s.y, zoom: 1.7 }])),
  data: { x: summit.x, y: summit.y, zoom: 1.35 },
  news: { ...trailEnd, zoom: 1.8 },
};

export const trail = { start: trailStart, end: trailEnd, summit };

/** A six-figure grid reference for a point, as a surveyor would quote it. */
export const gridRef = (p: Point) => `${String(Math.round(p.x)).padStart(3, "0")} ${String(Math.round(H - p.y)).padStart(3, "0")}`;
