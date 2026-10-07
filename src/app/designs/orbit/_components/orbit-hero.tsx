"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { formatDate, formatNumber, totalAccessions, type Crop } from "@/content";
import { cn } from "@/lib/utils";
import { PER_PARTICLE, clusters, cropCss } from "./geometry";
import type { Drag } from "./scene";
import { StaticOrbit } from "./static-orbit";
import { use3D } from "./use-3d";

const OrbitScene = dynamic(() => import("./scene").then((m) => m.OrbitScene), { ssr: false });

const display = "font-(family-name:--font-orbit-display)";

/** The hero visual: live 3D orbit when possible, the still otherwise, with a crop legend and release readout. */
export function OrbitHero() {
  const live = use3D();
  const [ready, setReady] = useState(false);
  // `hovered` follows the pointer; `pinned` keeps the last crop so the readout's links stay reachable.
  const [hovered, setHovered] = useState<Crop | null>(null);
  const [pinned, setPinned] = useState<Crop | null>(null);
  const drag = useRef<Drag>({ x: 0.08, y: 0.4, dragging: false, over: false });
  const last = useRef<{ x: number; y: number } | null>(null);

  const hover = (crop: Crop | null) => {
    setHovered(crop);
    if (crop) setPinned(crop);
  };
  const shown = hovered ?? pinned;
  const cluster = clusters.find((c) => c.crop === shown);

  const onDown = (e: PointerEvent) => {
    last.current = { x: e.clientX, y: e.clientY };
    drag.current.dragging = true;
  };
  const onMove = (e: PointerEvent) => {
    if (!last.current) return;
    const d = drag.current;
    d.y += (e.clientX - last.current.x) * 0.008;
    d.x = Math.max(-0.6, Math.min(0.8, d.x + (e.clientY - last.current.y) * 0.004));
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => {
    last.current = null;
    drag.current.dragging = false;
  };
  const onLeave = () => {
    onUp();
    drag.current.over = false;
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className={cn("relative aspect-square w-full touch-pan-y select-none", live && "cursor-grab active:cursor-grabbing")}
        onPointerDown={live ? onDown : undefined}
        onPointerMove={live ? onMove : undefined}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => (drag.current.over = true)}
        onPointerLeave={onLeave}
      >
        <StaticOrbit
          active={shown}
          className={cn("absolute inset-0 size-full transition-opacity duration-700", live && ready && "opacity-0")}
        />
        {live && (
          <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}>
            <OrbitScene drag={drag} active={shown} onHover={hover} onReady={() => setReady(true)} />
          </div>
        )}
        <p className="pointer-events-none absolute right-0 bottom-0 text-xs text-muted-foreground">
          {live ? "Drag to turn. Hover a cluster or pick a crop." : `One dot per ${formatNumber(PER_PARTICLE)} accessions`}
        </p>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Crops">
        {clusters.map((c) => (
          <li key={c.crop}>
            <button
              type="button"
              aria-pressed={shown === c.crop}
              onPointerEnter={() => hover(c.crop)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => hover(c.crop)}
              onClick={() => hover(c.crop)}
              className={cn(
                "flex items-center gap-2 border-b-2 border-transparent py-1 text-sm",
                shown === c.crop && "border-foreground",
              )}
            >
              <span className="size-3" style={{ background: cropCss(c.index) }} />
              {c.crop}
            </button>
          </li>
        ))}
      </ul>

      <div className="min-h-36 border-t pt-4" aria-live="polite">
        {cluster ? (
          <div>
            <p className={`${display} text-2xl font-semibold tracking-tight`}>
              {cluster.crop}: {formatNumber(cluster.accessions)} accessions
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {cluster.releases.map((r) => (
                <li key={r.doi} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="tabular-nums">{formatNumber(r.accessions)}</span>
                  <span className="text-muted-foreground">
                    {r.assembly}, released {formatDate(r.released)}
                  </span>
                  <a href={r.doi} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                    {r.doi.replace("https://doi.org/", "")}
                    <ArrowUpRightIcon className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <p className={`${display} text-2xl font-semibold tracking-tight`}>
              {formatNumber(totalAccessions)} accessions in orbit
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              One dot per {formatNumber(PER_PARTICLE)} genotyped accessions, grouped by crop. Pick a crop to see its release.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
