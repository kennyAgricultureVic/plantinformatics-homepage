// Johan Gielis' superformula and the content it is fed with, shared by every shape on the page.
//
//   r(φ) = ( |cos(mφ/4) / a|^n2 + |sin(mφ/4) / b|^n3 )^(-1/n1)
//
// With a = b = 1 and n1 = n2 = n3 = 2 the bracket is cos² + sin² = 1, so r = 1 for any m: a circle.
// Every shape on the page is reached from that circle by moving n1, n2 and n3.

import { crops, dataReleases, news, tools, type Crop } from "@/content";

export type Params = { m: number; n1: number; n2: number; n3: number; a?: number; b?: number };

export const CIRCLE = { n1: 2, n2: 2, n3: 2 } as const;

/** Radius at angle phi. Guards the bracket so very small exponents stay finite. */
export function radius(p: Params, phi: number) {
  const t = (p.m * phi) / 4;
  const c = Math.abs(Math.cos(t) / (p.a ?? 1)) ** p.n2;
  const s = Math.abs(Math.sin(t) / (p.b ?? 1)) ** p.n3;
  return Math.max(c + s, 1e-9) ** (-1 / p.n1);
}

const SAMPLES = 360;

/** Polar samples of one full turn, normalised so the largest radius is 1. */
export function outline(p: Params, samples = SAMPLES) {
  const r = Array.from({ length: samples }, (_, i) => radius(p, (i / samples) * Math.PI * 2));
  const max = Math.max(...r);
  return r.map((v) => v / max);
}

/** Area of the unit-normalised outline, ½∫r²dφ, so shapes can be scaled to an exact area. */
export function area(p: Params) {
  const r = outline(p);
  return r.reduce((sum, v) => sum + v * v, 0) * (Math.PI / r.length);
}

/**
 * SVG path of the outline at `scale`, rotated by `turn` radians, centred on the origin.
 * Rounded to three decimals so server and client produce the same string.
 */
export function shapePath(p: Params, scale = 1, turn = -Math.PI / 2, samples = SAMPLES) {
  const r = outline(p, samples);
  return (
    r
      .map((v, i) => {
        const phi = (i / samples) * Math.PI * 2 + turn;
        const x = (v * scale * Math.cos(phi)).toFixed(3);
        const y = (v * scale * Math.sin(phi)).toFixed(3);
        return `${i ? "L" : "M"}${x} ${y}`;
      })
      .join("") + "Z"
  );
}

/** Linear blend between two parameter sets with the same m. */
export const lerpParams = (from: Params, to: Params, t: number): Params => ({
  m: to.m,
  n1: from.n1 + (to.n1 - from.n1) * t,
  n2: from.n2 + (to.n2 - from.n2) * t,
  n3: from.n3 + (to.n3 - from.n3) * t,
  a: to.a,
  b: to.b,
});

/** Two decimals, trailing zeros dropped: 0.80 -> "0.8". */
export const fmt = (v: number) => String(Math.round(v * 100) / 100);

// ---------------------------------------------------------------------------------------------
// Content mapped to parameters. Every number below is said in plain words somewhere on the page.

const current = dataReleases.filter((r) => !("superseded" in r));

/**
 * The hero flower.
 * m  = crops released, one petal each.
 * n1 = news items ÷ 10; the lower it is, the more the petals pinch in at the centre.
 * n2 = current data releases, n3 = every release including superseded ones. The gap between
 *      them is what twists the petals off their axes.
 */
export const heroMapping = {
  m: { value: crops.length, note: "crops released" },
  n1: { value: news.length / 10, note: `${news.length} news items, divided by ten` },
  n2: { value: current.length, note: "current data releases" },
  n3: { value: dataReleases.length, note: "all releases, superseded ones included" },
} as const;

export const heroParams: Params = {
  m: heroMapping.m.value,
  n1: heroMapping.n1.value,
  n2: heroMapping.n2.value,
  n3: heroMapping.n3.value,
};

/**
 * Seed outlines per crop, after the shape of the grain itself: a long creased wheat grain, a
 * pointed barley grain, a beaked chickpea, a round pea and a lens-shaped lentil.
 */
export const seedParams: Record<Crop, Params> = {
  Wheat: { m: 4, n1: 2, n2: 2, n3: 2, b: 0.55 },
  Barley: { m: 4, n1: 1.3, n2: 1.5, n3: 1.5, b: 0.42 },
  Chickpea: { m: 1, n1: 0.6, n2: 0.4, n3: 1.5 },
  "Field pea": { m: 4, n1: 2.4, n2: 2.4, n3: 2.4, b: 0.94 },
  Lentil: { m: 4, n1: 1.7, n2: 1.7, n3: 1.7, b: 0.78 },
};

/** Palette slot for a crop: --p1..--p4, then the page ink for the fifth. */
export const cropSlot = (crop: Crop) => crops.indexOf(crop);
export const slotColor = (slot: number) => (slot < 4 ? `var(--p${(slot % 4) + 1})` : "var(--foreground)");
export const slotText = (slot: number) => (slot < 4 ? `var(--p${(slot % 4) + 1}-fg)` : "var(--background)");

/** Every release, newest first, with its outline scaled so outline area is proportional to accessions. */
export const releaseShapes = (() => {
  const unit = Math.max(...dataReleases.map((r) => r.accessions / area(seedParams[r.crop])));
  return dataReleases.map((r, i) => {
    const p = seedParams[r.crop];
    return {
      release: r,
      index: i,
      params: p,
      slot: cropSlot(r.crop),
      scale: Math.sqrt(r.accessions / area(p) / unit),
    };
  });
})();

// Tools: m counts capabilities; n1, n2, n3 are drawn from a seed of the tool's name.

/** FNV-1a hash of a string, the seed for mulberry32. */
export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
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

const round1 = (v: number) => Math.round(v * 10) / 10;

export const toolShapes = tools.map((tool, i) => {
  const rand = mulberry32(hashSeed(tool.slug));
  const n1 = round1(0.4 + rand() * 2.6);
  const n2 = round1(0.5 + rand() * 7.5);
  const n3 = round1(0.5 + rand() * 7.5);
  return { tool, slot: i % 4, params: { m: tool.capabilities.length, n1, n2, n3 } satisfies Params };
});

/**
 * News: the hero's morph in thirteen frames. The oldest item is the circle, the newest is the
 * finished flower, each item one step along the way.
 */
export const newsShapes = news.map((item, i) => {
  const t = news.length > 1 ? (news.length - 1 - i) / (news.length - 1) : 1;
  return { item, t, params: lerpParams({ m: heroParams.m, ...CIRCLE }, heroParams, t) };
});
