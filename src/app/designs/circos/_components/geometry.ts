// Pure layout for the Circos plot: segment angles, ribbon endpoints and SVG path builders.
// Angles are radians, 0 at 12 o'clock, increasing clockwise. Shared by the hero and the arc dividers.

import { crops, dataReleases, formatDate, formatNumber, news, tools, type Crop, type ToolSlug } from "@/content";

export const TAU = Math.PI * 2;

/** Track radii in viewBox units (the hero plot is centred on 0,0). */
export const R = {
  ribbon: 318,
  histIn: 326,
  histOut: 392,
  tickIn: 397,
  ideoIn: 404,
  ideoOut: 436,
  newsIn: 446,
  newsOut: 472,
  label: 500,
} as const;

const GAP = 0.03;
/** Fraction of the circle given to crops (right side); tools take the rest (left side). */
const CROP_SHARE = 0.6;
const TICK_EVERY = 5_000;

// Haploid chromosome counts, drawn as bands on each crop's ideogram segment.
const chromosomes: Record<Crop, number> = { Wheat: 21, Barley: 7, Chickpea: 8, "Field pea": 7, Lentil: 7 };

// Which crops each tool serves, used to draw ribbons. Pretzel hosts every release, Genolink joins
// passport data for all of them, Fairybread covers each crop's PCA, Brioche remaps wheat and barley.
export const servedBy: Record<ToolSlug, readonly Crop[]> = {
  pretzel: crops,
  genolink: crops,
  fairybread: crops,
  brioche: ["Wheat", "Barley"],
};

export type Release = (typeof dataReleases)[number];
export type Tool = (typeof tools)[number];

/** Stable anchor for a release row, from its DOI suffix. */
export const releaseId = (r: Release) => `release-${r.doi.split("/").pop()}`;

/** Palette slot for a tool, by its order in `tools`. */
export const toolColor = (slug: ToolSlug) => `var(--p${tools.findIndex((t) => t.slug === slug) + 1})`;

/** Split [from, to] into spans proportional to `weight`, with `gap` around each one. */
function spread<T>(items: readonly T[], weight: (item: T) => number, from: number, to: number, gap: number) {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  const usable = to - from - gap * items.length;
  let cursor = from + gap / 2;
  return items.map((item) => {
    const start = cursor;
    const end = start + (weight(item) / total) * usable;
    cursor = end + gap;
    return { item, start, end };
  });
}

// Crop segments are sized by the square root of their accessions so small crops stay legible.
export const cropSegments = spread(
  crops.map((crop) => {
    const releases = dataReleases.filter((r) => r.crop === crop);
    return { crop, releases, accessions: releases.reduce((sum, r) => sum + r.accessions, 0) };
  }),
  (c) => Math.sqrt(c.accessions),
  0,
  CROP_SHARE * TAU,
  GAP,
).map(({ item, start, end }) => ({
  kind: "crop" as const,
  key: item.crop,
  label: item.crop,
  start,
  end,
  accessions: item.accessions,
  href: "#data",
  releases: spread(item.releases, (r) => r.accessions, start, end, 0.008).map((s) => ({
    release: s.item,
    id: releaseId(s.item),
    start: s.start,
    end: s.end,
  })),
  bands: spread(Array.from({ length: chromosomes[item.crop] }, (_, i) => i), () => 1, start, end, 0.005),
  ticks: Array.from(
    { length: Math.floor(item.accessions / TICK_EVERY) + 1 },
    (_, k) => start + ((k * TICK_EVERY) / item.accessions) * (end - start),
  ),
}));

export const toolSegments = spread(tools, () => 1, CROP_SHARE * TAU, TAU, GAP).map(({ item, start, end }) => ({
  kind: "tool" as const,
  key: item.slug,
  label: item.name,
  start,
  end,
  tool: item,
  color: toolColor(item.slug),
  href: `#tool-${item.slug}`,
}));

export const segments = [...cropSegments, ...toolSegments];
export type Segment = (typeof segments)[number];
export type ReleaseArc = (typeof cropSegments)[number]["releases"][number];

export const maxRelease = Math.max(...dataReleases.map((r) => r.accessions));
/** Outer radius of a release's histogram bar, linear in accessions. */
export const barRadius = (r: Release) => R.histIn + 8 + (R.histOut - R.histIn - 8) * (r.accessions / maxRelease);

// Ribbons: one per (release, tool that serves its crop). Release side widths split the release arc
// evenly; tool side widths are proportional to accessions. Both ends are ordered to avoid crossings.
const rawLinks = cropSegments.flatMap((crop) =>
  crop.releases.flatMap((arc) => {
    const serving = toolSegments.filter((t) => servedBy[t.key].includes(crop.key)).toReversed();
    return spread(serving, () => 1, arc.start, arc.end, 0).map(({ item: tool, start, end }) => ({
      arc,
      crop: crop.key,
      tool,
      a0: start,
      a1: end,
      weight: arc.release.accessions / serving.length,
    }));
  }),
);

export const links = toolSegments.flatMap((tool) => {
  const mine = rawLinks.filter((l) => l.tool === tool).toSorted((x, y) => y.a0 - x.a0);
  return spread(mine, (l) => l.weight, tool.start + 0.02, tool.end - 0.02, 0).map(({ item, start, end }) => ({
    ...item,
    b0: start,
    b1: end,
    /** Focus keys that light this ribbon up. */
    keys: [item.crop, item.tool.key, item.arc.id] as const,
  }));
});

// News ticks sit on the segment they mention: a tool by name, otherwise the first crop named.
const newsOwner = (n: (typeof news)[number]): Segment => {
  const text = `${n.title} ${n.body}`.toLowerCase();
  const tool = toolSegments.find((t) => n.kind === "tool" && n.title.includes(t.label));
  const crop = cropSegments.find((c) => text.includes(c.key.toLowerCase()));
  return tool ?? crop ?? toolSegments[0];
};

export const newsTicks = (() => {
  const owned = news.map((item, index) => ({ item, index, owner: newsOwner(item) }));
  return owned.map((n) => {
    const siblings = owned.filter((o) => o.owner === n.owner);
    const k = siblings.indexOf(n);
    const angle = n.owner.start + ((k + 1) / (siblings.length + 1)) * (n.owner.end - n.owner.start);
    return { ...n, angle, color: n.owner.kind === "tool" ? n.owner.color : undefined };
  });
})();

/** What the plot is focused on: `keys` decide which ribbons light up, the rest feeds the readout. */
export type Focus = { id: string; keys: readonly string[]; title: string; lines: readonly string[] };

export const focusFor = {
  segment: (s: Segment): Focus =>
    s.kind === "crop"
      ? {
          id: s.key,
          keys: [s.key],
          title: s.label,
          lines: [
            `${formatNumber(s.accessions)} accessions in ${s.releases.length} release${s.releases.length > 1 ? "s" : ""}`,
            `${chromosomes[s.key]} chromosomes on ${s.releases[0].release.assembly}`,
          ],
        }
      : { id: s.key, keys: [s.key], title: s.label, lines: [s.tool.summary] },
  release: (a: ReleaseArc): Focus => ({
    id: a.id,
    keys: [a.id],
    title: `${a.release.crop}, ${formatNumber(a.release.accessions)} accessions`,
    lines: [
      `${a.release.assembly}, released ${formatDate(a.release.released)}`,
      "superseded" in a.release ? "Included in a later release" : a.release.doi.replace("https://doi.org/", "doi:"),
    ],
  }),
  news: (t: (typeof newsTicks)[number]): Focus => ({
    id: `news-${t.index}`,
    keys: [t.owner.key],
    title: t.item.title,
    lines: [formatDate(t.item.date)],
  }),
};

type Point = readonly [number, number];

export const polar = (r: number, a: number, [cx, cy]: Point = [0, 0]): Point => [
  cx + r * Math.sin(a),
  cy - r * Math.cos(a),
];

const fmt = ([x, y]: Point) => `${x.toFixed(2)} ${y.toFixed(2)}`;

/** Ring slice between radii r0 < r1 and angles a0 < a1. */
export function annulus(r0: number, r1: number, a0: number, a1: number, center?: Point) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M${fmt(polar(r1, a0, center))}`,
    `A${r1} ${r1} 0 ${large} 1 ${fmt(polar(r1, a1, center))}`,
    `L${fmt(polar(r0, a1, center))}`,
    `A${r0} ${r0} 0 ${large} 0 ${fmt(polar(r0, a0, center))}Z`,
  ].join("");
}

/** Bezier chord joining arc [a0, a1] to arc [b0, b1] on a circle of radius r, pulled through the centre. */
export function ribbon(r: number, a0: number, a1: number, b0: number, b1: number) {
  return [
    `M${fmt(polar(r, a0))}`,
    `A${r} ${r} 0 0 1 ${fmt(polar(r, a1))}`,
    `Q0 0 ${fmt(polar(r, b0))}`,
    `A${r} ${r} 0 0 1 ${fmt(polar(r, b1))}`,
    `Q0 0 ${fmt(polar(r, a0))}Z`,
  ].join("");
}

/** Radial line between two radii at angle a. */
export const spoke = (r0: number, r1: number, a: number, center?: Point) =>
  `M${fmt(polar(r0, a, center))}L${fmt(polar(r1, a, center))}`;
