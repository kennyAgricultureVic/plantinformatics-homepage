// Tool cell types, each cut from the same tessellation as the stem: a small relaxed patch with one
// special cell made by removing the sites where it sits and placing its own sites instead.

import { hashSeed, mulberry32, pathOf, rectPolygon, relax, scatter, shrink, voronoi, type Point, type Polygon } from "./voronoi";

export type CellKind = "xylem" | "guard" | "parenchyma" | "trichome";

const S = 400;
const MID = S / 2;
const r1 = (v: number) => Math.round(v * 10) / 10;

function patch(seed: string, clip: Polygon, count: number, inside: (p: Point) => boolean = () => true) {
  const rand = mulberry32(hashSeed(seed));
  const sites = scatter(count, clip, rand, inside);
  return { cells: relax(sites, clip, 5).at(-1)!, rand };
}

/** Background tissue: pale stain, walls and nuclei, the same marks as the stem. */
function Ground({ polys, rand, color }: { polys: Polygon[]; rand: () => number; color: string }) {
  return polys.map((poly, i) => (
    <path key={i} d={pathOf(poly)} fill={color} fillOpacity={r1((0.12 + rand() * 0.14) * 100) / 100} className="tissue-wall" />
  ));
}

function Nucleus({ at, r }: { at: Point; r: number }) {
  return <circle cx={r1(at[0])} cy={r1(at[1])} r={r1(r)} className="tissue-nucleus" />;
}

function Xylem({ color, seed }: { color: string; seed: string }) {
  const clip = rectPolygon(0, 0, S, S);
  const { cells, rand } = patch(seed, clip, 70);
  const sites: Point[] = [...cells.map((c) => c.centroid).filter(([x, y]) => Math.hypot(x - MID, y - MID) > 135), [MID, MID]];
  const all = voronoi(sites, clip);
  const vessel = all.at(-1)!;
  return (
    <>
      <Ground polys={all.slice(0, -1).map((c) => c.poly)} rand={rand} color={color} />
      <path d={pathOf(vessel.poly)} fill={color} fillOpacity={0.9} className="tissue-wall" />
      {/* Lignified secondary wall in rings, the lumen left empty: a xylem vessel is a dead, open pipe. */}
      {[0.92, 0.85, 0.78].map((t) => (
        <path key={t} d={pathOf(shrink(vessel.poly, vessel.centroid, t))} fill="none" className="tissue-wall" />
      ))}
      <path d={pathOf(shrink(vessel.poly, vessel.centroid, 0.7))} fill="var(--background)" className="tissue-wall" />
    </>
  );
}

function Guard({ color, seed }: { color: string; seed: string }) {
  const clip = rectPolygon(0, 0, S, S);
  const { cells, rand } = patch(seed, clip, 26);
  const outside = ([x, y]: Point) => ((x - MID) / 120) ** 2 + ((y - MID) / 95) ** 2 > 1;
  const sites: Point[] = [...cells.map((c) => c.centroid).filter(outside), [MID - 42, MID], [MID + 42, MID]];
  const all = voronoi(sites, clip);
  const guards = all.slice(-2);
  return (
    <>
      <Ground polys={all.slice(0, -2).map((c) => c.poly)} rand={rand} color={color} />
      {guards.map((g, i) => (
        <g key={i}>
          <path d={pathOf(g.poly)} fill={color} fillOpacity={0.88} className="tissue-wall" />
          <Nucleus at={[g.centroid[0] + (i ? 14 : -14), g.centroid[1]]} r={11} />
        </g>
      ))}
      {/* The stomatal pore between the pair. */}
      <ellipse cx={MID} cy={MID} rx={13} ry={46} fill="var(--background)" className="tissue-wall" />
    </>
  );
}

function Parenchyma({ color, seed }: { color: string; seed: string }) {
  const clip = rectPolygon(0, 0, S, S);
  const { cells, rand } = patch(seed, clip, 22);
  const centre = cells.reduce((best, c, i) =>
    Math.hypot(c.centroid[0] - MID, c.centroid[1] - MID) < Math.hypot(cells[best].centroid[0] - MID, cells[best].centroid[1] - MID) ? i : best, 0);
  const cell = cells[centre];
  const size = Math.sqrt(cell.area);
  // Starch grains scattered round the nucleus: parenchyma is the plant's store.
  const grains = Array.from({ length: 7 }, () => {
    const a = rand() * Math.PI * 2;
    const d = (0.18 + rand() * 0.14) * size;
    return [cell.centroid[0] + Math.cos(a) * d, cell.centroid[1] + Math.sin(a) * d, 4 + rand() * 5] as const;
  });
  return (
    <>
      <Ground polys={cells.filter((_, i) => i !== centre).map((c) => c.poly)} rand={rand} color={color} />
      <path d={pathOf(cell.poly)} fill={color} fillOpacity={0.85} className="tissue-wall" />
      <Nucleus at={cell.centroid} r={size * 0.12} />
      {grains.map(([x, y, r], i) => (
        <circle key={i} cx={r1(x)} cy={r1(y)} r={r1(r)} fill="var(--background)" className="tissue-wall" />
      ))}
    </>
  );
}

function Trichome({ color, seed }: { color: string; seed: string }) {
  const top = 230;
  const clip = rectPolygon(0, top, S, S - top);
  const { cells, rand } = patch(seed, clip, 20);
  // The base is the surface cell nearest the middle of the top edge; the hair grows out of it.
  const base = cells.reduce((best, c, i) =>
    Math.abs(c.centroid[0] - MID) + (c.centroid[1] - top) < Math.abs(cells[best].centroid[0] - MID) + (cells[best].centroid[1] - top) ? i : best, 0);
  const b = cells[base];
  const w = Math.sqrt(b.area) * 0.42;
  const x = b.centroid[0];
  const hair = `M${r1(x - w)} ${top}C${r1(x - w * 0.8)} 140 ${r1(x + 10)} 90 ${r1(x + 70)} 28C${r1(x + 22)} 100 ${r1(x + w * 0.8)} 150 ${r1(x + w)} ${top}Z`;
  return (
    <>
      <Ground polys={cells.filter((_, i) => i !== base).map((c) => c.poly)} rand={rand} color={color} />
      <path d={pathOf(b.poly)} fill={color} fillOpacity={0.85} className="tissue-wall" />
      <path d={hair} fill={color} fillOpacity={0.85} className="tissue-wall" />
      <Nucleus at={[x, b.centroid[1] + 6]} r={10} />
      <line x1={0} y1={top} x2={S} y2={top} stroke="var(--foreground)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </>
  );
}

const drawings = { xylem: Xylem, guard: Guard, parenchyma: Parenchyma, trichome: Trichome } as const;

export const cellKindNames: Record<CellKind, string> = {
  xylem: "Xylem vessel",
  guard: "Guard cell pair",
  parenchyma: "Parenchyma",
  trichome: "Trichome",
};

/** One tool drawn as a cell type, stained in its palette colour. */
export function CellType({ kind, color, seed, className }: { kind: CellKind; color: string; seed: string; className?: string }) {
  const Drawing = drawings[kind];
  return (
    <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={cellKindNames[kind]} className={className}>
      <Drawing color={color} seed={seed} />
    </svg>
  );
}
