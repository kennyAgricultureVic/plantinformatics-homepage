"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { crops, formatDate, formatNumber } from "@/content";
import { cn } from "@/lib/utils";
import { releaseShapes, shapePath, slotColor } from "./gielis";
import { useSeen } from "./hooks";
import { Shape } from "./shape";

/** Each crop's seeds point their own way, a fifth of a half turn apart, so the plate fans out like a rosette. */
const turn = (slot: number) => -Math.PI / 2 + (slot * Math.PI) / crops.length;

// Largest first, so smaller outlines are drawn on top and stay hoverable.
const drawOrder = releaseShapes.toSorted((a, b) => b.scale - a.scale);

/**
 * Every data release as one seed outline, all overlaid on a common centre like a plate in a seed
 * atlas. Outline area is proportional to accessions; superseded releases are dashed.
 */
export function SeedAtlas() {
  const [active, setActive] = useState<number | null>(null);
  const [ref, seen] = useSeen<SVGSVGElement>();

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
      <figure className="lg:sticky lg:top-24">
        <svg ref={ref} data-seen={seen} viewBox="-1.08 -1.08 2.16 2.16" className="sf-trace w-full overflow-visible" aria-hidden>
          {crops.map((c, i) => (
            <line
              key={c}
              x1={(-1.06 * Math.cos(turn(i))).toFixed(3)}
              y1={(-1.06 * Math.sin(turn(i))).toFixed(3)}
              x2={(1.06 * Math.cos(turn(i))).toFixed(3)}
              y2={(1.06 * Math.sin(turn(i))).toFixed(3)}
              stroke="currentColor"
              strokeOpacity={0.12}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {drawOrder.map((s, order) => {
            const on = active === null || active === s.index;
            const superseded = "superseded" in s.release;
            const d = shapePath(s.params, s.scale, turn(s.slot));
            return (
              <g key={s.release.doi} opacity={on ? 1 : 0.15} className="transition-opacity">
                <path
                  d={d}
                  fill={slotColor(s.slot)}
                  fillOpacity={active === s.index ? 0.35 : 0.08}
                  stroke="none"
                  onPointerEnter={() => setActive(s.index)}
                  onPointerLeave={() => setActive(null)}
                />
                <path
                  d={d}
                  pathLength={superseded ? undefined : 1}
                  fill="none"
                  stroke={slotColor(s.slot)}
                  strokeWidth={active === s.index ? 0.02 : 0.012}
                  strokeDasharray={superseded ? "0.02 0.02" : undefined}
                  style={{ "--i": order } as CSSProperties}
                  className="pointer-events-none"
                />
                {/* A hairline in the page ink keeps pale palette colours legible on white. */}
                <path
                  d={d}
                  pathLength={superseded ? undefined : 1}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.55}
                  style={{ "--i": order } as CSSProperties}
                  strokeWidth={0.0035}
                  strokeDasharray={superseded ? "0.02 0.02" : undefined}
                  className="pointer-events-none"
                />
              </g>
            );
          })}
        </svg>
        <figcaption className="mt-4 max-w-md text-sm leading-relaxed opacity-70">
          Each outline is one release, drawn in its crop&apos;s seed shape and scaled so its area is proportional to its
          accessions. Dashed outlines are releases a later one has superseded. Each crop points its own way, so the plate
          fans out like a rosette.
        </figcaption>
      </figure>

      <ol className="grid">
        {releaseShapes.map((s) => {
          const r = s.release;
          return (
            <li
              key={r.doi}
              tabIndex={0}
              onPointerEnter={() => setActive(s.index)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(s.index)}
              onBlur={() => setActive(null)}
              className={cn(
                "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-4 border-t border-foreground/20 py-4 outline-none transition-opacity focus-visible:bg-foreground/5",
                active !== null && active !== s.index && "opacity-40",
              )}
            >
              <Shape
                params={s.params}
                fill={"superseded" in r ? "none" : slotColor(s.slot)}
                stroke={"superseded" in r ? slotColor(s.slot) : "currentColor"}
                className="size-11"
                style={{ transform: `scale(${(0.35 + 0.65 * s.scale).toFixed(3)})` }}
              />
              <div className="min-w-0">
                <h4 className="text-xl font-bold">{r.crop}</h4>
                <p className="text-sm opacity-70">
                  {formatDate(r.released)} · {r.assembly}
                  {"superseded" in r && " · superseded"}
                </p>
                <a href={r.doi} className="mt-1 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline">
                  {r.doi.replace("https://doi.org/", "doi ")}
                  <ArrowUpRightIcon className="size-3" />
                </a>
              </div>
              <p className="text-right text-2xl font-bold sm:text-3xl">{formatNumber(r.accessions)}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
