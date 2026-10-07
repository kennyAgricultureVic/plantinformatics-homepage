// Fiddleheads (croziers): a young frond is a curve whose curvature grows toward the tip,
// κ(s) = A·s³, so the stalk stays nearly straight and the tip winds into a tight coil. As the
// frond matures the coil unwinds: fewer turns, same length.

import { news } from "@/content";

export type Crozier = { stalk: string; pinnae: string; minX: number; maxX: number; minY: number; maxY: number };

const STEPS = 140;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** A crozier of arc length `length` rooted at (0, 0), growing up (negative y), winding `turns` times. */
export function crozier(turns: number, length = 100): Crozier {
  const total = turns * Math.PI * 2;
  const ds = length / STEPS;
  let x = 0;
  let y = 0;
  let heading = -Math.PI / 2;
  const pts: { x: number; y: number; h: number; s: number }[] = [{ x, y, h: heading, s: 0 }];
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    // ∫ 4·total·t³ dt over [0, 1] = total, so the tip ends exactly `turns` round.
    heading += 4 * total * t ** 3 * (1 / STEPS);
    x += Math.cos(heading) * ds;
    y += Math.sin(heading) * ds;
    pts.push({ x, y, h: heading, s: t });
  }

  const stalk = pts.map((p, i) => `${i ? "L" : "M"}${r2(p.x)} ${r2(p.y)}`).join("");

  // Pinnae: short ticks on the outside of the curl, shrinking toward the tip and stopping
  // before the coil so they never cross it.
  let pinnae = "";
  for (let i = 18; i < STEPS * 0.82; i += 7) {
    const p = pts[i];
    const len = 9 * (1 - p.s) ** 1.2;
    const nx = Math.cos(p.h - Math.PI / 2 - 0.5);
    const ny = Math.sin(p.h - Math.PI / 2 - 0.5);
    pinnae += `M${r2(p.x)} ${r2(p.y)}L${r2(p.x + nx * len)} ${r2(p.y + ny * len)}`;
    const mx = Math.cos(p.h + Math.PI / 2 + 0.5);
    const my = Math.sin(p.h + Math.PI / 2 + 0.5);
    if (p.s < 0.55) pinnae += `M${r2(p.x)} ${r2(p.y)}L${r2(p.x + mx * len * 0.7)} ${r2(p.y + my * len * 0.7)}`;
  }

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    stalk,
    pinnae,
    minX: Math.min(...xs) - 8,
    maxX: Math.max(...xs) + 8,
    minY: Math.min(...ys) - 8,
    maxY: Math.max(...ys),
  };
}

const day = 86_400_000;
const newest = Date.parse(news[0].date);
const oldest = Date.parse(news[news.length - 1].date);

export const MAX_TURNS = 2.6;
export const MIN_TURNS = 0.35;

/** Newest news is still tightly curled; the oldest has had longest to unroll. Linear in days. */
export const turnsFor = (date: string) => {
  const age = (newest - Date.parse(date)) / day;
  const span = (newest - oldest) / day;
  return MAX_TURNS - (MAX_TURNS - MIN_TURNS) * (age / span);
};
