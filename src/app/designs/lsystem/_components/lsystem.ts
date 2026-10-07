// A small stochastic L-system engine: seeded PRNG, string rewriting and a turtle that
// turns the rewritten string into flat geometry arrays a canvas can draw in a few calls.

import type { Hex } from "@/content";

export type Successor = { readonly p: number; readonly s: string };

export type Grammar = {
  readonly name: string;
  readonly axiom: string;
  /** Stochastic productions. Probabilities for a symbol should sum to 1. */
  readonly rules: Readonly<Record<string, readonly Successor[]>>;
  /** Applied once after the last generation, turning growing tips into heads, pods or seeds. */
  readonly flower: Readonly<Record<string, string>>;
  /** Branch angle in degrees. */
  readonly angle: number;
  readonly generations: number;
};

/** mulberry32: tiny, fast, good enough for art. Returns floats in [0, 1). */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Rand = ReturnType<typeof mulberry32>;

/** Mixes numbers (and strings) into one 32-bit seed. */
export const hashSeed = (...parts: readonly (number | string)[]) => {
  let h = 0x811c9dc5;
  for (const part of parts) {
    for (const ch of String(part)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    h = Math.imul(h ^ 0x2f, 16777619);
  }
  return h >>> 0;
};

const pick = (options: readonly Successor[], rand: Rand) => {
  if (options.length === 1) return options[0].s;
  let r = rand();
  for (const o of options) {
    r -= o.p;
    if (r <= 0) return o.s;
  }
  return options[options.length - 1].s;
};

/** Every generation of a grammar, axiom first, flowered final string last. */
export const grow = (g: Grammar, rand: Rand) => {
  const out = [g.axiom];
  for (let i = 0; i < g.generations; i++) {
    let next = "";
    for (const ch of out[i]) {
      const options = g.rules[ch];
      next += options ? pick(options, rand) : ch;
    }
    out.push(next);
  }
  const last = out[out.length - 1];
  out.push([...last].map((ch) => g.flower[ch] ?? ch).join(""));
  return out;
};

/** Turtle output in unit space (y grows downward, plant base at 0,0). */
export type Shape = {
  stems: number[]; // x1 y1 x2 y2
  fine: number[]; // x1 y1 x2 y2 for awns and tendrils
  leaves: number[]; // x0 y0 cax cay tx ty cbx cby (closed lens of two quadratics)
  grains: number[]; // cx cy rx ry rotation
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
};

export type TurtleOptions = {
  angle: number;
  /** Random wobble per segment, radians. */
  jitter: number;
  /** Constant lean per segment, radians (wind). */
  lean: number;
};

/**
 * Interprets a bracketed L-system string.
 * F draw, f move, + - turn, [ ] push/pop, L leaf blade, K leaflet, P pod,
 * H wheat ear, B awned barley ear, T tendril, o seed. Any other letter is a growing tip.
 */
export const interpret = (str: string, opts: TurtleOptions, rand: Rand): Shape => {
  const shape: Shape = { stems: [], fine: [], leaves: [], grains: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
  const b = shape.bounds;
  const touch = (x: number, y: number) => {
    if (x < b.minX) b.minX = x;
    if (x > b.maxX) b.maxX = x;
    if (y < b.minY) b.minY = y;
    if (y > b.maxY) b.maxY = y;
  };
  const grain = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
    shape.grains.push(cx, cy, rx, ry, rot);
    touch(cx - rx, cy - rx);
    touch(cx + rx, cy + rx);
  };
  const turn = (opts.angle * Math.PI) / 180;
  let x = 0;
  let y = 0;
  let h = -Math.PI / 2;
  let depth = 0;
  const stack: [number, number, number, number][] = [];

  for (const ch of str) {
    const dx = Math.cos(h);
    const dy = Math.sin(h);
    const size = 0.86 ** depth;
    switch (ch) {
      case "F":
      case "f": {
        h += (rand() - 0.5) * opts.jitter + opts.lean;
        const nx = x + Math.cos(h) * size;
        const ny = y + Math.sin(h) * size;
        if (ch === "F") shape.stems.push(x, y, nx, ny);
        x = nx;
        y = ny;
        touch(x, y);
        break;
      }
      case "+":
        h += turn * (0.8 + rand() * 0.4);
        break;
      case "-":
        h -= turn * (0.8 + rand() * 0.4);
        break;
      case "[":
        stack.push([x, y, h, depth]);
        depth++;
        break;
      case "]": {
        const top = stack.pop();
        if (top) [x, y, h, depth] = top;
        break;
      }
      case "L": {
        // A drooping blade: tip falls under gravity, width bulges at the middle.
        // Blades splay out from the parent stem on whichever side the bracket turned to.
        const parent = stack.at(-1)?.[2] ?? -Math.PI / 2;
        const lh = parent + (Math.sign(h - parent) || 1) * (0.6 + rand() * 0.35);
        const ldx = Math.cos(lh);
        const ldy = Math.sin(lh);
        const len = (2.4 + rand() * 1.6) * size;
        const tx = x + ldx * len;
        const ty = y + ldy * len + len * 0.45;
        const mx = (x + tx) / 2;
        const my = (y + ty) / 2 - len * 0.12;
        const w = len * 0.1;
        shape.leaves.push(x, y, mx - ldy * w, my + ldx * w, tx, ty, mx + ldy * w, my - ldx * w);
        touch(tx, ty);
        touch(mx, my);
        break;
      }
      case "K":
        grain(x + dx * 0.55 * size, y + dy * 0.55 * size, 0.55 * size, 0.3 * size, h);
        break;
      case "P":
        grain(x + dx * 0.8 * size, y + dy * 0.8 * size + 0.3, 0.85 * size, 0.3 * size, h + 0.5);
        break;
      case "o":
        grain(x, y, 0.24, 0.15, h);
        break;
      case "H":
      case "B": {
        // Ear: alternating kernels stacked along the heading; barley adds long awns.
        const n = ch === "H" ? 9 : 7;
        for (let i = 0; i < n; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const cx = x + dx * (0.3 + i * 0.36) - dy * side * 0.15;
          const cy = y + dy * (0.3 + i * 0.36) + dx * side * 0.15;
          grain(cx, cy, 0.3, 0.16, h + side * 0.4);
          if (ch === "B") {
            const a = h + side * 0.1;
            const ex = cx + Math.cos(a) * 2.6;
            const ey = cy + Math.sin(a) * 2.6;
            shape.fine.push(cx, cy, ex, ey);
            touch(ex, ey);
          }
        }
        shape.stems.push(x, y, x + dx * 0.36 * n, y + dy * 0.36 * n);
        break;
      }
      case "T": {
        // Tendril: a curl whose curvature tightens as it goes.
        let tx = x;
        let ty = y;
        let th = h;
        const dir = rand() < 0.5 ? 1 : -1;
        for (let i = 0; i < 16; i++) {
          th += dir * (0.12 + i * 0.045);
          const nx = tx + Math.cos(th) * 0.22;
          const ny = ty + Math.sin(th) * 0.22;
          shape.fine.push(tx, ty, nx, ny);
          tx = nx;
          ty = ny;
          touch(tx, ty);
        }
        break;
      }
      default:
        // Growing tip, visible while the plant is still developing.
        if (ch >= "A" && ch <= "Z") grain(x, y, 0.16, 0.16, 0);
    }
  }
  return shape;
};

/** Where and how big to draw a shape, in CSS pixels. */
export type Placement = {
  x: number;
  y: number;
  scale: number;
  color: Hex;
  /** Fill for grains, pods and seeds. Defaults to `color`. */
  accent?: Hex;
  alpha: number;
  stemPx: number;
};

/** Draws a shape in four path calls. `dpr` maps CSS pixels to canvas pixels. */
export const drawShape = (ctx: CanvasRenderingContext2D, s: Shape, p: Placement, dpr: number) => {
  const k = dpr * p.scale;
  ctx.setTransform(k, 0, 0, k, p.x * dpr, p.y * dpr);
  ctx.globalAlpha = p.alpha;
  ctx.strokeStyle = p.color;
  ctx.fillStyle = p.color;
  ctx.lineCap = "round";

  ctx.lineWidth = p.stemPx / p.scale;
  ctx.beginPath();
  for (let i = 0; i < s.stems.length; i += 4) {
    ctx.moveTo(s.stems[i], s.stems[i + 1]);
    ctx.lineTo(s.stems[i + 2], s.stems[i + 3]);
  }
  ctx.stroke();

  if (s.fine.length) {
    ctx.lineWidth = (p.stemPx * 0.45) / p.scale;
    ctx.beginPath();
    for (let i = 0; i < s.fine.length; i += 4) {
      ctx.moveTo(s.fine[i], s.fine[i + 1]);
      ctx.lineTo(s.fine[i + 2], s.fine[i + 3]);
    }
    ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i < s.leaves.length; i += 8) {
    const [x0, y0, ax, ay, tx, ty, bx, by] = s.leaves.slice(i, i + 8);
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(ax, ay, tx, ty);
    ctx.quadraticCurveTo(bx, by, x0, y0);
  }
  ctx.fill();

  ctx.fillStyle = p.accent ?? p.color;
  ctx.beginPath();
  for (let i = 0; i < s.grains.length; i += 5) {
    const [cx, cy, rx, ry, rot] = s.grains.slice(i, i + 5);
    ctx.moveTo(cx + rx * Math.cos(rot), cy + rx * Math.sin(rot));
    ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  }
  ctx.fill();
};

/** Sizes the backing store for the current devicePixelRatio and clears it. Returns the dpr used. */
export const prepareCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(width * dpr);
  const hgt = Math.round(height * dpr);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== hgt) canvas.height = hgt;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, w, hgt);
  return { ctx, dpr };
};
