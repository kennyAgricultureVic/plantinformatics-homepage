import type { CSSProperties, ReactNode } from "react";
import { Hairline } from "@/components/hairline";
import { mix, tone, type StepIndex } from "./scale";

// Five drawn scenes in a 400 × 400 lens. Each keeps the next scene's subject at the exact centre,
// about a tenth of the lens across, so zooming ten times into the centre lands on the next scene.

const INK = "var(--foreground)";
const C = 200;

function Lens({ k, children }: { k: number; children: ReactNode }) {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 size-full [clip-path:circle(50%)]" aria-hidden="true">
      <circle cx={C} cy={C} r={200} style={{ fill: mix(tone(k), 16) }} />
      {children}
    </svg>
  );
}

/** Aerial view of a trial: a grid of drilled plots, one plant alone in the centre plot. */
function Field() {
  const k = 0;
  const pitch = 54;
  const size = 44;
  const plots = [];
  for (let r = -4; r <= 4; r++) {
    for (let c = -4; c <= 4; c++) {
      if (r === 0 && c === 0) continue;
      const x = C + c * pitch - size / 2;
      const y = C + r * pitch - size / 2;
      const j = 1 + (Math.abs(r * 3 + c * 5 + r * c) % 3);
      const pct = 38 + (Math.abs(r * r + c * 7 + 21) % 4) * 14;
      plots.push(
        <g key={`${r}:${c}`}>
          <rect x={x} y={y} width={size} height={size} style={{ fill: mix(tone(k, j), pct) }} />
          {[6, 13, 20, 27, 34, 41].map((dx) => (
            <line key={dx} x1={x + dx - 2} x2={x + dx - 2} y1={y + 3} y2={y + size - 3} stroke={INK} strokeOpacity={0.16} />
          ))}
        </g>,
      );
    }
  }
  return (
    <Lens k={k}>
      {plots}
      <rect x={C - size / 2} y={C - size / 2} width={size} height={size} style={{ fill: mix(tone(k, 1), 14) }} stroke={INK} strokeWidth={1.5} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={C} cy={C - 8} rx={3.2} ry={8} transform={`rotate(${a + 15} ${C} ${C})`} style={{ fill: tone(k, 1) }} stroke={INK} strokeWidth={0.6} />
      ))}
      <circle cx={C} cy={C} r={2.5} style={{ fill: tone(k, 2) }} />
    </Lens>
  );
}

function Ear({ x, y, angle = 0, focus = false, k }: { x: number; y: number; angle?: number; focus?: boolean; k: number }) {
  const grains = [-3, -2, -1, 0, 1, 2, 3];
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <line x1={x - 7} x2={x - 7} y1={y - 52} y2={y + 48} stroke={INK} strokeWidth={1.2} />
      {grains.flatMap((i) =>
        [-1, 1].map((side) => {
          const gx = x - 7 + side * 7;
          const gy = y + i * 14 + (side < 0 ? 7 : 0);
          const hit = focus && i === 0 && side > 0;
          return (
            <g key={`${i}${side}`}>
              <line x1={gx + side * 2} y1={gy - 8} x2={gx + side * 6} y2={gy - 40} stroke={INK} strokeOpacity={0.4} />
              <ellipse
                cx={gx}
                cy={gy}
                rx={6}
                ry={9.5}
                transform={`rotate(${side * 14} ${gx} ${gy})`}
                style={{ fill: hit ? tone(k, 2) : mix(tone(k, 1), 70) }}
                stroke={INK}
                strokeWidth={hit ? 1.6 : 0.8}
              />
            </g>
          );
        }),
      )}
    </g>
  );
}

/** One wheat plant side on, tillers and leaves, the main ear centred on a single grain. */
function Plant() {
  const k = 1;
  const leaf = { fill: mix(tone(k, 3), 62) };
  return (
    <Lens k={k}>
      <rect x={0} y={338} width={400} height={62} style={{ fill: mix(tone(k, 2), 40) }} />
      <path d="M200 340 C196 300 194 270 193 248" fill="none" stroke={INK} strokeWidth={1.6} />
      <path d="M200 340 C180 290 160 240 150 196" fill="none" stroke={INK} strokeWidth={1.3} />
      <path d="M200 340 C220 300 245 260 257 214" fill="none" stroke={INK} strokeWidth={1.3} />
      <path d="M198 318 C160 300 120 300 82 318 C120 296 160 292 198 312Z" style={leaf} stroke={INK} strokeWidth={0.8} />
      <path d="M199 296 C240 270 280 262 322 276 C282 256 240 262 199 290Z" style={leaf} stroke={INK} strokeWidth={0.8} />
      <path d="M176 280 C150 252 120 236 92 236 C124 230 156 244 179 272Z" style={leaf} stroke={INK} strokeWidth={0.8} />
      <path d="M229 290 C260 300 300 330 316 352 C292 322 258 302 227 296Z" style={leaf} stroke={INK} strokeWidth={0.8} />
      <Ear x={150} y={150} angle={-16} k={k} />
      <Ear x={260} y={166} angle={14} k={k} />
      <Ear x={200} y={200} focus k={k} />
    </Lens>
  );
}

const hex = (x: number, y: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** A grain cut lengthwise: bran, aleurone, embryo, and endosperm cells with one at the centre. */
function Seed() {
  const k = 2;
  const r = 14;
  const w = Math.sqrt(3) * r;
  const cells = [];
  for (let row = -6; row <= 6; row++) {
    for (let col = -9; col <= 9; col++) {
      const x = C + col * w + (Math.abs(row) % 2 ? w / 2 : 0);
      const y = C + row * r * 1.5;
      const inside = ((x - C) / 150) ** 2 + ((y - C) / 100) ** 2 < 1;
      const embryo = ((x - 58) / 52) ** 2 + ((y - 236) / 62) ** 2 < 1;
      if (!inside || embryo) continue;
      const centre = row === 0 && col === 0;
      cells.push(
        <polygon
          key={`${row}:${col}`}
          points={hex(x, y, r - 1)}
          style={{ fill: centre ? tone(k, 3) : mix(tone(k, 1), 18 + (Math.abs(row * 5 + col * 3) % 3) * 9) }}
          stroke={INK}
          strokeOpacity={centre ? 1 : 0.35}
          strokeWidth={centre ? 1.6 : 0.8}
        />,
      );
    }
  }
  return (
    <Lens k={k}>
      <ellipse cx={C} cy={C} rx={182} ry={130} style={{ fill: mix(tone(k, 1), 60) }} stroke={INK} strokeWidth={1.6} />
      <ellipse cx={C} cy={C} rx={168} ry={116} style={{ fill: mix(tone(k, 2), 40) }} stroke={INK} strokeOpacity={0.5} />
      <ellipse cx={C} cy={C} rx={158} ry={106} style={{ fill: mix(tone(k, 1), 12) }} />
      {cells}
      <ellipse cx={60} cy={238} rx={46} ry={56} style={{ fill: mix(tone(k, 3), 55) }} stroke={INK} strokeWidth={1.2} />
      <path d="M40 210 C60 226 66 250 52 276" fill="none" stroke={INK} strokeOpacity={0.6} />
      {[-12, -4, 4, 12].map((dy) => (
        <line key={dy} x1={376} y1={C + dy} x2={398} y2={C + dy * 1.6} stroke={INK} strokeOpacity={0.5} />
      ))}
    </Lens>
  );
}

function Chromosome({ x, y, size, angle, color }: { x: number; y: number; size: number; angle: number; color: string }) {
  const a = size * 0.32;
  const h = size / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {[-1, 1].map((s) => (
        <path key={s} d={`M${-a * s} ${-h} Q0 0 ${a * s} ${h}`} fill="none" stroke={color} strokeWidth={size * 0.26} strokeLinecap="round" />
      ))}
      {[-0.32, 0.32].map((t) => (
        <line key={t} x1={-a * 1.1} x2={a * 1.1} y1={h * t * 2.2} y2={h * t * 2.2} stroke={INK} strokeOpacity={0.35} strokeWidth={size * 0.04} />
      ))}
      <circle r={size * 0.09} fill={INK} />
    </g>
  );
}

/** An endosperm cell: walls, starch granules, and the nucleus with its chromosomes. */
function Cell() {
  const k = 3;
  const R = 178;
  const neighbours = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return [C + Math.sqrt(3) * R * Math.cos(a), C + Math.sqrt(3) * R * Math.sin(a)] as const;
  });
  const starch = [
    [110, 120, 20, 14, 20],
    [292, 110, 16, 11, -30],
    [318, 236, 22, 15, 60],
    [96, 262, 18, 13, -10],
    [150, 318, 21, 14, 25],
    [262, 312, 17, 12, -45],
    [80, 190, 12, 9, 80],
    [330, 170, 13, 9, 10],
    [206, 92, 14, 10, 0],
    [208, 334, 12, 9, 70],
  ] as const;
  return (
    <Lens k={k}>
      {neighbours.map(([x, y]) => (
        <polygon key={`${x}`} points={hex(x, y, R)} style={{ fill: mix(tone(k, 1), 14) }} stroke={INK} strokeWidth={2} />
      ))}
      <polygon points={hex(C, C, R)} style={{ fill: mix(tone(k, 1), 26) }} stroke={INK} strokeWidth={2} />
      <polygon points={hex(C, C, R - 9)} fill="none" stroke={INK} strokeOpacity={0.3} />
      {starch.map(([x, y, rx, ry, a]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${a} ${x} ${y})`} style={{ fill: mix(tone(k, 2), 50) }} stroke={INK} strokeOpacity={0.5} />
      ))}
      <circle cx={C} cy={C} r={78} style={{ fill: mix(tone(k, 3), 30) }} stroke={INK} strokeWidth={1.4} />
      <circle cx={C} cy={C} r={72} fill="none" stroke={INK} strokeOpacity={0.3} strokeDasharray="3 4" />
      <circle cx={246} cy={152} r={11} style={{ fill: mix(tone(k, 3), 70) }} />
      <Chromosome x={150} y={188} size={22} angle={-30} color={mix(tone(k, 2), 80)} />
      <Chromosome x={246} y={222} size={20} angle={40} color={mix(tone(k, 2), 80)} />
      <Chromosome x={190} y={252} size={18} angle={80} color={mix(tone(k, 2), 80)} />
      <Chromosome x={218} y={160} size={16} angle={10} color={mix(tone(k, 2), 80)} />
      <Chromosome x={C} y={C} size={40} angle={-12} color={tone(k)} />
    </Lens>
  );
}

/** The descent ends on the Hairline DNA figure, its plates the lens ground and its lines the palette. */
function Helix() {
  const k = 4;
  return (
    <div
      className="absolute inset-0"
      style={
        {
          "--hairline-plate": mix(tone(k), 16),
          "--hairline-hi": INK,
          "--hairline-edge": tone(k, 1),
          "--hairline-mid": mix(tone(k, 2), 70),
          "--hairline-lo": mix(tone(k, 3), 40),
          "--hairline-stroke": "1.1",
        } as CSSProperties
      }
    >
      <Lens k={k}>{null}</Lens>
      <div className="absolute inset-[8%] flex items-center">
        <Hairline figure="dna" intensity={0.55} />
      </div>
    </div>
  );
}

const scenes = [Field, Plant, Seed, Cell, Helix];

export function Scene({ k }: { k: StepIndex }) {
  const Drawn = scenes[k];
  return <Drawn />;
}
