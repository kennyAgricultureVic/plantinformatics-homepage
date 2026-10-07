"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { formatDate, formatNumber } from "@/content";
import {
  H,
  INTERVAL,
  W,
  bands,
  elevation,
  hills,
  nearestHill,
  routePath,
  stations,
  tint,
  trail,
  waypoints,
  type Point,
  type Waypoint,
} from "./terrain";

const label = "font-(family-name:--font-contour-display)";
// Map text is haloed in the ground colour so it reads over contour lines.
const halo = { paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 4, strokeLinejoin: "round" } as const;

function viewTransform(wp: Waypoint) {
  const z = wp.zoom;
  const clamp = (v: number, size: number) => Math.min(size - size / (2 * z), Math.max(size / (2 * z), v));
  const x = clamp(wp.x, W);
  const y = clamp(wp.y, H);
  return `translate(${W / 2 - x * z}px, ${H / 2 - y * z}px) scale(${z})`;
}

/** Follows `[data-waypoint]` elements through the viewport and returns the one at the middle. */
function useActiveWaypoint() {
  const [active, setActive] = useState("about");
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-waypoint]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.getAttribute("data-waypoint") ?? "about");
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

/** Index of the data release the reader is pointing at or focused on elsewhere on the page. */
function usePageHighlight() {
  const [index, setIndex] = useState<number | null>(null);
  useEffect(() => {
    const pick = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.("[data-release]");
      setIndex(el ? Number(el.getAttribute("data-release")) : null);
    };
    document.addEventListener("pointerover", pick);
    document.addEventListener("focusin", pick);
    return () => {
      document.removeEventListener("pointerover", pick);
      document.removeEventListener("focusin", pick);
    };
  }, []);
  return index;
}

function TrigPoint({ x, y, active }: Point & { active: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${active ? 1.35 : 1})`}>
      <circle r={9} fill="var(--background)" stroke="currentColor" strokeWidth={1.5} />
      <path d="M0,-5.5L5,3.5L-5,3.5Z" style={{ fill: active ? "var(--p4)" : "currentColor" }} stroke="currentColor" strokeWidth={0.8} />
    </g>
  );
}

export function SurveyMap({ className }: { className?: string }) {
  const active = useActiveWaypoint();
  const highlight = usePageHighlight();
  const plane = useRef<SVGGElement>(null);
  const [probe, setProbe] = useState<Point | null>(null);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const ctm = plane.current?.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    setProbe(p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H ? { x: p.x, y: p.y } : null);
  };

  const near = probe ? nearestHill(probe.x, probe.y) : highlight !== null ? hills[highlight] : null;
  const ground = probe ? Math.round(elevation(probe.x, probe.y) / 10) * 10 : null;
  // A release picked in the text column pulls the map over to its summit.
  const view = highlight !== null ? { x: hills[highlight].x, y: hills[highlight].y, zoom: 1.6 } : (waypoints[active] ?? waypoints.about);
  const peak = hills.reduce((a, b) => Math.max(a, b.release.accessions), 0);

  return (
    <div className={`relative overflow-hidden bg-background text-foreground [--contour-mix:80%] dark:[--contour-mix:68%] ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
        role="img"
        aria-label="Contour map with one hill per data release, its height the number of accessions"
        onPointerMove={onMove}
        onPointerLeave={() => setProbe(null)}
      >
        <g
          ref={plane}
          className="transition-transform duration-1000 ease-in-out motion-reduce:transition-none"
          style={{ transform: viewTransform(view), transformOrigin: "0 0" }}
        >
          <rect width={W} height={H} style={{ fill: tint(0) }} />
          <defs>
            {bands.map((b) => (
              <path key={b.value} id={`contour-${b.value}`} d={b.d} fillRule="evenodd" />
            ))}
          </defs>
          {bands.map((b) => (
            <use key={`f${b.value}`} href={`#contour-${b.value}`} style={{ fill: tint(b.t) }} />
          ))}
          {bands.map((b) => (
            <use
              key={`l${b.value}`}
              href={`#contour-${b.value}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={b.index ? 0.6 : 0.22}
              strokeWidth={b.index ? 1.1 : 0.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* The route: a haloed dashed trail from trailhead to camp. */}
          <path d={routePath} fill="none" stroke="var(--background)" strokeWidth={5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          <path d={routePath} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="7 5" vectorEffect="non-scaling-stroke" />

          <g transform={`translate(${trail.start.x} ${trail.start.y})`}>
            <rect x={-7} y={-7} width={14} height={14} style={{ fill: "var(--p1)" }} stroke="currentColor" strokeWidth={1.5} />
          </g>
          <g transform={`translate(${trail.end.x} ${trail.end.y})`}>
            <path d="M0,-11L9,7L-9,7Z" style={{ fill: active === "news" ? "var(--p4)" : "var(--background)" }} stroke="currentColor" strokeWidth={1.5} />
          </g>

          {stations.map((s) => {
            const on = active === `station-${s.tool.slug}`;
            return (
              <g key={s.tool.slug}>
                <TrigPoint x={s.x} y={s.y} active={on} />
                <text x={s.x + 16} y={s.y + 5} fontSize={on ? 17 : 14} fontWeight={600} fill="currentColor" className={label} style={halo}>
                  {s.tool.name}
                </text>
              </g>
            );
          })}

          {hills.map((h, i) => {
            const lit = near === h || (active === "data" && h.release.accessions === peak);
            const old = "superseded" in h.release;
            return (
              <g key={h.release.doi} transform={`translate(${h.x} ${h.y})`} opacity={old && !lit ? 0.7 : 1}>
                {lit && <circle r={16} fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
                <path d="M0,-6L5.5,4L-5.5,4Z" fill="currentColor" />
                <text y={-12} textAnchor="middle" fontSize={13} fontWeight={600} fill="currentColor" className={label} style={halo}>
                  {h.release.crop}
                </text>
                <text y={20} textAnchor="middle" fontSize={12} fill="currentColor" className="tabular-nums" style={halo}>
                  {formatNumber(h.release.accessions)}
                </text>
                <title>{`${h.release.crop}, released ${formatDate(h.release.released)}: ${formatNumber(h.release.accessions)} accessions (hill ${i + 1})`}</title>
              </g>
            );
          })}

          {probe && near && (
            <g pointerEvents="none">
              <line x1={probe.x} y1={probe.y} x2={near.x} y2={near.y} stroke="currentColor" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
              <path
                d={`M${probe.x - 10},${probe.y}h20M${probe.x},${probe.y - 10}v20`}
                stroke="currentColor"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}
        </g>
      </svg>

      {/* North point */}
      <svg viewBox="-12 -16 24 32" className="pointer-events-none absolute top-4 right-4 h-10 w-7" aria-hidden>
        <path d="M0,-14L7,10L0,5L-7,10Z" fill="currentColor" />
        <text y={-2} textAnchor="middle" fontSize={7} fontWeight={700} fill="var(--background)">
          N
        </text>
      </svg>

      {/* Readout and hypsometric key */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-3 text-xs sm:inset-x-4 sm:bottom-4">
        <div className={`min-w-48 border border-foreground/30 bg-background/90 px-3 py-2 backdrop-blur ${near ? "" : "hidden sm:block"}`} aria-live="polite">
          {near ? (
            <>
              <p className={`${label} text-sm font-semibold`}>
                {near.release.crop}, {formatDate(near.release.released)}
              </p>
              <p className="mt-0.5 tabular-nums">Summit {formatNumber(near.release.accessions)} accessions</p>
              {ground !== null && <p className="text-muted-foreground tabular-nums">Ground here about {formatNumber(ground)}</p>}
            </>
          ) : (
            <p className="text-muted-foreground">Point at the map to read the nearest summit</p>
          )}
        </div>
        <div className="ml-auto border border-foreground/30 bg-background/90 px-3 py-2 backdrop-blur">
          <div
            className="h-2.5 w-28 border border-foreground/30 sm:w-40"
            style={{ background: `linear-gradient(to right, ${[0, 1 / 3, 2 / 3, 1].map(tint).join(", ")})` }}
          />
          <div className="mt-1 flex justify-between tabular-nums">
            <span>0</span>
            <span>{formatNumber(Math.round(peak / 2 / 1000) * 1000)}</span>
            <span>{formatNumber(Math.round(peak / 1000) * 1000)}</span>
          </div>
          <p className="mt-0.5 hidden text-muted-foreground sm:block">Contours every {formatNumber(INTERVAL)} accessions</p>
        </div>
      </div>
    </div>
  );
}
