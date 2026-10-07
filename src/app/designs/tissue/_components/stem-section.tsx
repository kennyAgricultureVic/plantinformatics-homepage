"use client";

import { useState, type PointerEvent } from "react";
import { formatDate, formatNumber } from "@/content";
import { cn } from "@/lib/utils";
import { useSteps } from "./hooks";
import { LLOYD_STEPS, assignZones, cellLooks, stemZones, swatch, totalCells } from "./tissue";
import { circlePolygon, hashSeed, mulberry32, relax, scatter, type Cell } from "./voronoi";
import { ZonedCells } from "./zoned-cells";

const SIZE = 1000;
const C = SIZE / 2;
const R = 470;
const count = totalCells(stemZones);

let cache: { steps: Cell[][]; owners: Uint8Array[] } | null = null;

/** Every Lloyd step of the stem, computed once per page load (server and client agree: same seed). */
function grow() {
  if (cache) return cache;
  const clip = circlePolygon(C, C, R);
  const rand = mulberry32(hashSeed(`tissue:stem:${stemZones.map((z) => z.key).join()}`));
  const sites = scatter(count, clip, rand, ([x, y]) => Math.hypot(x - C, y - C) < R);
  const steps = relax(sites, clip, LLOYD_STEPS);
  const owners = steps.map((cells) => assignZones(cells, stemZones, (c) => Math.hypot(c.centroid[0] - C, c.centroid[1] - C)));
  cache = { steps, owners };
  return cache;
}

const looks = cellLooks(count, hashSeed("tissue:stem:looks"));

const zoneOf = (e: PointerEvent) => {
  const el = (e.target as Element).closest("[data-zone]");
  return el ? Number(el.getAttribute("data-zone")) : null;
};

/**
 * Hero: a stem cross-section with one cell per 100 accessions. The oldest release is the pith and each
 * later release a ring around it; Lloyd relaxation runs once on load from a raw scatter to even tissue.
 */
export function StemSection() {
  const { steps, owners } = grow();
  const k = useSteps(LLOYD_STEPS);
  const [hover, setHover] = useState<number | null>(null);
  const zone = hover === null ? null : stemZones[hover];

  return (
    <figure>
      <div className="relative">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`Stem cross-section of ${formatNumber(count)} cells, one per ${100} accessions, in rings by data release`}
          className="tissue-plate block w-full cursor-crosshair touch-manipulation"
          data-hover={hover ?? undefined}
          onPointerMove={(e) => setHover(zoneOf(e))}
          onPointerLeave={() => setHover(null)}
        >
          <ZonedCells cells={steps[k]} owner={owners[k]} zones={stemZones} looks={looks} />
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--foreground)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
          <circle
            cx={C}
            cy={C}
            r={R + 14}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.3}
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <p className="pointer-events-none absolute top-0 right-0 text-sm tabular-nums text-muted-foreground" aria-hidden>
          Lloyd step {k} of {LLOYD_STEPS}
        </p>
      </div>

      <figcaption className="mt-6">
        <div className="min-h-14 border-l-4 pl-4" style={{ borderColor: zone ? swatch(zone.slot) : "var(--border)" }} aria-live="polite">
          {zone ? (
            <>
              <p className="text-lg font-semibold">
                {zone.release.crop} · {formatNumber(zone.release.accessions)} accessions · {formatNumber(zone.cells)} cells
              </p>
              <p className="text-sm text-muted-foreground">
                Released {formatDate(zone.release.released)} on {zone.release.assembly}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Point at the section to find a release. Pith is the oldest release, the outer ring the newest.
            </p>
          )}
        </div>
        <ol className="mt-5 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {stemZones.map((z, i) => (
            <li
              key={z.key}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className={cn("flex items-baseline gap-2 transition-opacity", hover !== null && hover !== i && "opacity-35")}
            >
              <span className="size-3 shrink-0 translate-y-0.5 border border-foreground/60" style={{ background: swatch(z.slot) }} />
              <span className="font-medium">{z.release.crop}</span>
              <span className="text-muted-foreground">{formatDate(z.release.released)}</span>
              <span className="ml-auto tabular-nums">{formatNumber(z.cells)} cells</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
