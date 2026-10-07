"use client";

import type { ReactNode } from "react";
import { slotColor, stageNumber, stages, type Slot } from "./stages";

// One set of 48 marks is re-laid out for each stage: seeds in a tray, bases on a helix,
// cells in a call matrix, ticks on a new assembly, rows beside passports, points in a PCA,
// and finally seeds sown in a field. Scroll progress interpolates between neighbouring layouts.

const N = 48;
const VIEW = 400;

type Fill = Slot | "ink";
type Mark = { x: number; y: number; w: number; h: number; r: number; rot: number; fill: Fill; o: number };

/** Deterministic noise in [0, 1) so server and client render identical layouts. */
const rand = (i: number, salt: number) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const fillColor = (f: Fill) => (f === "ink" ? "currentColor" : slotColor(f));
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Genotype call per marker: three allele states, roughly 8% missing. */
const call = (i: number): Fill => (rand(i, 7) < 0.08 ? "ink" : ([1, 2, 3] as const)[Math.floor(rand(i, 3) * 3)]);
const callOpacity = (i: number) => (call(i) === "ink" ? 0.18 : 1);

// Stage geometry shared between mark layouts and overlays.
const helix = (i: number) => {
  const t = Math.floor(i / 2) / (N / 2 - 1);
  const angle = t * Math.PI * 3.2 + (i % 2) * Math.PI;
  return { x: 200 + Math.sin(angle) * 58, y: 55 + t * 290, depth: Math.cos(angle) };
};
const remapOld = (i: number) => 55 + (i / (N - 1)) * 290;
const remapNew = (i: number) => {
  // Markers 16 to 29 sit in an inverted block on the new assembly.
  const slot = i >= 16 && i <= 29 ? 45 - i : i;
  return 55 + clamp(slot / (N - 1) + (rand(i, 5) - 0.5) * 0.02) * 290;
};
const flagged = (i: number) => rand(i, 9) < 0.12;
const joinRowY = (row: number) => 62 + row * 24;
const clusters = [
  { x: 140, y: 150, slot: 2 },
  { x: 268, y: 128, slot: 3 },
  { x: 214, y: 262, slot: 4 },
] as const;
const gauss = (i: number, salt: number) =>
  Math.sqrt(-2 * Math.log(Math.max(rand(i, salt), 1e-3))) * Math.cos(2 * Math.PI * rand(i, salt + 1));
const field = (i: number) => ({ x: 48 + (i % 16) * 20.2, y: 232 + Math.floor(i / 16) * 58 });
const selected = (i: number) => i % 3 === 1 && rand(i, 11) < 0.5;

const layoutFns: readonly ((i: number) => Mark)[] = [
  // Seed: a mound of seeds in the genebank tray.
  (i) => {
    const u = rand(i, 1) * 2 - 1;
    return { x: 200 + u * 105, y: 322 - rand(i, 2) * 70 * (1 - u * u), w: 14, h: 8, r: 4, rot: rand(i, 4) * 180, fill: 1, o: 1 };
  },
  // DNA sample: two strands of a helix in a tube.
  (i) => {
    const { x, y, depth } = helix(i);
    return { x, y, w: 10, h: 10, r: 5, rot: 0, fill: i % 2 ? 4 : 2, o: 0.4 + 0.6 * ((depth + 1) / 2) };
  },
  // Genotype calls: an 8 by 6 matrix of allele states.
  (i) => ({ x: 200 + ((i % 8) - 3.5) * 36, y: 110 + Math.floor(i / 8) * 36, w: 28, h: 28, r: 2, rot: 0, fill: call(i), o: callOpacity(i) }),
  // Remapping: ticks on the new assembly.
  (i) => ({ x: 310, y: remapNew(i), w: 24, h: 2.5, r: 1.25, rot: 0, fill: flagged(i) ? "ink" : 4, o: flagged(i) ? 0.35 : 1 }),
  // Passport join: genotype rows waiting for their passport records.
  (i) => ({ x: 52 + (i % 4) * 16, y: joinRowY(Math.floor(i / 4)), w: 12, h: 12, r: 2, rot: 0, fill: call(i), o: callOpacity(i) }),
  // Views: three clusters in a PCA.
  (i) => {
    const c = clusters[i % 3];
    return { x: c.x + gauss(i, 20) * 26, y: c.y + gauss(i, 30) * 24, w: 10, h: 10, r: 5, rot: 0, fill: c.slot, o: 0.9 };
  },
  // Decision: seeds sown in furrows, the chosen few in colour.
  (i) => {
    const { x, y } = field(i);
    const pick = selected(i);
    return { x, y, w: pick ? 15 : 12, h: pick ? 9 : 7, r: 4, rot: (rand(i, 12) - 0.5) * 40, fill: pick ? 3 : "ink", o: pick ? 1 : 0.3 };
  },
];

const layouts = layoutFns.map((fn) => range(N).map(fn));
const last = layouts.length - 1;

const label = "fill-current [font-family:var(--font-plex-mono)] text-[11px] tracking-wide uppercase";

// Static line work drawn behind the marks for each stage, faded in near that stage.
const overlays: readonly ReactNode[] = [
  <g key="seed">
    {range(12).map((d) => {
      const x = 54 + (d % 4) * 76;
      const y = 50 + Math.floor(d / 4) * 56;
      return (
        <g key={d}>
          <rect x={x} y={y} width={64} height={46} fill="none" stroke={d === 9 ? slotColor(1) : "currentColor"} strokeOpacity={d === 9 ? 1 : 0.35} strokeWidth={d === 9 ? 2 : 1} />
          <line x1={x + 24} x2={x + 40} y1={y + 23} y2={y + 23} stroke="currentColor" strokeOpacity={0.5} strokeWidth={2} />
        </g>
      );
    })}
    <path d="M78 248 V334 H322 V248" fill="none" stroke="currentColor" strokeWidth={1.5} />
    <text x={200} y={360} textAnchor="middle" className={label}>
      genebank tray
    </text>
  </g>,
  <g key="sample">
    <path d="M125 30 V300 a75 75 0 0 0 150 0 V30" fill="none" stroke="currentColor" strokeOpacity={0.5} />
    <line x1={113} x2={287} y1={30} y2={30} stroke="currentColor" strokeWidth={2} />
    {range(N / 2).map((p) => {
      const a = helix(p * 2);
      const b = helix(p * 2 + 1);
      return <line key={p} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={0.25} />;
    })}
  </g>,
  <g key="calls">
    <text x={74} y={84} className={label}>
      markers →
    </text>
    <text x={0} y={0} transform="translate(46 98) rotate(90)" className={label}>
      accessions →
    </text>
    {(
      [
        [1, "AA"],
        [2, "AB"],
        [3, "BB"],
        ["ink", "missing"],
      ] as const
    ).map(([fill, name], k) => (
      <g key={name} transform={`translate(${74 + k * 70} 340)`}>
        <rect width={12} height={12} fill={fillColor(fill)} fillOpacity={fill === "ink" ? 0.18 : 1} />
        <text x={18} y={10} className={label}>
          {name}
        </text>
      </g>
    ))}
  </g>,
  <g key="remap">
    <rect x={82} y={50} width={16} height={300} rx={8} fill="none" stroke="currentColor" strokeOpacity={0.6} />
    <rect x={302} y={50} width={16} height={300} rx={8} fill="none" stroke="currentColor" strokeOpacity={0.6} />
    {range(N).map((i) => {
      const yo = remapOld(i);
      const yn = remapNew(i);
      return (
        <g key={i}>
          <line x1={76} x2={104} y1={yo} y2={yo} stroke="currentColor" strokeOpacity={0.6} />
          <path
            d={`M104 ${yo} C200 ${yo} 200 ${yn} 296 ${yn}`}
            fill="none"
            stroke={flagged(i) ? "currentColor" : slotColor(4)}
            strokeOpacity={flagged(i) ? 0.3 : 0.55}
            strokeDasharray={flagged(i) ? "3 3" : undefined}
          />
        </g>
      );
    })}
    <text x={90} y={38} textAnchor="middle" className={label}>
      previous
    </text>
    <text x={310} y={38} textAnchor="middle" className={label}>
      new assembly
    </text>
    <text x={200} y={378} textAnchor="middle" className={label}>
      - - - flagged as ambiguous
    </text>
  </g>,
  <g key="join">
    {range(N / 4).map((row) => {
      const y = joinRowY(row);
      const bar = 30 + rand(row, 40) * 40;
      return (
        <g key={row}>
          <path d={`M112 ${y} C160 ${y} 160 194 178 194 M222 194 C240 194 240 ${y} 262 ${y}`} fill="none" stroke="currentColor" strokeOpacity={0.2} />
          <rect x={262} y={y - 8} width={92} height={16} fill="none" stroke="currentColor" strokeOpacity={0.5} />
          <rect x={268} y={y - 3} width={bar} height={2} fill="currentColor" fillOpacity={0.5} />
          <rect x={268} y={y + 2} width={bar * 0.6} height={1.5} fill="currentColor" fillOpacity={0.3} />
        </g>
      );
    })}
    <circle cx={200} cy={194} r={22} fill={slotColor(1)} />
    <circle cx={200} cy={194} r={8} fill="none" stroke="var(--p1-fg)" strokeWidth={2} />
    <text x={76} y={40} textAnchor="middle" className={label}>
      genotypes
    </text>
    <text x={308} y={40} textAnchor="middle" className={label}>
      passports
    </text>
  </g>,
  <g key="views">
    <path d="M48 40 V340 H360" fill="none" stroke="currentColor" strokeOpacity={0.6} />
    <text x={360} y={358} textAnchor="end" className={label}>
      PC1
    </text>
    <text x={56} y={48} className={label}>
      PC2
    </text>
    <path
      d="M222 96 C240 62 314 68 320 118 C326 162 280 178 246 168 C212 158 204 118 222 96 Z"
      fill="none"
      stroke="currentColor"
      strokeDasharray="4 3"
      strokeWidth={1.5}
    />
    <text x={326} y={76} className={label}>
      lasso
    </text>
  </g>,
  <g key="decision">
    {range(3).map((row) => (
      <line key={row} x1={30} x2={370} y1={238 + row * 58} y2={238 + row * 58} stroke="currentColor" strokeOpacity={0.35} />
    ))}
    {range(N)
      .filter(selected)
      .map((i) => {
        const { x, y } = field(i);
        const h = 34 + rand(i, 13) * 16;
        const top = y - 6 - h;
        return (
          <g key={i}>
            <path d={`M${x} ${y - 6} V${top}`} stroke={slotColor(3)} strokeWidth={2} />
            <path d={`M${x} ${top + h * 0.45} q-16 -4 -18 -18 q14 0 18 18`} fill={slotColor(3)} />
            <path d={`M${x} ${top + h * 0.2} q16 -4 18 -18 q-14 0 -18 18`} fill={slotColor(3)} />
          </g>
        );
      })}
    <text x={30} y={60} className={label}>
      {range(N).filter(selected).length} lines chosen to cross
    </text>
  </g>,
];

/** Interpolated mark for particle `i` at fractional `progress`, staggered so marks flow rather than jump. */
const markAt = (i: number, progress: number): Mark => {
  const a = Math.min(Math.floor(progress), last);
  const b = Math.min(a + 1, last);
  const delay = (i / N) * 0.35;
  const t = ease(clamp((progress - a - delay) / 0.65));
  const from = layouts[a][i];
  const to = layouts[b][i];
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    w: lerp(from.w, to.w, t),
    h: lerp(from.h, to.h, t),
    r: lerp(from.r, to.r, t),
    rot: lerp(from.rot, to.rot, t),
    fill: t < 0.5 ? from.fill : to.fill,
    o: lerp(from.o, to.o, t),
  };
};

const fixed = (n: number) => n.toFixed(2);

type PipelineDiagramProps = {
  /** 0 to 6: fractional stage index from the scroll position. */
  progress: number;
  onJump: (stage: number) => void;
};

/** Sticky SVG for the scroll story, plus a stage readout that doubles as chapter navigation. */
export function PipelineDiagram({ progress, onJump }: PipelineDiagramProps) {
  const current = Math.round(progress);
  const stage = stages[current];

  return (
    <div className="flex h-full flex-col">
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="min-h-0 w-full flex-1 text-foreground" role="img" aria-label={`Pipeline diagram: ${stage.label}`}>
        <defs>
          <pattern id="seed-to-data-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <path d="M10 8 V12 M8 10 H12" stroke="currentColor" strokeOpacity={0.18} />
          </pattern>
        </defs>
        <rect width={VIEW} height={VIEW} fill="url(#seed-to-data-grid)" />
        {overlays.map((overlay, s) => {
          const weight = clamp(1 - Math.abs(progress - s) * 1.8);
          return weight > 0 ? (
            <g key={s} opacity={weight} transform={`translate(0 ${fixed((1 - weight) * 10)})`}>
              {overlay}
            </g>
          ) : null;
        })}
        {range(N).map((i) => {
          const m = markAt(i, progress);
          return (
            <rect
              key={i}
              x={fixed(-m.w / 2)}
              y={fixed(-m.h / 2)}
              width={fixed(m.w)}
              height={fixed(m.h)}
              rx={fixed(m.r)}
              transform={`translate(${fixed(m.x)} ${fixed(m.y)}) rotate(${fixed(m.rot)})`}
              opacity={fixed(m.o)}
              style={{ fill: fillColor(m.fill), transition: "fill 300ms" }}
            />
          );
        })}
      </svg>

      <div className="px-4 pb-3 sm:px-8 sm:pb-6">
        <p className="flex items-baseline gap-3">
          <span className="[font-family:var(--font-syne)] text-3xl font-extrabold sm:text-5xl" style={{ color: slotColor(stage.slot) }}>
            {stageNumber(current)}
          </span>
          <span className="[font-family:var(--font-plex-mono)] text-xs tracking-widest uppercase sm:text-sm">
            {stage.label}
          </span>
          <span className="ml-auto [font-family:var(--font-plex-mono)] text-xs tabular-nums">/ {stageNumber(last)}</span>
        </p>
        <div className="mt-2 flex gap-1">
          {stages.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Go to stage ${stageNumber(i)}: ${s.label}`}
              aria-current={i === current ? "step" : undefined}
              className="group relative h-6 flex-1 outline-offset-2 focus-visible:outline-2 focus-visible:outline-foreground"
            >
              <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-foreground/15 group-hover:bg-foreground/30" />
              <span
                className="absolute top-1/2 left-0 h-1 -translate-y-1/2"
                style={{ width: `${clamp(progress - i + 1) * 100}%`, background: slotColor(s.slot) }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
