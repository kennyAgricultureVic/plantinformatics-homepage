"use client";

import { useEffect, useState, type MouseEvent, type PointerEvent } from "react";
import { formatDate, formatNumber } from "@/content";
import { cn } from "@/lib/utils";
import { PER_SEED, cropNodes, head, seeds, slotColor, slotDeep, slotTint, type HeadNode } from "./seed-head";

const VIEW = head.r + 1;
/** Seeds pop in over about this long, centre first. */
const GROW_MS = 900;

/** Arc along the inside top of a circle, left to right, for a rim label. */
const rimArc = (n: HeadNode, inset: number) => {
  const r = n.r - inset;
  return `M ${n.x - r} ${n.y} A ${r} ${r} 0 0 1 ${n.x + r} ${n.y}`;
};

type Hover = { kind: "seed"; i: number } | { kind: "release"; c: number; r: number } | { kind: "crop"; c: number };

const parseHover = (key: string | undefined): Hover | null => {
  if (!key) return null;
  const [kind, a, b] = key.split(":");
  if (kind === "s") return { kind: "seed", i: Number(a) };
  if (kind === "r") return { kind: "release", c: Number(a), r: Number(b) };
  if (kind === "c") return { kind: "crop", c: Number(a) };
  return null;
};

const cropOf = (h: Hover | null) => (h === null ? null : h.kind === "seed" ? seeds[h.i].crop : h.c);

/** One line naming whatever is under the pointer. */
function describe(h: Hover | null) {
  if (!h) return null;
  if (h.kind === "seed") {
    const d = seeds[h.i].seed.data;
    if (d.kind !== "seed") return null;
    return (
      <>
        <strong className="font-bold">{d.release.crop}</strong>, seed {d.index + 1} of {d.of}: accessions {formatNumber(d.from)} to{" "}
        {formatNumber(d.to)} of the {formatDate(d.release.released)} release
        {d.carriedFrom && `, first released ${formatDate(d.carriedFrom)}`}
      </>
    );
  }
  if (h.kind === "release") {
    const d = cropNodes[h.c].children?.[h.r].data;
    if (d?.kind !== "release") return null;
    return (
      <>
        <strong className="font-bold">{d.release.crop}</strong>, {formatDate(d.release.released)} release: {formatNumber(d.release.accessions)}{" "}
        accessions in {d.seeds} seeds
      </>
    );
  }
  const d = cropNodes[h.c].data;
  if (d.kind !== "crop") return null;
  return (
    <>
      <strong className="font-bold">{d.crop}</strong>: {formatNumber(d.accessions)} accessions in {d.seeds} seeds
    </>
  );
}

/**
 * The hero seed head: every current release packed as a cluster of seeds inside its crop zone.
 * Hovering names a seed, release or crop; clicking a crop zooms the packing to it.
 */
export function SeedHeadFigure() {
  const [hover, setHover] = useState<Hover | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const el = (e.target as Element).closest<SVGElement>("[data-node]");
    const next = parseHover(el?.dataset.node);
    setHover((h) => (JSON.stringify(h) === JSON.stringify(next) ? h : next));
  };
  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    const el = (e.target as Element).closest<SVGElement>("[data-node]");
    const c = cropOf(parseHover(el?.dataset.node));
    setZoom((z) => (c === null || z === c ? null : c));
  };

  const focus = zoom === null ? null : cropNodes[zoom];
  const k = focus ? (head.r / focus.r) * 0.96 : 1;
  const transform = focus ? `scale(${k}) translate(${-focus.x}px, ${-focus.y}px)` : "scale(1) translate(0px, 0px)";
  const hoverCrop = cropOf(hover);
  const readout = describe(hover);

  return (
    <figure className="relative">
      <svg
        viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
        className="pk-head block w-full cursor-zoom-in touch-manipulation select-none"
        role="img"
        aria-label={`Seed head of ${seeds.length} seeds, one per ${PER_SEED} accessions, packed into releases and crops`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={onClick}
      >
        <defs>
          <clipPath id="pk-head-clip">
            <circle r={VIEW} />
          </clipPath>
        </defs>
        <g clipPath="url(#pk-head-clip)">
          <g className="pk-zoom" style={{ transform }}>
            <circle r={head.r} fill="none" stroke="var(--foreground)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            {cropNodes.map((crop, c) => {
              const d = crop.data;
              if (d.kind !== "crop") return null;
              const dim = zoom !== null && zoom !== c;
              return (
                <g key={d.crop} className={cn("transition-opacity duration-500", dim && "opacity-25")}>
                  <circle
                    data-node={`c:${c}`}
                    cx={crop.x}
                    cy={crop.y}
                    r={crop.r}
                    fill={slotTint(d.slot, hoverCrop === c ? 34 : 20)}
                    stroke={slotColor(d.slot)}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    className="transition-[fill]"
                  />
                  {crop.children?.map((release, r) => (
                    <circle
                      key={r}
                      data-node={`r:${c}:${r}`}
                      cx={release.x}
                      cy={release.y}
                      r={release.r}
                      fill="transparent"
                      stroke="var(--foreground)"
                      strokeOpacity={hover?.kind === "release" && hover.c === c && hover.r === r ? 1 : 0.35}
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <path id={`pk-rim-${c}`} d={rimArc(crop, 2.15)} fill="none" />
                  <text className="pk-rim hidden fill-foreground text-[1.9px] font-bold uppercase tracking-[0.12em] sm:block" aria-hidden>
                    <textPath href={`#pk-rim-${c}`} startOffset="50%" textAnchor="middle">
                      {d.crop} · {formatNumber(d.accessions)}
                    </textPath>
                  </text>
                </g>
              );
            })}
            {seeds.map(({ seed, crop }, i) => {
              const d = seed.data;
              if (d.kind !== "seed") return null;
              const hot = hover?.kind === "seed" && hover.i === i;
              return (
                <circle
                  key={i}
                  data-node={`s:${i}`}
                  cx={seed.x}
                  cy={seed.y}
                  r={seed.r}
                  fill={d.carriedFrom ? slotDeep(d.slot) : slotColor(d.slot)}
                  stroke={hot ? "var(--foreground)" : "none"}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  className={cn("pk-seed transition-opacity duration-500", zoom !== null && zoom !== crop && "opacity-25")}
                  style={{ animationDelay: `${Math.round((Math.hypot(seed.x, seed.y) / head.r) * GROW_MS)}ms` }}
                />
              );
            })}
          </g>
        </g>
      </svg>

      <figcaption className="mt-4 min-h-12 text-sm leading-snug" aria-live="polite">
        {readout ?? (
          <span className="opacity-60">
            {zoom === null ? "Point at a seed to name it. Click a crop to zoom in." : "Click again, or press Escape, to see the whole head."}
          </span>
        )}
      </figcaption>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" role="group" aria-label="Zoom to a crop">
        {cropNodes.map((crop, c) => {
          const d = crop.data;
          if (d.kind !== "crop") return null;
          return (
            <button
              key={d.crop}
              type="button"
              aria-pressed={zoom === c}
              onClick={() => setZoom((z) => (z === c ? null : c))}
              onPointerEnter={() => setHover({ kind: "crop", c })}
              onPointerLeave={() => setHover(null)}
              className={cn(
                "flex items-center gap-2 border-b-2 pb-0.5 font-medium",
                zoom === c ? "border-foreground" : "border-transparent hover:border-foreground/40",
              )}
            >
              <span className="size-3 shrink-0 rounded-full" style={{ background: slotColor(d.slot) }} />
              {d.crop}
            </button>
          );
        })}
      </div>
    </figure>
  );
}
