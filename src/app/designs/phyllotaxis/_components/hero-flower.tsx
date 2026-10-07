"use client";

import { useState } from "react";
import { formatDate, formatNumber, totalAccessions } from "@/content";
import { cn } from "@/lib/utils";
import { SunflowerCanvas, type FloretHit } from "./sunflower-canvas";
import { cropGroups, cropTotals, currentReleases, releaseGroups, slotColor, slotOf, type SpiralLayout } from "./vogel";

const modes = [
  { layout: "sectors", label: "Sectors", detail: "share of each crop" },
  { layout: "rings", label: "Rings", detail: "release order, oldest at the centre" },
] as const satisfies readonly { layout: SpiralLayout; label: string; detail: string }[];

const percent = (n: number) => `${((n / totalAccessions) * 100).toFixed(1)}%`;

/**
 * The hero sunflower: every genotyped accession as one floret, switchable between crop sectors
 * and release rings, with a legend and a hover readout naming the floret under the pointer.
 */
export function HeroFlower() {
  const [layout, setLayout] = useState<SpiralLayout>("sectors");
  const [hit, setHit] = useState<FloretHit | null>(null);
  const rings = layout === "rings";

  const legend = rings
    ? currentReleases.map((r) => ({ key: r.doi, label: r.crop, note: formatDate(r.released), count: r.accessions, slot: slotOf(r.crop) }))
    : cropTotals.map((t) => ({ key: t.crop, label: t.crop, note: percent(t.count), count: t.count, slot: t.slot }));
  const hovered = hit ? legend[hit.group] : null;

  return (
    <figure className="relative">
      <div className="relative">
        <SunflowerCanvas
          groups={rings ? releaseGroups : cropGroups}
          layout={layout}
          label={`Sunflower of ${formatNumber(totalAccessions)} florets, one per genotyped accession, coloured by crop`}
          onHover={setHit}
          className="cursor-crosshair"
        />
        {hit && hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: hit.x, top: hit.y }}
          >
            <span className="block size-5 rounded-full border-2 border-foreground" />
            <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-background px-2 py-1 font-(family-name:--font-phyllo-mono) text-xs whitespace-nowrap">
              n = {formatNumber(hit.n)} · {hovered.label} · {hovered.note}
            </span>
          </div>
        )}
      </div>

      <figcaption className="mt-6 font-(family-name:--font-phyllo-mono) text-xs">
        <div className="flex gap-6" role="group" aria-label="Spiral layout">
          {modes.map((m) => (
            <button
              key={m.layout}
              type="button"
              aria-pressed={layout === m.layout}
              onClick={() => setLayout(m.layout)}
              className={cn(
                "border-b-2 pb-1 text-left uppercase tracking-widest",
                layout === m.layout ? "border-foreground" : "border-transparent opacity-50 hover:opacity-100",
              )}
            >
              {m.label}
            </button>
          ))}
          <span className="ml-auto hidden self-end pb-1 opacity-60 sm:block">{modes.find((m) => m.layout === layout)?.detail}</span>
        </div>
        <ol className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {legend.map((row, i) => (
            <li key={row.key} className={cn("flex items-baseline gap-2 transition-opacity", hit && hit.group !== i && "opacity-30")}>
              <span className="size-2.5 shrink-0 translate-y-px rounded-full" style={{ background: slotColor(row.slot) }} />
              <span>{row.label}</span>
              <span className="opacity-60">{row.note}</span>
              <span className="ml-auto tabular-nums">{formatNumber(row.count)}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
