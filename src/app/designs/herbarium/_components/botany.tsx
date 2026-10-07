import type { ReactNode } from "react";
import type { Crop } from "@/content";

// Hand-built botanical line drawings. Every plant is assembled from a few primitives (spike, blade,
// pinnate leaf, pod, flower, roots) placed along quadratic-bezier stems in a 300 x 620 viewBox.
// Lines use currentColor so they follow the theme; accents (seeds, petals, nodules) use var(--p3).

type Pt = readonly [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;
const s = ([x, y]: Pt) => `${r1(x)} ${r1(y)}`;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Point `len` away from `p`, heading `deg` degrees clockwise from straight up. */
const polar = ([x, y]: Pt, deg: number, len: number): Pt => [x + len * Math.sin(toRad(deg)), y - len * Math.cos(toRad(deg))];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const heading = (a: Pt, b: Pt) => toDeg(Math.atan2(b[0] - a[0], a[1] - b[1]));

/** Point and heading at `t` along the quadratic bezier p0 -> c -> p1. */
const quad = (p0: Pt, c: Pt, p1: Pt, t: number) => {
  const u = 1 - t;
  const at: Pt = [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  const dx = 2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
  const dy = 2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
  return { at, deg: toDeg(Math.atan2(dx, -dy)) };
};

/** Small deterministic PRNG (mulberry32) so server and client draw the same plant. */
const prng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Closed lens outline from `base` to `tip`. `width` is the bezier bulge; `at` moves the widest point. */
const lens = (base: Pt, tip: Pt, width: number, at = 0.5) => {
  const h = heading(base, tip);
  const mid = lerp(base, tip, at);
  return `M${s(base)}Q${s(polar(mid, h + 90, width))} ${s(tip)}Q${s(polar(mid, h - 90, width))} ${s(base)}Z`;
};

/** Spiral tendril as a polyline that tightens as it turns. */
const curl = (start: Pt, deg: number, len: number, dir: 1 | -1) => {
  const n = 22;
  let p = start;
  let a = deg;
  const pts = [p];
  for (let i = 0; i < n; i++) {
    a += dir * (6 + i * 1.6);
    p = polar(p, a, (len / n) * (1 - i / (n * 1.4)));
    pts.push(p);
  }
  return `M${pts.map(s).join("L")}`;
};

const accent = { fill: "var(--p3)", fillOpacity: 0.55 } as const;

type SpikeSpec = { length: number; count: number; width: number; awn: number; droop: number };

// Cereal ear: alternating spikelets along a curved rachis, each with an awn.
function Spike({ base, angle, length, count, width, awn, droop }: SpikeSpec & { base: Pt; angle: number }) {
  const tip = polar(base, angle + droop, length);
  const ctrl = polar(base, angle, length * 0.55);
  const rand = prng(Math.round(base[0] * 31 + base[1]));
  return (
    <g>
      <path d={`M${s(base)}Q${s(ctrl)} ${s(tip)}`} />
      {Array.from({ length: count }, (_, i) => {
        const t = 0.04 + (0.94 * i) / (count - 1);
        const { at, deg } = quad(base, ctrl, tip, t);
        const side = i % 2 ? 1 : -1;
        const size = width * (t > 0.75 ? 1 - (t - 0.75) * 1.8 : 1);
        const sa = deg + side * 24;
        const end = polar(at, sa, size * 2.3);
        return (
          <g key={i}>
            <path d={lens(at, end, size * 0.9, 0.45)} />
            {awn > 0 && <path d={`M${s(end)}L${s(polar(end, deg + side * 6, awn * (0.75 + rand() * 0.35)))}`} strokeWidth={0.5} />}
          </g>
        );
      })}
    </g>
  );
}

type BladeSpec = { angle: number; bend: number; length: number; width?: number };

// Grass leaf blade that arcs and droops from its node, with a midrib.
function Blade({ base, angle, bend, length, width = 5 }: BladeSpec & { base: Pt }) {
  const tip = polar(base, angle + bend, length);
  const ctrl = polar(base, angle, length * 0.6);
  return (
    <g>
      <path d={`M${s(base)}Q${s(polar(ctrl, angle + 90, width))} ${s(tip)}Q${s(polar(ctrl, angle - 90, width))} ${s(base)}Z`} />
      <path d={`M${s(base)}Q${s(ctrl)} ${s(tip)}`} strokeWidth={0.4} />
    </g>
  );
}

// Fibrous root mass, or a taproot with laterals and nitrogen nodules for legumes.
function Roots({ at, seed, taproot }: { at: Pt; seed: number; taproot?: boolean }) {
  const rand = prng(seed);
  const count = taproot ? 9 : 16;
  return (
    <g strokeWidth={0.6}>
      {taproot && <path d={`M${s(at)}Q${s([at[0] + 6, at[1] + 40])} ${s([at[0] - 2, at[1] + 92])}`} strokeWidth={1.2} />}
      {Array.from({ length: count }, (_, i) => {
        const origin = taproot ? polar(at, 180, 8 + i * 8) : at;
        let a = 180 + (i / (count - 1) - 0.5) * (taproot ? 200 : 150) + (rand() - 0.5) * 16;
        let p = origin;
        let d = `M${s(p)}`;
        const steps = 4;
        const reach = taproot ? 38 - i * 2.5 : 70 + rand() * 25;
        const nodules: Pt[] = [];
        for (let k = 0; k < steps; k++) {
          a += (180 - a) * 0.22 + (rand() - 0.5) * 26;
          p = polar(p, a, (reach / steps) * (0.7 + rand() * 0.6));
          d += `L${s(p)}`;
          if (taproot && rand() > 0.6) nodules.push(p);
        }
        return (
          <g key={i}>
            <path d={d} />
            {nodules.map((n, k) => (
              <circle key={k} cx={r1(n[0])} cy={r1(n[1])} r={1.8} {...accent} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

type Culm = { top: Pt; bend: number; spike: SpikeSpec; leaves: readonly number[] };

// A tufted cereal: culms with nodes and blades rising from one crown, an ear on each.
function Grass({ crown, culms, basal, seed }: { crown: Pt; culms: readonly Culm[]; basal: readonly BladeSpec[]; seed: number }) {
  return (
    <>
      <Roots at={crown} seed={seed} />
      {basal.map((b, i) => (
        <Blade key={i} base={crown} {...b} />
      ))}
      {culms.map((culm, i) => {
        const mid = lerp(crown, culm.top, 0.5);
        const ctrl: Pt = [mid[0] + culm.bend, mid[1]];
        const end = quad(crown, ctrl, culm.top, 1);
        return (
          <g key={i}>
            <path d={`M${s(crown)}Q${s(ctrl)} ${s(culm.top)}`} strokeWidth={1.1} />
            {culm.leaves.map((t, k) => {
              const { at, deg } = quad(crown, ctrl, culm.top, t);
              const side = (k + i) % 2 ? 1 : -1;
              return (
                <g key={k}>
                  <path d={`M${s(polar(at, deg - 90, 2.4))}L${s(polar(at, deg + 90, 2.4))}`} strokeWidth={1.2} />
                  <Blade base={at} angle={deg + side * 26} bend={side * (40 + k * 8)} length={78 + k * 12} width={4.4} />
                </g>
              );
            })}
            <Spike base={culm.top} angle={end.deg} {...culm.spike} />
          </g>
        );
      })}
    </>
  );
}

type LeafSpec = {
  pairs: number;
  rx: number;
  ry: number;
  length: number;
  tendril: "none" | "simple" | "branched";
  stipule?: number;
};

// Compound legume leaf: paired leaflets on a rachis, ending in a terminal leaflet or tendrils.
function Pinnate({ base, angle, pairs, rx, ry, length, tendril }: LeafSpec & { base: Pt; angle: number }) {
  const tip = polar(base, angle, length);
  const ctrl = polar(base, angle - 8, length * 0.5);
  return (
    <g>
      <path d={`M${s(base)}Q${s(ctrl)} ${s(tip)}`} strokeWidth={0.6} />
      {Array.from({ length: pairs }, (_, k) => {
        const t = pairs > 1 ? 0.3 + (0.62 * k) / (pairs - 1) : 0.6;
        const { at, deg } = quad(base, ctrl, tip, t);
        return [-1, 1].map((side) => {
          const la = deg + side * 58;
          const c = polar(at, la, rx);
          return (
            <g key={`${k}${side}`}>
              <ellipse cx={r1(c[0])} cy={r1(c[1])} rx={rx} ry={ry} transform={`rotate(${r1(la - 90)} ${r1(c[0])} ${r1(c[1])})`} />
              <path d={`M${s(at)}L${s(polar(c, la, rx * 0.7))}`} strokeWidth={0.3} />
            </g>
          );
        });
      })}
      {tendril === "none" && (() => {
        const c = polar(tip, angle, rx);
        return <ellipse cx={r1(c[0])} cy={r1(c[1])} rx={rx} ry={ry} transform={`rotate(${r1(angle - 90)} ${r1(c[0])} ${r1(c[1])})`} />;
      })()}
      {tendril === "simple" && <path d={curl(tip, angle, 26, 1)} strokeWidth={0.5} />}
      {tendril === "branched" &&
        ([-28, 0, 28] as const).map((off, i) => <path key={off} d={curl(tip, angle + off, 34, i % 2 ? 1 : -1)} strokeWidth={0.5} />)}
    </g>
  );
}

type PodSpec = { length: number; width: number; seeds: number; hairy?: boolean };

// Legume pod with seeds showing through and an optional downy margin (chickpea).
function Pod({ base, angle, length, width, seeds, hairy }: PodSpec & { base: Pt; angle: number }) {
  const tip = polar(base, angle, length);
  return (
    <g>
      <path d={lens(base, tip, width, 0.55)} />
      <path d={`M${s(tip)}L${s(polar(tip, angle + 25, 5))}`} />
      {Array.from({ length: seeds }, (_, j) => {
        const c = lerp(base, tip, (j + 1) / (seeds + 1));
        return <circle key={j} cx={r1(c[0])} cy={r1(c[1])} r={r1(Math.min(width * 0.28, (length / seeds) * 0.38))} {...accent} />;
      })}
      {hairy &&
        Array.from({ length: 18 }, (_, j) => {
          const t = 0.1 + (0.8 * (j % 9)) / 8;
          const side = j < 9 ? 1 : -1;
          const edge = polar(lerp(base, tip, t), angle + side * 90, width * 0.5 * Math.sin(Math.PI * t) + 0.5);
          return <path key={j} d={`M${s(edge)}L${s(polar(edge, angle + side * 70, 3.5))}`} strokeWidth={0.3} />;
        })}
    </g>
  );
}

// Papilionaceous flower: calyx, a tinted standard petal and the keel.
function Flower({ base, angle, size }: { base: Pt; angle: number; size: number }) {
  const banner = polar(base, angle, size * 1.25);
  return (
    <g>
      <circle cx={r1(banner[0])} cy={r1(banner[1])} r={r1(size * 0.8)} {...accent} />
      <path d={lens(base, polar(base, angle, size * 0.7), size * 0.6)} />
      <path d={lens(polar(base, angle, size * 0.5), polar(base, angle + 25, size * 1.8), size * 0.55)} />
    </g>
  );
}

type LegumeSpec = {
  crown: Pt;
  seed: number;
  stems: readonly { top: Pt; bend: number; nodes: number }[];
  leaf: LeafSpec;
  pod: PodSpec;
  flower: number;
};

// A branching legume: alternate compound leaves, with pods and flowers in the leaf axils.
function Legume({ crown, seed, stems, leaf, pod, flower }: LegumeSpec) {
  return (
    <>
      <Roots at={crown} seed={seed} taproot />
      {stems.map((stem, i) => {
        const mid = lerp(crown, stem.top, 0.5);
        const ctrl: Pt = [mid[0] + stem.bend, mid[1]];
        const end = quad(crown, ctrl, stem.top, 1);
        return (
          <g key={i}>
            <path d={`M${s(crown)}Q${s(ctrl)} ${s(stem.top)}`} strokeWidth={1} />
            {Array.from({ length: stem.nodes }, (_, k) => {
              const { at, deg } = quad(crown, ctrl, stem.top, (k + 1) / (stem.nodes + 1));
              const side = (k + i) % 2 ? 1 : -1;
              const fruiting = k % 3 === 2;
              const flowering = k % 3 === 1 && k > stem.nodes / 2;
              const stalk = polar(at, deg - side * 60, 12);
              return (
                <g key={k}>
                  {leaf.stipule &&
                    [-1, 1].map((d) => <path key={d} d={lens(at, polar(at, deg + d * 38, leaf.stipule ?? 0), (leaf.stipule ?? 0) * 0.45, 0.4)} />)}
                  <Pinnate base={at} angle={deg + side * 52} {...leaf} length={leaf.length * (1 - (0.35 * k) / stem.nodes)} />
                  {(fruiting || flowering) && <path d={`M${s(at)}L${s(stalk)}`} strokeWidth={0.6} />}
                  {fruiting && <Pod base={stalk} angle={deg - side * 125} {...pod} />}
                  {flowering && <Flower base={stalk} angle={deg - side * 50} size={flower} />}
                </g>
              );
            })}
            <path d={lens(stem.top, polar(stem.top, end.deg, 9), 4)} />
          </g>
        );
      })}
    </>
  );
}

// Shared SVG frame: hairline ink that stays one pixel wide however large the sheet renders.
function Plate({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 300 620" role="img" aria-label={`Line drawing of ${label}`} className={className} preserveAspectRatio="xMidYMax meet">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}>
        {children}
      </g>
    </svg>
  );
}

type DrawingProps = { className?: string };

function Wheat({ className }: DrawingProps) {
  return (
    <Plate label="wheat, Triticum aestivum" className={className}>
      <Grass
        crown={[150, 520]}
        seed={7}
        culms={[
          { top: [118, 128], bend: -16, spike: { length: 104, count: 20, width: 6.4, awn: 15, droop: -6 }, leaves: [0.24, 0.5, 0.74] },
          { top: [190, 150], bend: 22, spike: { length: 96, count: 18, width: 6.2, awn: 13, droop: 8 }, leaves: [0.3, 0.58] },
          { top: [62, 250], bend: -8, spike: { length: 84, count: 16, width: 5.8, awn: 12, droop: -12 }, leaves: [0.32, 0.62] },
          { top: [236, 268], bend: 18, spike: { length: 80, count: 16, width: 5.6, awn: 12, droop: 14 }, leaves: [0.4] },
        ]}
        basal={[
          { angle: -70, bend: -60, length: 110 },
          { angle: -38, bend: -72, length: 136 },
          { angle: 52, bend: 66, length: 122 },
          { angle: 82, bend: 48, length: 92 },
          { angle: 18, bend: 84, length: 146 },
        ]}
      />
    </Plate>
  );
}

function Barley({ className }: DrawingProps) {
  return (
    <Plate label="barley, Hordeum vulgare" className={className}>
      <Grass
        crown={[150, 520]}
        seed={19}
        culms={[
          { top: [132, 196], bend: -12, spike: { length: 84, count: 24, width: 4.4, awn: 96, droop: 26 }, leaves: [0.26, 0.52, 0.76] },
          { top: [200, 214], bend: 20, spike: { length: 78, count: 22, width: 4.2, awn: 88, droop: 30 }, leaves: [0.32, 0.6] },
          { top: [78, 282], bend: -14, spike: { length: 70, count: 20, width: 4, awn: 80, droop: -24 }, leaves: [0.36, 0.66] },
        ]}
        basal={[
          { angle: -64, bend: -66, length: 118 },
          { angle: 46, bend: 70, length: 128 },
          { angle: 78, bend: 52, length: 96 },
          { angle: -24, bend: -80, length: 140 },
        ]}
      />
    </Plate>
  );
}

function Chickpea({ className }: DrawingProps) {
  return (
    <Plate label="chickpea, Cicer arietinum" className={className}>
      <Legume
        crown={[150, 520]}
        seed={3}
        stems={[
          { top: [150, 112], bend: 14, nodes: 9 },
          { top: [70, 236], bend: -34, nodes: 6 },
          { top: [236, 214], bend: 32, nodes: 7 },
        ]}
        leaf={{ pairs: 6, rx: 6.4, ry: 4, length: 54, tendril: "none" }}
        pod={{ length: 24, width: 18, seeds: 1, hairy: true }}
        flower={6}
      />
    </Plate>
  );
}

function FieldPea({ className }: DrawingProps) {
  return (
    <Plate label="field pea, Pisum sativum" className={className}>
      <Legume
        crown={[150, 520]}
        seed={11}
        stems={[
          { top: [168, 84], bend: -30, nodes: 8 },
          { top: [84, 232], bend: -22, nodes: 5 },
        ]}
        leaf={{ pairs: 2, rx: 15, ry: 9, length: 62, tendril: "branched", stipule: 22 }}
        pod={{ length: 64, width: 15, seeds: 6 }}
        flower={10}
      />
    </Plate>
  );
}

function Lentil({ className }: DrawingProps) {
  return (
    <Plate label="lentil, Lens culinaris" className={className}>
      <Legume
        crown={[150, 520]}
        seed={23}
        stems={[
          { top: [142, 118], bend: -12, nodes: 10 },
          { top: [78, 214], bend: -22, nodes: 7 },
          { top: [222, 182], bend: 26, nodes: 8 },
          { top: [192, 270], bend: 12, nodes: 5 },
        ]}
        leaf={{ pairs: 5, rx: 7, ry: 2.3, length: 46, tendril: "simple" }}
        pod={{ length: 16, width: 11, seeds: 2 }}
        flower={4}
      />
    </Plate>
  );
}

/** One drawing per released crop. Usage: `const Drawing = specimens[crop]; <Drawing className="h-80" />`. */
export const specimens = {
  Wheat,
  Barley,
  Chickpea,
  "Field pea": FieldPea,
  Lentil,
} satisfies Record<Crop, (props: DrawingProps) => ReactNode>;

/** Latin binomial for each crop, set in italics on labels. */
export const binomials = {
  Wheat: "Triticum aestivum",
  Barley: "Hordeum vulgare",
  Chickpea: "Cicer arietinum",
  "Field pea": "Pisum sativum",
  Lentil: "Lens culinaris",
} satisfies Record<Crop, string>;
