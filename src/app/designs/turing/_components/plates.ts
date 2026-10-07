// Every picture on the page as plain data: which shapes get which (F, k), on what grid, for how
// many steps. Built from @/content, so new releases, tools or news grow new pattern.

import { dataReleases, news, type ToolSlug } from "@/content";
import { packDiscs, regimes, type Plate, type RegimeKey } from "./gray-scott";

const HERO = { w: 360, h: 180, steps: 5000 };

/** Grid cells of area per accession in the hero, so the pattern covers about 30% of the plate. */
export const CELLS_PER_ACCESSION = 0.25;

const current = dataReleases.filter((r) => !("superseded" in r));
const superseded = dataReleases.filter((r) => "superseded" in r);

const radius = (accessions: number) => Math.sqrt((accessions * CELLS_PER_ACCESSION) / Math.PI);
const centres = packDiscs(
  current.map((r) => radius(r.accessions)),
  HERO.w,
  HERO.h,
  5,
);

/** Where each current release sits on the hero plate, as fractions for the HTML labels. */
export const heroDiscs = current.map((r, i) => ({
  release: r,
  x: centres[i].x / HERO.w,
  y: centres[i].y / HERO.h,
  r: radius(r.accessions) / HERO.w,
  /** The older release of the same crop it includes, drawn as an inner disc in another regime. */
  includes: superseded.find((s) => s.crop === r.crop),
}));

export const heroPlate: Plate = {
  key: "hero",
  ...HERO,
  regions: heroDiscs.flatMap(({ release, includes }, i) => {
    const { x, y } = centres[i];
    const outer = { shape: "disc" as const, x, y, r: radius(release.accessions), regime: "coral" as const };
    if (!includes) return [outer];
    return [outer, { shape: "disc" as const, x, y, r: radius(includes.accessions), regime: "spots" as const }];
  }),
};

export const heroRegimes = { current: regimes.coral, superseded: regimes.spots };

/** Each tool is a swatch of one regime. */
export const toolRegime: Record<ToolSlug, RegimeKey> = {
  pretzel: "labyrinth",
  genolink: "stripes",
  fairybread: "spots",
  brioche: "holes",
};

export const toolPlate = (slug: ToolSlug): Plate => ({
  key: `tool:${slug}`,
  w: 96,
  h: 96,
  steps: 4000,
  regions: [{ shape: "rect", x: 0, y: 0, w: 96, h: 96, regime: toolRegime[slug] }],
  density: 4,
});

/** Data strips: the pattern only feeds along a bar as long as the release is large. */
const STRIP = { w: 336, h: 14 };
/** Barren margin each side: the substrate dip spreads a few cells past the bar, and the grid wraps. */
const MARGIN = 8;
export const largestRelease = Math.max(...dataReleases.map((r) => r.accessions));
export const ACCESSIONS_PER_CELL = largestRelease / (STRIP.w - 2 * MARGIN);

export const releasePlate = (release: (typeof dataReleases)[number]): Plate => ({
  key: `release:${release.doi}`,
  ...STRIP,
  steps: 3000,
  regions: [
    // Starts MARGIN cells in, so nothing wraps round the grid edge onto the far end of the strip.
    { shape: "rect", x: MARGIN, y: 1, w: Math.max(3, Math.round(release.accessions / ACCESSIONS_PER_CELL)), h: STRIP.h - 2, regime: "spots" },
  ],
  density: 12,
});

/** A full-width band of one regime, used as the divider in front of each section. */
export const bandPlate = (regime: RegimeKey): Plate => ({
  key: `band:${regime}`,
  w: 360,
  h: 20,
  steps: 3000,
  regions: [{ shape: "rect", x: 0, y: 0, w: 360, h: 20, regime }],
  density: 8,
});

/** News timeline: one disc per item at its date, larger for data releases than tool releases. */
const NEWS = { w: 360, h: 48 };
const times = news.map((n) => Date.parse(n.date));
const [first, last] = [Math.min(...times), Math.max(...times)];
export const newsX = (date: string) => 0.04 + ((Date.parse(date) - first) / (last - first)) * 0.92;

export const newsPlate: Plate = {
  key: "news",
  ...NEWS,
  steps: 3000,
  regions: news.map((n) => ({
    shape: "disc" as const,
    x: newsX(n.date) * NEWS.w,
    y: NEWS.h / 2,
    r: n.kind === "data" ? 16 : 12,
    regime: n.kind === "data" ? ("coral" as const) : ("stripes" as const),
  })),
  density: 10,
};
