import { dataReleases, type Crop, type ToolSlug } from "@/content";

// Sprites are rows of characters. "." is empty, "k" black, "w" white, "1".."4" palette colours.
// Crop sprites also use "a" for the crop colour and "s" for the stem, set per use.

export const cropSprites: Record<Crop, readonly string[]> = {
  Wheat: ["..a..", ".aaa.", ".aaa.", ".aaa.", "..s..", ".ss..", "..s.s", "..s.."],
  Barley: ["a.a.a", ".aaa.", "aaaaa", ".aaa.", "..s..", "s.s..", ".ss.s", "..s.."],
  Chickpea: [".....", ".s.s.", "sasas", ".sss.", "asssa", ".sas.", "..s..", "..s.."],
  "Field pea": ["..s..", ".s.s.", "s..as", ".s.a.", "..s..", ".as..", "..s.s", "..s.."],
  Lentil: [".....", ".....", ".....", ".a.a.", "sssss", ".sas.", "..s..", "..s.."],
};

// Literal class strings so Tailwind sees them. Crops cycle through the three non-ground colours.
const cropFills = ["fill-(--p1)", "fill-(--p2)", "fill-(--p4)"] as const;
const cropBgs = ["bg-(--p1)", "bg-(--p2)", "bg-(--p4)"] as const;

/** One row per crop, current (non-superseded) accessions summed, largest first. */
export const harvest = Object.entries(
  dataReleases.reduce<Partial<Record<Crop, number>>>((acc, r) => {
    if (!("superseded" in r)) acc[r.crop] = (acc[r.crop] ?? 0) + r.accessions;
    return acc;
  }, {}),
)
  .map(([crop, accessions]) => ({ crop: crop as Crop, accessions: accessions ?? 0 }))
  .sort((a, b) => b.accessions - a.accessions);

const cropIndex = (crop: Crop) => Math.max(0, harvest.findIndex((h) => h.crop === crop));
export const cropFill = (crop: Crop) => cropFills[cropIndex(crop) % cropFills.length];
export const cropBg = (crop: Crop) => cropBgs[cropIndex(crop) % cropBgs.length];

// 9 x 9 shop signs, one per tool.
export const toolSigns: Record<ToolSlug, readonly string[]> = {
  pretzel: [
    ".kk...kk.",
    "k11k.k11k",
    "k1..k..1k",
    "k1.k1k.1k",
    ".kk1.1kk.",
    "..k1.1k..",
    ".k1...1k.",
    ".k1...1k.",
    "..kkkkk..",
  ],
  genolink: [
    ".........",
    ".kkk.....",
    "k222k....",
    "k2.kkkk..",
    "k2.k2k4k.",
    ".kkkk.4k.",
    "....k.4k.",
    ".....kkk.",
    ".........",
  ],
  fairybread: [
    "k........",
    "kk.......",
    "k1k......",
    "kw2k.....",
    "k4w1k....",
    "kw2w4k...",
    "k1w4w2k..",
    "kkkkkkkk.",
    ".........",
  ],
  brioche: [
    ".........",
    "...kkk...",
    "..k111k..",
    ".k11w11k.",
    "k1111111k",
    "k1111111k",
    "kkkkkkkkk",
    ".k22222k.",
    "..kkkkk..",
  ],
};

// Farmer, facing right, two walk frames.
export const farmer = [
  ["..kkk..", ".k111k.", "kkkkkkk", "..wwk..", "..www..", ".k222k.", "k.222.k", "..444..", "..4.4..", "..4.4..", ".kk.kk."],
  ["..kkk..", ".k111k.", "kkkkkkk", "..wwk..", "..www..", ".k222k.", ".k222k.", "..444..", "..444..", ".4...4.", "kk...kk"],
] as const;

export const sun = ["..1111..", ".111111.", "11w11111", "1ww11111", "11111111", "11111111", ".111111.", "..1111.."];
export const moon = ["..www...", ".ww.....", "ww......", "ww......", "ww......", "ww......", ".ww.....", "..www..."];
export const cloud = ["...www....", ".wwwwwww..", "wwwwwwwwww", ".wwwwwwww."];
