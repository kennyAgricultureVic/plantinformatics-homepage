"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePalette } from "@/components/palette";
import type { Hex } from "@/content";
import { PX_PER_CM, grow, type Geometry, type Lane } from "./model";

const luminance = (hex: Hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Palette colours ordered from most to least contrast against a white (light) or black (dark) ground. */
const byContrast = (colors: readonly Hex[], dark: boolean) =>
  [...colors].sort((a, b) => (dark ? luminance(b) - luminance(a) : luminance(a) - luminance(b)));

type Measured = { geometry: Geometry; height: number; depths: Record<string, number>; leaders: { x1: number; y1: number; x2: number; y2: number }[] };

const DepthContext = createContext<Record<string, number>>({});

/** Depth of a section's top below the soil line, in centimetres on the margin scale. Empty until measured. */
export function Depth({ of, prefix = "" }: { of: string; prefix?: string }) {
  const cm = useContext(DepthContext)[of];
  return cm === undefined ? null : <>{`${prefix}${cm} cm down`}</>;
}

const rel = (el: Element, base: DOMRect) => {
  const r = el.getBoundingClientRect();
  return { left: r.left - base.left, right: r.right - base.left, top: r.top - base.top, bottom: r.bottom - base.top, cx: (r.left + r.right) / 2 - base.left, cy: (r.top + r.bottom) / 2 - base.top };
};

function measure(root: HTMLElement): Measured | null {
  const base = root.getBoundingClientRect();
  const q = (sel: string) => root.querySelector(sel);
  const soil = q("[data-soil]");
  const crown = q("[data-crown]");
  const heroEnd = q("[data-hero-end]");
  const content = q("[data-content]");
  const end = q("[data-root-end]");
  if (!soil || !crown || !heroEnd || !content || !end) return null;

  const width = base.width;
  const soilY = rel(soil, base).top;
  const col = rel(content, base);
  const ruler = width < 640 ? 30 : 44;
  const lanes: Lane[] = [{ left: ruler, right: col.left - 8 }];
  if (width - col.right > 56) lanes.push({ left: col.right + 12, right: width - 12 });

  const nodules = [...root.querySelectorAll<HTMLElement>("[data-nodule]")].map((el) => {
    const r = rel(el, base);
    return { x: r.cx, y: r.cy, count: Number(el.dataset.nodule), ink: el.dataset.ink ?? "var(--ink0)" };
  });
  const hairs = [...root.querySelectorAll<HTMLElement>("[data-hair]")].map((el) => {
    const r = rel(el, base);
    return { x: r.cx, y: r.cy, ring: el.dataset.hair === "tool" };
  });
  const leaders = [...root.querySelectorAll<HTMLElement>("[data-band]")].flatMap((band) => {
    const label = q(`[data-label="${band.dataset.band}"]`);
    if (!label) return [];
    const b = rel(band, base);
    const l = rel(label, base);
    return [{ x1: b.right, y1: b.cy, x2: l.left - 6, y2: l.top + 22 }];
  });
  const depths = Object.fromEntries(
    [...root.querySelectorAll<HTMLElement>("[data-depth]")].map((el) => [el.dataset.depth, Math.max(0, Math.round((rel(el, base).top - soilY) / PX_PER_CM))]),
  );

  return {
    height: base.height,
    depths,
    leaders,
    geometry: {
      width,
      soil: soilY,
      crown: rel(crown, base).cx,
      heroEnd: rel(heroEnd, base).top,
      rootEnd: rel(end, base).top - 28,
      lanes,
      nodules,
      hairs,
    },
  };
}

/**
 * The soil: exposes contrast-ordered inks (--ink0 strongest), measures the page and draws one SVG of
 * roots, ruler and leader lines behind the content. Growth is CSS only and plays once.
 */
export function Soil({ seed, className, children }: { seed: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<Measured | null>(null);
  const [grown, setGrown] = useState(false);
  const { colors } = usePalette();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(el);
        if (!next) return;
        setM((prev) =>
          prev && prev.height === next.height && prev.geometry.width === next.geometry.width && JSON.stringify(prev.depths) === JSON.stringify(next.depths)
            ? prev
            : next,
        );
      });
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  const drawing = useMemo(() => (m ? grow(m.geometry, seed) : null), [m, seed]);

  // After the first growth finishes, later redraws (resize) appear finished.
  const end = drawing?.end ?? 0;
  useEffect(() => {
    if (!end || grown) return;
    const t = window.setTimeout(() => setGrown(true), end + 200);
    return () => window.clearTimeout(t);
  }, [end, grown]);

  const vars = Object.fromEntries([
    ...byContrast(colors, false).map((hex, i) => [`--rl${i}`, hex]),
    ...byContrast(colors, true).map((hex, i) => [`--rd${i}`, hex]),
  ]) as CSSProperties;

  const ticks = useMemo(() => {
    if (!m) return [];
    const out: { y: number; cm: number }[] = [];
    for (let cm = 0, y = m.geometry.soil; y <= m.geometry.rootEnd; cm++, y += PX_PER_CM) out.push({ y, cm });
    return out;
  }, [m]);

  return (
    <div ref={ref} style={vars} className={`roots relative ${className ?? ""}`}>
      <DepthContext value={m?.depths ?? {}}>{children}</DepthContext>
      {m && drawing && (
        <svg
          aria-hidden
          width={m.geometry.width}
          height={m.height}
          className={`roots-svg pointer-events-none absolute inset-0 z-[1] ${grown ? "is-grown" : ""}`}
        >
          <g className="text-foreground">
            {ticks.map(({ y, cm }) => (
              <g key={cm}>
                <line x1={0} x2={cm % 10 === 0 ? 14 : cm % 5 === 0 ? 9 : 5} y1={y} y2={y} stroke="currentColor" strokeOpacity={cm % 5 === 0 ? 0.7 : 0.35} />
                {cm % 10 === 0 && cm > 0 && (
                  <text x={2} y={y + 13} className="roots-scale" fill="currentColor">
                    {cm}
                  </text>
                )}
              </g>
            ))}
            <line x1={0.5} x2={0.5} y1={m.geometry.soil} y2={m.geometry.rootEnd} stroke="currentColor" strokeOpacity={0.35} />
          </g>
          <g fill="none" stroke="currentColor" strokeOpacity={0.45} className="text-foreground">
            {m.leaders.map((l, i) => (
              <path key={i} d={`M${l.x1} ${l.y1}H${l.x1 + 10}L${l.x2 - 10} ${l.y2}H${l.x2}`} strokeWidth={0.75} />
            ))}
          </g>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {drawing.strokes.map((s, i) => (
              <path
                key={i}
                d={s.d}
                pathLength={1}
                stroke={s.ink}
                strokeWidth={s.w}
                className="roots-grow"
                style={{ animationDelay: `${s.delay.toFixed(0)}ms`, animationDuration: `${Math.max(s.dur, 16).toFixed(0)}ms` }}
              />
            ))}
          </g>
          <g>
            {drawing.dots.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill={d.ring ? "var(--background)" : d.ink}
                stroke={d.ring ? d.ink : "var(--background)"}
                strokeWidth={d.ring ? 1.6 : 0.8}
                className="roots-tip"
                style={{ animationDelay: `${d.delay.toFixed(0)}ms` }}
              />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
