import type { ReactNode } from "react";
import { Hairline, type HairlineFigureName } from "@/components/hairline";

// Drawing space: the 400 x 320 Hairline figure sits inside a 480 x 400 sheet with a 40 unit margin
// on every side for dimension lines and balloons.
export const W = 480;
export const H = 400;
export const M = 40;

const ARROW = 7;
const textStyle = { fontFamily: "var(--font-blueprint-display)", letterSpacing: "0.06em" };

function Arrow({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <path
      d={`M0 0 L${-ARROW} ${-ARROW / 2.6} L${-ARROW} ${ARROW / 2.6} Z`}
      transform={`translate(${x} ${y}) rotate(${angle})`}
      fill="var(--bp-accent)"
      stroke="none"
    />
  );
}

/** Text label on a dimension line, with a ground-coloured gap cut into the line behind it. */
function DimLabel({ x, y, text, rotate = 0 }: { x: number; y: number; text: string; rotate?: number }) {
  const w = text.length * 7.6 + 12;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} stroke="none">
      <rect x={-w / 2} y={-10} width={w} height={20} fill="var(--bp-ground)" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="600" fill="var(--bp-ink)" style={textStyle}>
        {text.toUpperCase()}
      </text>
    </g>
  );
}

/** Horizontal dimension from x1 to x2 along y, with extension lines reaching back to `from`. */
export function DimH({ x1, x2, y, from, text }: { x1: number; x2: number; y: number; from: number; text: string }) {
  const dir = from > y ? 1 : -1;
  return (
    <g stroke="var(--bp-accent)" strokeWidth="1" fill="none">
      <line x1={x1} y1={from} x2={x1} y2={y - dir * 6} />
      <line x1={x2} y1={from} x2={x2} y2={y - dir * 6} />
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <Arrow x={x1} y={y} angle={180} />
      <Arrow x={x2} y={y} angle={0} />
      <DimLabel x={(x1 + x2) / 2} y={y} text={text} />
    </g>
  );
}

/** Vertical dimension from y1 to y2 along x, with extension lines reaching back to `from`. */
export function DimV({ y1, y2, x, from, text }: { y1: number; y2: number; x: number; from: number; text: string }) {
  const dir = from > x ? 1 : -1;
  return (
    <g stroke="var(--bp-accent)" strokeWidth="1" fill="none">
      <line x1={from} y1={y1} x2={x - dir * 6} y2={y1} />
      <line x1={from} y1={y2} x2={x - dir * 6} y2={y2} />
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <Arrow x={x} y={y1} angle={-90} />
      <Arrow x={x} y={y2} angle={90} />
      <DimLabel x={x} y={(y1 + y2) / 2} text={text} rotate={-90} />
    </g>
  );
}

/** Leader callout: a lettered balloon with a line ending in a dot on the part. */
export function Leader({ at, to, letter }: { at: [number, number]; to: [number, number]; letter: string }) {
  const [bx, by] = at;
  const [tx, ty] = to;
  const len = Math.hypot(tx - bx, ty - by) || 1;
  const r = 13;
  return (
    <g>
      <line
        x1={bx + ((tx - bx) / len) * r}
        y1={by + ((ty - by) / len) * r}
        x2={tx}
        y2={ty}
        stroke="var(--bp-accent)"
        strokeWidth="1"
      />
      <circle cx={tx} cy={ty} r="3" fill="var(--bp-accent)" />
      <circle cx={bx} cy={by} r={r} fill="var(--bp-ground)" stroke="var(--bp-accent)" strokeWidth="1.4" />
      <text x={bx} y={by + 0.5} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill="var(--bp-ink)" style={textStyle}>
        {letter}
      </text>
    </g>
  );
}

/** Centre lines through the figure: long dash, short dash, as on a drawing. */
function CentreLines() {
  return (
    <g stroke="var(--bp-soft)" strokeWidth="0.7" strokeDasharray="18 4 3 4" opacity="0.7">
      <line x1={W / 2} y1={M - 14} x2={W / 2} y2={H - M + 14} />
      <line x1={M - 14} y1={H / 2} x2={W - M + 14} y2={H / 2} />
    </g>
  );
}

/**
 * A Hairline figure drawn as a view on the sheet, with dimension and leader annotations
 * (in 480 x 400 drawing units) layered over it. The figure keeps answering the pointer.
 */
export function Drawing({
  figure,
  intensity,
  label,
  children,
  className = "",
}: {
  figure: HairlineFigureName;
  intensity?: number;
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative aspect-[6/5] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          <CentreLines />
        </svg>
        <div className="absolute" style={{ left: `${(M / W) * 100}%`, top: `${(M / H) * 100}%`, width: `${((W - 2 * M) / W) * 100}%` }}>
          <Hairline figure={figure} intensity={intensity} />
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
          {children}
        </svg>
      </div>
      <figcaption className="mt-2 text-center font-(family-name:--font-blueprint-display) text-sm font-semibold tracking-[0.2em] uppercase">
        <span className="border-b-2 border-(--bp-ink) pb-0.5">{label}</span>
      </figcaption>
    </figure>
  );
}
