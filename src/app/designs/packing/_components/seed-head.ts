// The content as trees to pack: seeds inside releases inside crops for the head, capabilities
// inside tools for the pods, news items inside years. Everything here is computed once at module
// load from @/content and is identical on the server and in the browser.

import { crops, dataReleases, news, tools, type Crop } from "@/content";
import { hashSeed, mulberry32, packTree, type PackNode, type Tree } from "./pack";

/** One seed stands for this many accessions. */
export const PER_SEED = 200;
/** Seeds vary in radius by up to this fraction either way, so the head looks grown rather than tiled. */
export const JITTER = 0.12;

/**
 * Palette slot for a crop, in the order crops first appear in the release list. Slots 0 to 3 are
 * --p1..--p4; slot 4 is the page ink, so five crops fit a four colour palette.
 */
export const slotOf = (crop: Crop) => crops.indexOf(crop);
export const slotColor = (slot: number) => (slot < 4 ? `var(--p${slot + 1})` : "var(--foreground)");
/** Crop zone tint: the crop colour thinned into the page ground (the ink slot thinner still, so it stays a tint). */
export const slotTint = (slot: number, amount = 22) =>
  `color-mix(in oklab, ${slotColor(slot)} ${slot < 4 ? amount : amount / 2}%, var(--background))`;
/** Seeds carried over from an earlier release: the crop colour pulled toward the ink. */
export const slotDeep = (slot: number) =>
  slot < 4 ? `color-mix(in oklab, ${slotColor(slot)} 55%, var(--foreground))` : "color-mix(in oklab, var(--foreground) 55%, var(--background))";

type Release = (typeof dataReleases)[number];

/** For a current release, the superseded release of the same crop that it includes, if any. */
const earlierOf = (r: Release) =>
  "superseded" in r ? undefined : dataReleases.find((s) => "superseded" in s && s.crop === r.crop && s.released < r.released);

export type HeadDatum =
  | { kind: "head"; seeds: number; accessions: number }
  | { kind: "crop"; crop: Crop; slot: number; accessions: number; seeds: number }
  | { kind: "release"; release: Release; slot: number; seeds: number; carried: number }
  | {
      kind: "seed";
      release: Release;
      slot: number;
      index: number;
      of: number;
      from: number;
      to: number;
      /** Date of the earlier release this seed's accessions first appeared in, if any. */
      carriedFrom: string | null;
    };

const seedsFor = (n: number) => Math.max(1, Math.round(n / PER_SEED));

const releaseTree = (r: Release): Tree<HeadDatum> => {
  const slot = slotOf(r.crop);
  const of = seedsFor(r.accessions);
  const earlier = earlierOf(r);
  const random = mulberry32(hashSeed(r.doi));
  const seeds = Array.from({ length: of }, (_, index): Tree<HeadDatum> => {
    const from = Math.round((index * r.accessions) / of) + 1;
    const to = Math.round(((index + 1) * r.accessions) / of);
    const carriedFrom = earlier && to <= earlier.accessions ? earlier.released : null;
    return { data: { kind: "seed", release: r, slot, index, of, from, to, carriedFrom }, r: 1 + (random() * 2 - 1) * JITTER };
  });
  const carried = seeds.filter((s) => s.data.kind === "seed" && s.data.carriedFrom).length;
  return { data: { kind: "release", release: r, slot, seeds: of, carried }, children: seeds };
};

const current = dataReleases.filter((r) => !("superseded" in r));
const sum = (rs: readonly Release[]) => rs.reduce((t, r) => t + r.accessions, 0);

const headTree: Tree<HeadDatum> = {
  data: { kind: "head", seeds: current.reduce((t, r) => t + seedsFor(r.accessions), 0), accessions: sum(current) },
  children: crops
    .map((crop) => {
      const releases = current.filter((r) => r.crop === crop).toSorted((a, b) => b.accessions - a.accessions);
      return {
        data: { kind: "crop", crop, slot: slotOf(crop), accessions: sum(releases), seeds: releases.reduce((t, r) => t + seedsFor(r.accessions), 0) },
        children: releases.map(releaseTree),
      } satisfies Tree<HeadDatum>;
    })
    .toSorted((a, b) => b.data.accessions - a.data.accessions),
};

/** Half the gap between crops, between releases and between seeds, in seed radii. */
export const PADDING = [1.2, 0.8, 0.35] as const;
/** Extra margin inside each crop zone, where its name runs round the rim. */
const CROP_RIM = 2;

/** The packed head: root, crop zones, releases, seeds. */
export const head = packTree(
  headTree,
  (depth) => PADDING[depth] ?? 0,
  hashSeed("plant informatics"),
  (depth) => (depth === 1 ? CROP_RIM : 0),
);

export type HeadNode = PackNode<HeadDatum>;
export const cropNodes = head.children ?? [];
export const seedCount = head.data.kind === "head" ? head.data.seeds : 0;

/** Every seed in drawing order, with its crop index for zooming. */
export const seeds = cropNodes.flatMap((crop, c) =>
  (crop.children ?? []).flatMap((release) => (release.children ?? []).map((seed) => ({ seed, crop: c }))),
);

/** Releases of a crop for the key, newest first, superseded ones included. */
export const releasesOf = (crop: Crop) => dataReleases.filter((r) => r.crop === crop).toSorted((a, b) => b.released.localeCompare(a.released));

// ---- Tool pods ------------------------------------------------------------------------------

export type PodDatum = { label: string; index: number } | { label: string; index: -1 };

const wordCount = (text: string) => text.split(/\s+/).length;

/** Each tool is a pod whose seeds are its capabilities, seed area by the number of words that describe it. */
export const toolPods = tools.map((tool, t) =>
  packTree<PodDatum>(
    {
      data: { label: tool.name, index: -1 },
      children: tool.capabilities.map((c, index) => ({ data: { label: c, index }, r: Math.sqrt(wordCount(c)) })),
    },
    () => 0.35,
    hashSeed(tool.slug) + t,
  ),
);

// ---- News pods ------------------------------------------------------------------------------

/** First crop named in a news item, so data news takes its crop's colour. */
export const cropInNews = (item: (typeof news)[number]) => {
  const text = `${item.title} ${item.body}`.toLowerCase();
  return crops
    .map((crop) => ({ crop, at: text.indexOf(crop.toLowerCase()) }))
    .filter((m) => m.at >= 0)
    .toSorted((a, b) => a.at - b.at)[0]?.crop;
};

export const newsYears = [...new Set(news.map((n) => n.date.slice(0, 4)))].map((year) => {
  const items = news.filter((n) => n.date.startsWith(year));
  const pod = packTree<PodDatum>(
    {
      data: { label: year, index: -1 },
      children: items.map((n, index) => ({ data: { label: n.title, index }, r: 1 })),
    },
    () => 0.3,
    hashSeed(year),
  );
  return { year, items, pod };
});
