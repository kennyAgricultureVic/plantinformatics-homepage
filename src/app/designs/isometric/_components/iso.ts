// Projection and world layout for the isometric station.
// Same camera as the Hairline figures, Cam(45, 0.5, S): +x runs down to the right, +y down to the left,
// z is up, and plates are painted back to front by ascending x + y.

import { crops, dataReleases, news, tools, type SectionId } from "@/content";
import type { HairlineFigureName } from "@/components/hairline";

export type V3 = readonly [number, number, number];
export type Pt = readonly [number, number];

/** World units to pixels. A field plot (34 units) comes out about 190px across. */
export const S = 4;
const C = Math.SQRT1_2;
const K = 0.5;
const ZF = Math.sqrt(1 - K * K);

const raw = (x: number, y: number, z: number): Pt => [S * (x - y) * C, S * ((x + y) * C * K - z * ZF)];

// ---------- world layout (ground units) ----------

/** The island everything stands on. */
export const ISLAND = { x0: -24, y0: -82, x1: 222, y1: 164, depth: 6 } as const;

/** Glasshouse, top of the campus. */
export const GLASS = { x: 0, y: -68, w: 48, d: 26, h: 20, ridge: 10 } as const;

/** Field plots: one per released crop, three to a row. */
export const PLOT = 34;
const GAP = 8;
export const FIELD_W = 3 * PLOT + 2 * GAP;
export const FIELD_D = Math.ceil(crops.length / 3) * PLOT + (Math.ceil(crops.length / 3) - 1) * GAP;
const figureFor: Record<string, HairlineFigureName> = {
  Wheat: "wheat",
  Barley: "barley",
  Chickpea: "chickpea",
  "Field pea": "pea",
  Lentil: "lentil",
  Lupin: "lupin",
};
export const plots = crops.map((crop, i) => {
  const x = (i % 3) * (PLOT + GAP);
  const y = Math.floor(i / 3) * (PLOT + GAP);
  return { crop, figure: figureFor[crop] ?? ("dna" as const), x, y };
});

/** Lab (tools): a cutaway room with a bench of machines and a server rack. */
export const LAB = { x: 140, y: -44, w: 86, d: 44, wall: 30 } as const;
export const BENCH = { x0: 18, y0: 10, x1: 82, y1: 21, h: 10 } as const;
export const RACK = { x0: 2, y0: 2, x1: 13, y1: 14, h: 44 } as const;
export const machines = tools.map((tool, i) => ({
  slug: tool.slug,
  name: tool.name,
  x0: BENCH.x0 + 3 + i * 15.5,
  x1: BENCH.x0 + 3 + i * 15.5 + 11,
}));

/** Seed store (data): crates stacked by release, height proportional to accessions. */
export const STORE = { x: -8, y: 104, w: 74, d: 50, wall: 30 } as const;
/** Accessions per world unit of stack height, and per crate. */
export const PER_UNIT = 500;
export const PER_CRATE = 2000;
// Largest releases in the back row, so the short stacks in front never hide them.
export const stacks = [...dataReleases].sort((a, b) => b.accessions - a.accessions).map((r, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const x0 = 6 + col * 17;
  const y0 = 8 + row * 21;
  return { release: r, id: r.doi, x0, y0, x1: x0 + 12, y1: y0 + 12, h: r.accessions / PER_UNIT };
});

/** Noticeboard (news): one note per item. */
export const BOARD = { x: 132, y: 112, w: 58, d: 26 } as const;
export const NOTE_COLS = 5;
export const notes = news.map((n, i) => {
  const col = i % NOTE_COLS;
  const row = Math.floor(i / NOTE_COLS);
  const rows = Math.ceil(news.length / NOTE_COLS);
  const cw = 46 / NOTE_COLS;
  const rh = 21 / rows;
  const x0 = 7 + col * cw;
  const z1 = 38 - row * rh;
  return { item: n, id: `${n.date}:${n.title}`, x0, x1: x0 + cw - 1.6, z0: z1 - rh + 1.4, z1 };
});

// ---------- fit the island into one pixel box ----------

const tallest = Math.max(...stacks.map((s) => s.h)) + 4;
const keyPoints: V3[] = [
  [ISLAND.x0, ISLAND.y0, 0],
  [ISLAND.x1, ISLAND.y0, 0],
  [ISLAND.x0, ISLAND.y1, 0],
  [ISLAND.x1, ISLAND.y1, -ISLAND.depth],
  [ISLAND.x0, ISLAND.y1, -ISLAND.depth],
  [ISLAND.x1, ISLAND.y0, -ISLAND.depth],
  [GLASS.x, GLASS.y, GLASS.h + GLASS.ridge],
  [STORE.x + 20, STORE.y, tallest],
  [LAB.x, LAB.y, RACK.h + 4],
];
const box = (pts: Pt[]) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
};
const PAD = 24;
const bounds = box(keyPoints.map((p) => raw(...p)));
export const WORLD_W = Math.ceil(bounds.x1 - bounds.x0 + PAD * 2);
export const WORLD_H = Math.ceil(bounds.y1 - bounds.y0 + PAD * 2);
const ox = PAD - bounds.x0;
const oy = PAD - bounds.y0;

/** World point to pixel in the world box. */
export const P = (x: number, y: number, z: number): Pt => {
  const [sx, sy] = raw(x, y, z);
  return [ox + sx, oy + sy];
};

// ---------- path strings ----------

const r2 = (n: number) => Math.round(n * 100) / 100;
export const poly = (pts: Pt[]) => `M${pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join("L")}Z`;
export const open = (pts: Pt[]) => `M${pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join("L")}`;
export const polyW = (pts: V3[]) => poly(pts.map((p) => P(...p)));
export const openW = (pts: V3[]) => open(pts.map((p) => P(...p)));

/** The three visible faces of an axis-aligned box and its silhouette. */
export function cuboid(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  return {
    top: polyW([
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y1, z1],
      [x0, y1, z1],
    ]),
    /** Face at x = x1, toward screen lower right. */
    right: polyW([
      [x1, y0, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x1, y0, z1],
    ]),
    /** Face at y = y1, toward screen lower left. */
    left: polyW([
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x0, y1, z1],
    ]),
    sil: polyW([
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y0, z0],
      [x1, y1, z0],
      [x0, y1, z0],
      [x0, y1, z1],
    ]),
  };
}

// ---------- camera regions (pixels in the world box) ----------

export type Region = { x0: number; y0: number; x1: number; y1: number };
const region = (pts: V3[], pad = 16): Region => {
  const b = box(pts.map((p) => P(...p)));
  return { x0: b.x0 - pad, y0: b.y0 - pad, x1: b.x1 + pad, y1: b.y1 + pad };
};
const corners = (x: number, y: number, w: number, d: number, h: number): V3[] => [
  [x, y, 0],
  [x + w, y, 0],
  [x, y + d, 0],
  [x + w, y + d, 0],
  [x, y, h],
  [x + w, y + d, h],
];

export const regions: Record<SectionId, Region> = {
  about: { x0: 0, y0: 0, x1: WORLD_W, y1: WORLD_H },
  tools: region(corners(LAB.x, LAB.y, LAB.w, LAB.d, RACK.h + 2), 20),
  data: region(corners(STORE.x, STORE.y, STORE.w, STORE.d, tallest), 20),
  news: region(corners(BOARD.x, BOARD.y, BOARD.w, BOARD.d, 44), 28),
};

/** The field and glasshouse together, for the narrow-screen crop of the about section. */
export const fieldRegion = region(
  [
    ...corners(0, 0, FIELD_W, FIELD_D, 40),
    ...corners(GLASS.x, GLASS.y, GLASS.w, GLASS.d, GLASS.h + GLASS.ridge),
  ],
  8,
);
