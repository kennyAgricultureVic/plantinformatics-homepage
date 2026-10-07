"use client";

import { useState, type PointerEvent } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { formatDate, formatNumber } from "@/content";
import { cn } from "@/lib/utils";
import { useSeen, useSteps } from "./hooks";
import { LLOYD_STEPS, assignZones, cellLooks, sliceZones, swatch, totalCells, type Zone } from "./tissue";
import { hashSeed, mulberry32, rectPolygon, relax, scatter, type Cell } from "./voronoi";
import { ZonedCells } from "./zoned-cells";

const W = 420;
const H = 1000;
const count = totalCells(sliceZones);

let cache: { steps: Cell[][]; owners: Uint8Array[] } | null = null;

function grow() {
  if (cache) return cache;
  const clip = rectPolygon(0, 0, W, H);
  const rand = mulberry32(hashSeed(`tissue:slice:${sliceZones.map((z) => z.key).join()}`));
  const sites = scatter(count, clip, rand, () => true);
  const steps = relax(sites, clip, LLOYD_STEPS);
  // Bands run down the slice: cells are handed out top to bottom, newest release first.
  const owners = steps.map((cells) => assignZones(cells, sliceZones, (c) => c.centroid[1] + c.centroid[0] * 0.02));
  cache = { steps, owners };
  return cache;
}

const looks = cellLooks(count, hashSeed("tissue:slice:looks"));
const isSuperseded = (z: Zone) => "superseded" in z.release;

const zoneOf = (e: PointerEvent) => {
  const el = (e.target as Element).closest("[data-zone]");
  return el ? Number(el.getAttribute("data-zone")) : null;
};

/**
 * Data: a longitudinal slice with one band per release, cells counted from accessions, beside the
 * cell-count table. Superseded releases stay in the slice unstained, since a later release holds them.
 */
export function ReleaseSlice() {
  const { steps, owners } = grow();
  const [ref, seen] = useSeen<HTMLDivElement>();
  const k = useSteps(LLOYD_STEPS, seen);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div ref={ref} className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-16">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Longitudinal slice of ${formatNumber(count)} cells in bands, one band per data release`}
        className="tissue-plate mx-auto block w-full max-w-64 cursor-crosshair border-2 border-foreground md:max-w-none"
        data-hover={hover ?? undefined}
        onPointerMove={(e) => setHover(zoneOf(e))}
        onPointerLeave={() => setHover(null)}
      >
        <ZonedCells cells={steps[k]} owner={owners[k]} zones={sliceZones} looks={looks} unstained={isSuperseded} />
      </svg>

      <div>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-foreground text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">
                Release
              </th>
              <th scope="col" className="hidden py-2 pr-3 font-medium sm:table-cell">
                Assembly
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">
                Accessions
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Cells
              </th>
            </tr>
          </thead>
          <tbody>
            {sliceZones.map((z, i) => (
              <tr
                key={z.key}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className={cn(
                  "border-b border-foreground/15 align-top transition-opacity",
                  hover !== null && hover !== i && "opacity-35",
                )}
              >
                <td className="py-3 pr-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 size-3.5 shrink-0 border border-foreground/60"
                      style={{ background: isSuperseded(z) ? "transparent" : swatch(z.slot) }}
                    />
                    <div>
                      <p className="text-base font-semibold">{z.release.crop}</p>
                      <p className="text-muted-foreground">{formatDate(z.release.released)}</p>
                      <a
                        href={z.release.doi}
                        className="mt-1 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
                      >
                        {z.release.doi.replace("https://doi.org/", "")}
                        <ArrowUpRightIcon className="size-3" />
                      </a>
                      {isSuperseded(z) && <p className="mt-1 text-xs text-muted-foreground">Superseded by a later release, left unstained</p>}
                    </div>
                  </div>
                </td>
                <td className="hidden py-3 pr-3 sm:table-cell">{z.release.assembly}</td>
                <td className="py-3 pr-3 text-right tabular-nums">{formatNumber(z.release.accessions)}</td>
                <td className="py-3 text-right text-base font-semibold tabular-nums">{formatNumber(z.cells)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-foreground">
              <td className="py-3 pr-3 font-semibold">Slice</td>
              <td className="hidden sm:table-cell" />
              <td className="py-3 pr-3 text-right tabular-nums">
                {formatNumber(sliceZones.reduce((s, z) => s + z.release.accessions, 0))}
              </td>
              <td className="py-3 text-right text-base font-semibold tabular-nums">{formatNumber(count)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
