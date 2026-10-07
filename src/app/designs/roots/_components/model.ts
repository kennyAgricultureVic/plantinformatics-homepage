// Stochastic root model: every root is a gravitropic random walk.
// Pure functions only, so the same content and page geometry always grow the same roots.

import { dataReleases, type Crop } from "@/content";

/** One visible root tip in the hero stands for this many genotyped accessions. */
export const ACCESSIONS_PER_TIP = 500;
/** The depth scale down the margin. */
export const PX_PER_CM = 40;

/** Parameters of the walk, shown on the page as the rule. */
export const RULE = {
  step: 6, // px per step
  gamma: 0.06, // gravitropic pull toward the preferred direction
  sigma: 0.2, // random turn per step, radians
  insertion: [55, 85] as const, // lateral branching angle, degrees
};

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

export function hashSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Inks are CSS colours so palette and theme changes never regrow the roots. */
export const INKS = ["var(--ink0)", "var(--ink1)", "var(--ink2)", "var(--ink3)", "var(--foreground)"] as const;

export type CropPlan = { crop: Crop; accessions: number; tips: number; ink: string };

/** Current (not superseded) accessions per crop, largest first, each with its tip count and ink. */
export const cropPlan: CropPlan[] = Object.entries(
  dataReleases.reduce<Record<string, number>>((acc, r) => {
    if (!("superseded" in r)) acc[r.crop] = (acc[r.crop] ?? 0) + r.accessions;
    return acc;
  }, {}),
)
  .sort((a, b) => b[1] - a[1])
  .map(([crop, accessions], i) => ({
    crop: crop as Crop,
    accessions,
    tips: Math.round(accessions / ACCESSIONS_PER_TIP),
    ink: INKS[i],
  }));

export const totalTips = cropPlan.reduce((s, c) => s + c.tips, 0);

// ---------------------------------------------------------------------------------------------

type Pt = { x: number; y: number; a: number };

export type Lane = { left: number; right: number };

export type Geometry = {
  width: number;
  soil: number; // y of the soil line
  crown: number; // x where the shoot meets the soil
  heroEnd: number; // seminal roots must be inside a lane by this depth
  rootEnd: number; // roots stop here
  lanes: Lane[]; // free margins beside the content column; lanes[0] is the left one
  nodules: { x: number; y: number; count: number; ink: string }[];
  hairs: { x: number; y: number; ring: boolean }[];
};

export type Stroke = { d: string; w: number; ink: string; delay: number; dur: number; opacity?: number };
export type Dot = { x: number; y: number; r: number; ink: string; delay: number; ring?: boolean };
export type Drawing = { strokes: Stroke[]; dots: Dot[]; end: number };

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * One gravitropic random walk. The angle is measured from straight down (positive turns right).
 * `aim` gives the preferred angle at each step; the walk turns a fraction gamma toward it plus noise.
 */
function walk(
  start: Pt,
  rand: () => number,
  opts: { steps: number; gamma: number; sigma: number; aim: (p: Pt) => number; stop?: (p: Pt) => boolean; clamp?: (p: Pt) => void },
) {
  const pts: Pt[] = [start];
  let p = start;
  for (let i = 0; i < opts.steps; i++) {
    const turn = opts.gamma * wrap(opts.aim(p) - p.a) + opts.sigma * (rand() + rand() - 1);
    const a = p.a + turn;
    p = { x: p.x + Math.sin(a) * RULE.step, y: p.y + Math.cos(a) * RULE.step, a };
    opts.clamp?.(p);
    pts.push(p);
    if (opts.stop?.(p)) break;
  }
  return pts;
}

const lengthOf = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0);

/** Splits a polyline into short paths so it can taper from w0 to w1 and grow at `speed` px per second. */
function strokes(pts: Pt[], w0: number, w1: number, ink: string, start: number, speed: number, chunk = 14, opacity?: number) {
  const out: Stroke[] = [];
  let t = start;
  for (let i = 0; i < pts.length - 1; i += chunk) {
    const part = pts.slice(i, Math.min(i + chunk + 1, pts.length));
    const len = lengthOf(part);
    const f = i / Math.max(pts.length - 1, 1);
    out.push({
      d: "M" + part.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L"),
      w: w0 + (w1 - w0) * f,
      ink,
      delay: t,
      dur: (len / speed) * 1000,
      opacity,
    });
    t += (len / speed) * 1000;
  }
  return { strokes: out, end: t };
}


const HERO_SPEED = 360;
const LANE_SPEED = 1600;
const LATERAL_SPEED = 160;

export function grow(g: Geometry, seed: number): Drawing {
  const rand = mulberry32(seed);
  const out: Drawing = { strokes: [], dots: [], end: 0 };
  const push = (r: { strokes: Stroke[]; end: number }) => {
    out.strokes.push(...r.strokes);
    out.end = Math.max(out.end, r.end);
  };

  // Seminal roots, one per crop, fanned out from the crown. Negative angles go to the left lane.
  const n = cropPlan.length;
  const order = cropPlan.map((_, i) => i).sort((a, b) => (a % 2) - (b % 2) || a - b); // alternate big crops left and right
  const fan = order.map((ci, k) => ({ ci, a0: -1.05 + (2.1 * k) / (n - 1) }));
  const hasRight = g.lanes.length > 1;
  const laneOf = (a0: number) => (hasRight && a0 > 0 ? 1 : 0);
  const laneMembers = [0, 1].map((l) => fan.filter((f) => laneOf(f.a0) === l));

  // Each primary keeps its points and the time (ms) its tip passes each point, so laterals start on cue.
  const primaries: { lane: number; pts: Pt[]; times: number[] }[] = [];

  fan.forEach(({ ci, a0 }) => {
    const plan = cropPlan[ci];
    const lane = g.lanes[laneOf(a0)];
    const members = laneMembers[laneOf(a0)];
    const slot = members.findIndex((m) => m.ci === ci);
    const inset = Math.min(10, (lane.right - lane.left) / 4);
    const span = lane.right - lane.left - 2 * inset;
    const targetX = lane.left + inset + (span * (slot + 0.5)) / members.length;
    const inLane = (p: Pt) => p.x >= lane.left && p.x <= lane.right;

    // Hero: head for the lane entry, keeping the initial splay for a while.
    const hero = walk({ x: g.crown, y: g.soil, a: a0 }, rand, {
      steps: 3000,
      gamma: 0.045,
      sigma: RULE.sigma * 0.6,
      // Keep the initial splay for the first third, then bend toward the lane entry.
      aim: (p) =>
        (p.y - g.soil) / (g.heroEnd - g.soil) < 0.3 ? a0 * 0.85 : Math.atan2(targetX - p.x, Math.max(g.heroEnd - 40 - p.y, 30)),
      stop: (p) => p.y >= g.heroEnd - 30 && inLane(p),
      clamp: (p) => {
        p.y = Math.max(p.y, g.soil + 2);
      },
    });

    // Lane: wander between random waypoints inside the lane down to the end of the page.
    const way: { x: number; y: number }[] = [];
    for (let y = hero[hero.length - 1].y + 160; y < g.rootEnd; y += 220 + rand() * 220) {
      way.push({ x: lane.left + inset + rand() * span, y });
    }
    way.push({ x: targetX, y: g.rootEnd + 200 });
    let w = 0;
    const deep = walk(hero[hero.length - 1], rand, {
      steps: 6000,
      gamma: 0.07,
      sigma: RULE.sigma * 0.7,
      aim: (p) => {
        while (w < way.length - 1 && p.y > way[w].y) w++;
        return Math.atan2(way[w].x - p.x, Math.max(way[w].y - p.y, 20));
      },
      stop: (p) => p.y >= g.rootEnd,
      clamp: (p) => {
        p.x = Math.min(Math.max(p.x, lane.left + 2), lane.right - 2);
      },
    });

    // Narrow lanes (phones) get finer roots so five of them still read as separate strands.
    const laneW = Math.min(Math.max((lane.right - lane.left) / 16, 1.2), 2.4);
    const heroDraw = strokes(hero, 3.6, laneW, "var(--foreground)", 0, HERO_SPEED);
    push(heroDraw);
    const deepDraw = strokes(deep, laneW, laneW * 0.5, "var(--foreground)", heroDraw.end, LANE_SPEED, 20);
    push(deepDraw);
    const tip = deep[deep.length - 1];
    out.dots.push({ x: tip.x, y: tip.y, r: 3.2, ink: plan.ink, delay: deepDraw.end, ring: false });

    const all = [...hero, ...deep.slice(1)];
    const times = [0];
    for (let i = 1; i < all.length; i++) {
      const len = Math.hypot(all[i].x - all[i - 1].x, all[i].y - all[i - 1].y);
      times.push(times[i - 1] + (len / (i < hero.length ? HERO_SPEED : LANE_SPEED)) * 1000);
    }
    primaries.push({ lane: laneOf(a0), pts: all, times });

    // Laterals: every terminal end is one tip. Some laterals carry a second-order branch, which costs two tips.
    const usable = hero.filter((p) => p.y > g.soil + 24 && p.y < g.heroEnd - 50);
    const heroEndTime = heroDraw.end;
    const inAnyLane = (p: Pt) => g.lanes.some((l) => p.x >= l.left && p.x <= l.right);
    const lateral = (from: Pt, a: number, length: number, born: number, ink: string, w0: number) => {
      const pts = walk({ ...from, a }, rand, {
        steps: Math.max(3, Math.round(length / RULE.step)),
        gamma: 0.035,
        sigma: RULE.sigma * 1.1,
        aim: () => 0,
        stop: (p) => p.y > g.heroEnd - 10 && !inAnyLane(p),
        clamp: (p) => {
          p.y = Math.max(p.y, g.soil + 4);
          p.x = Math.min(Math.max(p.x, 6), g.width - 6);
        },
      });
      const d = strokes(pts, w0, 0.6, ink, born, LATERAL_SPEED, 30);
      push(d);
      const end = pts[pts.length - 1];
      out.dots.push({ x: end.x, y: end.y, r: 2.4, ink, delay: d.end });
      return { pts, born, end: d.end };
    };
    const insertion = () => ((RULE.insertion[0] + rand() * (RULE.insertion[1] - RULE.insertion[0])) * Math.PI) / 180;
    const laterals = Math.round(plan.tips * 0.78);
    let left = plan.tips;
    for (let k = 0; k < laterals && left > 0; k++) {
      const idx = Math.min(usable.length - 1, Math.floor(((k + 0.2 + rand() * 0.6) / laterals) * usable.length));
      const base = usable[Math.max(idx, 0)];
      if (!base) break;
      const side = k % 2 ? 1 : -1;
      const depth = (base.y - g.soil) / Math.max(g.heroEnd - g.soil, 1);
      const length = (24 + rand() ** 1.6 * 190) * (1.15 - 0.6 * depth);
      const born = heroEndTime * ((hero.indexOf(base) + 1) / hero.length);
      const lat = lateral(base, base.a + side * insertion(), length, born, plan.ink, 1.4);
      left--;
      // Branch when tips remain beyond one per remaining lateral, or on the last lateral to use them up.
      const spare = left - (laterals - k - 1);
      if (spare > 0 && lat.pts.length > 8) {
        const j = Math.floor(lat.pts.length * (0.3 + rand() * 0.4));
        const p = lat.pts[j];
        const t = lat.born + (lat.end - lat.born) * (j / lat.pts.length);
        lateral(p, p.a - side * insertion() * 0.8, length * (0.3 + rand() * 0.3), t, plan.ink, 0.9);
        left--;
      }
    }
    // Any tips left over (very short laterals that could not branch) go on as short laterals near the top.
    for (let k = 0; left > 0 && usable.length; k++, left--) {
      const base = usable[Math.floor(rand() * usable.length * 0.6)];
      lateral(base, base.a + (k % 2 ? 1 : -1) * insertion(), 20 + rand() * 40, heroEndTime * 0.5, plan.ink, 1.1);
    }
  });

  // Laterals from a left-lane primary to an anchor in the content column (tool nodules, news hairs).
  const reach = (x: number, y: number, rise: number, w0: number, w1: number) => {
    const left = primaries.filter((p) => p.lane === 0);
    let best: { p: (typeof primaries)[number]; i: number } | null = null;
    for (const p of left) {
      const i = p.pts.findIndex((q) => q.y >= y - rise);
      if (i < 0) continue;
      if (!best || p.pts[i].x > best.p.pts[best.i].x) best = { p, i };
    }
    if (!best) return null;
    const from = best.p.pts[best.i];
    const lat = walk({ ...from, a: from.a + 1.1 }, rand, {
      steps: 600,
      gamma: 0.14,
      sigma: 0.12,
      aim: (p) => Math.atan2(x - p.x, y - p.y),
      stop: (p) => Math.hypot(x - p.x, y - p.y) < RULE.step * 1.5,
      // Steer harder near the anchor so the root homes in instead of circling it.
      clamp: (p) => {
        const dist = Math.hypot(x - p.x, y - p.y);
        if (dist < 60) p.a += Math.min(1, 12 / dist) * wrap(Math.atan2(x - p.x, y - p.y) - p.a);
      },
    });
    lat.push({ x, y, a: 0 });
    const born = best.p.times[best.i];
    return strokes(lat, w0, w1, "var(--foreground)", born, LATERAL_SPEED * 1.5, 30);
  };

  g.nodules.forEach((nod) => {
    const d = reach(nod.x, nod.y, 110, 1.6, 1);
    if (!d) return;
    push(d);
    // Nodules: one per capability, packed on a golden-angle spiral round the end of the lateral.
    for (let k = 0; k < nod.count; k++) {
      const r = 8 + rand() * 4;
      const rad = 12 * Math.sqrt(k + 0.4);
      const th = k * 2.39996 + 0.6;
      out.dots.push({ x: nod.x + rad * Math.cos(th), y: nod.y + rad * Math.sin(th), r, ink: nod.ink, delay: d.end + k * 90 });
    }
  });

  g.hairs.forEach((h) => {
    const d = reach(h.x, h.y, 60, 1, 0.6);
    if (!d) return;
    push(d);
    out.dots.push({ x: h.x, y: h.y, r: 3.6, ink: "var(--ink0)", delay: d.end, ring: h.ring });
  });

  out.end = Math.max(out.end, ...out.dots.map((d) => d.delay + 400));
  return out;
}
